import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiCamera, FiTrash2 } from "react-icons/fi";

import useSnapshotStore from "../store/useSnapshotStore";

import SnapshotModal from "../components/SnapshotModal";
import SnapshotViewerModal from "../components/SnapshotViewerModal";

export default function MoodSnapshots() {
    const {
        snapshots,
        loading,
        loadSnapshots,
        deleteSnapshot
    } = useSnapshotStore();

    const [openModal, setOpenModal] =
        useState(false);

    const [selectedSnapshot,
        setSelectedSnapshot] =
        useState(null);

    useEffect(() => {
        loadSnapshots();
    }, []);

    const groupedSnapshots =
        useMemo(() => {

            const groups = {};

            snapshots.forEach(snapshot => {

                const date =
                    new Date(
                        snapshot.createdAt
                    ).toLocaleDateString(
                        "vi-VN",
                        {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    );

                if (!groups[date]) {
                    groups[date] = [];
                }

                groups[date].push(snapshot);
            });

            return Object.entries(groups);
        }, [snapshots]);

    const handleDelete =
        async (id) => {

            const ok =
                window.confirm(
                    "Bạn muốn xóa Snapshot này?"
                );

            if (!ok) return;

            await deleteSnapshot(id);
        };

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div
                className="
                    rounded-3xl
                    p-6
                    text-white
                    shadow-lg
                "
                style={{
                    background:
                        "linear-gradient(135deg,#8b5e34,#a9744f)"
                }}
            >
                <h1 className="text-4xl font-bold">
                    📸 Mood Snapshot
                </h1>

                <p className="mt-3 opacity-90">
                    Một bức ảnh. Một cảm xúc.
                    Một ngày đáng nhớ.
                </p>
            </div>

            {/* ADD SNAPSHOT */}
            <div
                onClick={() =>
                    setOpenModal(true)
                }
                className="
                    cursor-pointer
                    rounded-3xl
                    border
                    p-6
                    text-center
                    transition
                    hover:shadow-lg
                "
                style={{
                    background: "#ede3d2",
                    borderColor: "#d6c9b4"
                }}
            >
                <FiCamera
                    size={32}
                    className="mx-auto mb-3"
                />

                <h3 className="font-semibold text-lg">
                    Thêm Snapshot
                </h3>

                <p className="opacity-70 mt-2">
                    Hôm nay bạn cảm thấy thế nào?
                </p>
            </div>

            {/* TITLE */}
            <div>
                <h2
                    className="
                        text-3xl
                        font-bold
                        flex
                        items-center
                        gap-3
                    "
                >
                    📖 Hành trình hình ảnh
                    <p className="text-sm text-gray-500 mt-1">
                        {snapshots.length} khoảnh khắc đã được lưu
                    </p>
                </h2>


            </div>

            {/* LOADING */}
            {loading && (
                <div>
                    Đang tải Snapshot...
                </div>
            )}

            {/* EMPTY */}
            {!loading &&
                snapshots.length === 0 && (
                    <div
                        className="
                            text-center
                            py-20
                            opacity-60
                        "
                    >
                        Chưa có Snapshot nào.
                    </div>
                )}

            {/* TIMELINE */}
            <div className="space-y-10">

                {groupedSnapshots.map(
                    ([date, items]) => (

                        <div
                            key={date}
                            className="relative"
                        >

                            {/* DATE HEADER */}
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    mb-6
                                "
                            >
                                <div
                                    className="
                                        w-3
                                        h-3
                                        rounded-full
                                    "
                                    style={{
                                        background:
                                            "#8b5e34"
                                    }}
                                />

                                <h3
                                    className="
                                        text-xl
                                        font-bold
                                    "
                                >
                                    {date}
                                </h3>

                                <div
                                    className="
                                        flex-1
                                        h-px
                                    "
                                    style={{
                                        background:
                                            "#d6c9b4"
                                    }}
                                />
                            </div>

                            {/* TIMELINE BODY */}
                            <div
                                className="
                                    ml-2
                                    border-l-2
                                    pl-8
                                    space-y-8
                                "
                                style={{
                                    borderColor:
                                        "#d6c9b4"
                                }}
                            >

                                {items.map(
                                    snapshot => (

                                        <motion.div
                                            key={
                                                snapshot.id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 20
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0
                                            }}
                                            whileHover={{
                                                y: -3
                                            }}
                                            onClick={() =>
                                                setSelectedSnapshot(
                                                    snapshot
                                                )
                                            }
                                            className="
                                                cursor-pointer
                                                rounded-3xl
                                                overflow-hidden
                                                shadow-md
                                                bg-white
                                            "
                                        >

                                            <div className="p-5">
                                                <div className="flex flex-col lg:flex-row gap-6">

                                                    {/* IMAGE */}
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={snapshot.imageUrl}
                                                            alt=""
                                                            className="
                    w-full
                    lg:w-[240px]
                    h-[240px]
                    rounded-2xl
                    object-cover
                "
                                                        />
                                                    </div>

                                                    {/* CONTENT */}
                                                    <div className="flex-1 flex flex-col justify-between">

                                                        <div>

                                                            {/* MOOD */}
                                                            <div
                                                                className="
                        flex
                        items-center
                        gap-2
                        mb-4
                    "
                                                            >
                                                                <span className="text-2xl">
                                                                    {getMoodEmoji(snapshot.mood)}
                                                                </span>

                                                                <span
                                                                    className="
                            text-xl
                            font-semibold
                            text-[#8b5e34]
                        "
                                                                >
                                                                    {snapshot.mood}
                                                                </span>
                                                            </div>

                                                            {/* CAPTION */}
                                                            {snapshot.caption && (
                                                                <div
                                                                    className="
                            bg-[#faf6f0]
                            rounded-2xl
                            p-4
                            text-gray-700
                            leading-relaxed
                        "
                                                                >
                                                                    "{snapshot.caption}"
                                                                </div>
                                                            )}

                                                            {/* AI INSIGHT */}
                                                            <div
                                                                className="
                        mt-4
                        rounded-2xl
                        border
                        border-[#e7d8c2]
                        bg-[#fffaf4]
                        p-4
                    "
                                                            >
                                                                <div
                                                                    className="
                            text-sm
                            font-semibold
                            text-[#8b5e34]
                            mb-2
                        "
                                                                >
                                                                    🧠 AI Insight
                                                                </div>

                                                                <div
                                                                    className="
                            text-sm
                            text-gray-500
                        "
                                                                >
                                                                    Chưa phân tích cảm xúc.
                                                                </div>
                                                            </div>

                                                        </div>

                                                        {/* FOOTER */}
                                                        <div
                                                            className="
                    flex
                    items-center
                    justify-between
                    mt-6
                "
                                                        >
                                                            <div
                                                                className="
                        text-sm
                        text-gray-500
                    "
                                                            >
                                                                🕐{" "}
                                                                {new Date(
                                                                    snapshot.createdAt
                                                                ).toLocaleTimeString(
                                                                    "vi-VN",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit"
                                                                    }
                                                                )}
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(snapshot.id);
                                                                }}
                                                                className="
                        flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-xl
                        text-sm
                        transition-all
                        hover:bg-red-50
                        hover:text-red-600
                    "
                                                            >
                                                                <FiTrash2 />
                                                                Xóa
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        </motion.div>
                                    )
                                )}

                            </div>

                        </div>
                    )
                )}

            </div>

            <SnapshotModal
                open={openModal}
                onClose={() =>
                    setOpenModal(false)
                }
            />

            <SnapshotViewerModal
                open={!!selectedSnapshot}
                snapshot={
                    selectedSnapshot
                }
                onClose={() =>
                    setSelectedSnapshot(
                        null
                    )
                }
            />

        </div>
    );
}

function getMoodEmoji(mood) {
    switch (
    mood?.toLowerCase()
    ) {
        case "happy":
            return "😊";

        case "sad":
            return "😢";

        case "calm":
            return "😌";

        case "angry":
            return "😡";

        case "motivated":
            return "🔥";

        default:
            return "✨";
    }
}