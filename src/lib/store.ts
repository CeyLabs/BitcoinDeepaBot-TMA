import { create } from "zustand";

export type Store = {
    count: number;
    setCount: (count: number) => void;
    userID: string;
    setUserID: (userID: string) => void;
};

export const useStore = create<Store>((set) => ({
    count: 0,
    setCount: (count: number) => set({ count }),
    userID: "",
    setUserID: (userID: string) => set({ userID }),
}));
