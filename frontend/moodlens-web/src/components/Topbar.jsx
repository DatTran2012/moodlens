import { BsList } from "react-icons/bs";

const P = {
    bg:     "#f5ede0",
    border: "#d6c9b4",
    text:   "#3b2f1e",
    muted:  "#8c7560",
    accent: "#7c5c3a",
};

export default function Topbar({ onMenuClick }) {
    return (
        <div className="h-14 w-full shrink-0 flex items-center justify-between px-4"
             style={{ background: P.bg, borderBottom:`1px solid ${P.border}` }}>
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick}
                        className="md:hidden transition hover:opacity-60"
                        style={{ color: P.muted }}>
                    <BsList size={22} />
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xl">🧠</span>
                    <div>
                        <span className="font-bold text-sm"
                              style={{ color: P.accent, fontFamily:"'Georgia', serif" }}>
                            MoodLens
                        </span>
                        <span className="hidden sm:inline text-xs italic ml-2"
                              style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                            Listen To Your Mind
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
