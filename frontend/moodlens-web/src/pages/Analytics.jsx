import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useGlobalStore } from "../store/useGlobalStore";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const PIE_COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#a855f7"];

const moodToScore = (mood) => {
    switch ((mood || "").toLowerCase()) {
        case "happy":
            return 8;
        case "stress":
            return 3;
        case "sad":
            return 4;
        case "neutral":
            return 6;
        default:
            return 5;
    }
};

export default function Analytics() {
    const { setLoading } = useGlobalStore();

    const [stats, setStats] = useState(null);
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true, "Loading analytics...");
            try {
                const [statsRes, timelineRes] = await Promise.all([
                    api.get("/dashboard/stats"),
                    api.get("/dashboard/mood-by-date"),
                ]);

                setStats(statsRes.data);
                setTimeline(timelineRes.data || []);
            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [setLoading]);

    const pieData = useMemo(() => {
        if (!stats) return [];

        return [
            { name: "Happy", value: stats.happy || 0 },
            { name: "Stress", value: stats.stress || 0 },
            { name: "Sad", value: stats.sad || 0 },
            { name: "Neutral", value: stats.neutral || 0 },
        ].filter((x) => x.value > 0);
    }, [stats]);

    const lineData = useMemo(() => {
        return (timeline || []).map((item) => ({
            date: new Date(item.date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
            }),
            mood: item.mood,
            score: item.score ?? moodToScore(item.mood),
        }));
    }, [timeline]);

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">📊 Mood Analytics</h1>
                <p className="text-gray-400">Loading chart data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">📊 Mood Analytics</h1>
            <p className="text-gray-400 mb-6 text-sm">
                AI-powered emotional insights
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg">Mood Trend</h2>
                        <span className="text-xs text-gray-400">Score over time</span>
                    </div>

                    <div className="h-72 sm:h-80">
                        {lineData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No timeline data yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                                    <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                                    <YAxis
                                        domain={[0, 10]}
                                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#111827",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        name="Mood Score"
                                        stroke="#60a5fa"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg">Mood Distribution</h2>
                        <span className="text-xs text-gray-400">Today</span>
                    </div>

                    <div className="h-72 sm:h-80">
                        {pieData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No mood stats yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={110}
                                        label
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#111827",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                    <p className="text-xs text-gray-400">Happy</p>
                    <p className="text-2xl font-bold text-green-300">{stats.happy}</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-xs text-gray-400">Stress</p>
                    <p className="text-2xl font-bold text-red-300">{stats.stress}</p>
                </div>

                <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4">
                    <p className="text-xs text-gray-400">Sad</p>
                    <p className="text-2xl font-bold text-sky-300">{stats.sad}</p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                    <p className="text-xs text-gray-400">Neutral</p>
                    <p className="text-2xl font-bold text-purple-300">{stats.neutral}</p>
                </div>
            </div>
        </div>
    );
}