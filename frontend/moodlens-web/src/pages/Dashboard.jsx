import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaFire } from "react-icons/fa";
import { BsStars, BsCalendar3, BsJournalText, BsXLg, BsArrowRight } from "react-icons/bs";
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from "recharts";

// ── Config ────────────────────────────────────────────────────────────────────
const moodConfig = {
    happy: { emoji: "😊", text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/25", pie: "#22c55e", cal: "bg-green-500" },
    sad: { emoji: "😢", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25", pie: "#3b82f6", cal: "bg-blue-500" },
    stress: { emoji: "😰", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/25", pie: "#eab308", cal: "bg-yellow-500" },
    neutral: { emoji: "😐", text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25", pie: "#a855f7", cal: "bg-purple-500" },
    angry: { emoji: "😠", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25", pie: "#ef4444", cal: "bg-red-500" },
};
const getMood = (mood) => moodConfig[(mood || "").toLowerCase()] || moodConfig.neutral;

const streakLabel = (d) => d >= 30 ? "Legend 🏅" : d >= 14 ? "Amazing 🚀" : d >= 7 ? "Great 🔥" : d >= 3 ? "Good 👍" : "Bắt đầu";

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-800 rounded-xl ${className}`} />
);

// ── Modal đọc nhật kí ─────────────────────────────────────────────────────────
function JournalModal({ journal, onClose }) {
    const navigate = useNavigate();
    if (!journal) return null;
    const mood = getMood(journal.mood);
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                        flex items-center justify-center p-4"
            onClick={onClose}>
            <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-xl border border-white/10
                            shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>

                {/* Gáy sổ */}
                <div className={`h-1 w-full ${mood.cal} opacity-60`} />

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <div className={`flex items-center gap-2 text-sm font-semibold ${mood.text}`}>
                                <span>{mood.emoji}</span>
                                <span className="capitalize">{journal.mood}</span>
                                <span className="text-gray-600 font-normal">·</span>
                                <span className="text-gray-500 font-normal">
                                    {new Date(journal.createdAt).toLocaleDateString("vi-VN", {
                                        weekday: "short", day: "numeric", month: "short"
                                    })}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="text-gray-500 hover:text-white transition">
                            <BsXLg size={14} />
                        </button>
                    </div>

                    {/* Nội dung trang giấy */}
                    <div className="relative bg-slate-900/60 rounded-xl p-5 mb-4 border border-white/5"
                        style={{
                            backgroundImage: "repeating-linear-gradient(transparent,transparent 27px,rgba(255,255,255,0.025) 27px,rgba(255,255,255,0.025) 28px)",
                            backgroundPositionY: "12px"
                        }}>
                        <p className="text-gray-200 leading-7 whitespace-pre-wrap text-sm"
                            style={{ fontFamily: "'Georgia', serif" }}>
                            {journal.content}
                        </p>
                    </div>

                    {/* AI Summary */}
                    {journal.summary && (
                        <div className="bg-slate-800/60 rounded-xl p-4 border border-white/5 mb-5">
                            <p className="text-xs text-yellow-400 font-semibold mb-2 flex items-center gap-1.5">
                                <BsStars size={11} /> AI phân tích
                            </p>
                            <p className="text-sm text-gray-400 leading-6">{journal.summary}</p>
                        </div>
                    )}

                    {/* Xem chi tiết */}
                    <button
                        onClick={() => navigate(`/journal/${journal.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                   bg-white/5 hover:bg-white/10 border border-white/10
                                   text-sm text-gray-300 hover:text-white transition"
                    >
                        Xem trang đầy đủ <BsArrowRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [data, setData] = useState(null);
    const [clock, setClock] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [modalJournal, setModal] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboard();
        const t = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const loadDashboard = async () => {
        const res = await api.get("/dashboard");
        setData(res.data);
    };

    const refreshWeeklyInsight = async () => {
        try {
            setRefreshing(true);
            const res = await api.post("/dashboard/refresh-weekly-insight");
            setData(prev => ({ ...prev, weeklyInsight: res.data.weeklyInsight }));
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    // Pie data
    const pieData = data ? [
        { name: "Happy", value: data.happy || 0 },
        { name: "Stress", value: data.stress || 0 },
        { name: "Sad", value: data.sad || 0 },
        { name: "Neutral", value: data.neutral || 0 },
    ].filter(x => x.value > 0) : [];

    const isSunday = new Date().getDay() === 0;

    // ── Loading ──
    if (!data) return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
            <Skeleton className="h-32 mb-6" />
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-48 mb-6" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">

            {/* ── HEADER ── */}
            <div className="relative bg-gradient-to-br from-indigo-600/80 via-blue-600/70
                            to-purple-600/60 rounded-2xl p-6 mb-6 overflow-hidden border
                            border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_60%)]" />
                <div className="relative">
                    <p className="text-sm text-indigo-200/70 uppercase tracking-widest mb-1">
                        MoodLens Dashboard
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">
                        👋 Xin chào!
                    </h1>
                    <p className="text-indigo-100/70 text-sm">
                        Theo dõi cảm xúc của bạn mỗi ngày
                    </p>
                    <p className="mt-3 text-xs text-indigo-200/50 font-mono">
                        {clock.toLocaleString("vi-VN")}
                    </p>
                </div>
            </div>

            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">

                {[
                    { label: "Tổng nhật kí", value: data.totalJournals, icon: <BsJournalText className="text-blue-400" size={20} />, color: "text-white" },
                    { label: "Điểm TB", value: data.averageScore, icon: <span className="text-yellow-400 text-xl">⭐</span>, color: "text-yellow-400" },
                    { label: "Tuần này", value: data.weeklyCount, icon: <BsCalendar3 className="text-purple-400" size={20} />, color: "text-white" },
                ].map(card => (
                    <div key={card.label}
                        className="bg-slate-900 border border-white/8 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            {card.icon}
                            <span className="text-xs text-gray-600">{card.label}</span>
                        </div>
                        <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                ))}

                {/* Top mood */}
                {(() => {
                    const m = getMood(data.topMood); return (
                        <div className={`rounded-2xl p-4 border ${m.bg} ${m.border}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{m.emoji}</span>
                                <span className="text-xs text-gray-600">Top mood</span>
                            </div>
                            <p className={`text-xl font-bold capitalize ${m.text}`}>{data.topMood || "—"}</p>
                        </div>
                    );
                })()}

                {/* Streak */}
                <div className="bg-orange-500/10 border border-orange-500/25 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <FaFire className="text-orange-400" size={20} />
                        <span className="text-xs text-gray-600">Streak</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-400">{data.currentStreak}</p>
                    <p className="text-xs text-orange-400/70 mt-1">{streakLabel(data.currentStreak)}</p>
                </div>
            </div>

            {/* ── CHARTS ROW ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                {/* Trend */}
                <div className="bg-slate-900 border border-white/8 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        📈 Xu hướng cảm xúc
                    </h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={data.trend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                                labelStyle={{ color: "#94a3b8" }}
                            />
                            <Line type="monotone" dataKey="score" stroke="#60a5fa"
                                strokeWidth={2.5} dot={{ fill: "#60a5fa", r: 3 }}
                                activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie */}
                <div className="bg-slate-900 border border-white/8 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        🥧 Phân bố cảm xúc
                    </h2>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name"
                                    outerRadius={90} innerRadius={40}>
                                    {pieData.map((entry, i) => (
                                        <Cell key={i}
                                            fill={getMood(entry.name).pie || "#6b7280"} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[240px] text-gray-600 text-sm">
                            Chưa có dữ liệu
                        </div>
                    )}
                </div>
            </div>

            {/* ── RECENT JOURNALS ── */}
            <div className="bg-slate-900 border border-white/8 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        📝 Nhật kí gần đây
                    </h2>
                    <button onClick={() => navigate("/history")}
                        className="text-xs text-blue-400 hover:text-blue-300 transition
                                       flex items-center gap-1">
                        Xem tất cả <BsArrowRight size={11} />
                    </button>
                </div>

                <div className="space-y-3">
                    {data.recent?.length > 0 ? data.recent.map(journal => {
                        const m = getMood(journal.mood);
                        return (
                            <div key={journal.id}
                                onClick={() => setModal(journal)}
                                className={`flex items-start gap-3 p-4 rounded-xl border
                                             cursor-pointer transition hover:brightness-110
                                             ${m.bg} ${m.border}`}>
                                <span className="text-xl mt-0.5 shrink-0">{m.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 leading-relaxed line-clamp-2"
                                        style={{ fontFamily: "'Georgia', serif" }}>
                                        {journal.content}
                                    </p>
                                    <p className={`text-xs mt-2 ${m.text}`}>
                                        {new Date(journal.createdAt).toLocaleDateString("vi-VN", {
                                            weekday: "short", day: "numeric", month: "short"
                                        })}
                                    </p>
                                </div>
                                <BsArrowRight size={13} className="text-gray-600 mt-1 shrink-0" />
                            </div>
                        );
                    }) : (
                        <p className="text-gray-600 text-sm text-center py-6">
                            Chưa có nhật kí nào
                        </p>
                    )}
                </div>
            </div>

            {/* ── CALENDAR + ACHIEVEMENTS ROW ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                {/* Calendar */}
                <div className="bg-slate-900 border border-white/8 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        📅 Lịch tâm trạng
                    </h2>

                    {/* Labels ngày trong tuần */}
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
                            <div key={d} className="text-center text-xs text-gray-600">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                        {data.calendar?.map((day, i) => {
                            const m = getMood(day.mood);
                            return (
                                <div key={i}
                                    title={`${new Date(day.date).toLocaleDateString("vi-VN")}\n${m.emoji} ${day.mood} · ${day.score}đ`}
                                    className={`aspect-square rounded-lg cursor-default
                                                 transition hover:scale-110 hover:brightness-125
                                                 ${m.cal} opacity-80`} />
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        {Object.entries(moodConfig).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <div className={`w-2.5 h-2.5 rounded-sm ${v.cal}`} />
                                <span className="capitalize">{k}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-slate-900 border border-white/8 rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        🏆 Thành tựu
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {data.achievements?.map(a => (
                            <div key={a.code}
                                className={`rounded-xl p-3 border transition
                                             ${a.unlocked
                                        ? "bg-yellow-500/10 border-yellow-500/30"
                                        : "bg-white/3 border-white/8 opacity-35"}`}>
                                <div className="text-3xl mb-2">{a.icon}</div>
                                <p className="text-sm font-medium leading-tight">{a.title}</p>
                                <p className={`text-xs mt-1 ${a.unlocked ? "text-yellow-400" : "text-gray-600"}`}>
                                    {a.unlocked ? "✓ Đã mở khoá" : "Chưa mở khoá"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── WEEKLY INSIGHT ── */}
            <div className="bg-slate-900 border border-yellow-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-yellow-400 uppercase
                                   tracking-wider flex items-center gap-2">
                        <BsStars size={14} /> Lời khuyên AI tuần này
                    </h2>
                    {isSunday && (
                        <button
                            disabled={refreshing}
                            onClick={refreshWeeklyInsight}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                       bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-300
                                       text-xs transition disabled:opacity-50"
                        >
                            {refreshing ? "Đang phân tích..." : "🔄 Cập nhật"}
                        </button>
                    )}
                </div>
                <p className="text-gray-300 leading-7 whitespace-pre-wrap text-sm">
                    {data.weeklyInsight || "Chưa có dữ liệu tuần này."}
                </p>
                {!isSunday && (
                    <p className="text-xs text-gray-600 mt-4">
                        💡 Cập nhật tự động vào mỗi Chủ nhật
                    </p>
                )}
            </div>

            {/* ── MODAL ── */}
            <JournalModal journal={modalJournal} onClose={() => setModal(null)} />
        </div>
    );
}
