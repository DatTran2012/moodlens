// MusicContext.jsx
import { createContext, useContext, useState } from "react";
import { BsMusicNoteBeamed, BsXLg } from "react-icons/bs";

const MusicContext = createContext();

const P = {
    surface: "#f5ede0",
    border: "#d6c9b4",
    spine: "#c4a882",
    text: "#3b2f1e",
    muted: "#8c7560",
    card: "#ede3d2",
    accent: "#7c5c3a"
};

export function MusicProvider({ children }) {
    const [videoId, setVideoId] = useState(null);
    const [videoTitle, setVideoTitle] = useState("");
    const [isMinimized, setIsMinimized] = useState(false);

    const playTrack = (id, title) => {
        setVideoId(id);
        setVideoTitle(title);
        setIsMinimized(false);
    };

    const stopTrack = (e) => {
        if (e) e.stopPropagation();
        setVideoId(null);
        setVideoTitle("");
    };

    return (
        <MusicContext.Provider value={{ videoId, videoTitle, playTrack, stopTrack }}>
            {children}

            {videoId && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

                    {/* TRƯỜNG HỢP 1: ICON TRÒN XOAY (Chỉ ẩn/hiện bằng CSS class để giữ iframe chạy ngầm) */}
                    <div
                        onClick={() => setIsMinimized(false)}
                        className={`w-12 h-12 rounded-full shadow-xl cursor-pointer flex items-center justify-center border transition-all duration-300 hover:scale-110 group animate-spin ${isMinimized ? "flex" : "hidden"
                            }`}
                        style={{
                            background: P.surface,
                            borderColor: P.border,
                            animationDuration: '4s'
                        }}
                        title={`Đang phát: ${videoTitle} - Bấm để mở rộng`}
                    >
                        <BsMusicNoteBeamed size={20} style={{ color: P.accent }} />
                        <button
                            onClick={stopTrack}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                        >
                            ✕
                        </button>
                    </div>

                    {/* TRƯỜNG HỢP 2: KHUNG PHÁT MINI GỌN GÀNG */}
                    <div
                        className={`max-w-[260px] w-80 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col ${isMinimized ? "hidden" : "flex"
                            }`}
                        style={{ background: P.surface, border: `1px solid ${P.border}` }}
                    >
                        <div className="h-1" style={{ background: `linear-gradient(to right, ${P.spine}, #a8896a, ${P.spine})` }} />

                        <div className="p-2 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] uppercase tracking-wider text-amber-800 font-serif font-semibold">
                                        Đang phát ngầm ✍️
                                    </p>
                                    <p className="text-xs font-bold truncate font-serif mt-0.5" style={{ color: P.text }}>
                                        🎵 {videoTitle}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => setIsMinimized(true)}
                                        className="px-1.5 py-0.5 rounded hover:bg-black/5 text-gray-500 text-[10px] font-medium transition"
                                        style={{ border: `1px solid ${P.border}`, background: P.card }}
                                    >
                                        ➖ Thu nhỏ
                                    </button>
                                    <button
                                        onClick={stopTrack}
                                        className="p-1 rounded hover:bg-red-50 text-red-500 transition"
                                    >
                                        <BsXLg size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* IFRAME LUÔN LUÔN SỐNG: Đặt cố định ở ngoài rìa để dù ẩn hay hiện UI thì iframe vẫn giữ nguyên vị trí và hát */}
                    <div className="w-0 h-0 pointer-events-none opacity-0 overflow-hidden">
                        <iframe
                            key={videoId}
                            width="100"
                            height="100"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title={videoTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    </div>

                </div>
            )}
        </MusicContext.Provider>
    );
}

export const useMusic = () => useContext(MusicContext);