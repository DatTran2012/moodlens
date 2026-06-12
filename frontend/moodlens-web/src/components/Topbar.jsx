import { useAuth } from "../context/AuthContext";
import { BsList } from "react-icons/bs";

export default function Topbar({ onMenuClick }) {
    return (
        <div className="h-14 w-full bg-gray-900 border-b border-white/8
                        flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-gray-400 hover:text-white transition"
                >
                    <BsList size={22} />
                </button>
                <span className="text-white font-semibold text-sm">
                    🧠 MoodLens
                    Listen To Your Mind
                </span>
            </div>
        </div>
    );
}
