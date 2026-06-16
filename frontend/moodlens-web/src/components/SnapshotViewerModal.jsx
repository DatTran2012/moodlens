import { AnimatePresence, motion } from "framer-motion";

export default function SnapshotViewerModal({
    open,
    snapshot,
    onClose,
}) {
    if (!open || !snapshot) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="
          fixed
          inset-0
          z-50
          bg-black/80
          flex
          items-center
          justify-center
          p-4
        "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="
            bg-white
            rounded-3xl
            overflow-hidden
            max-w-4xl
            w-full
            max-h-[90vh]
            shadow-2xl
          "
                    initial={{
                        scale: 0.9,
                        opacity: 0,
                    }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                    }}
                    exit={{
                        scale: 0.9,
                        opacity: 0,
                    }}
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                >
                    {/* IMAGE */}
                    <img
                        src={snapshot.imageUrl}
                        alt="snapshot"
                        className="
              w-full
              max-h-[70vh]
              object-contain
              bg-black
            "
                    />

                    {/* CONTENT */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-3xl">
                                {getMoodEmoji(
                                    snapshot.mood
                                )}
                            </span>

                            <span className="font-semibold text-xl">
                                {snapshot.mood}
                            </span>
                        </div>

                        {snapshot.caption && (
                            <p className="mb-4 text-lg">
                                {snapshot.caption}
                            </p>
                        )}

                        <p className="text-sm text-gray-500">
                            {new Date(
                                snapshot.createdAt
                            ).toLocaleDateString(
                                "vi-VN"
                            )}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function getMoodEmoji(mood) {
    const value =
        mood?.toLowerCase();

    switch (value) {
        case "happy":
            return "😊";

        case "calm":
            return "😌";

        case "sad":
            return "😢";

        case "angry":
            return "😡";

        case "motivated":
            return "🔥";

        default:
            return "✨";
    }
}