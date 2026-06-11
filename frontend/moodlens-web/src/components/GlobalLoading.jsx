import { useGlobalStore } from "../store/useGlobalStore";

export default function GlobalLoading() {
    const { loading, loadingText } = useGlobalStore();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/70 
                    backdrop-blur-sm flex flex-col items-center justify-center">

            <div className="text-6xl animate-bounce mb-4">
                🤖
            </div>

            <div className="w-10 h-10 border-4 border-white/30 
                      border-t-white rounded-full animate-spin mb-4"></div>

            <p className="text-white text-sm">
                {loadingText}
            </p>

        </div>
    );
}