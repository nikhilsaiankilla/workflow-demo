import { create } from 'zustand'

export type ContactType = {
    name: string,
    phone: string,
    avatar: string | null,
    id: string,
}

export type ContactStoreType = {
    contacts: ContactType[],
    activeChatId: string | null,
    messages: {
        userId: string,
        sentToId: string,
        text: string,
        timestamp: number,
        read: boolean,
        sender: 'me' | 'them',
        sent: boolean,
    }[],
    isTyping: boolean,

    addContact: (contact: ContactType) => void,
    setActiveChatId: (id: string) => void,
    sendMessage: (message: {
        userId: string,
        sentToId: string,
        text: string,
        timestamp: number,
        read: boolean,
        sender: 'me' | 'them',
        sent: boolean,
    }) => void;
    setIsTyping: (isTyping: boolean) => void;
}

export const useContactStore = create<ContactStoreType>((set) => ({
    contacts: [],
    activeChatId: null,
    messages: [],
    isTyping: false,

    // add contact into store
    addContact: (contact: ContactType) => set((state) => ({
        contacts: [...state.contacts, contact]
    })),

    setActiveChatId: (id: string) => set((state) => ({
        activeChatId: id
    })),

    sendMessage: (message: {
        userId: string,
        sentToId: string,
        sent: boolean,
        text: string,
        timestamp: number,
        read: boolean,
        sender: 'me' | 'them',
    }) => set((state) => ({
        messages: [...state.messages, message]
    })),

    setIsTyping: (isTyping: boolean) => {
        set((state) => ({
            isTyping: true,
        }))

        setTimeout(() => {
            set((state) => ({
                isTyping: false,
            }))
        }, 1000)
    }
}))