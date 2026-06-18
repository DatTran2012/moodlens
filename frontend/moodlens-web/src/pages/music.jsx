// Music.jsx đã lược bỏ phần iframe player vì đã chuyển lên cấp cao hơn
import { useState, useRef } from "react";
import { BsMusicNoteBeamed, BsSearch, BsXLg, BsYoutube } from "react-icons/bs";
import { useMusic } from "./MusicContext"; // Khai báo sử dụng Context

const P = {
    bg: "#faf6f0",
    surface: "#f5ede0",
    card: "#ede3d2",
    border: "#d6c9b4",
    spine: "#c4a882",
    text: "#3b2f1e",
    muted: "#8c7560",
    accent: "#7c5c3a",
};

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export default function Music() {
    const { playTrack } = useMusic(); // Lấy hàm phát nhạc từ Context ra dùng
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [searchError, setSearchError] = useState("");
    const inputRef = useRef(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearching(true); setSearchError(""); setResults([]);
        try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.error) setSearchError("Không tìm được. Kiểm tra lại API key.");
            else setResults(data.items || []);
        } catch { setSearchError("Lỗi kết nối. Thử lại sau."); }
        finally { setSearching(false); }
    };

    const pickVideo = (item) => {
        // Gọi hàm từ Context: Nhạc sẽ được phát ở tầng gốc của App
        playTrack(item.id.videoId, item.snippet.title);
        setResults([]);
    };

    const clearSearch = () => {
        setQuery(""); setResults([]);
        inputRef.current?.focus();
    };

    return (
        <div className="min-h-screen p-4 sm:p-8" style={{ background: P.bg, color: P.text }}>
            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" style={{ fontFamily: "'Caveat', serif" }}>
                    <BsMusicNoteBeamed size={24} style={{ color: P.accent }} /> Âm nhạc
                </h1>
                <p className="mt-1 ml-9 text-sm" style={{ color: P.muted }}>
                    Tìm và nghe nhạc yêu thích trong lúc viết nhật kí
                </p>
            </div>

            {/* SEARCH */}
            <div className="max-w-2xl mb-6">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={14} style={{ color: P.muted }} />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                            placeholder="Tìm bài hát, nghệ sĩ..."
                            className="w-full py-3 rounded-xl text-sm outline-none transition"
                            style={{
                                paddingLeft: 40, paddingRight: query ? 36 : 16,
                                background: P.surface, border: `1px solid ${P.border}`, color: P.text,
                            }}
                        />
                        {query && (
                            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-60 transition" style={{ color: P.muted }}>
                                <BsXLg size={12} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching || !query.trim()}
                        className="px-5 py-3 rounded-xl text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40 shrink-0"
                        style={{ background: `linear-gradient(135deg, ${P.spine}, ${P.accent})` }}>
                        {searching ? "..." : "Tìm"}
                    </button>
                </div>
                {searchError && <p className="mt-2 text-xs" style={{ color: "#c0392b" }}>{searchError}</p>}
            </div>

            {/* KẾT QUẢ TÌM KIẾM */}
            {results.length > 0 && (
                <div className="max-w-2xl mb-6 rounded-2xl overflow-hidden"
                    style={{ background: P.surface, border: `1px solid ${P.border}`, boxShadow: "0 4px 16px rgba(139,110,80,0.08)" }}>
                    <div className="p-2">
                        {results.map(item => (
                            <button key={item.id.videoId} onClick={() => pickVideo(item)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition hover:bg-amber-100/50">
                                <img src={item.snippet.thumbnails.default.url} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" style={{ border: `1px solid ${P.border}` }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: P.text }}>{item.snippet.title}</p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: P.muted }}>{item.snippet.channelTitle}</p>
                                </div>
                                <BsYoutube size={16} className="shrink-0 text-red-500" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Ý tưởng thêm: Bạn có thể làm một hàng chữ nhỏ ở đây thông báo trạng thái */}
            <p className="text-xs italic" style={{ color: P.muted }}>
                *Bạn có thể thoải mái chuyển sang mục viết Nhật Ký, nhạc vẫn sẽ được giữ chạy dưới góc màn hình.
            </p>
        </div>
    );
}