import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function JournalDetail() {


    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [editing, setEditing] = useState(false);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadJournal();
    }, [id]);

    const loadJournal = async () => {

        try {

            const res =
                await api.get(`/journal/${id}`);

            setItem(res.data);
            setContent(res.data.content);

        } catch (err) {

            console.error(err);
            toast.error("Cannot load journal");

        }

    };

    const handleSave = async () => {

        try {

            setSaving(true);

            await api.put(
                `/journal/${id}`,
                {
                    content
                }
            );

            toast.success(
                "Journal updated"
            );

            await loadJournal();

            setEditing(false);

        } catch {

            toast.error(
                "Update failed"
            );

        } finally {

            setSaving(false);

        }

    };

    const handleDelete = async () => {

        const confirmed =
            window.confirm(
                "Delete this journal?"
            );

        if (!confirmed)
            return;

        try {

            await api.delete(
                `/journal/${id}`
            );

            toast.success(
                "Journal deleted"
            );

            navigate("/history");

        } catch {

            toast.error(
                "Delete failed"
            );

        }

    };

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

    const getScoreLabel = (score) => {

        if (score <= 20)
            return "😢 Sad";

        if (score <= 50)
            return "😰 Stress";

        if (score <= 80)
            return "😐 Neutral";

        return "😊 Happy";
    };

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                Loading...
            </div>
        );
    }

    const mood =
        moodConfig[item.mood?.toLowerCase()]
        || moodConfig.neutral;

    const score =
        Math.max(
            0,
            Math.min(100, item.score || 0)
        );

    return (

        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">

            <div className="flex flex-wrap gap-3 mb-6">

                <button
                    onClick={() => navigate(-1)}
                    className="
                    px-4 py-2
                    rounded-xl
                    bg-white/10
                    hover:bg-white/20
                    transition
                "
                >
                    ← Trở về
                </button>

                <button
                    onClick={() =>
                        setEditing(!editing)
                    }
                    className="
                    px-4 py-2
                    rounded-xl
                    bg-blue-500/20
                    text-blue-300
                    hover:bg-blue-500/30
                "
                >
                    ✏ Chỉnh sửa
                </button>

                <button
                    onClick={handleDelete}
                    className="
                    px-4 py-2
                    rounded-xl
                    bg-red-500/20
                    text-red-300
                    hover:bg-red-500/30
                "
                >
                    🗑 Xóa
                </button>

            </div>

            <div
                className={`
        rounded-2xl
        border
        p-6
        mb-6
        ${mood.bg}
    `}
            >

                <div
                    className={`
        flex
        items-center
        gap-4
        ${mood.color}
    `}
                >

                    <span className="text-5xl">
                        {mood.icon}
                    </span>

                    <div>

                        <div className="text-3xl font-bold capitalize">
                            {item.mood}
                        </div>

                        <div className="text-sm text-gray-400 mt-1">
                            {new Date(
                                item.createdAt
                            ).toLocaleString("vi-VN")}
                        </div>

                    </div>

                </div>

            </div>

            <div className="space-y-6">

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                    <h2 className="text-lg font-semibold mb-4">
                        📝 Nội dung nhật ký
                    </h2>

                    {
                        editing ? (

                            <textarea
                                value={content}
                                onChange={(e) =>
                                    setContent(
                                        e.target.value
                                    )
                                }
                                className="
                                w-full
                                min-h-[250px]
                                bg-black/20
                                border
                                border-white/10
                                rounded-xl
                                p-4
                                outline-none
                            "
                            />

                        ) : (

                            <div
                                className="
                                text-gray-200
                                leading-relaxed
                                whitespace-pre-wrap
                            "
                            >
                                {item.content}
                            </div>

                        )
                    }

                    {
                        editing && (

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="
                                mt-4
                                px-4
                                py-2
                                rounded-xl
                                bg-green-500/20
                                text-green-300
                                disabled:opacity-50
                            "
                            >
                                {
                                    saving
                                        ? "Saving..."
                                        : "💾 Save"
                                }
                            </button>

                        )
                    }

                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                    <h2 className="text-lg font-semibold mb-4 text-yellow-400">
                        💡 AI phân tích
                    </h2>

                    <div className="text-gray-300 whitespace-pre-wrap">
                        {item.summary || "No summary"}
                    </div>

                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                    <h2 className="text-lg font-semibold mb-4">
                        📊 Điểm số cảm xúc
                    </h2>

                    <div className="text-5xl font-bold mb-2">
                        {score}%
                    </div>

                    <div className="text-gray-400 mb-5">
                        {getScoreLabel(score)}
                    </div>

                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">

                        <div
                            className="
                            h-full
                            bg-gradient-to-r
                            from-red-500
                            via-yellow-400
                            to-green-500
                        "
                            style={{
                                width: `${score}% `
                            }}
                        />

                    </div>

                    <div className="flex justify-between mt-2 text-xs text-gray-500">

                        <span>Sad</span>
                        <span>Stress</span>
                        <span>Neutral</span>
                        <span>Happy</span>

                    </div>

                </div>

            </div>

        </div>

    );


}
