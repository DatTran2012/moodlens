import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import AiAvatar from "../components/AiAvatar";
import toast from "react-hot-toast";

export default function AiCoach() {


    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId,
        setConversationId]
        =
        useState(null);

    const [conversations,
        setConversations]
        =
        useState([]);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Xin chào 👋 Tôi là AI Coach của MoodLens. Hãy hỏi tôi bất kỳ điều gì về cảm xúc của bạn."
        }
    ]);
    const renameConversation =
        async (id, currentTitle) => {

            const title =
                prompt(
                    "Tên cuộc trò chuyện",
                    currentTitle
                );

            if (!title)
                return;

            await api.put(
                `/aicoach/conversation/rename/${id}`,
                {
                    title
                }
            );

            toast.success(
                "Đổi tên cuộc trò chuyện thành công"
            );


            loadConversations();
        };
    const togglePin =
        async (id) => {

            await api.put(
                `/aicoach/conversation/pin/${id}`
            );

            toast.success(
                "Ghim cuộc trò chuyện thành công"
            );


            loadConversations();
        };
    const deleteConversation =
        async (id) => {

            const confirmDelete = window.confirm(
                "Bạn có chắc muốn xóa cuộc trò chuyện này?"
            );

            if (!confirmDelete)
                return;

            try {

                await api.delete(
                    `/aicoach/conversation/delete/${id}`
                );

                toast.success("Đã xóa cuộc trò chuyện");

                setConversations(prev =>
                    prev.filter(
                        x => x.id !== id
                    )
                );

                if (
                    conversationId === id
                ) {

                    setConversationId(null);

                    setMessages([
                        {
                            role: "assistant",
                            content:
                                "Xin chào 👋"
                        }
                    ]);
                }

            } catch (err) {

                console.error(err);

            }

        };

    const [insight, setInsight] = useState(null);

    const bottomRef = useRef(null);

    const suggestions = [
        "Tại sao tôi hay stress?",
        "Điều gì làm tôi hạnh phúc nhất?",
        "Cảm xúc của tôi đang cải thiện không?",
        "Tôi nên tập trung vào điều gì?"
    ];

    useEffect(() => {

        loadInsight();

    }, []);

    useEffect(() => {

        loadConversations();

    }, []);

    const createConversation =
        async () => {

            const res =
                await api.post(
                    "/aicoach/conversation"
                );

            setConversationId(
                res.data.id
            );

            setMessages([
                {
                    role: "assistant",
                    content:
                        "Xin chào 👋"
                }
            ]);

            loadConversations();

        };

    const typeMessage = async (text) => {

        let current = "";

        setMessages(prev => [
            ...prev,
            {
                role: "assistant",
                content: ""
            }
        ]);

        for (let i = 0; i < text.length; i++) {

            current += text[i];

            setMessages(prev => {

                const clone = [...prev];

                clone[clone.length - 1] = {
                    role: "assistant",
                    content: current
                };

                return clone;
            });

            await new Promise(r =>
                setTimeout(r, 15)
            );
        }
    };

    const loadConversations =
        async () => {

            const res =
                await api.get(
                    "/aicoach/conversations"
                );

            setConversations(
                res.data
            );

        };

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);

    const loadInsight = async () => {

        try {

            const res =
                await api.get(
                    "/aicoach/coach-insight"
                );

            setInsight(res.data);

        } catch (err) {

            console.error(err);

        }

    };

    const askAI = async () => {

        if (!question.trim())
            return;

        const userQuestion = question;

        setMessages(prev => [
            ...prev,
            {
                role: "user",
                content: userQuestion
            }
        ]);

        setQuestion("");

        setLoading(true);


        try {

            let currentConversationId =
                conversationId;

            if (!currentConversationId) {
                const createRes =
                    await api.post(
                        "/aicoach/conversation"
                    );

                currentConversationId =
                    createRes.data.id;

                setConversationId(
                    currentConversationId
                );

                loadConversations();
            }


            const res =
                await api.post(
                    "/aicoach/ask",
                    {
                        conversationId:
                            currentConversationId,
                        question:
                            userQuestion
                    }
                );

            await typeMessage(
                res.data.answer
            );

            // Reload sidebar để cập nhật conversation mới
            loadConversations();

        } catch (err) {

            console.error(err);

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Xin lỗi, tôi chưa thể trả lời lúc này."
                }
            ]);

        } finally {

            setLoading(false);

        }

    };

    const handleKeyDown = (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            askAI();

        }

    };

    const openConversation =
        async (id) => {

            setConversationId(id);

            const res =
                await api.get(
                    `/aicoach/conversation/${id}`
                );

            setMessages(
                res.data.map(x => ({
                    role: x.role,
                    content: x.content
                }))
            );

        };

    return (

        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
            <div
                className="
grid
grid-cols-1
xl:grid-cols-5
gap-6
"
            >

                {/* CHAT AREA */}

                <div
                    className="
                xl:col-span-3
                bg-slate-900
                rounded-2xl
                border
                border-white/10
                flex
                flex-col
                h-[80vh]
            "
                >

                    {/* HEADER */}
                    <div className="flex flex-col items-center">

                        <AiAvatar
                            isThinking={loading}
                        />

                        <h1 className="mt-4 text-2xl font-bold">
                            Ava AI Coach
                        </h1>

                    </div>

                    {/* SUGGESTIONS */}

                    <div
                        className="
                    p-4
                    border-b
                    border-white/10
                    flex
                    flex-wrap
                    gap-2
                "
                    >

                        {
                            suggestions.map(q => (

                                <button
                                    key={q}
                                    onClick={() =>
                                        setQuestion(q)
                                    }
                                    className="
                                px-3
                                py-2
                                rounded-xl
                                bg-white/10
                                hover:bg-white/20
                                transition
                            "
                                >
                                    {q}
                                </button>

                            ))
                        }

                    </div>

                    {/* MESSAGES */}

                    <div
                        className="
                    flex-1
                    overflow-y-auto
                    p-6
                "
                    >

                        {
                            messages.map(
                                (
                                    msg,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className={`
    flex
    mb-4
    ${msg.role === "user"
                                                ? "justify-end"
                                                : "justify-start"}
`}
                                    >

                                        <div
                                            className={`
    max-w-[80%]
    rounded-2xl
    px-4
    py-3
    whitespace-pre-wrap
    ${msg.role === "user"
                                                    ? "bg-blue-600"
                                                    : "bg-white/10"
                                                }
`}
                                        >

                                            <div
                                                className="
                                            text-xs
                                            opacity-60
                                            mb-2
                                        "
                                            >

                                                {
                                                    msg.role === "user"
                                                        ? "🧑 You"
                                                        : "🤖  MoodLens  AI"
                                                }

                                            </div>

                                            {msg.content}

                                        </div>

                                    </div>

                                ))
                        }

                        {
                            loading && (

                                <div className="mb-4">

                                    <div
                                        className="
                                    inline-block
                                    px-4
                                    py-3
                                    rounded-2xl
                                    bg-white/10
                                    animate-pulse
                                "
                                    >
                                        🤖 Thinking...
                                    </div>

                                </div>

                            )
                        }

                        <div ref={bottomRef} />

                    </div>

                    {/* INPUT */}

                    <div
                        className="
                    border-t
                    border-white/10
                    p-4
                "
                    >

                        <div className="flex gap-3">

                            <textarea
                                value={question}
                                onChange={(e) =>
                                    setQuestion(
                                        e.target.value
                                    )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                rows={2}
                                placeholder="Nhập câu hỏi..."
                                className="
                            flex-1
                            bg-white/10
                            border
                            border-white/10
                            rounded-xl
                            p-3
                            resize-none
                            focus:outline-none
                        "
                            />

                            <button
                                onClick={askAI}
                                disabled={loading}
                                className="
                            px-6
                            rounded-xl
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:opacity-50
                        "
                            >
                                Send
                            </button>
                        </div>

                    </div>

                </div>

                {/* SIDEBAR */}

                <div className="xl:col-span-2 space-y-4">


                    <div className="
    bg-slate-900
    rounded-2xl
    border
    border-white/10
    p-5
">

                        <button
                            onClick={createConversation}
                            className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            rounded-xl
            py-3
            font-medium
            transition
        "
                        >
                            ➕ New Chat
                        </button>

                        <div className="mt-5">

                            <h2 className="font-semibold mb-3">
                                💬 Chat History
                            </h2>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">

                                {
                                    conversations.map(c => (

                                        <div
                                            key={c.id}
                                            onClick={() =>
                                                openConversation(c.id)
                                            }
                                            className="
                            cursor-pointer
                            p-3
                            rounded-xl
                            bg-white/5
                            hover:bg-white/10
                            transition
                        "
                                        >

                                            <div
                                                className="
    flex
    items-center
    justify-between
    p-3
    rounded-xl
    bg-white/5
    hover:bg-white/10
"
                                            >



                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() =>
                                                        openConversation(c.id)
                                                    }
                                                >
                                                    {c.title}
                                                </div>

                                                <div className="flex gap-2">

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            renameConversation(
                                                                c.id,
                                                                c.title
                                                            );
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>

                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteConversation(c.id);
                                                        }}
                                                        className="
        text-red-400
        hover:text-red-300
        px-2
    "
                                                    >
                                                        🗑
                                                    </button>

                                                    <button
                                                        onClick={(e) => {

                                                            e.stopPropagation();

                                                            togglePin(c.id);

                                                        }}
                                                    >
                                                        {c.isPinned
                                                            ? "📌"
                                                            : "📍"}
                                                    </button>

                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-400 mt-1">
                                                {
                                                    new Date(
                                                        c.createdAt
                                                    ).toLocaleDateString("vi-VN")
                                                }
                                            </div>

                                        </div>

                                    ))
                                }

                            </div>

                        </div>

                    </div>

                    <div
                        className="
    bg-slate-900
    rounded-2xl
    border
    border-white/10
    p-5
"
                    >

                        <h2 className="text-xl font-bold mb-5">
                            📊 Insights
                        </h2>

                        <div className="space-y-4">

                            <div>
                                😊 Happy:
                                <span className="ml-2 text-green-400">
                                    {insight?.happy ?? 0}
                                </span>
                            </div>

                            <div>
                                😰 Stress:
                                <span className="ml-2 text-red-400">
                                    {insight?.stress ?? 0}
                                </span>
                            </div>

                            <div>
                                😢 Sad:
                                <span className="ml-2 text-blue-400">
                                    {insight?.sad ?? 0}
                                </span>
                            </div>

                            <div>
                                😐 Neutral:
                                <span className="ml-2 text-purple-400">
                                    {insight?.neutral ?? 0}
                                </span>
                            </div>

                            <hr className="border-white/10" />

                            <div>
                                📚 Journals:
                                <span className="ml-2">
                                    {insight?.total ?? 0}
                                </span>
                            </div>

                            <div>
                                📈 Avg Score:
                                <span className="ml-2">
                                    {Math.round(
                                        insight?.average ?? 0
                                    )}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );


}
