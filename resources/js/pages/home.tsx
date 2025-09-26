import AppLayout from '@/layouts/app-layout';
import { Attachment, type BreadcrumbItem, Message, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import axios from 'axios';
import { File, FileText, Image, Music, Paperclip, Send, Video, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Home', href: '/home' }];

function Home() {
    useEffect(() => {
        console.log('Home mounted');
    }, []);
    return (
        <>
            <Head title="Home" />
            <Content />
        </>
    );
}

Home.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

export default Home;

const Content = () => {
    const props = usePage<SharedData>().props;
    const { selectedConversation, messages, auth } = props;

    useEffect(() => {
        console.log('Content Mounted');
    }, []);

    const getChannelName = () => {
        const currentUserId = auth.user.id;
        const otherUserId = selectedConversation?.id;
        const isGroup = selectedConversation?.is_group;
        const userId1 = Math.min(currentUserId, otherUserId);
        const userId2 = Math.max(currentUserId, otherUserId);
        return isGroup ? `message.group.${selectedConversation.id}` : `message.user.${userId1}-${userId2}`;
        // return `message.group.4`;
    };

    const channelName = getChannelName();

    // Submit handler

    return (
        <>
            <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
                <div className="relative flex flex-1 flex-col">
                    {selectedConversation?.id ?
                        <Messages messages={messages?.data} userId={auth.user.id} channelName={channelName} />
                        : 'select a chat'
                    }
                    <SendMessage />
                </div>
            </div>
        </>
    );
};


const SendMessage = () => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<{ url: string; file: File }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const props = usePage<SharedData>().props;
    const { selectedConversation, messages, auth } = props;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim() && !files.length) return;

        const formData = new FormData();

        formData.append(selectedConversation?.is_group ? 'group_id' : 'receiver_id', String(selectedConversation.id));
        formData.append('message', text);

        files.forEach((f) => {
            formData.append('attachments[]', f.file);
        });
        for (const [key, value] of formData.entries()) {
            console.log('----------');
            console.log(key, value);
        }

        try {
            await axios.post(route('message.store'), formData);

            // پیام خودمون رو هم اضافه می‌کنیم (تا قبل از رسیدن از Echo ببینیمش)
            // setLocalMessages((prev) => [...prev, response.data.data]);
            setText('');
            setFiles((pre) => []);
        } catch (err) {
            console.error('Message send failed', err);
        }
    };

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const _files = event.target.files;
        if (!_files?.length) return;

        const updatedFiles = [..._files].map((f) => ({
            file: f,
            url: URL.createObjectURL(f),
        }));

        setFiles((prevState) => [...prevState, ...updatedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleTextareaChange = (e) => {
        setText(e.target.value);

        const textarea = e.target;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = newHeight + 'px';

        // If content exceeds max height, show scrollbar
        if (textarea.scrollHeight > 120) {
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.overflowY = 'hidden';
        }
    };

    return (
        <div
            className="absolute inset-x-0 z-10  bottom-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
            {/* File Previews */}
            {files.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    {files.map((file, index) => (
                        <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <div className="relative flex-1">
                    <textarea
                        id={"message"}
                        value={text}
                        onChange={handleTextareaChange}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full  resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-3 bottom-3 p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={!text.trim() && files.length === 0}
                    className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                    <Send className="h-5 w-5" />
                </button>

                <input ref={fileInputRef} type="file" multiple onChange={onFileChange} className="hidden" />
            </form>
        </div>
    );
};

const FilePreview = ({ file, onRemove }: { file: { url: string; file: File }; onRemove: () => void }) => {
    const isImage = file.file.type.startsWith('image/');

    return (
        <div className="group relative rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
            <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
            >
                <X className="h-3 w-3" />
            </button>

            {isImage ? (
                <img src={file.url} alt={file.file.name} className="h-16 w-16 rounded object-cover" />
            ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
                    <File className="h-6 w-6 text-gray-500" />
                </div>
            )}

            <p className="mt-1 max-w-[4rem] truncate text-xs text-gray-600 dark:text-gray-400">{file.file.name}</p>
        </div>
    );
};

const AttachmentItem = ({ attachment }: { attachment: Attachment }) => {
    const mime = attachment.mime;

    const getFileIcon = (mime: string) => {
        if (mime.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (mime.startsWith('video/')) return <Video className="h-4 w-4" />;
        if (mime.startsWith('audio/')) return <Music className="h-4 w-4" />;
        if (mime === 'text/plain') return <FileText className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    if (mime.startsWith('image/')) {
        return (
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block max-h-[200px] max-w-[280px]">
                    <img
                        src={attachment.url}
                        alt={attachment.name}
                        className=" object-cover transition-transform group-hover:scale-105"
                    />
                    {/*<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />*/}
                </a>
            </div>
        );
    }

    if (mime.startsWith('video/')) {
        return (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <video controls className="max-w-[320px] bg-gray-900" src={attachment.url}>
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    if (mime.startsWith('audio/')) {
        return (
            <div className="min-w-[280px] rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">{attachment.name}</span>
                </div>
                <audio controls className="w-full">
                    <source src={attachment.url} type={mime} />
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
    }

    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-[200px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
            <div className="rounded-lg bg-gray-200 p-2 transition-colors group-hover:bg-gray-300 dark:bg-gray-700 dark:group-hover:bg-gray-600">
                {getFileIcon(mime)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{attachment.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{mime.split('/')[1]?.toUpperCase() || 'FILE'}</p>
            </div>
        </a>
    );
};

const Messages = ({ messages, userId, channelName }: { messages: Message[]; userId: number; channelName: string | null }) => {
    const props = usePage<SharedData>().props;
    const { selectedConversation } = props;

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const topRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [persistedUserId, setPersistedUserId] = useState<Set<number>>(new Set());
    const [persistedGroupId, setPersistedGroupId] = useState<Set<number>>(new Set());
    const [scrolledUserChat, setScrolledUserChat] = useState<{ [key in string]: boolean }>({});
    const [scrolledGroupChat, setScrolledGroupChat] = useState<{ [key in string]: boolean }>({});

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);

    const [persistedUserMessages, setPersistedUserMessages] = useState<{ [key in number]: Message[] }>({});
    const [persistedGroupMessages, setPersistedGroupMessages] = useState<{ [key in number]: Message[] }>({});

    useEffect(() => {
        if (!topRef.current) return;
        const target = topRef.current;
        console.log('useeffect');

        const observer = new IntersectionObserver(
            async (entries) => {
                console.log('triggered...', loadingRef.current);
                const first = entries[0];
                if (first.isIntersecting && !loadingRef.current) {
                    console.log('start', selectedConversation);
                    const convId = selectedConversation.id;
                    const isGroup = selectedConversation.is_group;
                    const conv = isGroup ? persistedGroupMessages[convId] : persistedUserMessages[convId];
                    if (!conv?.[0]?.id) {
                        hasMoreRef.current = false;
                        return;
                    }

                    const first = conv[0];

                    // Save scroll height before loading older messages
                    const prevScrollHeight = containerRef.current?.scrollHeight || 0;

                    // Mark as loading
                    loadingRef.current = true;
                    console.log('older id: ', first.id);
                    axios
                        .get(route('message.loadOlder', first?.id))
                        .then((response) => {
                            const older = response.data.data as Message[];

                            if (!older.length) {
                                // no more older messages
                                observer.disconnect();
                                return;
                            }

                            console.log('response', response);
                            if (isGroup) {
                                setPersistedGroupMessages((prevState) => ({ ...prevState, [convId]: [...older.reverse(), ...prevState[convId]] }));
                            } else {
                                setPersistedUserMessages((prevState) => ({ ...prevState, [convId]: [...older.reverse(), ...prevState[convId]] }));
                            }

                            // // Restore scroll position after new messages are prepended
                            requestAnimationFrame(() => {
                                if (containerRef.current) {
                                    const newScrollHeight = containerRef.current.scrollHeight;
                                    containerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                                }
                            });
                        })
                        .finally(() => {
                            loadingRef.current = false;
                        });
                }
            },
            { threshold: 1, root: containerRef.current },
        );

        observer.observe(topRef.current);
        return () => {
            console.log('disconnect');
            observer.disconnect();
        };
    }, [persistedGroupMessages, persistedUserMessages, selectedConversation]);

    useEffect(() => {
        if (!selectedConversation?.id) return;
        if (selectedConversation.is_group) return;
        const convId = selectedConversation.id;

        if (persistedUserId.has(convId)) {
            if (scrolledUserChat[convId]) return;
            if (!bottomRef?.current) return;
            bottomRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
            setScrolledUserChat((prevState) => ({ ...prevState, [convId]: true }));
        }
    }, [persistedUserId, scrolledUserChat, selectedConversation.id, selectedConversation.is_group]);

    useEffect(() => {
        console.log('====');
        if (!selectedConversation?.id) return;
        if (!selectedConversation.is_group) return;
        const convId = selectedConversation.id;
        if (persistedUserId.has(convId)) {
            if (scrolledGroupChat[convId]) return;
            if (!bottomRef?.current) return;

            bottomRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
            setScrolledGroupChat((prevState) => ({ ...prevState, [convId]: true }));
        }
    }, [persistedUserId, scrolledGroupChat, selectedConversation.id, selectedConversation.is_group]);

    useEffect(() => {
        if (!selectedConversation?.id) return;
        if (selectedConversation.is_group) return;
        const selectedId = selectedConversation.id;
        if (persistedUserId?.has(selectedId)) return;
        setPersistedUserId((prevState) => new Set(prevState.add(selectedId)));
        setPersistedUserMessages((prevState) => ({ ...prevState, [selectedId]: [...(messages || [])].reverse() }));
    }, [messages, persistedUserId, selectedConversation.id, selectedConversation.is_group]);

    useEffect(() => {
        console.log('in');
        if (!selectedConversation?.id) return;
        if (!selectedConversation.is_group) return;
        const selectedId = selectedConversation.id;
        if (persistedGroupId?.has(selectedId)) return;
        setPersistedGroupId((prevState) => new Set(prevState.add(selectedId)));
        setPersistedGroupMessages((prevState) => ({ ...prevState, [selectedId]: [...(messages || [])].reverse() }));
    }, [messages, persistedGroupId, persistedGroupId, selectedConversation.id, selectedConversation.is_group]);

    useEcho(
        channelName,
        'SocketMessage',
        (event: { message: Message }) => {
            console.log('--------------------', event);
            const isGroup = selectedConversation.is_group;
            const convId = selectedConversation.id;

            if (isGroup) {
                setPersistedGroupMessages((prevState) => ({ ...prevState, [convId]: [...(prevState?.[convId] || []), event.message] }));
            } else {
                setPersistedUserMessages((prevState) => ({ ...prevState, [convId]: [...(prevState?.[convId] || []), event.message] }));
            }

            scrollToBottom();
        },
        [channelName],
        'private',
    );

    const scrollToBottom = () => {
        if (!bottomRef?.current) return;
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    console.log(persistedUserMessages);

    return (
        <div ref={containerRef} className={'h-[calc(100vh-100px)] overflow-y-scroll p-2'}>
            <div ref={topRef} className={'h-4 '}></div>

            {selectedConversation?.is_group
                ? persistedGroupMessages?.[selectedConversation.id]?.map((c) => <MessageItem userId={userId} c={c} key={c.id} />)
                : persistedUserMessages?.[selectedConversation.id]?.map((c) => <MessageItem userId={userId} c={c} key={c.id} />)}
            <div ref={bottomRef} className={'h-20'}></div>
        </div>
    );
};

const MessageItem = ({ c, userId }: { userId: number; c: Message }) => {
    const isOwn = userId === c.sender.id;

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`mb-6 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[75%] items-end gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-lg">
                        {c.sender.name.slice(0, 1).toUpperCase()}
                    </div>
                </div>

                {/* Message Content */}
                <div
                    className={`relative ${isOwn ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100'} rounded-2xl border px-4 py-3 shadow-sm ${isOwn ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
                >
                    {/*/!* Message tail *!/*/}
                    {/*<div className={`absolute bottom-0 w-4 h-4 ${isOwn ? 'bg-blue-600 -right-2' : 'bg-white dark:bg-gray-800 -left-2'} transform rotate-45 ${isOwn ? '' : 'border-l border-b border-gray-200 dark:border-gray-700'}`} />*/}
                    {/* Message tail */}
  {/*                  <div*/}
  {/*                      className={`*/}
  {/*  absolute bottom-2 h-3 w-3 rotate-45*/}
  {/*  ${isOwn*/}
  {/*                          ? 'right-[-6px] bg-blue-600 rounded-br-full'*/}
  {/*                          : 'left-[-6px] bg-white dark:bg-gray-800 border-b border-l border-gray-200 dark:border-gray-700 rounded-tl-full'*/}
  {/*                      }*/}
  {/*`}*/}
  {/*                  />*/}
                    <div className="relative z-10">
                        {c.message && <p className="mb-3 text-sm leading-relaxed">{c.message}</p>}

                        {c.attachments.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {c.attachments.map((attachment) => (
                                    <AttachmentItem attachment={attachment} key={attachment.id} />
                                ))}
                            </div>
                        )}

                        {c.updated_at && (
                            <p className={`mt-2 text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                {formatTime(c.updated_at)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
