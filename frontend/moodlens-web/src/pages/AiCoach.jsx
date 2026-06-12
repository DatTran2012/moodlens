import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import AiAvatar from "../components/AiAvatar";
import toast from "react-hot-toast";
import { BsPlus, BsPencil, BsTrash3, BsPinAngle, BsPinAngleFill, BsSend } from "react-icons/bs";

const suggestions = [
    "Tại sao tôi hay stress?",
    "Điều gì làm tôi hạnh phúc nhất?",
    "Cảm xúc của tôi đang cải thiện không?",
    "Tôi nên tập trung vào điều gì?",
];

const insightConfig = [
    { key: "happy", emoji: "😊", label: "Vui", color: "text-green-400" },
    { key: "stress", emoji: "😰", label: "Căng thẳng", color: "text-yellow-400" },
    { key: "sad", emoji: "😢", label: "Buồn", color: "text-blue-400" },
    { key: "neutral", emoji: "😐", label: "Ổn định", color: "text-purple-400" },
];

export default function AiCoach() {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([{
        role: "assistant",
        content: "Xin chào 👋 Tôi là AI Coach của MoodLens. Hãy hỏi tôi bất kỳ điều gì về cảm xúc của bạn."
    }]);
    const [insight, setInsight] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => { loadInsight(); loadConversations(); }, []);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const loadConversations = async () => {
        const res = await api.get("/aicoach/conversations");
        setConversations(res.data);
    };

    const loadInsight = async () => {
        try {
            const res = await api.get("/aicoach/coach-insight");
            setInsight(res.data);
        } catch (e) { console.error(e); }
    };

    const createConversation = async () => {
        const res = await api.post("/aicoach/conversation");
        setConversationId(res.data.id);
        setMessages([{ role: "assistant", content: "Xin chào 👋 Cuộc trò chuyện mới bắt đầu!" }]);
        loadConversations();
    };

    const openConversation = async (id) => {
        setConversationId(id);
        const res = await api.get(`/aicoach/conversation/${id}`);
        setMessages(res.data.map(x => ({ role: x.role, content: x.content })));
    };

    const typeMessage = async (text) => {
        let current = "";
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        for (let i = 0; i < text.length; i++) {
            current += text[i];
            setMessages(prev => {
                const clone = [...prev];
                clone[clone.length - 1] = { role: "assistant", content: current };
                return clone;
            });
            await new Promise(r => setTimeout(r, 15));
        }
    };

    const askAI = async () => {
        if (!question.trim() || loading) return;
        const userQuestion = question;
        setMessages(prev => [...prev, { role: "user", content: userQuestion }]);
        setQuestion("");
        setLoading(true);
        try {
            let cid = conversationId;
            if (!cid) {
                const res = await api.post("/aicoach/conversation");
                cid = res.data.id;
                setConversationId(cid);
                loadConversations();
            }
            const res = await api.post("/aicoach/ask", {
                conversationId: cid,
                question: userQuestion
            });
            await typeMessage(res.data.answer);
            loadConversations();
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Xin lỗi, tôi chưa thể trả lời lúc này."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renameConversation = async (id, currentTitle) => {
        const title = prompt("Tên cuộc trò chuyện", currentTitle);
        if (!title) return;
        await api.put(`/aicoach/conversation/rename/${id}`, { title });
        toast.success("Đổi tên thành công");
        loadConversations();
    };

    const deleteConversation = async (id) => {
        if (!window.confirm("Xoá cuộc trò chuyện này?")) return;
        try {
            await api.delete(`/aicoach/conversation/delete/${id}`);
            toast.success("Đã xoá");
            setConversations(prev => prev.filter(x => x.id !== id));
            if (conversationId === id) {
                setConversationId(null);
                setMessages([{ role: "assistant", content: "Xin chào 👋" }]);
            }
        } catch (e) { console.error(e); }
    };

    const togglePin = async (id) => {
        await api.put(`/aicoach/conversation/pin/${id}`);
        toast.success("Đã cập nhật ghim");
        loadConversations();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askAI(); }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 h-[calc(100vh-7rem)]">

                {/* ── CHAT ── */}
                <div className="xl:col-span-3 bg-slate-900 rounded-2xl border border-white/8
                                flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center gap-4 px-5 py-4 border-b border-white/8">
                        <AiAvatar isThinking={loading} />
                        <div>
                            <h2 className="font-bold text-base">Ava AI Coach</h2>
                            <p className="text-xs text-gray-500">
                                {loading ? "Đang suy nghĩ..." : "Sẵn sàng trò chuyện"}
                            </p>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="px-4 py-3 border-b border-white/5 flex flex-wrap gap-2">
                        {suggestions.map(q => (
                            <button key={q} onClick={() => setQuestion(q)}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/5
                                               hover:bg-white/10 border border-white/8
                                               text-gray-400 hover:text-white transition">
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500
                                                    to-purple-600 flex items-center justify-center
                                                    text-sm shrink-0 mt-1">
                                        🤖
                                    </div>
                                )}
                                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm
                                                leading-relaxed whitespace-pre-wrap
                                                ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                        : "bg-white/8 text-gray-200 rounded-tl-sm"}`}>
                                    {msg.content}
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-7 h-7 rounded-full bg-slate-700
                                                    flex items-center justify-center text-sm shrink-0 mt-1">
                                        🧑
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500
                                                to-purple-600 flex items-center justify-center text-sm shrink-0">
                                    🤖
                                </div>
                                <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="flex gap-1.5 items-center h-5">
                                        {[0, 1, 2].map(i => (
                                            <div key={i}
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/8 p-4">
                        <div className="flex gap-3 items-end">
                            <textarea
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                                placeholder="Nhập câu hỏi... (Enter để gửi)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl
                                           px-4 py-3 resize-none focus:outline-none text-sm
                                           focus:border-blue-500/50 transition placeholder-gray-600"
                            />
                            <button
                                onClick={askAI}
                                disabled={loading || !question.trim()}
                                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700
                                           disabled:opacity-40 disabled:cursor-not-allowed
                                           flex items-center justify-center transition shrink-0"
                            >
                                <BsSend size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="xl:col-span-2 flex flex-col gap-4 overflow-y-auto">

                    {/* Conversations */}
                    <div className="bg-slate-900 rounded-2xl border border-white/8 p-4">
                        <button
                            onClick={createConversation}
                            className="w-full flex items-center justify-center gap-2 py-2.5
                                       rounded-xl bg-blue-600 hover:bg-blue-700 text-sm
                                       font-medium transition mb-4"
                        >
                            <BsPlus size={18} /> Cuộc trò chuyện mới
                        </button>

                        <h3 className="text-xs font-semibold text-gray-500 uppercase
                                       tracking-wider mb-3">
                            Lịch sử
                        </h3>

                        <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                            {conversations.length === 0
                                ? <p className="text-gray-600 text-xs text-center py-4">
                                    Chưa có cuộc trò chuyện nào
                                </p>
                                : conversations.map(c => (
                                    <div key={c.id}
                                        onClick={() => openConversation(c.id)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl
                                                     cursor-pointer transition group
                                                     ${conversationId === c.id
                                                ? "bg-blue-600/20 border border-blue-500/30"
                                                : "hover:bg-white/5 border border-transparent"}`}>

                                        {c.isPinned && <BsPinAngleFill size={11} className="text-yellow-400 shrink-0" />}

                                        <span className="flex-1 text-sm text-gray-300 truncate">
                                            {c.title || "New Chat"}
                                        </span>

                                        <span className="text-xs text-gray-600 shrink-0">
                                            {new Date(c.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })}
                                        </span>

                                        {/* Actions — chỉ hiện khi hover */}
                                        <div className="hidden group-hover:flex gap-1 shrink-0">
                                            <button onClick={e => { e.stopPropagation(); renameConversation(c.id, c.title); }}
                                                className="p-1 text-gray-500 hover:text-white transition rounded">
                                                <BsPencil size={11} />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); togglePin(c.id); }}
                                                className="p-1 text-gray-500 hover:text-yellow-400 transition rounded">
                                                {c.isPinned ? <BsPinAngleFill size={11} /> : <BsPinAngle size={11} />}
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); deleteConversation(c.id); }}
                                                className="p-1 text-gray-500 hover:text-red-400 transition rounded">
                                                <BsTrash3 size={11} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="bg-slate-900 rounded-2xl border border-white/8 p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase
                                       tracking-wider mb-4">
                            📊 Tổng quan cảm xúc
                        </h3>
                        <div className="space-y-3">
                            {insightConfig.map(({ key, emoji, label, color }) => {
                                const val = insight?.[key] ?? 0;
                                const total = insight?.total || 1;
                                const pct = Math.round((val / total) * 100);
                                return (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-400 flex items-center gap-1.5">
                                                {emoji} {label}
                                            </span>
                                            <span className={`text-sm font-semibold ${color}`}>{val}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500 ${key === "happy" ? "bg-green-500" :
                                                key === "stress" ? "bg-yellow-500" :
                                                    key === "sad" ? "bg-blue-500" : "bg-purple-500"
                                                }`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-2 border-t border-white/8 flex justify-between text-xs text-gray-500">
                                <span>📚 Tổng: <span className="text-white">{insight?.total ?? 0}</span></span>
                                <span>📈 TB: <span className="text-white">{Math.round(insight?.average ?? 0)}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
