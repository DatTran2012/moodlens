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

    const handleSubmit = async () => {
        if (!file) {
            alert("Vui lòng chọn ảnh");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("file", file);
            formData.append("mood", mood);
            formData.append("caption", caption);

            await createSnapshot(formData);

            setFile(null);
            setPreview("");
            setCaption("");
            setMood("Happy");

            onClose();
        } catch (error) {
            alert(error.message);
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
          flex
          items-center
          justify-center
          bg-black/50
          p-4
        "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.9,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.9,
                    }}
                    className="
            w-full
            max-w-xl
            rounded-3xl
            shadow-xl
            overflow-hidden
          "
                    style={{
                        background:
                            COLORS.bg,
                    }}
                >
                    {/* Header */}
                    <div
                        className="p-6"
                        style={{
                            background:
                                COLORS.card,
                        }}
                    >
                        <h2 className="text-2xl font-bold">
                            📸 New Snapshot
                        </h2>

                        <p className="opacity-70 mt-1">
                            Lưu lại cảm xúc hôm nay
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">

                        {/* Upload */}
                        <div>
                            <label
                                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
                            >
                                Hình ảnh
                            </label>

                            <label
                                className="
                  cursor-pointer
                  block
                  border-2
                  border-dashed
                  rounded-2xl
                  p-4
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
                      h-64
                      flex
                      flex-col
                      items-center
                      justify-center
                    "
                                    >
                                        <div className="text-6xl">
                                            📷
                                        </div>

                                        <p className="mt-3 opacity-70">
                                            Chọn ảnh
                                        </p>
                                    </div>
                                ) : (
                                    <img
                                        src={preview}
                                        alt="preview"
                                        className="
                      w-full
                      h-64
                      object-cover
                      rounded-xl
                    "
                                    />
                                )}
                            </label>
                        </div>

                        {/* Mood */}
                        <div>
                            <label
                                className="
                  block
                  text-sm
                  font-medium
                  mb-3
                "
                            >
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
                                    (item) => (
                                        <button
                                            key={item.value}
                                            onClick={() =>
                                                setMood(
                                                    item.value
                                                )
                                            }
                                            className="
                        px-4
                        py-2
                        rounded-full
                        transition
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
                                            {item.emoji}
                                            {" "}
                                            {item.value}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Caption */}
                        <div>
                            <label
                                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
                            >
                                Caption
                            </label>

                            <textarea
                                rows={4}
                                value={caption}
                                onChange={(e) =>
                                    setCaption(
                                        e.target.value
                                    )
                                }
                                placeholder="Hôm nay bạn cảm thấy thế nào..."
                                className="
                  w-full
                  rounded-2xl
                  p-4
                  outline-none
                  resize-none
                "
                                style={{
                                    background:
                                        COLORS.surface,
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="
              flex
              justify-end
              gap-3
              p-6
            "
                        style={{
                            background:
                                COLORS.card,
                        }}
                    >
                        <button
                            onClick={onClose}
                            className="
                px-5
                py-2
                rounded-xl
              "
                        >
                            Cancel
                        </button>

                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="
                px-5
                py-2
                rounded-xl
                text-white
              "
                            style={{
                                background:
                                    COLORS.accent,
                            }}
                        >
                            {loading
                                ? "Saving..."
                                : "Save Snapshot"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

