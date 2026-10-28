import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '../actions/apiRequest';
import { getConversationsAction } from '../actions/messages';
import { ENDPOINTS } from '../constants/endpoints';
import { MessagesState } from './types';

export const useMessageStore = create<MessagesState>()(
    devtools((set, get) => ({
        loading: true,
        conversationsLoading: false,
        conversations: [],
        selectedConversation: null,
        page: 1,
        size: 10,
        count: 0,
        refresh: () => {
            set((state) => ({ loading: true }));
            const page = get().page;
            const size = get().size;
            getConversationsAction(page, size).then((data: any) => {
                set((state) => ({ conversations: data.conversations, count: data.count, loading: false }));
                if (get().selectedConversation && data.conversations.find((conversation: any) => conversation.userId === get().selectedConversation?.userId)) {
                    set((state) => ({ selectedConversation: data.conversations.find((conversation: any) => conversation.userId === get().selectedConversation?.userId) }));
                }
            });
        },
        refreshWithoutLoading: () => {
            const page = get().page;
            const size = get().size;
            getConversationsAction(page, size).then((data: any) => {
                set((state) => ({ conversations: data.conversations, count: data.count, conversationsLoading: false }));
                if (get().selectedConversation && data.conversations.find((conversation: any) => conversation.userId === get().selectedConversation?.userId)) {
                    set((state) => ({ selectedConversation: data.conversations.find((conversation: any) => conversation.userId === get().selectedConversation?.userId) }));
                }
            });
        },
        setSelectedConversation: (conversation) => set((state) => ({ selectedConversation: conversation })),
        setConversationRead: (conversation) => {
            apiRequest(ENDPOINTS.API.MESSAGES.CONVERSATIONS_READ, 'POST', { conversation: conversation });
            set((state) => ({ conversations: state.conversations.map((c) => (c.userId === conversation.userId ? { ...c, unread: false } : c)) }));
        },
        setPage: (page) => {
            set((state) => ({ page: page, conversationsLoading: true }));
            get().refreshWithoutLoading();
        },
        setSize: (size) => {
            set((state) => ({ size: size, conversationsLoading: true }));
            get().refreshWithoutLoading();
        },
    }))
);
