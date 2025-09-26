import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    id: number;
    name: string;
    href: string;
    icon?: LucideIcon  |null;
    avatar_url?:  string |null;
    isOnline: boolean;
    lastMessage: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
    conversations: Conversation[]
    messages: MessageListResponse
    selectedConversation:Conversation
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    avatar_url: string | null
    [key: string]: unknown; // This allows for additional properties...
}

export interface Conversation {
    "id": number;
    "name": string;
    "is_group": boolean;
    "is_user": boolean;
    "is_admin":boolean;
    "created_at": string;
    "updated_at": string;
    "blocked_at": string | null;
    "last_message": string;
    "last_message_date": string;
}

export interface MessageListResponse {
    data: Message[]
}

export type Attachment = {
    "id": number;
    "message_id":number;
    "name": string;
    "mime": string;
    "size": number;
    "url": string;
    "created_at": string;
    "updated_at": string;
}
export interface Message {
    "id":number,
    "message": string,
    "receiver_id": string,
    "sender": {
    "id": 1,
        "avatar_url": null | string,
        "name": string,
        "email": string,
        "created_at": string,
        "updated_at": string,
        "is_admin": 0 | 1,
        "last_message": null | string,
        "last_message_data": null | string
},
    "group_id": null | number,
    "attachments": Attachment[],
    "created_at": string,
    "updated_at": string
}

export interface SelectedConversation {
    "id": number,
    "name": string,
    "is_group":boolean,
    "is_user": boolean,
    "is_admin": boolean,
    "created_at": string,
    "updated_at": string,
    "blocked_at": null | string,
    "last_message": null |string,
    "last_message_date": null | string
}
