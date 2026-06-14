import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BsSpeedometer2, BsJournalText, BsClockHistory, BsRobot, BsBoxArrowRight, BsMusicNoteBeamed } from "react-icons/bs";

const P = {
    bg: "#f5ede0",
    card: "#ede3d2",
    border: "#d6c9b4",
    spine: "#c4a882",
    text: "#3b2f1e",
    muted: "#8c7560",
    accent: "#7c5c3a",
};

const menu = [
    { name: "Trang chủ", path: "/dashboard", icon: <BsSpeedometer2 size={17} /> },
    { name: "Nhật kí", path: "/journal", icon: <BsJournalText size={17} /> },
    { name: "Lịch sử", path: "/history", icon: <BsClockHistory size={17} /> },
    { name: "AI Coach", path: "/coach", icon: <BsRobot size={17} /> },
    // { name: "Âm nhạc", path: "/music", icon: <BsMusicNoteBeamed size={17} /> },
];

export default function Sidebar({ onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const go = (path) => { navigate(path); onClose?.(); };

    return (
        <div className="h-screen w-64 flex flex-col"
            style={{ background: P.bg, borderRight: `1px solid ${P.border}` }}>

            {/* Logo — bìa sổ tay */}
            <div className="px-5 py-5 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${P.border}` }}>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        <span className="font-bold text-lg"
                            style={{ color: P.accent, fontFamily: "'Georgia', serif" }}>
                            MoodLens
                        </span>
                    </div>
                    <p className="text-xs mt-0.5 ml-8 italic"
                        style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>
                        Listen To Your Mind
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose}
                        className="md:hidden transition hover:opacity-60"
                        style={{ color: P.muted }}>✕</button>
                )}
            </div>

            {/* Gáy sổ — dải nâu ấm dọc trái */}
            <div className="flex flex-1 min-h-0">
                <div className="w-1 shrink-0"
                    style={{ background: `linear-gradient(to bottom, ${P.spine}, #a8896a, ${P.spine})`, opacity: 0.7 }} />

                <div className="flex-1 flex flex-col min-h-0">
                    {/* Menu */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {menu.map(item => {
                            const active = location.pathname === item.path;
                            return (
                                <button key={item.path} onClick={() => go(item.path)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition"
                                    style={{
                                        background: active ? P.accent : "transparent",
                                        color: active ? "white" : P.muted,
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = P.card; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                                >
                                    <span style={{ color: active ? "white" : P.muted }}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="px-3 pb-5 pt-4"
                        style={{ borderTop: `1px solid ${P.border}` }}>
                        <button onClick={() => { logout(); onClose?.(); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition"
                            style={{ color: "#c0392b" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fdecea"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                            <BsBoxArrowRight size={17} />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
