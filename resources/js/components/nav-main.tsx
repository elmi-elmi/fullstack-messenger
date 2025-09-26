import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Conversation, Message, type SharedData, User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEcho, useEchoPresence } from '@laravel/echo-react';
import { useEffect, useState } from 'react';

export function NavMain() {
    const page = usePage();
    const sharedData = usePage<SharedData>().props;
    const { conversations } = sharedData;
    const selectedConversation = page.props.selectedConversation;
    const [onlineUsers, setOnlineUsers] = useState<{ [key in string]: User }>({});

    const [localConversations, setLocalConversations] = useState<Conversation[]>(conversations);
    // const [sortedConversations, setSortedConversations] = useState<Conversation[]>([]);


    // useEffect(() => {
    //     if(localConversations.length) return;
    //     setLocalConversations(conversations);
    // }, [conversations, localConversations.length]);
    //
    // useEffect(() => {
    //     setSortedConversations(
    //         [...localConversations].sort((a, b) => {
    //             if (a.blocked_at && b.blocked_at) {
    //                 return a.blocked_at > b.blocked_at ? 1 : -1;
    //             } else if (a.blocked_at) {
    //                 return 1;
    //             } else if (b.blocked_at) {
    //                 return -1;
    //             }
    //
    //             if (a.last_message_date && b.last_message_date) {
    //                 return b.last_message_date.localeCompare(a.last_message_date);
    //             } else if (a.last_message_date) {
    //                 return -1;
    //             } else if (b.last_message_date) {
    //                 return 1;
    //             } else {
    //                 return 0;
    //             }
    //         }),
    //     );
    // }, [localConversations]);
    //
    const { channel } = useEchoPresence('online');

    channel()
        .here((users: User[]) => {
            const objectedUsers = Object.fromEntries(users.map((user) => [user.id, user]));
            setOnlineUsers(objectedUsers);
        })
        .joining((user: User) => {
            setOnlineUsers((prevState) => {
                return { ...prevState, [user.id]: user };
            });
        })
        .leaving((user: User) => {
            setOnlineUsers((prevState) => {
                delete prevState[user.id];
                return { ...prevState };
            });
        })
        .listen('online', (a, b) => {
        })
        .error((e) => {
        });

    const updateConversation = ({
        id,
        // name,
        date,
        message,
        isUser,
    }: {
        message: string;
        id: number;
        // name:string,
        date: string;
        isUser: boolean;
    }) => {
        setLocalConversations((prev) => {
            return prev.map((conv) => {
                if (conv.id === id && conv.is_user === isUser) {
                    return {
                        ...conv,
                        last_message: message,
                        last_message_date: date,
                        updated_at: date,
                        // name: name,
                    };
                }
                return conv;
            });
        });
    };
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {localConversations
                .sort((a,b)=>b.last_message_date && a.last_message_date
                    ?b.last_message_date.localeCompare(a.last_message_date)
                    :a.last_message_date ? -1 : 0)
                    .map((item) => (
                    <Sidebar
                        key={(item.is_group ? 'group__' : 'user__') + item.id}
                        item={item}
                        isOnline={!!onlineUsers[item.id]}
                        channelName={
                            item.is_group
                                ? 'message.group.' + item.id
                                : 'message.user.' + [item.id, sharedData.auth.user.id].sort().join('-')
                        }
                        updateConversation={updateConversation}
                    />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

const Sidebar = ({
    item,
    isOnline,
    channelName,
    updateConversation,
}: {
    item: Conversation;
    isOnline: boolean;
    channelName: string;
    updateConversation: ({
        id,
        // name,
        date,
        message,
        isUser,
    }: {
        message: string;
        id: number;
        // name: string;
        date: string;
        isUser: boolean;
    }) => void;
}) => {
    const page = usePage<SharedData>();

    const { channel } = useEcho(channelName, 'SocketMessage', (e: { message: Message }) => {
        updateConversation({
            date: e.message.created_at,
            id: item.id,
            message: e.message.message,
            isUser: !e.message.group_id,
            // name: e.message.sender.name
        });
    });

    return (
        <SidebarMenuItem>
            <SidebarMenuButton size={'lg'} asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.name }}>
                <Link
                    preserveState
                    preserveScroll
                    href={route(item.is_group ? 'chat.byGroup' : 'chat.byUser', item.id)} prefetch>
                    <div className={'relative'}>
                        <Avatar className="rounded-lg">
                            <AvatarImage src={item.avatar_url || undefined} alt={item.name} />
                            <AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        {item.is_group ? null : (
                            <span className={cn('absolute end-0.5 top-0.5 size-1.5 rounded-full', isOnline ? 'bg-green-500' : 'bg-gray-500')} />
                        )}
                    </div>

                    <div className={'flex flex-col'}>
                        <div className={'text-xs'}>{item.name}</div>
                        <p className={'line-clamp-1 text-xs text-gray-400'}>{item.last_message}</p>
                    </div>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

