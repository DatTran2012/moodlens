import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { BsStars, BsPencilFill, BsTrash3, BsArrowLeft, BsCheckLg, BsXLg } from "react-icons/bs";

// ── Palette nâu ấm ────────────────────────────────────────────────────────────
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

const moodConfig = {
    happy:   { emoji:"😊", color:"text-emerald-700", bg:"bg-emerald-100", border:"border-emerald-300", dot:"bg-emerald-500" },
    sad:     { emoji:"😢", color:"text-blue-700",    bg:"bg-blue-100",    border:"border-blue-300",    dot:"bg-blue-500"    },
    stress:  { emoji:"😰", color:"text-amber-700",   bg:"bg-amber-100",   border:"border-amber-300",   dot:"bg-amber-500"   },
    neutral: { emoji:"😐", color:"text-stone-600",   bg:"bg-stone-100",   border:"border-stone-300",   dot:"bg-stone-400"   },
    angry:   { emoji:"😠", color:"text-red-700",     bg:"bg-red-100",     border:"border-red-300",     dot:"bg-red-500"     },
};
const getMood = (m) => moodConfig[(m||"").toLowerCase()] || moodConfig.neutral;

const moodRanges = [
    { max:20,  label:"Buồn bã",    emoji:"😢", color:"bg-blue-400"    },
    { max:50,  label:"Căng thẳng", emoji:"😰", color:"bg-amber-400"   },
    { max:80,  label:"Ổn định",    emoji:"😐", color:"bg-stone-400"   },
    { max:100, label:"Vui vẻ",     emoji:"😊", color:"bg-emerald-500" },
];
const getScoreRange = (s) => moodRanges.find(r => s <= r.max) || moodRanges[3];

