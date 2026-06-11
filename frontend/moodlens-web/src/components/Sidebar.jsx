import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const menu = [
        { name: "Trang chủ", path: "/dashboard", icon: "📊" },
        { name: "Nhật kí", path: "/journal", icon: "📝" },
        { name: "Lịch sử", path: "/history", icon: "📚" },
        {
            name: "AI trợ thủ",
            path: "/coach",
            icon: "🤖"
        }
    ];

    const handleNavigate = (path) => {
        navigate(path);
        onClose?.(); // auto close mobile sidebar
    };

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-blue-400">
                    MoodLens 🔍❤️
                </h1>

                {/* Close button (mobile only) */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden text-white text-xl"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* MENU */}
            <div className="flex flex-col gap-2 flex-1">

                {menu.map((item) => {
                    const active = location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition
                ${active
                                    ? "bg-blue-500 text-white"
                                    : "text-gray-300 hover:bg-white/10"
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                        </button>
                    );
                })}

            </div>

            {/* FOOTER */}
            <div className="pt-4 border-t border-white/10">

                <button
                    onClick={() => {
                        logout();
                        onClose?.();
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg"
                >
                    Đăng xuất
                </button>

            </div>

        </div>
    );
}


