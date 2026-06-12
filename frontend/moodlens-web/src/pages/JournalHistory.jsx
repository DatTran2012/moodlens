import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { BsStars, BsCalendar3, BsChevronLeft, BsChevronRight } from "react-icons/bs";

const moodConfig = {
    happy: { icon: "😊", color: "text-green-400", dot: "bg-green-400", ring: "ring-green-400/30", card: "bg-green-500/8  border-green-500/20" },
    sad: { icon: "😢", color: "text-blue-400", dot: "bg-blue-400", ring: "ring-blue-400/30", card: "bg-blue-500/8   border-blue-500/20" },
    stress: { icon: "😰", color: "text-yellow-400", dot: "bg-yellow-400", ring: "ring-yellow-400/30", card: "bg-yellow-500/8 border-yellow-500/20" },
    neutral: { icon: "😐", color: "text-purple-400", dot: "bg-purple-400", ring: "ring-purple-400/30", card: "bg-purple-500/8 border-purple-500/20" },
    angry: { icon: "😠", color: "text-red-400", dot: "bg-red-400", ring: "ring-red-400/30", card: "bg-red-500/8    border-red-500/20" },
};

const getMood = (mood) => moodConfig[(mood || "").toLowerCase()] || moodConfig.neutral;

const truncate = (text, max = 150) =>
    !text ? "" : text.length > max ? text.slice(0, max) + "..." : text;

const formatDate = (iso) => {
    const d = new Date(iso);
    return {
        time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        full: d.toLocaleString("vi-VN"),
    };
};

const groupByDate = (items) => {
    const groups = {};
    items.forEach(item => {
        const key = new Date(item.createdAt).toLocaleDateString("vi-VN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    });
    return Object.entries(groups);
};

export default function JournalHistory() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
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
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const groups = groupByDate(data);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">

            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <BsCalendar3 className="text-blue-400" size={24} />
                    Hành trình cảm xúc
                </h1>
                <p className="text-gray-500 mt-1 ml-9 text-sm">
                    Nhìn lại những khoảnh khắc bạn đã ghi lại
                </p>
            </div>

            {/* FILTER */}
            <div className="flex gap-3 mb-10 ml-0 sm:ml-9">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => { setPage(1); setDate(e.target.value); }}
                    className="bg-white/5 border border-white/10 px-4 py-2
                               rounded-xl text-sm text-gray-300 outline-none
                               focus:border-blue-500/50 transition"
                />
                <button
                    onClick={() => { setDate(new Date().toISOString().split("T")[0]); setPage(1); }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10
                               border border-white/10 text-sm text-gray-300 transition"
                >
                    Hôm nay
                </button>
            </div>

            {/* TIMELINE */}
            {loading ? (
                <div className="space-y-6 ml-0 sm:ml-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-3 h-3 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                            <div className="flex-1 bg-slate-800 rounded-2xl h-28" />
                        </div>
                    ))}
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-lg font-semibold">Không có nhật kí nào</p>
                    <p className="text-gray-500 mt-2 text-sm">Thử chọn ngày khác hoặc bắt đầu viết nhật kí mới</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {groups.map(([dateLabel, items]) => (
                        <div key={dateLabel}>

                            {/* Date label */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                                <span className="text-sm font-semibold text-blue-400 capitalize tracking-wide">
                                    {dateLabel}
                                </span>
                                <div className="flex-1 h-px bg-white/5" />
                                <span className="text-xs text-gray-600">{items.length} nhật kí</span>
                            </div>

                            {/* Items trong ngày */}
                            <div className="relative ml-1 sm:ml-4">

                                {/* Đường kẻ dọc timeline */}
                                <div className="absolute left-[5px] top-3 bottom-3 w-px bg-white/8" />

                                <div className="space-y-4">
                                    {items.map((item, idx) => {
                                        const mood = getMood(item.mood);
                                        const { time } = formatDate(item.createdAt);
                                        const isLast = idx === items.length - 1;

                                        return (
                                            <div key={item.id} className="flex gap-4 group">

                                                {/* Dot + line */}
                                                <div className="flex flex-col items-center shrink-0 pt-3">
                                                    <div className={`w-3 h-3 rounded-full shrink-0 z-10
                                                                    ring-4 ${mood.ring} ${mood.dot}
                                                                    transition group-hover:scale-125`} />
                                                    {!isLast && <div className="w-px flex-1 bg-transparent" />}
                                                </div>

                                                {/* Card */}
                                                <div
                                                    onClick={() => navigate(`/journal/${item.id}`)}
                                                    className={`flex-1 mb-2 rounded-2xl border p-4
                                                                cursor-pointer transition-all duration-200
                                                                hover:scale-[1.01] hover:shadow-lg
                                                                hover:shadow-black/30 ${mood.card}`}
                                                >
                                                    {/* Top row: time + mood */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs text-gray-500">🕒 {time}</span>
                                                        <span className={`flex items-center gap-1.5 text-sm
                                                                          font-semibold ${mood.color}`}>
                                                            <span>{mood.icon}</span>
                                                            <span className="capitalize">{item.mood}</span>
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <p className="text-gray-200 text-sm leading-relaxed mb-3"
                                                        style={{ fontFamily: "'Georgia', serif" }}>
                                                        {truncate(item.content, 160)}
                                                    </p>

                                                    {/* AI Summary */}
                                                    {item.summary && (
                                                        <div className="bg-black/20 rounded-xl px-3 py-2
                                                                        border border-white/5">
                                                            <p className="text-xs text-yellow-400 font-semibold
                                                                          mb-1 flex items-center gap-1">
                                                                <BsStars size={11} /> AI Summary
                                                            </p>
                                                            <p className="text-xs text-gray-400 leading-relaxed">
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
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                                   bg-white/5 hover:bg-white/10 border border-white/10
                                   disabled:opacity-30 disabled:cursor-not-allowed
                                   text-sm transition"
                    >
                        <BsChevronLeft size={13} /> Trước
                    </button>

                    <span className="text-sm text-gray-400">
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                                   bg-white/5 hover:bg-white/10 border border-white/10
                                   disabled:opacity-30 disabled:cursor-not-allowed
                                   text-sm transition"
                    >
                        Tiếp <BsChevronRight size={13} />
                    </button>
                </div>
            )}
        </div>
    );
}
