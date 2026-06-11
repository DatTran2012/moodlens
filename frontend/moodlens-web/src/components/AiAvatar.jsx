import { motion } from "framer-motion";
export default function AiAvatar() {
    return (

        <motion.div
            animate={{
                scale: [1, 1.05, 1]
            }}
            transition={{
                duration: 2,
                repeat: Infinity
            }}
            className="
                w-32
                h-32
                rounded-full
                bg-gradient-to-r
                from-blue-500
                to-purple-500
                flex
                items-center
                justify-center
                text-5xl
                shadow-2xl
            "
        >
            🤖
        </motion.div>

    );
}