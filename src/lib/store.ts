import { create } from "zustand";

export type Store = {
    count: number;
    isLoading: boolean;
    setCount: (count: number) => void;
    setLoading: (loading: boolean) => void;
    userID: string;
    setUserID: (userID: string) => void;
};

export const useStore = create<Store>((set) => ({
    count: 0,
    isLoading: true,
    setCount: (count: number) => set({ count }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    userID: "",
    setUserID: (userID: string) => set({ userID }),
}));
