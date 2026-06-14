import { motion } from "framer-motion";

// Palette nâu ấm
const spineColor = "#c4a882";
const accentColor = "#7c5c3a";

export default function AiAvatar({ isThinking = false }) {
    return (
        <div className="relative flex items-center justify-center">
            {/* Pulse ring khi thinking — màu nâu ấm thay vì xanh */}
            {isThinking && (
                <motion.div
                    animate={{ scale:[1, 1.5, 1], opacity:[0.35, 0, 0.35] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="absolute rounded-full"
                    style={{ width:52, height:52, background:`${spineColor}40` }}
                />
            )}

            <motion.div
                animate={{ scale: isThinking ? [1, 1.06, 1] : 1 }}
                transition={{ duration: 1.3, repeat: isThinking ? Infinity : 0 }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{
                    background: `linear-gradient(135deg, ${spineColor} 0%, ${accentColor} 100%)`,
                    boxShadow: `0 4px 14px ${spineColor}55`,
                }}
            >
                🤖
            </motion.div>
        </div>
    );
}
