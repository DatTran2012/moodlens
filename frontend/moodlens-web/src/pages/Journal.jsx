import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { BsPencilFill, BsStars, BsJournalPlus, BsXLg, BsClockHistory } from "react-icons/bs";

const DRAFT_KEY = "moodlens_journal_draft";

const P = {
    bg: "#faf6f0",
    surface: "#f5ede0",
    card: "#ede3d2",
    border: "#d6c9b4",
    spine: "#c4a882",
    text: "#3b2f1e",
    muted: "#8c7560",
    accent: "#7c5c3a",
    line: "rgba(139,110,80,0.07)",
};

const moodConfig = {
    happy: { emoji: "😊", text: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-300", bar: "bg-emerald-500" },
    sad: { emoji: "😢", text: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300", bar: "bg-blue-500" },
    stress: { emoji: "😰", text: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", bar: "bg-amber-500" },
    anxious: { emoji: "😰", text: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", bar: "bg-amber-500" },
    angry: { emoji: "😠", text: "text-red-700", bg: "bg-red-100", border: "border-red-300", bar: "bg-red-500" },
    neutral: { emoji: "😐", text: "text-stone-600", bg: "bg-stone-100", border: "border-stone-300", bar: "bg-stone-400" },
};
const getMood = (m) => moodConfig[(m || "").toLowerCase()] || moodConfig.neutral;

const moodRanges = [
    { min: 0, max: 20, label: "Buồn", color: "bg-blue-400", emoji: "😢" },
    { min: 21, max: 50, label: "Căng thẳng", color: "bg-amber-400", emoji: "😰" },
    { min: 51, max: 80, label: "Ổn định", color: "bg-stone-400", emoji: "😐" },
    { min: 80, max: 100, label: "Vui", color: "bg-emerald-500", emoji: "😊" },
];

const today = () => new Date().toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
});

const SkeletonCard = () => (
    <div className="animate-pulse space-y-3">
        <div className="h-3 rounded-full" style={{ background: P.border }} />
        <div className="h-3 rounded-full w-5/6" style={{ background: P.border }} />
        <div className="h-3 rounded-full w-4/6" style={{ background: P.border }} />
    </div>
);

export default function Journal() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [displaySummary, setDisplay] = useState("");
    const [recentJournals, setRecent] = useState([]);
    const [selectedJournal, setSelected] = useState(null);
    const [detailLoading, setDetailLoad] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [mobileTab, setMobileTab] = useState("write"); // "write" | "result"

    useEffect(() => {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) setContent(draft);
        loadRecent();
    }, []);

    useEffect(() => {
        localStorage.setItem(DRAFT_KEY, content);
        setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
    }, [content]);

    useEffect(() => {
        if (!result?.summary) return;
        let i = 0; setDisplay("");
        const iv = setInterval(() => {
            i++;
            setDisplay(result.summary.slice(0, i));
            if (i >= result.summary.length) clearInterval(iv);
        }, 18);
        return () => clearInterval(iv);
    }, [result?.summary]);

    const loadRecent = async () => {
        try {
            const res = await api.get("/journal/history?page=1&pageSize=3");
            setRecent(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const openDetail = async (id) => {
        setSelected({ _loading: true }); setDetailLoad(true);
        try { const res = await api.get(`/journal/${id}`); setSelected(res.data); }
        catch (e) { console.error(e); setSelected(null); }
        finally { setDetailLoad(false); }
    };

    const handleAnalyze = async () => {
        if (!content.trim() || loading) return;
        try {
            setLoading(true); setResult(null);
            const res = await api.post("/journal", { content });
            setResult({ mood: res.data.mood, score: res.data.score, summary: res.data.summary });
            localStorage.removeItem(DRAFT_KEY);
            await loadRecent();
            toast.success("Đã lưu & phân tích cảm xúc 🎉");
            setMobileTab("result"); // tự chuyển sang tab kết quả trên mobile
        } catch { toast.error("Không thể phân tích cảm xúc"); }
        finally { setLoading(false); }
    };

    const handleNewPage = () => {
        if (content.trim() && !window.confirm("Bắt đầu trang mới? Nội dung hiện tại sẽ bị xoá.")) return;
        setContent(""); setResult(null); setDisplay("");
        localStorage.removeItem(DRAFT_KEY);
        setMobileTab("write");
    };

    const handleKeyDown = (e) => {
        if (window.innerWidth < 768) return;
        if (e.shiftKey && e.key === "Enter") return;
        if (e.key === "Enter") { e.preventDefault(); handleAnalyze(); }
    };

    const mood = result ? getMood(result.mood) : null;

    // ── Panel viết ────────────────────────────────────────────────────────────
    const WritePanel = () => (
        <div>
            {/* Tờ nhật kí */}
            <div className="relative rounded-2xl overflow-hidden"
                style={{
                    background: P.surface,
                    border: `1px solid ${P.border}`,
                    boxShadow: "0 4px 20px rgba(139,110,80,0.10), inset 0 0 0 1px rgba(255,255,255,0.6)"
                }}>
                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                    style={{ background: `linear-gradient(to bottom, ${P.spine}, #a8896a, ${P.spine})` }} />
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `repeating-linear-gradient(transparent,transparent 31px,${P.line} 31px,${P.line} 32px)`,
                        backgroundPositionY: "56px"
                    }} />
                <div className="relative p-6 pl-9">
                    <div className="text-xs font-medium mb-4 tracking-wide pb-3"
                        style={{ color: P.muted, borderBottom: `1px solid ${P.border}`, fontFamily: "'Georgia', serif" }}>
                        📅 {today()}
                    </div>
                    <textarea
                        value={content}
                        disabled={loading}
                        onChange={e => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={"Hôm nay bạn cảm thấy thế nào?\n\nHãy viết tự do — không có gì là đúng hay sai..."}
                        className="w-full h-[280px] md:h-[360px] resize-none bg-transparent outline-none leading-8 text-[15px]"
                        style={{ color: P.text, fontFamily: "'Georgia', serif", caretColor: P.accent }}
                    />
                    <div className="flex items-center justify-between mt-2 text-xs" style={{ color: P.muted }}>
                        <span>{wordCount} từ</span>
                        <span className="hidden sm:inline">Enter để phân tích · Shift+Enter xuống dòng</span>
                    </div>
                </div>
            </div>

            {/* Nút phân tích */}
            <button onClick={handleAnalyze} disabled={loading || !content.trim()}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition text-sm text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, #7c5c3a, #5c3d20)`, boxShadow: "0 4px 16px rgba(124,92,58,0.3)" }}>
                <BsStars size={16} />
                {loading ? "Đang phân tích..." : "Phân tích cảm xúc"}
            </button>

            {/* Nhật kí gần đây */}
            <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>
                    Gần đây
                </h3>
                {recentJournals.length === 0
                    ? <p className="text-sm text-center py-6" style={{ color: P.muted }}>Chưa có nhật kí nào</p>
                    : (
                        <div className="space-y-2">
                            {recentJournals.map(j => {
                                const m = getMood(j.mood);
                                return (
                                    <div key={j.id} onClick={() => openDetail(j.id)}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition hover:brightness-95 ${m.bg} ${m.border}`}>
                                        <span className="text-lg mt-0.5">{m.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate" style={{ color: P.text, fontFamily: "'Georgia', serif" }}>
                                                {j.content.length > 70 ? j.content.slice(0, 70) + "..." : j.content}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: P.muted }}>
                                                {new Date(j.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </div>
        </div>
    );

    // ── Panel kết quả AI ──────────────────────────────────────────────────────
    const ResultPanel = () => (
        <div className="space-y-4">
            {/* Cảm xúc */}
            <div className={`rounded-2xl p-5 border transition-all duration-500 ${mood ? `${mood.bg} ${mood.border}` : ""}`}
                style={!mood ? { background: P.surface, border: `1px solid ${P.border}` } : {}}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>Cảm xúc</p>
                {result
                    ? <div className={`text-2xl font-bold flex items-center gap-2 ${mood.text}`}
                        style={{ fontFamily: "'Georgia', serif" }}>
                        <span>{mood.emoji}</span>
                        <span className="capitalize">{result.mood}</span>
                    </div>
                    : <p className="text-sm" style={{ color: P.muted }}>Chưa có kết quả — hãy viết và phân tích trước nhé</p>
                }
            </div>

            {/* Điểm số */}
            <div className="rounded-2xl p-5" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>Điểm cảm xúc</p>
                <div className="text-4xl font-bold mb-4" style={{ color: P.text, fontFamily: "'Georgia', serif" }}>
                    {result ? result.score : <span style={{ color: P.border }}>—</span>}
                </div>
                <div className="relative">
                    <div className="flex h-3 rounded-full overflow-hidden" style={{ border: `1px solid ${P.border}` }}>
                        {moodRanges.map(r => (
                            <div key={r.label} title={`${r.emoji} ${r.label}`}
                                className={`${r.color} flex-1 opacity-70`} />
                        ))}
                    </div>
                    {result && (
                        <div className="absolute top-[-5px] w-5 h-5 rounded-full shadow-lg transition-all duration-700"
                            style={{ left: `calc(${result.score}% - 10px)`, background: "white", border: `2px solid ${P.spine}` }} />
                    )}
                </div>
                <div className="flex justify-between text-xs mt-2" style={{ color: P.muted }}>
                    {moodRanges.map(r => <span key={r.label}>{r.emoji}</span>)}
                </div>
            </div>

            {/* AI Summary */}
            <div className="rounded-2xl p-5 min-h-[180px]"
                style={{ background: "#fef9ec", border: "1px solid #e8d5a0" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
                    style={{ color: "#92701a", fontFamily: "'Georgia', serif" }}>
                    <BsStars size={13} className="text-yellow-600" /> AI phân tích
                </p>
                {loading
                    ? <SkeletonCard />
                    : result
                        ? <p className="leading-7 whitespace-pre-wrap text-[14px]"
                            style={{ color: "#6b5320", fontFamily: "'Georgia', serif" }}>
                            {displaySummary}
                        </p>
                        : <p className="text-sm" style={{ color: "#b8975a" }}>
                            Viết nhật kí và bấm phân tích để AI đọc cảm xúc của bạn ✨
                        </p>
                }
            </div>
        </div>
    );

    return (
        <div style={{ background: P.bg, color: P.text, minHeight: "100dvh" }}>

            {/* ── HEADER ── */}
            <div className="flex items-start justify-between p-4 md:px-8 md:pt-8 pb-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <BsPencilFill size={20} style={{ color: P.accent }} />
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight"
                            style={{ fontFamily: "'Georgia', serif", color: P.text }}>
                            Nhật kí của tôi
                        </h1>
                    </div>
                    <p className="text-sm ml-9 capitalize" style={{ color: P.muted }}>{today()}</p>
                </div>
                <button onClick={handleNewPage} title="Trang mới"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
                    style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.accent }}>
                    <BsJournalPlus size={17} />
                    <span className="hidden sm:inline">Trang mới</span>
                </button>
            </div>

            {/* ── MOBILE: tab switcher ── */}
            <div className="lg:hidden flex gap-2 px-4 pb-4">
                <button onClick={() => setMobileTab("write")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition"
                    style={{
                        background: mobileTab === "write" ? P.accent : P.card,
                        color: mobileTab === "write" ? "white" : P.muted,
                        border: `1px solid ${P.border}`,
                    }}>
                    <BsPencilFill size={13} /> Viết nhật kí
                </button>
                <button onClick={() => setMobileTab("result")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition"
                    style={{
                        background: mobileTab === "result" ? P.accent : P.card,
                        color: mobileTab === "result" ? "white" : P.muted,
                        border: `1px solid ${P.border}`,
                    }}>
                    <BsStars size={13} />
                    AI phân tích
                    {result && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                </button>
            </div>

            {/* ── MOBILE: nội dung tab ── */}
            <div className="lg:hidden px-4 pb-8">
                {mobileTab === "write" ? <WritePanel /> : <ResultPanel />}
            </div>

            {/* ── DESKTOP: 2 cột ── */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6 px-8 pb-8">
                <WritePanel />
                <ResultPanel />
            </div>

            {/* ── MODAL CHI TIẾT ── */}
            {selectedJournal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(59,47,30,0.55)", backdropFilter: "blur(4px)" }}
                    onClick={() => setSelected(null)}>
                    <div className="w-full max-w-xl" onClick={e => e.stopPropagation()}>
                        {detailLoading ? (
                            <div className="rounded-2xl p-6" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                                <SkeletonCard />
                            </div>
                        ) : selectedJournal && !selectedJournal._loading && (() => {
                            const m = getMood(selectedJournal.mood);
                            return (
                                <div className="rounded-2xl overflow-hidden shadow-2xl"
                                    style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                                    <div className="h-1.5 w-full" style={{ background: P.spine, opacity: 0.8 }} />
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-5">
                                            <div>
                                                <div className={`flex items-center gap-2 text-sm font-semibold ${m.text}`}>
                                                    <span>{m.emoji}</span>
                                                    <span className="capitalize">{selectedJournal.mood}</span>
                                                    <span style={{ color: P.border }}>·</span>
                                                    <span className="font-normal" style={{ color: P.muted }}>
                                                        {new Date(selectedJournal.createdAt).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" })}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: P.muted }}>
                                                    🕒 {new Date(selectedJournal.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <button onClick={() => setSelected(null)} style={{ color: P.muted }}
                                                className="hover:opacity-70 transition">
                                                <BsXLg size={14} />
                                            </button>
                                        </div>
                                        <div className="rounded-xl p-5 mb-4 max-h-[200px] overflow-y-auto"
                                            style={{ background: P.card, border: `1px solid ${P.border}`, backgroundImage: `repeating-linear-gradient(transparent,transparent 27px,${P.line} 27px,${P.line} 28px)`, backgroundPositionY: "12px" }}>
                                            <p className="leading-7 whitespace-pre-wrap text-sm"
                                                style={{ color: P.text, fontFamily: "'Georgia', serif" }}>
                                                {selectedJournal.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xs shrink-0" style={{ color: P.muted }}>Điểm</span>
                                            <span className={`text-base font-bold shrink-0 ${m.text}`}>{selectedJournal.score}</span>
                                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: P.card }}>
                                                <div className={`h-full rounded-full ${m.bar}`} style={{ width: `${selectedJournal.score}%` }} />
                                            </div>
                                        </div>
                                        {selectedJournal.summary && (
                                            <div className="rounded-xl p-4" style={{ background: "#fef9ec", border: "1px solid #e8d5a0" }}>
                                                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#92701a" }}>
                                                    <BsStars size={11} /> AI phân tích
                                                </p>
                                                <p className="text-sm leading-6" style={{ color: "#6b5320", fontFamily: "'Georgia', serif" }}>
                                                    {selectedJournal.summary}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
