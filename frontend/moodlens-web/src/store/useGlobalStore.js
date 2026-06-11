import { create } from "zustand";

export const useGlobalStore = create((set) => ({
    loading: false,
    loadingText: "Loading...",

    setLoading: (value, text = "Loading...") =>
        set({
            loading: value,
            loadingText: text,
        }),
}));