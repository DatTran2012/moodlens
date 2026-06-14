import { useNavigate } from "react-router-dom";
import { FaBrain, FaBookOpen, FaChartLine, FaMusic } from "react-icons/fa";
import { motion } from "framer-motion";

const P = {
    bg:      "#faf6f0",
    surface: "#f5ede0",
    card:    "#ede3d2",
    border:  "#d6c9b4",
    spine:   "#c4a882",
    text:    "#3b2f1e",
    muted:   "#8c7560",
    accent:  "#7c5c3a",
    line:    "rgba(139,110,80,0.07)",
};

const features = [
    {
        icon:  <FaBookOpen  size={26} />,
        title: "Journal",
        desc:  "Ghi lại cảm xúc và những điều xảy ra mỗi ngày.",
        iconColor: "#2563eb",
        cardBg:    "#eff6ff",
        cardBorder:"#bfdbfe",
    },
    {
        icon:  <FaBrain     size={26} />,
        title: "AI Analysis",
        desc:  "AI phân tích cảm xúc, điểm số và tóm tắt nội dung.",
        iconColor: "#d97706",
        cardBg:    "#fffbeb",
        cardBorder:"#fde68a",
    },
    {
        icon:  <FaChartLine size={26} />,
        title: "Insight",
        desc:  "Theo dõi xu hướng cảm xúc theo ngày, tuần và tháng.",
        iconColor: "#16a34a",
        cardBg:    "#f0fdf4",
        cardBorder:"#bbf7d0",
    },
    {
        icon:  <FaMusic     size={26} />,
        title: "Âm nhạc",
        desc:  "Nghe nhạc phù hợp với tâm trạng để cân bằng cảm xúc.",
        iconColor: "#7c3aed",
        cardBg:    "#faf5ff",
        cardBorder:"#ddd6fe",
    },
];

export default function Welcome() {
    const navigate = useNavigate();

    const handleStart = () => {
        localStorage.setItem("welcomeCompleted", "true");
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
             style={{ background: P.bg }}>

            {/* Ambient glow nâu ấm */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                            rounded-full blur-3xl pointer-events-none"
                 style={{ background:"rgba(196,168,130,0.18)" }} />

            <div className="relative max-w-3xl w-full text-center">

                {/* Hero */}
                <motion.div
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.6 }}
                    className="mb-12"
                >
                    {/* Bìa sổ tay */}
                    <div className="inline-flex items-center justify-center w-20 h-20
                                    rounded-2xl mb-5 shadow-lg"
                         style={{ background:`linear-gradient(135deg, ${P.spine}, ${P.accent})` }}>
                        <span className="text-4xl">🧠</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight"
                        style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                        Xin chào đến với{" "}
                        <span style={{ color: P.accent }}>MoodLens</span>
                    </h1>

                    <p className="text-lg max-w-xl mx-auto leading-relaxed italic"
                       style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                        Theo dõi cảm xúc, hiểu bản thân và phát triển mỗi ngày cùng AI.
                    </p>

                    {/* Divider kiểu trang giấy */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <div className="h-px w-16" style={{ background: P.border }} />
                        <span className="text-lg" style={{ color: P.spine }}>✦</span>
                        <div className="h-px w-16" style={{ background: P.border }} />
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.6, delay:0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity:0, y:16 }}
                            animate={{ opacity:1, y:0 }}
                            transition={{ duration:0.4, delay:0.2 + i * 0.08 }}
                        >
                            <div className="rounded-2xl p-5 text-left h-full transition hover:brightness-97"
                                 style={{
                                     background: f.cardBg,
                                     border: `1px solid ${f.cardBorder}`,
                                     boxShadow: "0 2px 12px rgba(139,110,80,0.06)"
                                 }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                     style={{ background:`${f.iconColor}18`, color: f.iconColor }}>
                                    {f.icon}
                                </div>
                                <h3 className="font-bold mb-1 text-base"
                                    style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                                    {f.title}
                                </h3>
                                <p className="text-sm leading-relaxed"
                                   style={{ color: P.muted }}>
                                    {f.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity:0 }}
                    animate={{ opacity:1 }}
                    transition={{ duration:0.6, delay:0.5 }}
                >
                    <button
                        onClick={handleStart}
                        className="px-10 py-4 rounded-2xl text-lg font-bold text-white
                                   transition active:scale-[0.97] hover:opacity-90"
                        style={{
                            background: `linear-gradient(135deg, ${P.spine}, ${P.accent})`,
                            boxShadow: "0 8px 24px rgba(124,92,58,0.30)",
                            fontFamily:"'Georgia', serif",
                        }}
                    >
                        🚀 Bắt đầu ngay
                    </button>

                    <p className="mt-4 text-sm italic" style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                        Listen To Your Mind
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
