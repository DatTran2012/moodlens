import { useEffect, useState } from "react";
import api from "../api/axios";
import { BsJournalBookmarkFill, BsJournalRichtext } from 'react-icons/bs';
import toast from "react-hot-toast";

export default function Journal() {

    const [content, setContent] = useState("");
    const DRAFT_KEY = "moodlens_journal_draft";
    const [loading, setLoading] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const [result, setResult] = useState({
        mood: "",
        score: 0,
        summary: ""
    });
    const [recentJournals, setRecentJournals] = useState([]);

    useEffect(() => {
        loadRecentJournals();
    }, []);
    useEffect(() => {

        const draft =
            localStorage.getItem(DRAFT_KEY);

        if (draft)
            setContent(draft);

    }, []);
    useEffect(() => {

        localStorage.setItem(
            DRAFT_KEY,
            content
        );

    }, [content]);
    const openJournalDetail = async (id) => {

        try {

            setShowModal(true);
            setDetailLoading(true);

            const response =
                await api.get(`/journal/${id}`);

            setSelectedJournal(response.data);

        }
        catch (err) {

            console.error(err);

        }
        finally {

            setDetailLoading(false);

        }
    };
    const loadRecentJournals = async () => {

        try {

            const response =
                await api.get("/journal/history?page=1&pageSize=3");

            setRecentJournals(

                response.data.data || []
            );

        }
        catch (err) {

            console.error(err);

        }

    };
    const getMoodStyle = (mood) => {
        switch ((mood || "").toLowerCase()) {
            case "happy":
                return {
                    text: "text-green-400",
                    bg: "bg-green-500/10",
                    border: "border-green-500/30"
                };

            case "sad":
                return {
                    text: "text-blue-400",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/30"
                };

            case "angry":
                return {
                    text: "text-red-400",
                    bg: "bg-red-500/10",
                    border: "border-red-500/30"
                };

            case "anxious":
                return {
                    text: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    border: "border-yellow-500/30"
                };

            default:
                return {
                    text: "text-gray-300",
                    bg: "bg-gray-500/10",
                    border: "border-gray-500/30"
                };
        }
    };

    const moodStyle = getMoodStyle(result.mood);
    const [displaySummary, setDisplaySummary] = useState("");
    // typing effect
    useEffect(() => {

        if (!result.summary)
            return;

        let index = 0;

        setDisplaySummary("");

        const interval = setInterval(() => {

            index++;

            setDisplaySummary(
                result.summary.slice(0, index)
            );

            if (index >= result.summary.length)
                clearInterval(interval);

        }, 20);

        return () => clearInterval(interval);

    }, [result.summary]);
    const isMobile =
        window.innerWidth < 768;
    const handleKeyDown = async (e) => {
        if (isMobile)
            return;
        if (window.innerWidth < 768)
            return;
        // Shift + Enter => xuống dòng
        if (e.shiftKey && e.key === "Enter") {
            return;
        }

        // Enter => submit
        if (e.key === "Enter") {

            e.preventDefault();

            if (!content.trim())
                return;

            if (loading)
                return;

            await handleAnalyze();
        }
    };
    const handleAnalyze = async () => {

        if (!content.trim())
            return;

        try {

            setLoading(true);
            setResult({
                mood: "",
                score: 0,
                summary: ""
            });

            const response = await api.post("/journal", {
                content
            });

            setResult({
                mood: response.data.mood,
                score: response.data.score,
                summary: response.data.summary,
            });
            localStorage.removeItem(
                DRAFT_KEY
            );

            await loadRecentJournals();

            toast.success(
                "Phân tích cảm xúc thành công"
            );
        }
        catch (err) {

            console.error(err);
            toast.error(
                "Không thể phân tích cảm xúc"
            );

        }
        finally {
            setLoading(false);
        }
    };
    const getMoodEmoji = (mood) => {

        switch ((mood || "").toLowerCase()) {

            case "happy":
                return "😊";

            case "sad":
                return "😢";

            case "angry":
                return "😠";

            case "anxious":
                return "😰";

            default:
                return "😐";
        }
    };
    const getMoodInfo = (mood) => {

        switch ((mood || "").toLowerCase()) {

            case "happy":
                return {
                    emoji: "😊",
                    textColor: "text-green-400",
                    bgColor: "bg-green-500/10",
                    borderColor: "border-green-500/30"
                };

            case "sad":
                return {
                    emoji: "😢",
                    textColor: "text-blue-400",
                    bgColor: "bg-blue-500/10",
                    borderColor: "border-blue-500/30"
                };

            case "stress":
            case "anxious":
                return {
                    emoji: "😰",
                    textColor: "text-yellow-400",
                    bgColor: "bg-yellow-500/10",
                    borderColor: "border-yellow-500/30"
                };

            case "angry":
                return {
                    emoji: "😠",
                    textColor: "text-red-400",
                    bgColor: "bg-red-500/10",
                    borderColor: "border-red-500/30"
                };

            default:
                return {
                    emoji: "😐",
                    textColor: "text-gray-300",
                    bgColor: "bg-gray-500/10",
                    borderColor: "border-gray-500/30"
                };
        }
    };
    const moodRanges = [
        {
            min: 0,
            max: 20,
            label: "Sad",
            color: "bg-blue-500",
            emoji: "😢",
            description: "Buồn bã, tiêu cực"
        },
        {
            min: 21,
            max: 50,
            label: "Stress",
            color: "bg-yellow-500",
            emoji: "😰",
            description: "Áp lực, căng thẳng"
        },
        {
            min: 51,
            max: 80,
            label: "Neutral",
            color: "bg-gray-400",
            emoji: "😐",
            description: "Ổn định"
        },
        {
            min: 80,
            max: 100,
            label: "Happy",
            color: "bg-green-500",
            emoji: "😊",
            description: "Tích cực"
        },
    ];
    const getScoreColor = (mood) => {
        switch ((mood || "").toLowerCase()) {
            case "happy":
                return "bg-green-500";

            case "sad":
                return "bg-blue-500";

            case "angry":
                return "bg-red-500";

            case "anxious":
                return "bg-yellow-500";

            default:
                return "bg-gray-500";
        }
    };

    const SkeletonCard = () => (
        <div className="animate-pulse">

            <div className="h-5 bg-slate-700 rounded w-32 mb-4" />

            <div className="space-y-3">

                <div className="h-4 bg-slate-700 rounded" />

                <div className="h-4 bg-slate-700 rounded w-5/6" />

                <div className="h-4 bg-slate-700 rounded w-4/6" />

            </div>

        </div>
    );
    const EmptyState = () => (
        <div className="text-center py-10">

            <div className="text-5xl mb-3">
                📝
            </div>

            <h3 className="font-semibold">
                Chưa có nhật ký nào
            </h3>

            <p className="text-gray-400 mt-2">
                Hãy viết cảm xúc đầu tiên của bạn.
            </p>

        </div>
    );
    const moodInfo =
        selectedJournal
            ? getMoodInfo(selectedJournal.mood)
            : null;
    return (
        <div className="p-4 md:p-6">

            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BsJournalBookmarkFill color="#4A90E2" size={30} />
                        <p>Nhật kí hôm nay</p>
                    </div>
                </h1>

                <p className="text-gray-400 mt-2">
                    Viết nhật ký và để AI phân tích cảm xúc của bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT */}
                <div className="bg-slate-900 rounded-xl p-5">

                    <h2 className="font-semibold mb-4">
                        Nhật ký hôm nay
                    </h2>

                    <textarea
                        value={content}
                        disabled={loading}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Hôm nay của bạn thế nào?"
                        className="
                            w-full
                           h-[250px] md:h-[350px]
                            resize-none
                            rounded-lg
                            bg-slate-800
                            p-4
                            outline-none
                        "
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        disabled:opacity-50
disabled:cursor-not-allowed
                        className="
        mt-4
        w-full
        bg-blue-600
        hover:bg-blue-700
        py-3
        rounded-lg
        font-medium
        disabled:opacity-50
    "
                    >
                        {loading
                            ? "Đang phân tích..."
                            : "Phân tích cảm xúc"}
                    </button>

                    {/* RECENT JOURNALS */}

                    <div className="mt-6">

                        <h3 className="font-semibold mb-4">
                            Nhật ký gần đây
                        </h3>

                        {
                            recentJournals.length === 0
                                ? <EmptyState />
                                : (
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto">

                                        {
                                            recentJournals.slice(0, 3).map(journal => (

                                                <div
                                                    key={journal.id}
                                                    onClick={() => openJournalDetail(journal.id)}
                                                    className="
                                    bg-slate-800
                                    rounded-lg
                                    p-3
                                    hover:bg-slate-700
                                    cursor-pointer
                                    transition
                                "
                                                >

                                                    <div className="text-sm text-gray-300">

                                                        {
                                                            journal.content.length > 60
                                                                ? journal.content.substring(0, 60) + "..."
                                                                : journal.content
                                                        }

                                                    </div>

                                                    <div className="text-xs text-gray-500 mt-2">

                                                        {
                                                            new Date(
                                                                journal.createdAt
                                                            ).toLocaleDateString("vi-VN")
                                                        }

                                                    </div>

                                                </div>

                                            ))
                                        }

                                    </div>
                                )
                        }

                    </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-4">

                    {/* Mood */}
                    <div
                        className={`
        rounded-xl
        p-5
        border
        ${moodStyle.bg}
        ${moodStyle.border}
    `}
                    >
                        <h3 className="text-gray-400 mb-2">
                            Cảm xúc
                        </h3>
                        <div className={`text-2xl font-bold ${moodStyle.text}`}>

                            {getMoodEmoji(result.mood)}
                            {" "}
                            {result.mood || ""}

                        </div>

                    </div>

                    {/* Score */}
                    <div className="bg-slate-900 rounded-xl p-5">

                        <h3 className="text-gray-400 mb-2">
                            Điểm số cảm xúc
                        </h3>

                        <div className="text-2xl font-bold mb-3">
                            {result.score || 0}
                        </div>

                        <div
                            className={`
        h-3
        rounded-full
        transition-all
        duration-700
        ${getScoreColor(result.mood)}
    `}
                            style={{
                                width: `${result.score || 0}%`
                            }}
                        />
                        <div className="relative mt-6">

                            <div className="flex h-4 rounded-full overflow-hidden">

                                {moodRanges.map((range) => (

                                    <div
                                        key={range.label}
                                        title={`${range.label}
${range.min}-${range.max}
${range.description}`}
                                        className={`${range.color} flex-1`}
                                    />

                                ))}

                            </div>

                            {/* Marker hiện tại */}
                            <div
                                className="
            absolute
            top-[-6px]
            w-4
            h-7
            bg-white
            rounded-full
            shadow
            border-2
            border-black
        "
                                style={{
                                    left: `calc(${result.score}% - 8px)`
                                }}
                            />

                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-900 rounded-xl p-5 min-h-[250px]">

                        <h3 className="text-gray-400 mb-4 flex items-center gap-2">
                            🤖 AI phân tích
                        </h3>

                        {loading ? (
                            <SkeletonCard />
                        ) : (
                            <p className="leading-7 whitespace-pre-wrap">
                                {displaySummary}
                            </p>
                        )}

                    </div>

                </div>

            </div>
            {
                showModal && (
                    <div
                        className="
                fixed
                inset-0
                bg-black/60
                backdrop-blur-sm
                z-50
                flex
                items-center
                justify-center
                p-4
            "
                    >

                        <div
                            className="
                    bg-slate-900
                    rounded-2xl
                    w-full
                    max-w-3xl
                    max-h-[85vh]
                    overflow-y-auto
                    p-6
                "
                        >

                            <div className="flex justify-between mb-4">

                                <h2 className="text-xl font-bold">
                                    📖 Chi tiết nhật ký
                                </h2>

                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedJournal(null);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>

                            </div>

                            {
                                detailLoading
                                    ? (
                                        <SkeletonCard />
                                    )
                                    : selectedJournal && (
                                        <>
                                            <div className="mb-4">

                                                <h3 className="text-gray-400 mb-2">
                                                    Nhật ký
                                                </h3>

                                                <div className="bg-slate-800 rounded-lg p-4 whitespace-pre-wrap">
                                                    {selectedJournal.content}
                                                </div>

                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">

                                                <div
                                                    className={`
        rounded-lg
        p-4
        border
        ${moodInfo?.bgColor}
        ${moodInfo?.borderColor}
    `}
                                                >

                                                    <div className="text-gray-400 mb-2">
                                                        Cảm xúc
                                                    </div>

                                                    <div
                                                        className={`
            text-xl
            font-bold
            flex
            items-center
            gap-2
            ${moodInfo?.textColor}
        `}
                                                    >

                                                        <span>
                                                            {moodInfo?.emoji}
                                                        </span>

                                                        <span>
                                                            {selectedJournal.mood}
                                                            <div className="mt-2 text-sm text-gray-400">

                                                                {
                                                                    selectedJournal.score >= 80
                                                                        ? "Tâm trạng rất tích cực"
                                                                        : selectedJournal.score >= 50
                                                                            ? "Tâm trạng ổn định"
                                                                            : "Cần quan tâm nhiều hơn đến cảm xúc"
                                                                }

                                                            </div>
                                                        </span>

                                                    </div>

                                                </div>

                                                <div
                                                    className={`
        rounded-lg
        p-4
        border
        ${moodInfo?.bgColor}
        ${moodInfo?.borderColor}
    `}
                                                >

                                                    <div className="text-gray-400 mb-2">
                                                        Điểm số
                                                    </div>

                                                    <div className="text-xl font-bold">
                                                        {selectedJournal.score}
                                                    </div>

                                                </div>

                                            </div>

                                            <div className="mt-4">

                                                <h3 className="text-gray-400 mb-2">
                                                    🤖 AI Summary
                                                </h3>

                                                <div className="bg-slate-800 rounded-lg p-4 whitespace-pre-wrap">
                                                    {selectedJournal.summary}
                                                </div>

                                            </div>
                                        </>
                                    )
                            }

                        </div>

                    </div>
                )
            }
        </div>
    );
}


