import { useState } from "react";
import { BsMusicNoteBeamed, BsPlayFill, BsPauseFill, BsShuffle } from "react-icons/bs";

const P = {
    bg: "#faf6f0",
    surface: "#f5ede0",
    card: "#ede3d2",
    border: "#d6c9b4",
    spine: "#c4a882",
    text: "#3b2f1e",
    muted: "#8c7560",
    accent: "#7c5c3a",
    line: "rgba(139,110,80,0.07)",
};

// Map mood → playlist YouTube (embed)
const moodPlaylists = {
    happy: {
        label: "Vui vẻ & Phấn chấn",
        emoji: "😊",
        color: "bg-emerald-100 border-emerald-300",
        text: "text-emerald-700",
        playlists: [
            { title: "Happy Vibes", id: "PLFgquLnL59akA2PflFpeQG9L01VFg90wS" },
            { title: "Nhạc vui lo-fi", id: "PLcirGkCPmbmFeQ1sm4wFciF03D_EroIfS" },
            { title: "Feel Good Hits", id: "PLDIoUOhQQPlXr63I_vwF06Dq4oY6B3zIT" },
        ],
    },
    sad: {
        label: "Chữa lành & Bình yên",
        emoji: "😢",
        color: "bg-blue-100 border-blue-300",
        text: "text-blue-700",
        playlists: [
            { title: "Healing Music", id: "PLQ_PIlf6OzrljGSuOlMqUhJTN1rCQjgvQ" },
            { title: "Nhạc buồn nhẹ nhàng", id: "PLw-VjHDlEOguCOIKZFVqDQTKO_CKM_9Pn" },
            { title: "Rainy Day Lofi", id: "PLOzDu-MXXLliO9gsei2vy7RV5MT62RQAH" },
        ],
    },
    stress: {
        label: "Thư giãn & Giải stress",
        emoji: "😰",
        color: "bg-amber-100 border-amber-300",
        text: "text-amber-700",
        playlists: [
            { title: "Stress Relief", id: "PLzvRx_johoA-YabI6GiCiGFK7MjmavlGp" },
            { title: "Nhạc thiền định", id: "PLQkQfzsIUwRYQLzF3zBvL3OFbEGHvlzST" },
            { title: "Calm Lo-fi Study", id: "PLOzDu-MXXLliO9gsei2vy7RV5MT62RQAH" },
        ],
    },
    neutral: {
        label: "Tập trung & Làm việc",
        emoji: "😐",
        color: "bg-stone-100 border-stone-300",
        text: "text-stone-600",
        playlists: [
            { title: "Focus Music", id: "PLTBqohhFNBE_09L0i4VcOmFMm9Kj1NS3Q" },
            { title: "Lo-fi Study Beats", id: "PL6NdkXsPL07KiewBDpJC9rWHs3EfqF46E" },
            { title: "Deep Focus", id: "PLMEZyDHJojxkGjVpKCfN5tS8xXL12yvDd" },
        ],
    },
    angry: {
        label: "Xả stress & Năng lượng",
        emoji: "😠",
        color: "bg-red-100 border-red-300",
        text: "text-red-700",
        playlists: [
            { title: "Energy Boost", id: "PLH6pfBXQXHEC2uDmDy6ZPMTCYWItjR4Xo" },
            { title: "Workout Motivation", id: "PLw-VjHDlEOgv7lBEPFPmB1M_VwxXSHPwQ" },
            { title: "Rock & Metal Mix", id: "PL7k0JFoxwvTbKL8kjGI_CaV31QxCGf1vJ" },
        ],
    },
};

const moodKeys = Object.keys(moodPlaylists);

