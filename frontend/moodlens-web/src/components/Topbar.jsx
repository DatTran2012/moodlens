import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onMenuClick }) {
    const { logout } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // close when click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="h-14 w-full bg-gray-900 border-b border-white/10 
                    flex items-center justify-between px-4">

            {/* LEFT */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-white text-2xl"
                >
                    ☰
                </button>

                <h1 className="text-white font-semibold">
                    MoodLens 🔍❤️
                </h1>
            </div>


            {/* <div className="relative" ref={menuRef}>

              
                <button
                    onClick={() => setOpen(!open)}
                    className="w-9 h-9 rounded-full bg-blue-500 
                     flex items-center justify-center text-sm
                     hover:scale-105 transition"
                >
                    U
                </button>

             
                {open && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 
                          border border-white/10 rounded-lg shadow-lg 
                          overflow-hidden z-50">

                        <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-sm text-white font-semibold">
                                User Name
                            </p>
                            <p className="text-xs text-gray-400">
                                user@email.com
                            </p>
                        </div>

                        <button
                            className="w-full text-left px-4 py-2 hover:bg-white/10"
                        >
                            👤 Profile
                        </button>

                        <button
                            className="w-full text-left px-4 py-2 hover:bg-white/10"
                        >
                            ⚙️ Settings
                        </button>

                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
                        >
                            🚪 Logout
                        </button>

                    </div>
                )}

            </div> */}
        </div>
    );
}