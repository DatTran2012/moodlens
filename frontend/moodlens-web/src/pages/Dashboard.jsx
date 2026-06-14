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

// ── Palette nâu ấm ────────────────────────────────────────────────────────────
const P = {
    bg: "#faf6f0",   // nền trang giấy kem
    surface: "#f5ede0",   // card nhạt hơn
    card: "#ede3d2",   // card đậm hơn
    border: "#d6c9b4",   // viền nâu nhạt
    spine: "#c4a882",   // màu gáy sổ
    text: "#3b2f1e",   // chữ nâu đậm
    muted: "#8c7560",   // chữ mờ
    accent: "#7c5c3a",   // nâu đậm nhấn
    line: "rgba(139,110,80,0.08)", // đường kẻ trang giấy
};

const moodConfig = {
    happy: { emoji: "😊", text: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-300", pie: "#059669", cal: "bg-emerald-400" },
    sad: { emoji: "😢", text: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300", pie: "#2563eb", cal: "bg-blue-400" },
    stress: { emoji: "😰", text: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", pie: "#d97706", cal: "bg-amber-400" },
    neutral: { emoji: "😐", text: "text-stone-600", bg: "bg-stone-100", border: "border-stone-300", pie: "#78716c", cal: "bg-stone-400" },
};
const getMood = (m) => moodConfig[(m || "").toLowerCase()] || moodConfig.neutral;
const streakLabel = (d) => d >= 30 ? "Legend 🏅" : d >= 14 ? "Amazing 🚀" : d >= 7 ? "Great 🔥" : d >= 3 ? "Good 👍" : "Bắt đầu";

// ── Skeleton nâu ──────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
    <div className={`animate-pulse rounded-xl ${className}`} style={{ background: P.card }} />
);

// ── Tiêu đề section ───────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
    <h2 className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>
        {children}
    </h2>
);

// ── Card wrapper ──────────────────────────────────────────────────────────────
const Card = ({ children, className = "", style = {} }) => (
    <div className={`rounded-2xl p-5 ${className}`}
        style={{ background: P.surface, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(139,110,80,0.08)", ...style }}>
        {children}
    </div>
);

// ── Modal nhật kí ─────────────────────────────────────────────────────────────
function JournalModal({ journal, onClose }) {
    const navigate = useNavigate();
    if (!journal) return null;
    const mood = getMood(journal.mood);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(59,47,30,0.55)", backdropFilter: "blur(4px)" }}
            onClick={onClose}>
            <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: P.bg, border: `1px solid ${P.border}` }}
                onClick={e => e.stopPropagation()}>

                {/* Gáy sổ trên */}
                <div className="h-1.5 w-full" style={{ background: P.spine, opacity: 0.8 }} />

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                        <div className={`flex items-center gap-2 text-sm font-semibold ${mood.text}`}>
                            <span>{mood.emoji}</span>
                            <span className="capitalize">{journal.mood}</span>
                            <span style={{ color: P.border }}>·</span>
                            <span style={{ color: P.muted }} className="font-normal">
                                {new Date(journal.createdAt).toLocaleDateString("vi-VN", {
                                    weekday: "short", day: "numeric", month: "short"
                                })}
                            </span>
                        </div>
                        <button onClick={onClose} style={{ color: P.muted }}
                            className="hover:opacity-70 transition">
                            <BsXLg size={14} />
                        </button>
                    </div>

                    {/* Trang giấy */}
                    <div className="rounded-xl p-5 mb-4"
                        style={{
                            background: P.card,
                            border: `1px solid ${P.border}`,
                            backgroundImage: `repeating-linear-gradient(transparent,transparent 27px,${P.line} 27px,${P.line} 28px)`,
                            backgroundPositionY: "12px"
                        }}>
                        <p className="leading-7 whitespace-pre-wrap text-sm"
                            style={{ color: P.text, fontFamily: "'Georgia', serif" }}>
                            {journal.content}
                        </p>
                    </div>

                    {/* AI Summary */}
                    {journal.summary && (
                        <div className="rounded-xl p-4 mb-5"
                            style={{ background: "#fef9ec", border: "1px solid #e8d5a0" }}>
                            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                                style={{ color: "#92701a" }}>
                                <BsStars size={11} /> AI phân tích
                            </p>
                            <p className="text-sm leading-6" style={{ color: "#6b5320" }}>
                                {journal.summary}
                            </p>
                        </div>
                    )}

                    <button onClick={() => navigate(`/journal/${journal.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                       transition text-sm font-medium hover:opacity-80"
                        style={{ background: P.card, border: `1px solid ${P.border}`, color: P.accent }}>
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
        } catch (e) { console.error(e); }
        finally { setRefreshing(false); }
    };

    const pieData = data ? [
        { name: "Happy", value: data.happy || 0 },
        { name: "Stress", value: data.stress || 0 },
        { name: "Sad", value: data.sad || 0 },
        { name: "Neutral", value: data.neutral || 0 },
    ].filter(x => x.value > 0) : [];

    const isSunday = new Date().getDay() === 0;

    // Loading
    if (!data) return (
        <div className="min-h-screen p-4 sm:p-8" style={{ background: P.bg }}>
            <Skeleton className="h-32 mb-6" />
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-48 mb-6" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Skeleton className="h-80" /><Skeleton className="h-80" />
            </div>
        </div>
    );

    const week = Array(7).fill(null);
    data.calendar?.forEach(item => { week[new Date(item.date).getDay()] = item; });

    const tooltipStyle = {
        contentStyle: { background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, color: P.text },
        labelStyle: { color: P.muted }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8" style={{ background: P.bg, color: P.text }}>

            {/* ── HEADER — bìa nhật kí ── */}
            <div className="relative rounded-2xl p-6 mb-6 overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, #6b4c2a 0%, #8c6240 50%, #7a5535 100%)`,
                    boxShadow: "0 8px 32px rgba(107,76,42,0.25)"
                }}>
                {/* Texture vân giấy */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="relative">
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,235,200,0.6)" }}>
                        MoodLens · Nhật kí cảm xúc
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white"
                        style={{ fontFamily: "'Georgia', serif" }}>
                        👋 Xin chào!
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(255,235,200,0.75)" }}>
                        Theo dõi cảm xúc của bạn mỗi ngày
                    </p>
                    <p className="mt-3 text-xs font-mono" style={{ color: "rgba(255,235,200,0.45)" }}>
                        {clock.toLocaleString("vi-VN")}
                    </p>
                </div>
            </div>

            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
                {[
                    { label: "Tổng nhật kí", value: data.totalJournals, icon: <BsJournalText size={18} style={{ color: P.accent }} />, vColor: P.text },
                    { label: "Điểm TB", value: data.averageScore, icon: <span className="text-lg">⭐</span>, vColor: "#92701a" },
                    { label: "Tuần này", value: data.weeklyCount, icon: <BsCalendar3 size={18} style={{ color: P.accent }} />, vColor: P.text },
                ].map(c => (
                    <Card key={c.label}>
                        <div className="flex items-center justify-between mb-3">
                            {c.icon}
                            <span className="text-xs" style={{ color: P.muted }}>{c.label}</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: c.vColor }}>{c.value}</p>
                    </Card>
                ))}

                {/* Top mood */}
                {(() => {
                    const m = getMood(data.topMood); return (
                        <div className={`rounded-2xl p-4 ${m.bg} ${m.border} border`}
                            style={{ boxShadow: "0 2px 12px rgba(139,110,80,0.06)" }}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{m.emoji}</span>
                                <span className="text-xs" style={{ color: P.muted }}>Top mood</span>
                            </div>
                            <p className={`text-xl font-bold capitalize ${m.text}`}>{data.topMood || "—"}</p>
                        </div>
                    );
                })()}

                {/* Streak */}
                <div className="rounded-2xl p-4 bg-orange-100 border border-orange-300"
                    style={{ boxShadow: "0 2px 12px rgba(139,110,80,0.06)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <FaFire className="text-orange-600" size={18} />
                        <span className="text-xs" style={{ color: P.muted }}>Streak</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-700">{data.currentStreak}</p>
                    <p className="text-xs text-orange-600/80 mt-1">{streakLabel(data.currentStreak)}</p>
                </div>
            </div>

            {/* ── CHARTS ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <Card>
                    <SectionTitle>📈 Xu hướng cảm xúc</SectionTitle>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={data.trend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke={P.line} />
                            <XAxis dataKey="date"
                                tickFormatter={v => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(v))}
                                tick={{ fill: P.muted, fontSize: 11 }} />
                            <YAxis tick={{ fill: P.muted, fontSize: 11 }} domain={[0, 100]} />
                            <Tooltip {...tooltipStyle} />
                            <Line type="monotone" dataKey="score" stroke={P.accent}
                                strokeWidth={2.5} dot={{ fill: P.accent, r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card>
                    <SectionTitle>🥧 Phân bố cảm xúc</SectionTitle>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name"
                                    outerRadius={90} innerRadius={40}>
                                    {pieData.map((e, i) => <Cell key={i} fill={getMood(e.name).pie} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, color: P.text }} />
                                <Legend wrapperStyle={{ fontSize: 12, color: P.muted }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[240px] text-sm" style={{ color: P.muted }}>
                            Chưa có dữ liệu
                        </div>
                    )}
                </Card>
            </div>

            {/* ── RECENT JOURNALS ── */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <SectionTitle>📝 Nhật kí gần đây</SectionTitle>
                    <button onClick={() => navigate("/history")}
                        className="flex items-center gap-1 text-xs hover:opacity-70 transition"
                        style={{ color: P.accent }}>
                        Xem tất cả <BsArrowRight size={11} />
                    </button>
                </div>
                <div className="space-y-3">
                    {data.recent?.length > 0 ? data.recent.map(j => {
                        const m = getMood(j.mood);
                        return (
                            <div key={j.id} onClick={() => setModal(j)}
                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer
                                             transition hover:brightness-95 ${m.bg} ${m.border}`}>
                                <span className="text-xl mt-0.5 shrink-0">{m.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-relaxed line-clamp-2"
                                        style={{ color: P.text, fontFamily: "'Georgia', serif" }}>
                                        {j.content}
                                    </p>
                                    <p className={`text-xs mt-2 ${m.text}`}>
                                        {new Date(j.createdAt).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" })}
                                    </p>
                                </div>
                                <BsArrowRight size={13} className="mt-1 shrink-0" style={{ color: P.muted }} />
                            </div>
                        );
                    }) : (
                        <p className="text-sm text-center py-6" style={{ color: P.muted }}>Chưa có nhật kí nào</p>
                    )}
                </div>
            </Card>

            {/* ── CALENDAR + ACHIEVEMENTS ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <Card>
                    <SectionTitle>📅 Lịch tâm trạng</SectionTitle>
                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
                            <div key={d} className="text-center text-xs" style={{ color: P.muted }}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {week.map((day, i) => {
                            if (!day) return (
                                <div key={i} className="aspect-square rounded-md"
                                    style={{ background: P.card, border: `1px solid ${P.border}` }} />
                            );
                            const m = getMood(day.mood);
                            return (
                                <div key={i}
                                    title={`${new Date(day.date).toLocaleDateString("vi-VN")}\n${m.emoji} ${day.mood} · ${day.score}đ`}
                                    className={`aspect-square rounded-md cursor-pointer transition hover:scale-110 ${m.cal}`} />
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                        {Object.entries(moodConfig).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-1.5 text-xs" style={{ color: P.muted }}>
                                <div className={`w-2.5 h-2.5 rounded-sm ${v.cal}`} />
                                <span className="capitalize">{k}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <SectionTitle>🏆 Thành tựu</SectionTitle>
                    <div className="grid grid-cols-2 gap-3">
                        {data.achievements?.map(a => (
                            <div key={a.code}
                                className={`rounded-xl p-3 border transition ${a.unlocked ? "opacity-100" : "opacity-35"}`}
                                style={{
                                    background: a.unlocked ? "#fef9ec" : P.card,
                                    border: `1px solid ${a.unlocked ? "#e8d5a0" : P.border}`
                                }}>
                                <div className="text-3xl mb-2">{a.icon}</div>
                                <p className="text-sm font-medium leading-tight" style={{ color: P.text }}>{a.title}</p>
                                <p className="text-xs mt-1" style={{ color: a.unlocked ? "#92701a" : P.muted }}>
                                    {a.unlocked ? "✓ Đã mở khoá" : "Chưa mở khoá"}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ── WEEKLY INSIGHT ── */}
            <div className="rounded-2xl p-6"
                style={{ background: "#fef9ec", border: "1px solid #e8d5a0", boxShadow: "0 2px 12px rgba(139,110,80,0.08)" }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                        style={{ color: "#92701a", fontFamily: "'Georgia', serif" }}>
                        <BsStars size={14} /> Lời khuyên AI tuần này
                    </h2>
                    {isSunday && (
                        <button disabled={refreshing} onClick={refreshWeeklyInsight}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition hover:opacity-80 disabled:opacity-50"
                            style={{ background: "#f5e9c4", border: "1px solid #d4b96a", color: "#92701a" }}>
                            {refreshing ? "Đang phân tích..." : "🔄 Cập nhật"}
                        </button>
                    )}
                </div>
                <p className="leading-7 whitespace-pre-wrap text-sm" style={{ color: "#6b5320", fontFamily: "'Georgia', serif" }}>
                    {data.weeklyInsight || "Chưa có dữ liệu tuần này."}
                </p>
                {!isSunday && (
                    <p className="text-xs mt-4" style={{ color: "#b8975a" }}>
                        💡 Cập nhật tự động vào mỗi Chủ nhật
                    </p>
                )}
            </div>

            <JournalModal journal={modalJournal} onClose={() => setModal(null)} />
        </div>
    );
}
