import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaFire } from "react-icons/fa";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import {
    FaBook,
    FaSmile,
    FaChartLine,
    FaCalendarWeek
} from "react-icons/fa";

const PIE_COLORS = {
    happy: "#22c55e",
    stress: "#ef4444",
    sad: "#3b82f6",
    neutral: "#a855f7"
};

export default function Dashboard() {

    const [data, setData] = useState(null);
    const [date, setDate] = useState(new Date());
    const [refreshing, setRefreshing] =
        useState(false);
    useEffect(() => {

        loadDashboard();

        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(timer);

    }, []);

    const getStreakLabel = (days) => {

        if (days >= 30)
            return "Legend";

        if (days >= 14)
            return "Amazing";

        if (days >= 7)
            return "Great";

        if (days >= 3)
            return "Good";

        return "Bắt đầu từ";
    };
    const refreshWeeklyInsight = async () => {

        try {

            setRefreshing(true);

            const res = await api.post(
                "/dashboard/refresh-weekly-insight"
            );

            // Cập nhật weeklyInsight ngay từ response, không cần reload toàn bộ
            setData(prev => ({
                ...prev,
                weeklyInsight: res.data.weeklyInsight
            }));

        } catch (err) {

            console.error(err);

        } finally {

            setRefreshing(false);

        }

    };
    const loadDashboard = async () => {

        const response =
            await api.get("/dashboard");

        console.log(
            "Weekly Insight:",
            response.data.weeklyInsight
        );

        setData({
            ...response.data
        });
    };

    const getMoodEmoji = (mood) => {

        switch ((mood || "").toLowerCase()) {

            case "happy":
                return "😊";

            case "sad":
                return "😢";

            case "stress":
                return "😰";

            default:
                return "😐";
        }
    };

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                Đang tải bảng điều khiển ...
            </div>
        );
    }

    const pieData = [
        {
            name: "Happy",
            value: data.happy || 0
        },
        {
            name: "Stress",
            value: data.stress || 0
        },
        {
            name: "Sad",
            value: data.sad || 0
        },
        {
            name: "Neutral",
            value: data.neutral || 0
        }
    ].filter(x => x.value > 0);
    const getMoodColor = (mood) => {

        switch ((mood || "").toLowerCase()) {

            case "happy":
                return "text-green-400";

            case "sad":
                return "text-blue-400";

            case "stress":
                return "text-red-400";

            default:
                return "text-purple-400";
        }
    };

    const getMoodCalendarColor = (mood) => {

        switch ((mood || "").toLowerCase()) {

            case "happy":
                return "bg-green-500";

            case "sad":
                return "bg-blue-500";

            case "stress":
                return "bg-red-500";

            default:
                return "bg-purple-500";
        }
    };
    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 mb-6">

                <h1 className="text-3xl font-bold">
                    👋 Bảng điều khiển tâm trạng
                </h1>

                <p className="mt-2 opacity-90">
                    Theo dõi cảm xúc của bạn mỗi ngày
                </p>

                <div className="mt-4 text-sm opacity-80">
                    {date.toLocaleString("vi-VN")}
                </div>

            </div>

            {/* KPI */}

            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">

                <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                    <FaBook className="text-blue-400 text-2xl mb-3" />
                    <div className="text-gray-400 text-sm">
                        Tổng nhật kí đã viết
                    </div>
                    <div className="text-3xl font-bold">
                        {data.totalJournals}
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                    <FaChartLine className="text-yellow-400 text-2xl mb-3" />
                    <div className="text-gray-400 text-sm">
                        Điểm trung bình cảm xúc
                    </div>
                    <div className="text-3xl font-bold">
                        {data.averageScore}
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                    <FaSmile className="text-green-400 text-2xl mb-3" />
                    <div className="text-gray-400 text-sm">
                        Cảm xúc thuộc top
                    </div>
                    <div className={`text-2xl font-bold ${getMoodColor(data.topMood)}`}>
                        {getMoodEmoji(data.topMood)} {data.topMood}
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
                    <FaCalendarWeek className="text-purple-400 text-2xl mb-3" />
                    <div className="text-gray-400 text-sm">
                        Nhật kí đã viết trong tuần này
                    </div>

                    <div className="text-3xl font-bold">
                        {data.weeklyCount}
                    </div>
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-5">

                    <FaFire className="text-orange-400 text-2xl mb-3" />

                    <div className="text-gray-400 text-sm">
                        Chuỗi hiện tại
                    </div>

                    <div className="text-xs text-orange-400 mt-1">
                        {getStreakLabel(data.currentStreak)}
                    </div>

                    <div className="text-xs text-orange-400 mt-1">
                        ngày
                    </div>

                </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-5 mb-6">

                <h2 className="font-semibold mb-4">
                    🏆 Thành tựu
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    {
                        data.achievements?.map(a => (

                            <div
                                key={a.code}
                                className={`
                        rounded-xl
                        p-4
                        border
                        transition
                        ${a.unlocked
                                        ? "bg-yellow-500/10 border-yellow-500/30"
                                        : "bg-white/5 border-white/10 opacity-40"
                                    }
                    `}
                            >

                                <div className="text-4xl mb-2">
                                    {a.icon}
                                </div>

                                <div className="font-medium">
                                    {a.title}
                                </div>

                                <div className="text-xs mt-2">

                                    {
                                        a.unlocked
                                            ? "Mở khóa"
                                            : "Khóa"
                                    }

                                </div>

                            </div>

                        ))
                    }

                </div>

            </div>
            {/* TREND

            <div className="bg-slate-900 rounded-xl p-5 mb-6">

                <h2 className="font-semibold mb-4">
                    📈 Mood Trend
                </h2>

                <ResponsiveContainer
                    width="100%"
                    height={320}
                >

                    <LineChart data={data.trend}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="date" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#60a5fa"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div> */}

            {/* DISTRIBUTION + RECENT */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* PIE CHART */}

                <div className="bg-slate-900 rounded-xl p-5">

                    <h2 className="font-semibold mb-4">
                        🥧 Đồ thị cảm xúc
                    </h2>

                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >

                        <PieChart>

                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={110}
                                label
                            >

                                {
                                    pieData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                PIE_COLORS[
                                                entry.name.toLowerCase()
                                                ] || "#6b7280"
                                            }
                                        />
                                    ))
                                }

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

                {/* RECENT */}

                <div className="bg-slate-900 rounded-xl p-5">

                    <h2 className="font-semibold mb-4">
                        📝 Nhật ký gần đây
                    </h2>

                    <div className="space-y-3">

                        {
                            data.recent?.map(journal => (

                                <div
                                    key={journal.id}
                                    className="
                                    bg-slate-800
                                    rounded-xl
                                    p-4
                                    border
                                    border-white/5
                                "
                                >

                                    <div className="text-sm text-gray-200">

                                        {journal.content}

                                    </div>

                                    <div
                                        className={`
    inline-flex
    items-center
    gap-2
    mt-3
    px-3
    py-1
    rounded-full
    bg-white/5
    text-sm
    ${getMoodColor(journal.mood)}
`}
                                    >
                                        <span>{getMoodEmoji(journal.mood)}</span>
                                        <span>{journal.mood}</span>
                                    </div>

                                </div>

                            ))
                        }

                    </div>

                </div>

            </div>

            {/** CALENDAR */}
            <div className="mt-8">

                <h2 className="text-xl font-bold mb-4">
                    📅 Lịch theo dõi tâm trạng
                </h2>

                <div className="
        grid
        grid-cols-7
        gap-2
        max-w-md
    ">

                    {
                        data.calendar?.map((day, index) => (

                            <div
                                key={index}
                                title={
                                    `${new Date(
                                        day.date
                                    ).toLocaleDateString("vi-VN")}
                        
Mood: ${day.mood}
Score: ${day.score}`
                                }
                                className={`
                        w-8
                        h-8
                        rounded-md
                        cursor-pointer
                        hover:scale-110
                        transition
                        ${getMoodCalendarColor(day.mood)}
                    `}
                            />

                        ))
                    }

                </div>

            </div>
            {/* AI Insight Weekly  */}
            <div
                className="
    bg-white/5
    border
    border-white/10
    rounded-2xl
    p-6
    mt-6
">

                <div
                    className="
    flex
    justify-between
    items-center
    mb-4
"
                >

                    <h2
                        className="
        text-xl
        font-bold
        text-yellow-400
    "
                    >
                        🤖 Lời khuyên của AI trong tuần qua
                    </h2>

                    <button
                        disabled={refreshing}
                        onClick={refreshWeeklyInsight}
                        className="
        px-3
        py-2
        rounded-lg
        bg-yellow-500/20
        hover:bg-yellow-500/30
        text-sm
        transition
    "
                    >
                        {
                            refreshing
                                ? "Đang phân tích..."
                                : "🔄 Phân tích"
                        }
                    </button>

                </div>
                <div
                    className="
        text-gray-300
        whitespace-pre-wrap
        leading-relaxed
    "
                >
                    {data.weeklyInsight}
                </div>

            </div>
        </div>

    );

}
