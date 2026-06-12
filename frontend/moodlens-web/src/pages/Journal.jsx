import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { BsPencilFill, BsStars, BsJournalPlus, BsXLg } from "react-icons/bs";

const DRAFT_KEY = "moodlens_journal_draft";

const moodConfig = {
    happy: { emoji: "😊", text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", bar: "bg-green-500" },
    sad: { emoji: "😢", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", bar: "bg-blue-500" },
    stress: { emoji: "😰", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", bar: "bg-yellow-500" },
    anxious: { emoji: "😰", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", bar: "bg-yellow-500" },
    angry: { emoji: "😠", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", bar: "bg-red-500" },
    neutral: { emoji: "😐", text: "text-gray-300", bg: "bg-gray-500/10", border: "border-gray-500/30", bar: "bg-gray-500" },
};

const getMood = (mood) =>
    moodConfig[(mood || "").toLowerCase()] || moodConfig.neutral;

const moodRanges = [
    { min: 0, max: 20, label: "Buồn", color: "bg-blue-500", emoji: "😢" },
    { min: 21, max: 50, label: "Căng thẳng", color: "bg-yellow-500", emoji: "😰" },
    { min: 51, max: 80, label: "Ổn định", color: "bg-gray-400", emoji: "😐" },
    { min: 80, max: 100, label: "Vui", color: "bg-green-500", emoji: "😊" },
];

const today = () =>
    new Date().toLocaleDateString("vi-VN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

const SkeletonCard = () => (
    <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-700 rounded" />
        <div className="h-4 bg-slate-700 rounded w-5/6" />
        <div className="h-4 bg-slate-700 rounded w-4/6" />
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

    // Load draft
    useEffect(() => {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) setContent(draft);
        loadRecent();
    }, []);

    // Save draft
    useEffect(() => {
        localStorage.setItem(DRAFT_KEY, content);
        setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
    }, [content]);

    // Typing effect cho AI summary
    useEffect(() => {
        if (!result?.summary) return;
        let i = 0;
        setDisplay("");
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
        setSelected({ _loading: true });
        setDetailLoad(true);
        try {
            const res = await api.get(`/journal/${id}`);
            setSelected(res.data);
        } catch (e) {
            console.error(e);
            setSelected(null);
        } finally {
            setDetailLoad(false);
        }
    };

    const handleAnalyze = async () => {
        if (!content.trim() || loading) return;
        try {
            setLoading(true);
            setResult(null);
            const res = await api.post("/journal", { content });
            setResult({ mood: res.data.mood, score: res.data.score, summary: res.data.summary });
            localStorage.removeItem(DRAFT_KEY);
            await loadRecent();
            toast.success("Đã lưu & phân tích cảm xúc 🎉");
        } catch {
            toast.error("Không thể phân tích cảm xúc");
        } finally {
            setLoading(false);
        }
    };

    // Trang mới: xoá nội dung + kết quả AI
    const handleNewPage = () => {
        if (content.trim() && !window.confirm("Bắt đầu trang mới? Nội dung hiện tại sẽ bị xoá."))
            return;
        setContent("");
        setResult(null);
        setDisplay("");
        localStorage.removeItem(DRAFT_KEY);
    };

    const handleKeyDown = (e) => {
        if (window.innerWidth < 768) return;
        if (e.shiftKey && e.key === "Enter") return;
        if (e.key === "Enter") { e.preventDefault(); handleAnalyze(); }
    };

    const mood = result ? getMood(result.mood) : null;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">

            {/* ── HEADER ── */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <BsPencilFill className="text-blue-400" size={22} />
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Nhật kí của tôi
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-9 capitalize">{today()}</p>
                </div>

                {/* Nút Trang mới — icon tờ giấy + dấu + = bắt đầu trang mới */}
                <button
                    onClick={handleNewPage}
                    title="Trang mới — xoá và bắt đầu lại"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl
                               bg-white/5 hover:bg-white/10 border border-white/10
                               text-gray-300 hover:text-white transition text-sm font-medium"
                >
                    <BsJournalPlus size={18} />
                    <span className="hidden sm:inline">Trang mới</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── LEFT: EDITOR ── */}
                <div>
                    {/* Tờ nhật kí */}
                    <div className="relative bg-[#1a1f2e] rounded-2xl border border-white/8
                                    shadow-xl overflow-hidden">

                        {/* Gáy sổ bên trái */}
                        <div className="absolute left-0 top-0 bottom-0 w-1
                                        bg-gradient-to-b from-blue-500/60 via-blue-400/40 to-blue-500/60
                                        rounded-l-2xl" />

                        {/* Đường kẻ trang giấy */}
                        <div className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(255,255,255,0.03) 31px, rgba(255,255,255,0.03) 32px)",
                                backgroundPositionY: "48px"
                            }} />

                        <div className="relative p-6 pl-8">
                            {/* Ngày trên đầu trang */}
                            <div className="text-xs text-blue-400/70 font-medium mb-4 tracking-wide">
                                📅 {today()}
                            </div>

                            <textarea
                                value={content}
                                disabled={loading}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={"Hôm nay bạn cảm thấy thế nào?\n\nHãy viết tự do — không có gì là đúng hay sai..."}
                                className="w-full h-[300px] md:h-[380px] resize-none bg-transparent
                                           outline-none text-gray-100 leading-8 text-[15px]
                                           placeholder:text-gray-600 placeholder:leading-8"
                                style={{ fontFamily: "'Georgia', serif" }}
                            />

                            {/* Word count + hint */}
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                                <span>{wordCount} từ</span>
                                <span className="hidden sm:inline">
                                    Enter để phân tích · Shift+Enter xuống dòng
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nút phân tích */}
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !content.trim()}
                        className="mt-4 w-full flex items-center justify-center gap-2
                                   bg-blue-600 hover:bg-blue-700 disabled:opacity-40
                                   disabled:cursor-not-allowed py-3 rounded-xl
                                   font-semibold transition text-sm"
                    >
                        <BsStars size={16} />
                        {loading ? "Đang phân tích..." : "Phân tích cảm xúc"}
                    </button>

                    {/* Nhật kí gần đây */}
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                            Gần đây
                        </h3>
                        {recentJournals.length === 0
                            ? <p className="text-gray-600 text-sm text-center py-6">Chưa có nhật kí nào</p>
                            : (
                                <div className="space-y-2">
                                    {recentJournals.map(j => {
                                        const m = getMood(j.mood);
                                        return (
                                            <div
                                                key={j.id}
                                                onClick={() => openDetail(j.id)}
                                                className={`flex items-start gap-3 p-3 rounded-xl
                                                            border cursor-pointer transition hover:brightness-110
                                                            ${m.bg} ${m.border}`}
                                            >
                                                <span className="text-lg mt-0.5">{m.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-300 truncate">
                                                        {j.content.length > 70
                                                            ? j.content.slice(0, 70) + "..."
                                                            : j.content}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
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

                {/* ── RIGHT: KẾT QUẢ AI ── */}
                <div className="space-y-4">

                    {/* Cảm xúc */}
                    <div className={`rounded-2xl p-5 border transition-all duration-500
                                    ${mood ? `${mood.bg} ${mood.border}` : "bg-slate-900 border-white/5"}`}>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Cảm xúc</p>
                        {result
                            ? <div className={`text-2xl font-bold flex items-center gap-2 ${mood.text}`}>
                                <span>{mood.emoji}</span>
                                <span className="capitalize">{result.mood}</span>
                            </div>
                            : <p className="text-gray-600 text-sm">Chưa có kết quả</p>
                        }
                    </div>

                    {/* Điểm số */}
                    <div className="bg-slate-900 rounded-2xl p-5 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                            Điểm cảm xúc
                        </p>
                        <div className="text-3xl font-bold mb-4">
                            {result ? result.score : <span className="text-gray-700">—</span>}
                        </div>

                        {/* Thanh màu */}
                        <div className="relative">
                            <div className="flex h-3 rounded-full overflow-hidden">
                                {moodRanges.map(r => (
                                    <div key={r.label}
                                        title={`${r.emoji} ${r.label} (${r.min}–${r.max})`}
                                        className={`${r.color} flex-1`} />
                                ))}
                            </div>
                            {result && (
                                <div className="absolute top-[-5px] w-5 h-5 bg-white rounded-full
                                                shadow-lg border-2 border-gray-900 transition-all duration-700"
                                    style={{ left: `calc(${result.score}% - 10px)` }} />
                            )}
                        </div>

                        {/* Labels */}
                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                            {moodRanges.map(r => (
                                <span key={r.label}>{r.emoji}</span>
                            ))}
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div className="bg-slate-900 rounded-2xl p-5 border border-white/5 min-h-[200px]">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <BsStars className="text-yellow-400" />
                            AI phân tích
                        </p>
                        {loading
                            ? <SkeletonCard />
                            : result
                                ? <p className="text-gray-200 leading-7 whitespace-pre-wrap text-[14px]">
                                    {displaySummary}
                                </p>
                                : <p className="text-gray-600 text-sm">
                                    Viết nhật kí và bấm phân tích để AI đọc cảm xúc của bạn ✨
                                </p>
                        }
                    </div>
                </div>
            </div>

            {/* ── MODAL CHI TIẾT ── */}
            {selectedJournal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                                flex items-center justify-center p-4"
                     onClick={() => setSelected(null)}>
                    <div className="w-full max-w-xl"
                         onClick={e => e.stopPropagation()}>

                        {detailLoading ? (
                            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6">
                                <SkeletonCard />
                            </div>
                        ) : selectedJournal && !selectedJournal._loading && (() => {
                            const m = getMood(selectedJournal.mood);
                            return (
                                <div className="bg-[#1a1f2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

                                    {/* Gáy sổ trên màu theo mood */}
                                    <div className={`h-1 w-full ${m.bar} opacity-70`} />

                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-5">
                                            <div>
                                                <div className={`flex items-center gap-2 text-sm font-semibold ${m.text}`}>
                                                    <span>{m.emoji}</span>
                                                    <span className="capitalize">{selectedJournal.mood}</span>
                                                    <span className="text-gray-600 font-normal">·</span>
                                                    <span className="text-gray-500 font-normal">
                                                        {new Date(selectedJournal.createdAt).toLocaleDateString("vi-VN", {
                                                            weekday: "short", day: "numeric", month: "short"
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    🕒 {new Date(selectedJournal.createdAt).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>
                                            <button onClick={() => setSelected(null)}
                                                    className="text-gray-500 hover:text-white transition">
                                                <BsXLg size={14} />
                                            </button>
                                        </div>

                                        {/* Trang giấy */}
                                        <div className="relative bg-slate-900/60 rounded-xl p-5 mb-4
                                                        border border-white/5 max-h-[200px] overflow-y-auto"
                                             style={{
                                                 backgroundImage: "repeating-linear-gradient(transparent,transparent 27px,rgba(255,255,255,0.025) 27px,rgba(255,255,255,0.025) 28px)",
                                                 backgroundPositionY: "12px"
                                             }}>
                                            <p className="text-gray-200 leading-7 whitespace-pre-wrap text-sm"
                                               style={{ fontFamily: "'Georgia', serif" }}>
                                                {selectedJournal.content}
                                            </p>
                                        </div>

                                        {/* Score bar */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xs text-gray-500 shrink-0">Điểm</span>
                                            <span className={`text-base font-bold shrink-0 ${m.text}`}>
                                                {selectedJournal.score}
                                            </span>
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${m.bar}`}
                                                     style={{ width: `${selectedJournal.score}%` }} />
                                            </div>
                                        </div>

                                        {/* AI Summary */}
                                        {selectedJournal.summary && (
                                            <div className="bg-slate-800/60 rounded-xl p-4 border border-white/5">
                                                <p className="text-xs text-yellow-400 font-semibold mb-2 flex items-center gap-1.5">
                                                    <BsStars size={11} /> AI phân tích
                                                </p>
                                                <p className="text-sm text-gray-400 leading-6">
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
