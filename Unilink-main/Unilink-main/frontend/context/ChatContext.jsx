import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { encryptMessage, decryptMessage } from '../utils/encryption';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // The user or group we are chatting with
    const [messageQueue, setMessageQueue] = useState(() => {
        const savedQueue = localStorage.getItem('unilink_msg_queue');
        return savedQueue ? JSON.parse(savedQueue) : [];
    });
    const [postQueue, setPostQueue] = useState(() => {
        const savedQueue = localStorage.getItem('unilink_post_queue');
        return savedQueue ? JSON.parse(savedQueue) : [];
    });
    const syncTimer = useRef(null);

    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_API_URL || window.location.origin);
            setSocket(newSocket);

            newSocket.emit('join', user._id);

            newSocket.on('getMessage', async (message) => {
                // Decrypt message text
                if (message.text) {
                    message.text = await decryptMessage(message.text);
                }

                // If the message is for the user or group we are currently chatting with
                const isCurrentChat = activeChat && (
                    (message.group && message.group === activeChat._id) ||
                    (!message.group && (message.sender === activeChat._id || message.receiver === activeChat._id))
                );

                if (isCurrentChat) {
                    setMessages((prev) => [...prev, message]);
                }
                fetchConversations();
            });

            // Start batch sync timer (5 minutes)
            syncTimer.current = setInterval(() => {
                syncBatchMessages();
                syncBatchPosts();
            }, 5 * 60 * 1000);

            return () => {
                newSocket.close();
                if (syncTimer.current) clearInterval(syncTimer.current);
            };
        }
    }, [user, activeChat]);

    // Save queues to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('unilink_msg_queue', JSON.stringify(messageQueue));
    }, [messageQueue]);

    useEffect(() => {
        localStorage.setItem('unilink_post_queue', JSON.stringify(postQueue));
    }, [postQueue]);

    const syncBatchMessages = async () => {
        const queue = JSON.parse(localStorage.getItem('unilink_msg_queue') || '[]');
        if (queue.length === 0) return;

        try {
            console.log(`Syncing batch of ${queue.length} messages...`);
            await api.post('/chat/batch', { messages: queue });
            setMessageQueue([]); // Clear queue on success
            console.log('Message batch sync successful');
        } catch (error) {
            console.error('Message batch sync failed:', error);
        }
    };

    const syncBatchPosts = async () => {
        const queue = JSON.parse(localStorage.getItem('unilink_post_queue') || '[]');
        if (queue.length === 0) return;

        try {
            console.log(`Syncing batch of ${queue.length} posts...`);
            await api.post('/groups/posts/batch', { posts: queue });
            setPostQueue([]); // Clear queue on success
            console.log('Post batch sync successful');
        } catch (error) {
            console.error('Post batch sync failed:', error);
        }
    };

    const fetchMessages = useCallback(async (userId, isGroup = false) => {
        try {
            const url = isGroup ? `/chat/${userId}?groupId=${userId}` : `/chat/${userId}`;
            const { data } = await api.get(url);
            
            // Decrypt all messages
            const decryptedMessages = await Promise.all(data.messages.map(async (msg) => ({
                ...msg,
                text: msg.text ? await decryptMessage(msg.text) : '',
            })));

            setMessages(decryptedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/chat/conversations');
            // Decrypt last messages
            const decryptedConversations = await Promise.all(data.map(async (conv) => ({
                ...conv,
                lastMessage: conv.lastMessage ? await decryptMessage(conv.lastMessage) : '',
            })));
            setConversations(decryptedConversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }, []);

    const sendMessage = async (receiverId, text, groupId = null) => {
        if (user) {
            // 1. Encrypt message
            const encryptedText = await encryptMessage(text);
            
            const messageData = {
                senderId: user._id,
                receiverId: groupId ? null : receiverId,
                groupId: groupId,
                text: encryptedText,
                timestamp: new Date().toISOString(),
                tempId: Date.now().toString(), // For matching response
            };

            // 2. Add to batch queue for DB persistence
            setMessageQueue((prev) => [...prev, messageData]);

            // 3. Emit via socket for real-time relay
            if (socket) {
                // We emit the encrypted text so other clients decrypt it
                socket.emit('sendMessage', messageData);
            }
            
            // 4. Optimistically add to local messages UI
            const optimisticMsg = {
                _id: messageData.tempId,
                sender: user._id,
                receiver: receiverId,
                group: groupId,
                text: text, // Show plain text locally for the sender
                createdAt: messageData.timestamp,
                status: 'pending' // Indicate it's in the queue for batch sync
            };
            setMessages((prev) => [...prev, optimisticMsg]);
            
            // Trigger conversation list update if needed
            fetchConversations();
        }
    };

    const joinGroupChat = (groupId) => {
        if (socket) {
            socket.emit('joinGroup', groupId);
        }
    };

    const queuePost = (groupId, text, image = null) => {
        const postData = {
            groupId,
            text,
            image,
            timestamp: new Date().toISOString(),
            tempId: Date.now().toString()
        };
        setPostQueue(prev => [...prev, postData]);
        toast.info('Post queued for batch sync! ⏳');
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                conversations,
                activeChat,
                setActiveChat,
                fetchMessages,
                fetchConversations,
                sendMessage,
                joinGroupChat,
                queuePost,
                socket,
                messageQueue,
                postQueue,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
