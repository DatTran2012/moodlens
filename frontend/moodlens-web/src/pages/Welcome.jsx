import { useNavigate } from "react-router-dom";
import { FaBrain, FaBookOpen, FaChartLine } from "react-icons/fa";

export default function Welcome() {


    const navigate = useNavigate();

    const handleStart = () => {

        localStorage.setItem(
            "welcomeCompleted",
            "true"
        );

        navigate("/dashboard");
    };

    return (

        <div
            className="
            min-h-screen
            bg-gray-950
            text-white
            flex
            items-center
            justify-center
            p-6
        "
        >

            <div
                className="
                max-w-5xl
                w-full
                text-center
            "
            >

                {/* HERO */}

                <div className="mb-12">

                    <div className="text-7xl mb-6">
                        🌙
                    </div>

                    <h1
                        className="
                        text-4xl
                        sm:text-6xl
                        font-bold
                        mb-4
                    "
                    >
                        Xin chào đến với MoodLens 🔍❤️
                    </h1>

                    <p
                        className="
                        text-gray-400
                        text-lg
                        sm:text-xl
                        max-w-2xl
                        mx-auto
                    "
                    >
                        Theo dõi cảm xúc, hiểu bản thân
                        và phát triển mỗi ngày cùng AI.
                    </p>

                </div>

                {/* FEATURES */}

                <div
                    className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-6
                    mb-12
                "
                >

                    <div
                        className="
                        bg-white/5
                        border
                        border-white/10
                        rounded-2xl
                        p-6
                        hover:bg-white/10
                        transition
                    "
                    >

                        <FaBookOpen
                            className="
                            text-blue-400
                            text-4xl
                            mx-auto
                            mb-4
                        "
                        />

                        <h3
                            className="
                            text-xl
                            font-semibold
                            mb-2
                        "
                        >
                            Journal
                        </h3>

                        <p className="text-gray-400">
                            Ghi lại cảm xúc và những điều
                            xảy ra mỗi ngày.
                        </p>

                    </div>

                    <div
                        className="
                        bg-white/5
                        border
                        border-white/10
                        rounded-2xl
                        p-6
                        hover:bg-white/10
                        transition
                    "
                    >

                        <FaBrain
                            className="
                            text-yellow-400
                            text-4xl
                            mx-auto
                            mb-4
                        "
                        />

                        <h3
                            className="
                            text-xl
                            font-semibold
                            mb-2
                        "
                        >
                            AI Analysis
                        </h3>

                        <p className="text-gray-400">
                            AI phân tích cảm xúc,
                            điểm số và tóm tắt nội dung.
                        </p>

                    </div>

                    <div
                        className="
                        bg-white/5
                        border
                        border-white/10
                        rounded-2xl
                        p-6
                        hover:bg-white/10
                        transition
                    "
                    >

                        <FaChartLine
                            className="
                            text-green-400
                            text-4xl
                            mx-auto
                            mb-4
                        "
                        />

                        <h3
                            className="
                            text-xl
                            font-semibold
                            mb-2
                        "
                        >
                            Insight
                        </h3>

                        <p className="text-gray-400">
                            Theo dõi xu hướng cảm xúc
                            theo ngày, tuần và tháng.
                        </p>

                    </div>

                </div>

                {/* CTA */}

                <button
                    onClick={handleStart}
                    className="
                    px-8
                    py-4
                    rounded-2xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-lg
                    font-semibold
                    transition
                "
                >
                    🚀 Bắt đầu ngay
                </button>

            </div>

        </div>
    );


}
