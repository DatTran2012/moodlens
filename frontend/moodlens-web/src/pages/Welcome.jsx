import { useNavigate } from "react-router-dom";
import { FaBrain, FaBookOpen, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
    {
        icon: <FaBookOpen size={28} className="text-blue-400" />,
        title: "Journal",
        desc: "Ghi lại cảm xúc và những điều xảy ra mỗi ngày.",
        color: "border-blue-500/30 bg-blue-500/8"
    },
    {
        icon: <FaBrain size={28} className="text-yellow-400" />,
        title: "AI Analysis",
        desc: "AI phân tích cảm xúc, điểm số và tóm tắt nội dung.",
        color: "border-yellow-500/30 bg-yellow-500/8"
    },
    {
        icon: <FaChartLine size={28} className="text-green-400" />,
        title: "Insight",
        desc: "Theo dõi xu hướng cảm xúc theo ngày, tuần và tháng.",
        color: "border-green-500/30 bg-green-500/8"
    },
];

export default function Welcome() {
    const navigate = useNavigate();

    const handleStart = () => {
        localStorage.setItem("welcomeCompleted", "true");
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center
                        justify-center p-6 relative overflow-hidden">

            {/* Ambient */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                            bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-3xl w-full text-center">

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-14"
                >
                    <div className="text-6xl mb-5">🔍❤️</div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                        Xin chào đến với{" "}
                        <span className="text-blue-400">MoodLens</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Theo dõi cảm xúc, hiểu bản thân và phát triển mỗi ngày cùng AI.
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
                >
                    {features.map((f, i) => (
                        <div key={i}
                             className={`rounded-2xl border p-6 text-left
                                         transition hover:brightness-110 ${f.color}`}>
                            <div className="mb-3">{f.icon}</div>
                            <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <button
                        onClick={handleStart}
                        className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700
                                   text-lg font-semibold transition active:scale-[0.97]
                                   shadow-lg shadow-blue-500/20"
                    >
                        🚀 Bắt đầu ngay
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
