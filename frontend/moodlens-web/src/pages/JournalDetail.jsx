import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { BsStars, BsPencilFill, BsTrash3, BsArrowLeft, BsCheckLg, BsXLg } from "react-icons/bs";

const moodConfig = {
    happy: { emoji: "😊", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/25", dot: "bg-green-400" },
    sad: { emoji: "😢", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", dot: "bg-blue-400" },
    stress: { emoji: "😰", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25", dot: "bg-yellow-400" },
    neutral: { emoji: "😐", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25", dot: "bg-purple-400" },
    angry: { emoji: "😠", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25", dot: "bg-red-400" },
};
const getMood = (mood) => moodConfig[(mood || "").toLowerCase()] || moodConfig.neutral;

const moodRanges = [
    { max: 20, label: "Buồn bã", emoji: "😢", color: "bg-blue-500" },
    { max: 50, label: "Căng thẳng", emoji: "😰", color: "bg-yellow-500" },
    { max: 80, label: "Ổn định", emoji: "😐", color: "bg-gray-400" },
    { max: 100, label: "Vui vẻ", emoji: "😊", color: "bg-green-500" },
];
const getScoreRange = (score) =>
    moodRanges.find(r => score <= r.max) || moodRanges[3];

export default function JournalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [editing, setEditing] = useState(false);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => { loadJournal(); }, [id]);
    useEffect(() => {
        setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
    }, [content]);

    const loadJournal = async () => {
        try {
            const res = await api.get(`/journal/${id}`);
            setItem(res.data);
            setContent(res.data.content);
        } catch {
            toast.error("Không tải được nhật kí");
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        try {
            setSaving(true);
            await api.put(`/journal/${id}`, { content });
            toast.success("Đã lưu nhật kí ✍️");
            await loadJournal();
            setEditing(false);
        } catch {
            toast.error("Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setContent(item.content);
        setEditing(false);
    };

    const handleDelete = async () => {
        if (!window.confirm("Xoá nhật kí này?")) return;
        try {
            setDeleting(true);
            await api.delete(`/journal/${id}`);
            toast.success("Đã xoá nhật kí");
            navigate("/history");
        } catch {
            toast.error("Xoá thất bại");
        } finally {
            setDeleting(false);
        }
    };

    // ── Loading ──
    if (!item) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full max-w-2xl px-6">
                <div className="h-6 bg-slate-800 rounded w-1/3" />
                <div className="h-64 bg-slate-800 rounded-2xl" />
                <div className="h-32 bg-slate-800 rounded-2xl" />
            </div>
        </div>
    );

    const mood = getMood(item.mood);
    const score = Math.max(0, Math.min(100, item.score || 0));
    const range = getScoreRange(score);
    const createdAt = new Date(item.createdAt);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">

                {/* ── TOP NAV ── */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400
                                   hover:text-white transition text-sm"
                    >
                        <BsArrowLeft size={16} /> Trở về
                    </button>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                               bg-white/5 hover:bg-white/10 text-gray-400
                                               hover:text-white text-sm transition"
                                >
                                    <BsXLg size={12} /> Huỷ
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                               bg-green-600 hover:bg-green-700 text-white
                                               text-sm font-medium transition disabled:opacity-50"
                                >
                                    <BsCheckLg size={13} />
                                    {saving ? "Đang lưu..." : "Lưu lại"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                               bg-blue-500/15 hover:bg-blue-500/25 text-blue-300
                                               text-sm transition"
                                >
                                    <BsPencilFill size={12} /> Chỉnh sửa
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                               bg-red-500/15 hover:bg-red-500/25 text-red-300
                                               text-sm transition disabled:opacity-50"
                                >
                                    <BsTrash3 size={12} />
                                    {deleting ? "Đang xoá..." : "Xoá"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ── TRANG NHẬT KÍ ── */}
                <div className="relative bg-[#1a1f2e] rounded-2xl border border-white/8
                                shadow-2xl overflow-hidden mb-6">

                    {/* Gáy sổ trái */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl
                                    bg-gradient-to-b ${mood.dot}
                                    opacity-70`} />

                    {/* Đường kẻ trang */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(255,255,255,0.025) 31px, rgba(255,255,255,0.025) 32px)",
                            backgroundPositionY: "72px"
                        }} />

                    <div className="relative p-6 pl-8">

                        {/* Header trang: ngày + mood */}
                        <div className="flex items-start justify-between mb-6 pb-4
                                        border-b border-white/5">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                                    Nhật kí
                                </p>
                                <p className="text-sm font-medium text-gray-300 capitalize">
                                    {createdAt.toLocaleDateString("vi-VN", {
                                        weekday: "long", year: "numeric",
                                        month: "long", day: "numeric"
                                    })}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    {createdAt.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            </div>

                            {/* Mood badge */}
                            <div className={`flex items-center gap-2 px-3 py-1.5
                                            rounded-full border text-sm font-semibold
                                            ${mood.bg} ${mood.border} ${mood.color}`}>
                                <span>{mood.emoji}</span>
                                <span className="capitalize">{item.mood}</span>
                            </div>
                        </div>

                        {/* Nội dung / Editor */}
                        {editing ? (
                            <div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    autoFocus
                                    className="w-full min-h-[280px] bg-transparent outline-none
                                               text-gray-100 leading-8 text-[15px] resize-none
                                               placeholder:text-gray-600"
                                    style={{ fontFamily: "'Georgia', serif" }}
                                    placeholder="Viết lại nhật kí của bạn..."
                                />
                                <div className="text-xs text-gray-600 mt-2 text-right">
                                    {wordCount} từ
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-200 leading-8 whitespace-pre-wrap text-[15px]
                                          min-h-[180px]"
                                style={{ fontFamily: "'Georgia', serif" }}>
                                {item.content}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── ĐIỂM SỐ ── */}
                <div className="bg-slate-900 rounded-2xl border border-white/5 p-5 mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
                        Điểm cảm xúc
                    </p>

                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-4xl font-bold">{score}</span>
                        <span className={`text-sm font-medium mb-1 ${mood.color}`}>
                            {range.emoji} {range.label}
                        </span>
                    </div>

                    {/* Thanh gradient */}
                    <div className="relative mb-2">
                        <div className="flex h-3 rounded-full overflow-hidden">
                            {moodRanges.map(r => (
                                <div key={r.label} className={`${r.color} flex-1`}
                                    title={r.label} />
                            ))}
                        </div>
                        <div className="absolute top-[-5px] w-5 h-5 bg-white rounded-full
                                        shadow-lg border-2 border-gray-900 transition-all duration-500"
                            style={{ left: `calc(${score}% - 10px)` }} />
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 mt-3">
                        {moodRanges.map(r => (
                            <span key={r.label}>{r.emoji}</span>
                        ))}
                    </div>
                </div>

                {/* ── AI SUMMARY ── */}
                <div className="bg-slate-900 rounded-2xl border border-white/5 p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3
                                  flex items-center gap-2">
                        <BsStars className="text-yellow-400" /> AI phân tích
                    </p>
                    <p className="text-gray-300 leading-7 whitespace-pre-wrap text-sm">
                        {item.summary || "Chưa có phân tích"}
                    </p>
                </div>

            </div>
        </div>
    );
}
