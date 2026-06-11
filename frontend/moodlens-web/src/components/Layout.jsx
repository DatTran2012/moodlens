import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-950 text-white">

            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* MOBILE SIDEBAR OVERLAY */}
            {open && (
                <div className="fixed inset-0 z-40 flex md:hidden">

                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setOpen(false)}
                    />

                    {/* SIDEBAR */}
                    <div className="relative z-50">
                        <Sidebar onClose={() => setOpen(false)} />
                    </div>

                </div>
            )}

            {/* MAIN */}
            <div className="flex-1 flex flex-col">

                {/* TOPBAR */}
                <Topbar onMenuClick={() => setOpen(true)} />

                {/* CONTENT */}
                <div className="flex-1 overflow-auto p-4">
                    {children}
                </div>

            </div>

        </div>
    );
}

