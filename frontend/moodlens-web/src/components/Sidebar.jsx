import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BsSpeedometer2, BsJournalText, BsClockHistory, BsRobot, BsBoxArrowRight } from "react-icons/bs";

const menu = [
    { name: "Trang chủ",  path: "/dashboard", icon: <BsSpeedometer2 size={17} /> },
    { name: "Nhật kí",    path: "/journal",   icon: <BsJournalText  size={17} /> },
    { name: "Lịch sử",   path: "/history",   icon: <BsClockHistory size={17} /> },
    { name: "AI Coach",   path: "/coach",     icon: <BsRobot        size={17} /> },
];

export default function Sidebar({ onClose }) {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { logout } = useAuth();

    const go = (path) => { navigate(path); onClose?.(); };

    return (
        <div className="h-screen w-64 bg-gray-900 border-r border-white/8
                        text-white flex flex-col">

            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-5
                            border-b border-white/8">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔍❤️</span>
                    <span className="font-bold text-lg text-white">MoodLens</span>
                </div>
                {onClose && (
                    <button onClick={onClose}
                            className="text-gray-500 hover:text-white transition md:hidden">
                        ✕
                    </button>
                )}
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menu.map(item => {
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => go(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5
                                        rounded-xl text-sm font-medium transition
                                        ${active
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-400 hover:bg-white/8 hover:text-white"}`}
                        >
                            <span className={active ? "text-white" : "text-gray-500"}>
                                {item.icon}
                            </span>
                            {item.name}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-5 border-t border-white/8 pt-4">
                <button
                    onClick={() => { logout(); onClose?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                               text-sm font-medium text-red-400 hover:bg-red-500/10
                               hover:text-red-300 transition"
                >
                    <BsBoxArrowRight size={17} />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
