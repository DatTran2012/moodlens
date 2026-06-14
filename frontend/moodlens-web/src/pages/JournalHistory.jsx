import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { BsStars, BsCalendar3, BsChevronLeft, BsChevronRight } from "react-icons/bs";

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
    happy:   { icon:"😊", color:"text-emerald-700", dot:"bg-emerald-500", ring:"ring-emerald-400/40", card:"bg-emerald-50  border-emerald-200" },
    sad:     { icon:"😢", color:"text-blue-700",    dot:"bg-blue-500",    ring:"ring-blue-400/40",    card:"bg-blue-50    border-blue-200"    },
    stress:  { icon:"😰", color:"text-amber-700",   dot:"bg-amber-500",   ring:"ring-amber-400/40",   card:"bg-amber-50   border-amber-200"   },
    neutral: { icon:"😐", color:"text-stone-600",   dot:"bg-stone-400",   ring:"ring-stone-400/40",   card:"bg-stone-50   border-stone-200"   },
    angry:   { icon:"😠", color:"text-red-700",     dot:"bg-red-500",     ring:"ring-red-400/40",     card:"bg-red-50     border-red-200"     },
};
const getMood = (m) => moodConfig[(m||"").toLowerCase()] || moodConfig.neutral;
const truncate = (t, n=150) => !t ? "" : t.length > n ? t.slice(0,n)+"..." : t;
const groupByDate = (items) => {
    const g = {};
    items.forEach(i => {
        const k = new Date(i.createdAt).toLocaleDateString("vi-VN", {
            weekday:"long", year:"numeric", month:"long", day:"numeric"
        });
        if (!g[k]) g[k] = [];
        g[k].push(i);
    });
    return Object.entries(g);
};

export default function JournalHistory() {
    const [data, setData]       = useState([]);
    const [page, setPage]       = useState(1);
    const [total, setTotal]     = useState(0);
    const [date, setDate]       = useState(() => new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const pageSize = 10;

    useEffect(() => { fetchData(); }, [page, date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/journal/history", {
                params: { page, pageSize, date: date || null }
            });
            setData(res.data.data);
            setTotal(res.data.total);
        } finally { setLoading(false); }
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const groups = groupByDate(data);

    return (
        <div className="min-h-screen p-4 sm:p-8" style={{ background: P.bg, color: P.text }}>

            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"
                    style={{ fontFamily:"'Georgia', serif" }}>
                    <BsCalendar3 size={24} style={{ color: P.accent }} />
                    Hành trình cảm xúc
                </h1>
                <p className="mt-1 ml-9 text-sm" style={{ color: P.muted }}>
                    Nhìn lại những khoảnh khắc bạn đã ghi lại
                </p>
            </div>

            {/* FILTER */}
            <div className="flex gap-3 mb-10 ml-0 sm:ml-9">
                <input
                    type="date"
                    value={date}
                    onChange={e => { setPage(1); setDate(e.target.value); }}
                    className="px-4 py-2 rounded-xl text-sm outline-none transition"
                    style={{
                        background: P.surface,
                        border: `1px solid ${P.border}`,
                        color: P.text,
                    }}
                />
                <button
                    onClick={() => { setDate(new Date().toISOString().split("T")[0]); setPage(1); }}
                    className="px-4 py-2 rounded-xl text-sm transition hover:opacity-80"
                    style={{ background: P.surface, border:`1px solid ${P.border}`, color: P.accent }}
                >
                    Hôm nay
                </button>
            </div>

            {/* TIMELINE */}
            {loading ? (
                <div className="space-y-6 ml-0 sm:ml-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                                 style={{ background: P.border }} />
                            <div className="flex-1 rounded-2xl h-28"
                                 style={{ background: P.card }} />
                        </div>
                    ))}
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-lg font-semibold" style={{ color: P.text }}>
                        Không có nhật kí nào
                    </p>
                    <p className="mt-2 text-sm" style={{ color: P.muted }}>
                        Thử chọn ngày khác hoặc bắt đầu viết nhật kí mới
                    </p>
                </div>
            ) : (
                <div className="space-y-10">
                    {groups.map(([dateLabel, items]) => (
                        <div key={dateLabel}>

                            {/* Date label */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                                     style={{ background: P.accent }} />
                                <span className="text-sm font-bold capitalize tracking-wide"
                                      style={{ color: P.accent, fontFamily:"'Georgia', serif" }}>
                                    {dateLabel}
                                </span>
                                <div className="flex-1 h-px" style={{ background: P.border }} />
                                <span className="text-xs" style={{ color: P.muted }}>
                                    {items.length} nhật kí
                                </span>
                            </div>

                            {/* Items */}
                            <div className="relative ml-1 sm:ml-4">

                                {/* Đường kẻ dọc timeline — nâu nhạt */}
                                <div className="absolute left-[5px] top-3 bottom-3 w-px"
                                     style={{ background: P.border }} />

                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const mood = getMood(item.mood);
                                        const time = new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                                            hour:"2-digit", minute:"2-digit"
                                        });

                                        return (
                                            <div key={item.id} className="flex gap-4 group">

                                                {/* Dot */}
                                                <div className="flex flex-col items-center shrink-0 pt-3">
                                                    <div className={`w-3 h-3 rounded-full shrink-0 z-10
                                                                    ring-4 ${mood.ring} ${mood.dot}
                                                                    transition group-hover:scale-125`} />
                                                </div>

                                                {/* Card */}
                                                <div
                                                    onClick={() => navigate(`/journal/${item.id}`)}
                                                    className={`flex-1 mb-2 rounded-2xl border p-4
                                                                cursor-pointer transition-all duration-200
                                                                hover:scale-[1.01] hover:shadow-md
                                                                ${mood.card}`}
                                                    style={{ boxShadow:"0 2px 8px rgba(139,110,80,0.06)" }}
                                                >
                                                    {/* Top row */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs" style={{ color: P.muted }}>
                                                            🕒 {time}
                                                        </span>
                                                        <span className={`flex items-center gap-1.5 text-sm font-semibold ${mood.color}`}>
                                                            <span>{mood.icon}</span>
                                                            <span className="capitalize">{item.mood}</span>
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <p className="text-sm leading-relaxed mb-3"
                                                       style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                                                        {truncate(item.content, 160)}
                                                    </p>

                                                    {/* AI Summary */}
                                                    {item.summary && (
                                                        <div className="rounded-xl px-3 py-2"
                                                             style={{ background:"#fef9ec", border:"1px solid #e8d5a0" }}>
                                                            <p className="text-xs font-semibold mb-1 flex items-center gap-1"
                                                               style={{ color:"#92701a" }}>
                                                                <BsStars size={11} /> AI Summary
                                                            </p>
                                                            <p className="text-xs leading-relaxed"
                                                               style={{ color:"#6b5320", fontFamily:"'Georgia', serif" }}>
                                                                {truncate(item.summary, 120)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: P.surface, border:`1px solid ${P.border}`, color: P.accent }}
                    >
                        <BsChevronLeft size={13} /> Trước
                    </button>

                    <span className="text-sm" style={{ color: P.muted }}>
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: P.surface, border:`1px solid ${P.border}`, color: P.accent }}
                    >
                        Tiếp <BsChevronRight size={13} />
                    </button>
                </div>
            )}
        </div>
    );
}
