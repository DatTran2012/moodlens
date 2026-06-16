import { create } from "zustand";

import {
    getSnapshots,
    createSnapshot,
    deleteSnapshot,
} from "../api/snapshotService";

const useSnapshotStore = create(
    (set, get) => ({
        snapshots: [],
        loading: false,
        error: null,

        loadSnapshots: async () => {
            try {
                set({
                    loading: true,
                    error: null,
                });

                const data =
                    await getSnapshots();

                set({
                    snapshots: data || [],
                });
            } catch (error) {
                console.error(error);

                set({
                    error:
                        error?.response?.data
                            ?.message ||
                        "Load snapshots failed",
                });
            } finally {
                set({
                    loading: false,
                });
            }
        },

        createSnapshot: async (
            formData
        ) => {
            try {
                set({
                    loading: true,
                    error: null,
                });

                const newSnapshot =
                    await createSnapshot(
                        formData
                    );

                set((state) => ({
                    snapshots: [
                        newSnapshot,
                        ...state.snapshots,
                    ],
                }));

                return newSnapshot;
            } catch (error) {
                const message =
                    error?.response?.data?.message
                    || "Có lỗi xảy ra";

                throw new Error(message);
            } finally {
                set({
                    loading: false,
                });
            }
        },

        clearError: () =>
            set({
                error: null,
            }),

        deleteSnapshot: async (id) => {
            try {
                set({
                    loading: true
                });

                await deleteSnapshot(id);

                set((state) => ({
                    snapshots:
                        state.snapshots.filter(
                            (x) => x.id !== id
                        )
                }));
            }
            catch (error) {
                console.error(error);
            }
            finally {
                set({
                    loading: false
                });
            }
        },
    })
);

export default useSnapshotStore;

