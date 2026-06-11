export default function LoadingOverlay({ show, text = "Analyzing..." }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm 
                    flex flex-col items-center justify-center">

            {/* ICON */}
            <div className="text-5xl animate-bounce mb-4">
                🤖
            </div>

            {/* SPINNER */}
            <div className="w-10 h-10 border-4 border-white/30 
                      border-t-white rounded-full animate-spin mb-4"></div>

            {/* TEXT */}
            <p className="text-white text-sm">{text}</p>

        </div>
    );
}