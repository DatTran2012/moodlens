import { motion } from "framer-motion";

export default function AiAvatar({ isThinking = false }) {
    return (
        <div className="relative flex items-center justify-center">
            {/* Outer pulse ring khi đang thinking */}
            {isThinking && (
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute w-20 h-20 rounded-full bg-blue-500/30"
                />
            )}

            <motion.div
                animate={{ scale: isThinking ? [1, 1.06, 1] : 1 }}
                transition={{ duration: 1.2, repeat: isThinking ? Infinity : 0 }}
                className="w-14 h-14 rounded-full
                           bg-gradient-to-br from-blue-500 to-purple-600
                           flex items-center justify-center
                           shadow-lg shadow-blue-500/30 text-2xl"
            >
                🤖
            </motion.div>
        </div>
    );
}
