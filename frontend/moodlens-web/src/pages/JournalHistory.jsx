import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function JournalHistory() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();

    const pageSize = 10;

    const moodConfig = {
        happy: {
            icon: "😊",
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20"
        },
        sad: {
            icon: "😢",
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20"
        },
        stress: {
            icon: "😰",
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20"
        },
        neutral: {
            icon: "😐",
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20"
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, date]);

    const fetchData = async () => {
        setLoading(true);

        try {
            const res = await api.get("/journal/history", {
                params: {
                    page,
                    pageSize,
                    date: date || null
                }
            });

            setData(res.data.data);
            setTotal(res.data.total);
        } finally {
            setLoading(false);
        }
    };

    const totalPages =
        Math.max(1, Math.ceil(total / pageSize));

    const truncate = (text, max = 150) => {
        if (!text) return "";
        return text.length > max
            ? text.substring(0, max) + "..."
            : text;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">

            {/* HEADER */}

            <div className="mb-6">

                <h1 className="text-3xl font-bold">
                    📚 Lịch sử nhật ký cảm xúc
                </h1>

                <p className="text-gray-400 mt-2">
                    Xem lại hành trình cảm xúc của bạn
                </p>

            </div>

            {/* FILTER */}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">

                <input
                    type="date"
                    className="
                    bg-white/10
                    border
                    border-white/10
                    p-3
                    rounded-xl
                "
                    value={date}
                    onChange={(e) => {
                        setPage(1);
                        setDate(e.target.value);
                    }}
                />

                <button
                    onClick={() => {
                        setDate("");
                        setPage(1);
                    }}
                    className="
                    px-4
                    py-3
                    rounded-xl
                    bg-white/10
                    hover:bg-white/20
                    transition
                "
                >
                    Đặt lại
                </button>

            </div>

            {/* LIST */}

            <div className="space-y-4">


                {data.map((item) => {

                    const mood =
                        moodConfig[
                        item.mood?.toLowerCase()
                        ] || moodConfig.neutral;

                    return (

                        <div
                            key={item.id}
                            onClick={() =>
                                navigate(`/journal/${item.id}`)
                            }
                            className={`
                cursor-pointer
                rounded-2xl
                border
                p-5
                transition-all
                hover:scale-[1.01]
                hover:shadow-xl
                ${mood.bg}
            `}
                        >

                            {/* DATE */}

                            <div className="text-xs text-gray-400 mb-3">

                                🕒 {
                                    new Date(
                                        item.createdAt
                                    ).toLocaleString("vi-VN")
                                }

                            </div>

                            {/* MOOD */}

                            <div
                                className={`
                    flex
                    items-center
                    gap-2
                    mb-4
                    font-semibold
                    ${mood.color}
                `}
                            >

                                <span className="text-2xl">
                                    {mood.icon}
                                </span>

                                <span className="capitalize text-lg">
                                    {item.mood}
                                </span>

                            </div>

                            {/* CONTENT */}

                            <div className="mb-4">

                                <div className="text-xs text-gray-400 mb-2">
                                    📝 Journal
                                </div>

                                <div className="text-gray-200 leading-relaxed">
                                    {truncate(item.content, 180)}
                                </div>

                            </div>

                            {/* AI SUMMARY */}

                            <div
                                className="
                    bg-black/20
                    rounded-xl
                    p-3
                    border
                    border-white/5
                "
                            >

                                <div
                                    className="
                        text-xs
                        font-semibold
                        text-yellow-400
                        mb-2
                    "
                                >
                                    💡 AI Summary
                                </div>

                                <div
                                    className="
                        text-sm
                        text-gray-300
                        leading-relaxed
                    "
                                >
                                    {truncate(item.summary, 120)}
                                </div>

                            </div>

                        </div>

                    );
                })}

                {!loading && data.length === 0 && (

                    <div className="text-center py-16">

                        <div className="text-6xl mb-4">
                            📝
                        </div>

                        <div className="text-xl font-semibold">
                            Chưa có nhật ký nào
                        </div>

                        <div className="text-gray-400 mt-2">
                            Hãy bắt đầu ghi lại cảm xúc đầu tiên của bạn
                        </div>

                    </div>

                )}


            </div>


            {/* PAGINATION */}

            <div className="flex justify-center items-center gap-3 mt-8">

                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="
                    px-4
                    py-2
                    rounded-lg
                    bg-white/10
                    disabled:opacity-30
                "
                >
                    Prev
                </button>

                <div className="text-gray-300">
                    {page} / {totalPages}
                </div>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="
                    px-4
                    py-2
                    rounded-lg
                    bg-white/10
                    disabled:opacity-30
                "
                >
                    Next
                </button>

            </div>

        </div>
    );
}
