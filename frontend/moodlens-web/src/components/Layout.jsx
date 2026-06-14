import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex h-screen" style={{ background:"#faf6f0" }}>

            {/* Desktop sidebar */}
            <div className="hidden md:block shrink-0">
                <Sidebar />
            </div>

            {/* Mobile overlay */}
            {open && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div className="absolute inset-0 bg-black/40"
                         onClick={() => setOpen(false)} />
                    <div className="relative z-50">
                        <Sidebar onClose={() => setOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar onMenuClick={() => setOpen(true)} />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
