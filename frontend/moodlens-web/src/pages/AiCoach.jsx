import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import AiAvatar from "../components/AiAvatar";
import toast from "react-hot-toast";
import { BsPlus, BsPencil, BsTrash3, BsPinAngle, BsPinAngleFill, BsSend, BsChatDots, BsClockHistory } from "react-icons/bs";

const P = {
    bg:      "#faf6f0",
    surface: "#f5ede0",
    card:    "#ede3d2",
    border:  "#d6c9b4",
    spine:   "#c4a882",
    text:    "#3b2f1e",
    muted:   "#8c7560",
    accent:  "#7c5c3a",
    line:    "rgba(139,110,80,0.07)",
};

const suggestions = [
    "Tại sao tôi hay stress?",
    "Điều gì làm tôi hạnh phúc nhất?",
    "Cảm xúc của tôi đang cải thiện không?",
    "Tôi nên tập trung vào điều gì?",
];

const insightConfig = [
    { key:"happy",   emoji:"😊", label:"Vui",        barColor:"bg-emerald-500" },
    { key:"stress",  emoji:"😰", label:"Căng thẳng", barColor:"bg-amber-500"   },
    { key:"sad",     emoji:"😢", label:"Buồn",        barColor:"bg-blue-500"    },
    { key:"neutral", emoji:"😐", label:"Ổn định",    barColor:"bg-stone-400"   },
];

