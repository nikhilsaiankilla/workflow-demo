import { create } from "zustand";

export interface Items {
    id: string,
    name: string,
    checked: boolean,
}

export interface storeTypes {
    items: Items[];
    toggleChecked: boolean;

    addItem: (name: string, checked: boolean) => void;
    removeItem: (id: string) => void;
    toggleItem: (id: string) => void;

    toggleCheckedFunc: () => void;
    seedItems: () => void;
}

export const useStore = create<storeTypes>((set, get) => ({
    items: [],
    toggleChecked: false,

    addItem: (name: string, checked: boolean) => {
        const id = crypto.randomUUID();

        const newItem = {
            id,
            name,
            checked,
        }

        set((state) => {
            return { items: [...state.items, newItem] }
        })
    },

    removeItem: (id: string) => {
        set((state) => {
            return { items: state.items.filter((item) => item.id !== id) }
        })
    },

    toggleItem: (id: string) => {
        set((state) => ({
            items: state.items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item)
        }))
    },

    toggleCheckedFunc: () => {
        set((state) => ({
            toggleChecked: !state.toggleChecked
        }))
    },

    seedItems: () => {
        set((state) => ({
            items: Array.from({ length: 10 }, () => createSeedItem())
        }))
    },
}))

const createSeedItem = () => {
    const id = crypto.randomUUID();
    const name = `Item ${id.slice(0, 5)}`
    const checked = false

    const newItem = {
        id,
        name,
        checked
    }

    return newItem;
}