export default function JournalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem]         = useState(null);
    const [editing, setEditing]   = useState(false);
    const [content, setContent]   = useState("");
    const [saving, setSaving]     = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => { loadJournal(); }, [id]);
    useEffect(() => {
        setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
    }, [content]);

    const loadJournal = async () => {
        try {
            const res = await api.get(`/journal/${id}`);
            setItem(res.data); setContent(res.data.content);
        } catch { toast.error("Không tải được nhật kí"); }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        try {
            setSaving(true);
            await api.put(`/journal/${id}`, { content });
            toast.success("Đã lưu nhật kí ✍️");
            await loadJournal(); setEditing(false);
        } catch { toast.error("Lưu thất bại"); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Xoá nhật kí này?")) return;
        try {
            setDeleting(true);
            await api.delete(`/journal/${id}`);
            toast.success("Đã xoá nhật kí");
            navigate("/history");
        } catch { toast.error("Xoá thất bại"); }
        finally { setDeleting(false); }
    };

    // Loading skeleton
    if (!item) return (
        <div className="min-h-screen flex items-center justify-center"
             style={{ background: P.bg }}>
            <div className="animate-pulse space-y-4 w-full max-w-2xl px-6">
                <div className="h-6 rounded w-1/3" style={{ background: P.card }} />
                <div className="h-64 rounded-2xl"  style={{ background: P.card }} />
                <div className="h-32 rounded-2xl"  style={{ background: P.card }} />
            </div>
        </div>
    );

    const mood      = getMood(item.mood);
    const score     = Math.max(0, Math.min(100, item.score || 0));
    const range     = getScoreRange(score);
    const createdAt = new Date(item.createdAt);

    return (
        <div className="min-h-screen p-4 sm:p-8" style={{ background: P.bg, color: P.text }}>
            <div className="max-w-2xl mx-auto">

                {/* ── TOP NAV ── */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm transition hover:opacity-70"
                            style={{ color: P.muted }}>
                        <BsArrowLeft size={16} /> Trở về
                    </button>

                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <button onClick={() => { setContent(item.content); setEditing(false); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition hover:opacity-80"
                                        style={{ background: P.surface, border:`1px solid ${P.border}`, color: P.muted }}>
                                    <BsXLg size={12} /> Huỷ
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                        style={{ background:`linear-gradient(135deg,#5a7a4a,#3d5c32)` }}>
                                    <BsCheckLg size={13} />
                                    {saving ? "Đang lưu..." : "Lưu lại"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setEditing(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition hover:opacity-80"
                                        style={{ background:"#eef4e8", border:"1px solid #b8d4a8", color:"#4a7a3a" }}>
                                    <BsPencilFill size={12} /> Chỉnh sửa
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition hover:opacity-80 disabled:opacity-50"
                                        style={{ background:"#fdecea", border:"1px solid #f5b8b0", color:"#c0392b" }}>
                                    <BsTrash3 size={12} />
                                    {deleting ? "Đang xoá..." : "Xoá"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── TRANG NHẬT KÍ ── */}
                <div className="relative rounded-2xl overflow-hidden mb-6"
                     style={{
                         background: P.surface,
                         border: `1px solid ${P.border}`,
                         boxShadow: "0 4px 24px rgba(139,110,80,0.10), inset 0 0 0 1px rgba(255,255,255,0.5)"
                     }}>

                    {/* Gáy sổ trái — nâu ấm */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                         style={{ background:`linear-gradient(to bottom, ${P.spine}, #a8896a, ${P.spine})` }} />

                    {/* Đường kẻ trang */}
                    <div className="absolute inset-0 pointer-events-none"
                         style={{
                             backgroundImage: `repeating-linear-gradient(transparent,transparent 31px,${P.line} 31px,${P.line} 32px)`,
                             backgroundPositionY: "80px"
                         }} />

                    <div className="relative p-6 pl-9">

                        {/* Header trang */}
                        <div className="flex items-start justify-between mb-6 pb-4"
                             style={{ borderBottom:`1px solid ${P.border}` }}>
                            <div>
                                <p className="text-xs uppercase tracking-widest mb-1"
                                   style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                                    Nhật kí
                                </p>
                                <p className="text-sm font-medium capitalize"
                                   style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                                    {createdAt.toLocaleDateString("vi-VN", {
                                        weekday:"long", year:"numeric", month:"long", day:"numeric"
                                    })}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: P.muted }}>
                                    {createdAt.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" })}
                                </p>
                            </div>

                            {/* Mood badge */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full
                                            border text-sm font-semibold ${mood.bg} ${mood.border} ${mood.color}`}>
                                <span>{mood.emoji}</span>
                                <span className="capitalize">{item.mood}</span>
                            </div>
                        </div>

                        {/* Nội dung / Editor */}
                        {editing ? (
                            <div>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    autoFocus
                                    className="w-full min-h-[280px] bg-transparent outline-none
                                               leading-8 text-[15px] resize-none"
                                    style={{ color: P.text, fontFamily:"'Georgia', serif", caretColor: P.accent }}
                                    placeholder="Viết lại nhật kí của bạn..."
                                />
                                <div className="text-xs mt-2 text-right" style={{ color: P.muted }}>
                                    {wordCount} từ
                                </div>
                            </div>
                        ) : (
                            <p className="leading-8 whitespace-pre-wrap text-[15px] min-h-[180px]"
                               style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                                {item.content}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── ĐIỂM SỐ ── */}
                <div className="rounded-2xl p-5 mb-6"
                     style={{ background: P.surface, border:`1px solid ${P.border}` }}>
                    <p className="text-xs uppercase tracking-wider mb-4"
                       style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                        Điểm cảm xúc
                    </p>

                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-4xl font-bold" style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                            {score}
                        </span>
                        <span className={`text-sm font-medium mb-1 ${mood.color}`}>
                            {range.emoji} {range.label}
                        </span>
                    </div>

                    <div className="relative mb-2">
                        <div className="flex h-3 rounded-full overflow-hidden"
                             style={{ border:`1px solid ${P.border}` }}>
                            {moodRanges.map(r => (
                                <div key={r.label} className={`${r.color} flex-1 opacity-75`}
                                     title={r.label} />
                            ))}
                        </div>
                        <div className="absolute top-[-5px] w-5 h-5 rounded-full shadow-lg transition-all duration-500"
                             style={{ left:`calc(${score}% - 10px)`, background:"white", border:`2px solid ${P.spine}` }} />
                    </div>

                    <div className="flex justify-between text-xs mt-3" style={{ color: P.muted }}>
                        {moodRanges.map(r => <span key={r.label}>{r.emoji}</span>)}
                    </div>
                </div>

                {/* ── AI SUMMARY ── */}
                <div className="rounded-2xl p-5"
                     style={{ background:"#fef9ec", border:"1px solid #e8d5a0" }}>
                    <p className="text-xs uppercase tracking-wider mb-3 flex items-center gap-2"
                       style={{ color:"#92701a", fontFamily:"'Georgia', serif" }}>
                        <BsStars className="text-yellow-600" size={13} /> AI phân tích
                    </p>
                    <p className="leading-7 whitespace-pre-wrap text-sm"
                       style={{ color:"#6b5320", fontFamily:"'Georgia', serif" }}>
                        {item.summary || "Chưa có phân tích"}
                    </p>
                </div>

            </div>
        </div>
    );
}