export default function AiCoach() {
    const [question, setQuestion]             = useState("");
    const [loading, setLoading]               = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations]   = useState([]);
    const [messages, setMessages]             = useState([{
        role: "assistant",
        content: "Xin chào 👋 Tôi là AI Coach của MoodLens. Hãy hỏi tôi bất kỳ điều gì về cảm xúc của bạn."
    }]);
    const [insight, setInsight]   = useState(null);
    const [mobileTab, setMobileTab] = useState("chat"); // "chat" | "history"
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
        } catch(e) { console.error(e); }
    };

    const createConversation = async () => {
        const res = await api.post("/aicoach/conversation");
        setConversationId(res.data.id);
        setMessages([{ role:"assistant", content:"Xin chào 👋 Tôi là AI Coach của MoodLens. Hãy hỏi tôi bất kỳ điều gì về cảm xúc của bạn." }]);
        loadConversations();
        setMobileTab("chat");
    };

    const openConversation = async (id) => {
        setConversationId(id);
        const res = await api.get(`/aicoach/conversation/${id}`);
        setMessages(res.data.map(x => ({ role: x.role, content: x.content })));
        setMobileTab("chat");
    };

    const typeMessage = async (text) => {
        const messageId = Date.now();
        setMessages(prev => [...prev, { id: messageId, role:"assistant", content:"" }]);
        let current = "";
        for (let i = 0; i < text.length; i++) {
            current += text[i];
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, content: current } : msg
            ));
            await new Promise(r => setTimeout(r, 15));
        }
    };

    const askAI = async () => {
        if (!question.trim() || loading) return;
        const userQuestion = question;
        setMessages(prev => [...prev, { role:"user", content: userQuestion }]);
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
            const res = await api.post("/aicoach/ask", { conversationId: cid, question: userQuestion });
            await typeMessage(res.data.answer);
        } catch {
            setMessages(prev => [...prev, { role:"assistant", content:"Xin lỗi, tôi chưa thể trả lời lúc này." }]);
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
                setMessages([{ role:"assistant", content:"Xin chào 👋" }]);
            }
        } catch(e) { console.error(e); }
    };

    const togglePin = async (id) => {
        await api.put(`/aicoach/conversation/pin/${id}`);
        toast.success("Đã cập nhật ghim");
        loadConversations();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askAI(); }
    };

    // ── Chat panel (dùng chung desktop + mobile) ─────────────────────────────
    const ChatPanel = () => (
        <div className="rounded-2xl flex flex-col overflow-hidden h-full"
             style={{ background: P.surface, border:`1px solid ${P.border}`, boxShadow:"0 4px 20px rgba(139,110,80,0.08)" }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3"
                 style={{ borderBottom:`1px solid ${P.border}` }}>
                <AiAvatar isThinking={loading} />
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-sm" style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                        MoodLens AI
                    </h2>
                    <p className="text-xs" style={{ color: P.muted }}>
                        {loading ? "Đang suy nghĩ..." : "Sẵn sàng trò chuyện"}
                    </p>
                </div>
                {/* Nút new chat trên mobile header */}
                <button onClick={createConversation}
                        className="xl:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white transition hover:opacity-90"
                        style={{ background:`linear-gradient(135deg,${P.spine},${P.accent})` }}>
                    <BsPlus size={15} /> Mới
                </button>
            </div>

            {/* Suggestions — scroll ngang trên mobile */}
            <div className="px-3 py-2.5 flex gap-2 overflow-x-auto"
                 style={{ borderBottom:`1px solid ${P.line}` }}>
                {suggestions.map(q => (
                    <button key={q} onClick={() => setQuestion(q)}
                            className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition hover:opacity-80 shrink-0"
                            style={{ background: P.card, border:`1px solid ${P.border}`, color: P.accent }}>
                        {q}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-1"
                                 style={{ background:`linear-gradient(135deg,${P.spine},${P.accent})` }}>
                                🤖
                            </div>
                        )}
                        <div className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                             style={msg.role === "user"
                                 ? { background:`linear-gradient(135deg,${P.accent},#5c3d20)`, color:"white", borderTopRightRadius:4 }
                                 : { background: P.card, border:`1px solid ${P.border}`, color: P.text, borderTopLeftRadius:4, fontFamily:"'Georgia', serif" }
                             }>
                            {msg.content}
                        </div>
                        {msg.role === "user" && (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-1"
                                 style={{ background: P.card, border:`1px solid ${P.border}` }}>
                                🧑
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                             style={{ background:`linear-gradient(135deg,${P.spine},${P.accent})` }}>
                            🤖
                        </div>
                        <div className="rounded-2xl px-4 py-3"
                             style={{ background: P.card, border:`1px solid ${P.border}`, borderTopLeftRadius:4 }}>
                            <div className="flex gap-1.5 items-center h-5">
                                {[0,1,2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                                         style={{ background: P.muted, animationDelay:`${i*0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3" style={{ borderTop:`1px solid ${P.border}` }}>
                <div className="flex gap-2 items-end">
                    <textarea
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        placeholder="Nhập câu hỏi... (Enter để gửi)"
                        className="flex-1 rounded-xl px-4 py-3 resize-none outline-none text-sm transition"
                        style={{ background: P.card, border:`1px solid ${P.border}`, color: P.text, fontFamily:"'Georgia', serif" }}
                    />
                    <button onClick={askAI} disabled={loading || !question.trim()}
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition hover:opacity-90 disabled:opacity-40"
                            style={{ background:`linear-gradient(135deg,${P.spine},${P.accent})` }}>
                        <BsSend size={15} />
                    </button>
                </div>
            </div>
        </div>
    );

    // ── Right panel (dùng chung desktop + mobile history tab) ────────────────
    const RightPanel = () => (
        <div className="flex flex-col gap-4">

            {/* Conversations */}
            <div className="rounded-2xl p-4"
                 style={{ background: P.surface, border:`1px solid ${P.border}`, boxShadow:"0 2px 12px rgba(139,110,80,0.06)" }}>
                <button onClick={createConversation}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition hover:opacity-90 mb-4"
                        style={{ background:`linear-gradient(135deg,${P.spine},${P.accent})` }}>
                    <BsPlus size={18} /> Cuộc trò chuyện mới
                </button>

                <h3 className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                    Lịch sử
                </h3>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {conversations.length === 0
                        ? <p className="text-xs text-center py-4" style={{ color: P.muted }}>Chưa có cuộc trò chuyện nào</p>
                        : conversations.map(c => (
                            <div key={c.id} onClick={() => openConversation(c.id)}
                                 className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition group"
                                 style={{ background: conversationId === c.id ? P.card : "transparent", border:`1px solid ${conversationId === c.id ? P.border : "transparent"}` }}
                                 onMouseEnter={e => { if (conversationId !== c.id) e.currentTarget.style.background = P.card; }}
                                 onMouseLeave={e => { if (conversationId !== c.id) e.currentTarget.style.background = "transparent"; }}
                            >
                                {c.isPinned && <BsPinAngleFill size={11} style={{ color:"#b8975a" }} className="shrink-0" />}
                                <span className="flex-1 text-sm truncate" style={{ color: P.text }}>{c.title || "New Chat"}</span>
                                <span className="text-xs shrink-0" style={{ color: P.muted }}>
                                    {new Date(c.createdAt).toLocaleDateString("vi-VN", { day:"numeric", month:"short" })}
                                </span>
                                <div className="hidden group-hover:flex gap-1 shrink-0">
                                    <button onClick={e => { e.stopPropagation(); renameConversation(c.id, c.title); }}
                                            className="p-1 rounded hover:opacity-70" style={{ color: P.muted }}>
                                        <BsPencil size={11} />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); togglePin(c.id); }}
                                            className="p-1 rounded hover:opacity-70"
                                            style={{ color: c.isPinned ? "#b8975a" : P.muted }}>
                                        {c.isPinned ? <BsPinAngleFill size={11} /> : <BsPinAngle size={11} />}
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); deleteConversation(c.id); }}
                                            className="p-1 rounded hover:opacity-70" style={{ color:"#c0392b" }}>
                                        <BsTrash3 size={11} />
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Insights */}
            <div className="rounded-2xl p-4"
                 style={{ background: P.surface, border:`1px solid ${P.border}`, boxShadow:"0 2px 12px rgba(139,110,80,0.06)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4"
                    style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                    📊 Tổng quan cảm xúc
                </h3>
                <div className="space-y-3">
                    {insightConfig.map(({ key, emoji, label, barColor }) => {
                        const val   = insight?.[key] ?? 0;
                        const total = insight?.total || 1;
                        const pct   = Math.round((val / total) * 100);
                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm flex items-center gap-1.5" style={{ color: P.text }}>{emoji} {label}</span>
                                    <span className="text-sm font-semibold" style={{ color: P.accent }}>{val}</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: P.card }}>
                                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width:`${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    <div className="pt-2 flex justify-between text-xs" style={{ borderTop:`1px solid ${P.border}`, color: P.muted }}>
                        <span>📚 Tổng: <span style={{ color: P.text, fontWeight:600 }}>{insight?.total ?? 0}</span></span>
                        <span>📈 TB: <span style={{ color: P.text, fontWeight:600 }}>{Math.round(insight?.average ?? 0)}</span></span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ background: P.bg, minHeight:"100dvh" }}>

            {/* ── MOBILE layout ─────────────────────────────────────────────── */}
            <div className="xl:hidden flex flex-col" style={{ height:"100dvh" }}>

                {/* Tab switcher */}
                <div className="flex shrink-0 p-3 gap-2"
                     style={{ borderBottom:`1px solid ${P.border}`, background: P.surface }}>
                    <button onClick={() => setMobileTab("chat")}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition"
                            style={{
                                background: mobileTab === "chat" ? P.accent : P.card,
                                color: mobileTab === "chat" ? "white" : P.muted,
                                border: `1px solid ${P.border}`,
                            }}>
                        <BsChatDots size={15} /> Chat
                    </button>
                    <button onClick={() => setMobileTab("history")}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition"
                            style={{
                                background: mobileTab === "history" ? P.accent : P.card,
                                color: mobileTab === "history" ? "white" : P.muted,
                                border: `1px solid ${P.border}`,
                            }}>
                        <BsClockHistory size={15} /> Lịch sử
                        {conversations.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{ background:"rgba(255,255,255,0.25)" }}>
                                {conversations.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Nội dung tab */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {mobileTab === "chat"
                        ? <ChatPanel />
                        : <div className="h-full overflow-y-auto p-4"><RightPanel /></div>
                    }
                </div>
            </div>

            {/* ── DESKTOP layout ────────────────────────────────────────────── */}
            <div className="hidden xl:grid xl:grid-cols-5 gap-5 p-6"
                 style={{ height:"calc(100vh - 3.5rem)" }}>
                <div className="xl:col-span-3 min-h-0">
                    <ChatPanel />
                </div>
                <div className="xl:col-span-2 overflow-y-auto">
                    <RightPanel />
                </div>
            </div>
        </div>
    );
}
