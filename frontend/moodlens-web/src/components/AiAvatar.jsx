import { motion } from "framer-motion";

const spineColor = "#c4a882";
const accentColor = "#7c5c3a";

export default function AiAvatar({ isThinking = false }) {
    return (
        <div className="relative flex items-center justify-center">

            {/* Pulse ring khi thinking */}
            {isThinking && (
                <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute rounded-full"
                    style={{ width: 56, height: 56, background: `${spineColor}35` }}
                />
            )}

            {/* Avatar — bút viết trên nền giấy kem */}
            <motion.div
                animate={{ rotate: isThinking ? [0, -6, 6, -4, 4, 0] : 0 }}
                transition={{ duration: 1.4, repeat: isThinking ? Infinity : 0, ease: "easeInOut" }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                    background: `linear-gradient(135deg, #f5ede0 0%, #ede3d2 100%)`,
                    border: `2px solid ${spineColor}`,
                    boxShadow: `0 4px 14px ${spineColor}44`,
                    fontSize: 20,
                }}
            >
                ✍️
            </motion.div>
        </div>
    );
}
