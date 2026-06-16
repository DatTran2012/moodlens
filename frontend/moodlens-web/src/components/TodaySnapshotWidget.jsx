import { useNavigate } from "react-router-dom";
import useSnapshotStore from "../store/useSnapshotStore";

const moodEmoji = {
    happy: "😊",
    sad: "😢",
    stress: "😰",
    neutral: "😐",
    calm: "😌",
    excited: "🤩",
    angry: "😡",
};

export default function TodaySnapshotWidget() {
    const navigate = useNavigate();

    const { snapshots } = useSnapshotStore();

    const today = new Date().toDateString();

    const todaySnapshot = snapshots.find(
        (x) =>
            new Date(
                x.createdAt
            ).toDateString() === today
    );

    if (!todaySnapshot) {
        return (
            <div
                onClick={() =>
                    navigate("/snapshots")
                }
                className="
                    rounded-3xl
                    p-8
                    cursor-pointer
                    transition-all
                    hover:shadow-lg
                "
                style={{
                    background: "#ede3d2",
                    border:
                        "1px solid #d6c9b4",
                }}
            >
                <div
                    className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-center
                        py-8
                    "
                >
                    <div className="text-6xl">
                        📷
                    </div>

                    <h3
                        className="
                            mt-4
                            text-xl
                            font-bold
                            text-[#7c5c3a]
                        "
                    >
                        Chưa có Snapshot hôm nay
                    </h3>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-gray-500
                        "
                    >
                        Hãy ghi lại một khoảnh khắc
                        của ngày hôm nay.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => navigate("/snapshots")}
            className="
            rounded-3xl
            overflow-hidden
            cursor-pointer
            transition-all
            hover:shadow-xl
            bg-[#ede3d2]
            border border-[#d6c9b4]
        "
        >
            <div className="p-5">

                <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                        Today's Snapshot
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    {/* IMAGE */}
                    <img
                        src={todaySnapshot.imageUrl}
                        alt=""
                        className="
                        w-full
                        h-[280px]
                        rounded-2xl
                        object-cover
                    "
                    />

                    {/* CONTENT */}
                    <div className="flex flex-col justify-between">

                        <div>
                            <h3
                                className="
                                text-2xl
                                font-bold
                                text-[#7c5c3a]
                                flex
                                items-center
                                gap-2
                            "
                            >
                                {moodEmoji[
                                    todaySnapshot.mood?.toLowerCase()
                                ] || "✨"}

                                {todaySnapshot.mood}
                            </h3>

                            <p
                                className="
                                mt-4
                                text-gray-700
                                leading-relaxed
                            "
                            >
                                {todaySnapshot.caption ||
                                    "Không có ghi chú"}
                            </p>
                        </div>

                        <div className="mt-6">
                            <div
                                className="
                                rounded-xl
                                bg-white/50
                                p-4
                            "
                            >
                                <p
                                    className="
                                    text-sm
                                    font-semibold
                                    text-[#8b5e34]
                                "
                                >
                                    🧠 AI Insight
                                </p>

                                <p
                                    className="
                                    text-sm
                                    text-gray-600
                                    mt-2
                                "
                                >
                                    Phân tích cảm xúc từ ảnh
                                    sẽ hiển thị tại đây.
                                </p>
                            </div>

                            <div
                                className="
                                mt-4
                                flex
                                justify-end
                            "
                            >
                                <span
                                    className="
                                    text-sm
                                    font-medium
                                    text-[#8b5e34]
                                "
                                >
                                    Xem tất cả →
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}