export default function Music() {
    const [selectedMood, setSelectedMood] = useState("happy");
    const [selectedPlaylist, setSelectedPlaylist] = useState(0);
    const [playing, setPlaying] = useState(false);

    const current = moodPlaylists[selectedMood];
    const playlist = current.playlists[selectedPlaylist];

    const shufflePlaylist = () => {
        const next = Math.floor(Math.random() * current.playlists.length);
        setSelectedPlaylist(next);
    };

    return (
        <div className="min-h-screen p-4 sm:p-8" style={{ background: P.bg, color: P.text }}>

            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"
                    style={{ fontFamily: "'Georgia', serif" }}>
                    <BsMusicNoteBeamed size={26} style={{ color: P.accent }} />
                    Âm nhạc theo cảm xúc
                </h1>
                <p className="mt-1 ml-11 text-sm" style={{ color: P.muted }}>
                    Chọn tâm trạng — để âm nhạc chữa lành
                </p>
            </div>

            {/* MOOD SELECTOR */}
            <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>
                    Bạn đang cảm thấy thế nào?
                </p>
                <div className="flex flex-wrap gap-3">
                    {moodKeys.map(key => {
                        const m = moodPlaylists[key];
                        const active = selectedMood === key;
                        return (
                            <button key={key}
                                onClick={() => { setSelectedMood(key); setSelectedPlaylist(0); setPlaying(false); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border
                                                text-sm font-medium transition hover:brightness-95
                                                ${m.color} ${m.text}`}
                                style={{
                                    boxShadow: active ? `0 0 0 2px ${P.accent}` : "none",
                                    fontWeight: active ? 700 : 500,
                                }}>
                                <span className="text-lg">{m.emoji}</span>
                                {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* PLAYER */}
                <div className="xl:col-span-2">
                    {/* Trang giấy player */}
                    <div className="relative rounded-2xl overflow-hidden mb-4"
                        style={{
                            background: P.surface,
                            border: `1px solid ${P.border}`,
                            boxShadow: "0 4px 20px rgba(139,110,80,0.10)"
                        }}>
                        {/* Gáy sổ trên */}
                        <div className="h-1.5 w-full"
                            style={{ background: `linear-gradient(to right, ${P.spine}, #a8896a, ${P.spine})`, opacity: 0.8 }} />

                        <div className="p-5">
                            {/* Now playing */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-widest mb-0.5"
                                        style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>
                                        Đang phát
                                    </p>
                                    <p className="font-bold text-lg"
                                        style={{ color: P.text, fontFamily: "'Georgia', serif" }}>
                                        {current.emoji} {playlist.title}
                                    </p>
                                    <p className="text-sm" style={{ color: P.muted }}>
                                        {current.label}
                                    </p>
                                </div>

                                <button onClick={shufflePlaylist}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition hover:opacity-80"
                                    style={{ background: P.card, border: `1px solid ${P.border}`, color: P.accent }}>
                                    <BsShuffle size={13} /> Ngẫu nhiên
                                </button>
                            </div>

                            {/* YouTube Embed */}
                            <div className="rounded-xl overflow-hidden"
                                style={{ border: `1px solid ${P.border}` }}>
                                <iframe
                                    key={`${selectedMood}-${selectedPlaylist}`}
                                    width="100%"
                                    height="360"
                                    src={`https://www.youtube.com/embed/videoseries?list=${playlist.id}&autoplay=0`}
                                    title={playlist.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PLAYLIST LIST */}
                <div>
                    <div className="rounded-2xl p-5"
                        style={{ background: P.surface, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(139,110,80,0.06)" }}>

                        {/* Gáy sổ trên */}
                        <div className="-mx-5 -mt-5 mb-5 h-1.5 rounded-t-2xl"
                            style={{ background: `linear-gradient(to right, ${P.spine}, #a8896a, ${P.spine})`, opacity: 0.8 }} />

                        <p className="text-xs font-bold uppercase tracking-widest mb-4"
                            style={{ color: P.muted, fontFamily: "'Georgia', serif" }}>
                            Danh sách phát
                        </p>

                        <div className="space-y-2">
                            {current.playlists.map((pl, idx) => (
                                <button key={idx}
                                    onClick={() => setSelectedPlaylist(idx)}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left transition"
                                    style={{
                                        background: selectedPlaylist === idx ? P.card : "transparent",
                                        border: `1px solid ${selectedPlaylist === idx ? P.border : "transparent"}`,
                                        color: P.text,
                                    }}
                                    onMouseEnter={e => { if (selectedPlaylist !== idx) e.currentTarget.style.background = P.card; }}
                                    onMouseLeave={e => { if (selectedPlaylist !== idx) e.currentTarget.style.background = "transparent"; }}
                                >
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: selectedPlaylist === idx ? P.accent : P.border }}>
                                        <BsMusicNoteBeamed size={12} color={selectedPlaylist === idx ? "white" : P.muted} />
                                    </div>
                                    <span style={{ fontFamily: "'Georgia', serif" }}>{pl.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tips */}
                        <div className="mt-5 rounded-xl p-4"
                            style={{ background: "#fef9ec", border: "1px solid #e8d5a0" }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: "#92701a" }}>
                                💡 Gợi ý
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: "#6b5320", fontFamily: "'Georgia', serif" }}>
                                Âm nhạc phù hợp với cảm xúc giúp bạn thư giãn và cân bằng tâm trạng hiệu quả hơn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
