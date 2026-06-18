import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSnapshotStore from "../store/useSnapshotStore";

const COLORS = {
    bg: "#faf6f0",
    surface: "#f5ede0",
    card: "#ede3d2",
    border: "#d6c9b4",
    accent: "#7c5c3a",
    text: "#3b2f1e",
};

const moods = [
    { emoji: "😊", value: "Happy" },
    { emoji: "😌", value: "Calm" },
    { emoji: "😢", value: "Sad" },
    { emoji: "😡", value: "Angry" },
    { emoji: "🔥", value: "Motivated" },
];

export default function SnapshotModal({
    open,
    onClose,
}) {
    const {
        createSnapshot,
        loading,
    } = useSnapshotStore();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [mood, setMood] = useState("Happy");
    const [caption, setCaption] = useState("");

    const handleFileChange = (e) => {
        const selectedFile =
            e.target.files?.[0];

        if (!selectedFile) return;

        setFile(selectedFile);

        setPreview(
            URL.createObjectURL(selectedFile)
        );
    };

    const resetForm = () => {
        setFile(null);
        setPreview("");
        setMood("Happy");
        setCaption("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!file) {
            alert("Vui lòng chọn ảnh");
            return;
        }

        try {
            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "mood",
                mood
            );

            formData.append(
                "caption",
                caption
            );

            await createSnapshot(
                formData
            );

            handleClose();
        } catch (error) {
            alert(
                error.message ||
                    "Có lỗi xảy ra"
            );
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="
                    fixed
                    inset-0
                    z-50
                    bg-black/50
                    backdrop-blur-sm
                    flex
                    items-center
                    justify-center
                    p-4
                "
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                exit={{
                    opacity: 0,
                }}
                onClick={
                    handleClose
                }
            >
                <motion.div
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    initial={{
                        opacity: 0,
                        scale: 0.95,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.95,
                    }}
                    className="
                        w-full
                        max-w-2xl
                        max-h-[90vh]
                        rounded-3xl
                        shadow-2xl
                        overflow-hidden
                        flex
                        flex-col
                    "
                    style={{
                        background:
                            COLORS.bg,
                    }}
                >
                    {/* Header */}
                    <div
                        className="
                            px-6
                            py-4
                            flex
                            items-center
                            justify-between
                        "
                        style={{
                            background:
                                COLORS.card,
                        }}
                    >
                        <div>
                            <h2 className="text-xl font-bold text-[#3b2f1e]">
                                📸 New Snapshot
                            </h2>

                            <p className="text-sm opacity-70">
                                Ghi lại cảm xúc
                                của hôm nay
                            </p>
                        </div>

                        <button
                            onClick={
                                handleClose
                            }
                            className="
                                w-10
                                h-10
                                rounded-xl
                                hover:bg-black/5
                                transition
                            "
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div
                        className="
                            p-5
                            overflow-y-auto
                            space-y-5
                        "
                    >
                        {/* Upload */}
                        <div>
                            <label className="block font-medium mb-2">
                                Hình ảnh
                            </label>

                            <label
                                className="
                                    block
                                    cursor-pointer
                                    border-2
                                    border-dashed
                                    rounded-3xl
                                    overflow-hidden
                                "
                                style={{
                                    borderColor:
                                        COLORS.border,
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={
                                        handleFileChange
                                    }
                                />

                                {!preview ? (
                                    <div
                                        className="
                                            h-48
                                            flex
                                            flex-col
                                            items-center
                                            justify-center
                                        "
                                    >
                                        <div className="text-5xl">
                                            📷
                                        </div>

                                        <p className="mt-3 text-gray-500">
                                            Chọn ảnh
                                        </p>
                                    </div>
                                ) : (
                                    <img
                                        src={
                                            preview
                                        }
                                        alt="preview"
                                        className="
                                            w-full
                                            h-60
                                            object-cover
                                        "
                                    />
                                )}
                            </label>
                        </div>

                        {/* Mood */}
                        <div>
                            <label className="block font-medium mb-3">
                                Mood
                            </label>

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    gap-3
                                "
                            >
                                {moods.map(
                                    (
                                        item
                                    ) => (
                                        <button
                                            key={
                                                item.value
                                            }
                                            onClick={() =>
                                                setMood(
                                                    item.value
                                                )
                                            }
                                            className="
                                                px-4
                                                py-2.5
                                                rounded-full
                                                transition-all
                                                text-sm
                                                font-medium
                                            "
                                            style={{
                                                background:
                                                    mood ===
                                                    item.value
                                                        ? COLORS.accent
                                                        : COLORS.surface,

                                                color:
                                                    mood ===
                                                    item.value
                                                        ? "#fff"
                                                        : COLORS.text,
                                            }}
                                        >
                                            {
                                                item.emoji
                                            }{" "}
                                            {
                                                item.value
                                            }
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Caption */}
                        <div>
                            <label className="block font-medium mb-2">
                                Caption
                            </label>

                            <textarea
                                rows={3}
                                maxLength={
                                    200
                                }
                                value={
                                    caption
                                }
                                onChange={(
                                    e
                                ) =>
                                    setCaption(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Hôm nay bạn cảm thấy thế nào..."
                                className="
                                    w-full
                                    rounded-2xl
                                    p-4
                                    resize-none
                                    outline-none
                                "
                                style={{
                                    background:
                                        COLORS.surface,
                                }}
                            />

                            <div
                                className="
                                    mt-2
                                    text-right
                                    text-xs
                                    text-gray-400
                                "
                            >
                                {
                                    caption.length
                                }
                                /200
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="
                            px-6
                            py-4
                            flex
                            justify-end
                            gap-3
                            border-t
                        "
                        style={{
                            background:
                                COLORS.card,
                            borderColor:
                                COLORS.border,
                        }}
                    >
                        <button
                            onClick={
                                handleClose
                            }
                            className="
                                px-5
                                py-2.5
                                rounded-xl
                                hover:bg-black/5
                                transition
                            "
                        >
                            Hủy
                        </button>

                        <button
                            disabled={
                                loading
                            }
                            onClick={
                                handleSubmit
                            }
                            className="
                                px-5
                                py-2.5
                                rounded-xl
                                text-white
                                font-medium
                                disabled:opacity-50
                            "
                            style={{
                                background:
                                    COLORS.accent,
                            }}
                        >
                            {loading
                                ? "Đang lưu..."
                                : "Lưu Snapshot"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}