import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Send, User as UserIcon, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Avatar = ({ user, size = 40, radius = '12px' }) => (
  user?.profilePic
    ? <img src={user.profilePic} alt={user.name} style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', background: '#FFC4C4', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: radius, background: 'rgba(238,105,131,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <UserIcon size={size * 0.45} style={{ color: '#EE6983' }} />
      </div>
);

const Chat = () => {
  const { messages, conversations, activeChat, setActiveChat, fetchMessages, fetchConversations, sendMessage } = useChat();
  const { user: currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (activeChat) { fetchMessages(activeChat._id); setMobileShowChat(true); }
  }, [activeChat, fetchMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim() && activeChat) { sendMessage(activeChat._id, inputText.trim()); setInputText(''); }
  };

  const handleSelectChat = (chatUser) => { setActiveChat(chatUser); setMobileShowChat(true); };

  const C = {
    panel: { height: '100%', display: 'flex', flexDirection: 'column', background: 'white' },
    header: { padding: '1rem 1.25rem', borderBottom: '1px solid rgba(238,105,131,0.12)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', flexShrink: 0 },
    headerTitle: { fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem', color: '#850E35', margin: 0 },
    subtext: { fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', color: '#9A6472', margin: 0 },
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', height: 'calc(100vh - 88px)', background: 'white', borderRadius: '20px', border: '1px solid rgba(238,105,131,0.14)', boxShadow: '0 4px 32px rgba(133,14,53,0.08)', display: 'flex', overflow: 'hidden' }}>

      {/* ── Conversation list ── */}
      <div style={{ width: '300px', flexShrink: 0, borderRight: '1px solid rgba(238,105,131,0.12)', display: 'flex', flexDirection: 'column', ...(mobileShowChat ? { display: 'none' } : {}) }}
        className="chat-list">
        {/* List header */}
        <div style={C.header}>
          <MessageSquare size={20} style={{ color: '#EE6983' }} />
          <p style={C.headerTitle}>Messages</p>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#9A6472' }}>No conversations yet. Visit someone's profile to start chatting.</p>
            </div>
          ) : conversations.map((chatUser) => {
            const isActive = activeChat?._id === chatUser._id;
            return (
              <button
                key={chatUser._id}
                onClick={() => handleSelectChat(chatUser)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.18s', background: isActive ? 'rgba(238,105,131,0.1)' : 'transparent', marginBottom: '2px' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(238,105,131,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ position: 'relative' }}>
                  <Avatar user={chatUser} size={44} radius="14px" />
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, background: '#22C55E', borderRadius: '50%', border: '2px solid white' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: isActive ? '#850E35' : '#3B0A1F', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chatUser.name}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#9A6472', margin: 0 }}>Tap to view chat</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Message window ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FEFCFB', minWidth: 0 }}>
        {activeChat ? (
          <>
            {/* Chat header */}
            <div style={C.header}>
              <button
                onClick={() => { setMobileShowChat(false); }}
                style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#9A6472', padding: '0.25rem', borderRadius: '8px' }}
                className="mobile-back-btn"
              >
                <ArrowLeft size={20} />
              </button>
              <Avatar user={activeChat} size={38} radius="12px" />
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#3B0A1F', margin: 0 }}>{activeChat.name}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', color: '#22C55E', margin: 0, fontWeight: 600 }}>Online</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMine = String(msg.sender) === String(currentUser?._id);
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '0.625rem 0.875rem',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMine ? '#850E35' : 'white',
                        border: isMine ? 'none' : '1px solid rgba(238,105,131,0.15)',
                        boxShadow: isMine ? '0 2px 12px rgba(133,14,53,0.25)' : '0 1px 4px rgba(133,14,53,0.06)',
                      }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: isMine ? 'white' : '#3B0A1F', margin: 0, lineHeight: 1.55 }}>{msg.text}</p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', color: isMine ? 'rgba(255,255,255,0.55)' : '#b0899c', margin: '0.25rem 0 0', textAlign: 'right' }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid rgba(238,105,131,0.1)', background: 'white', flexShrink: 0, display: 'flex', gap: '0.625rem' }}>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '0.75rem 1.125rem', borderRadius: '12px', border: '1.5px solid rgba(238,105,131,0.2)', outline: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', color: '#3B0A1F', background: '#FCF5EE', transition: 'border-color 0.18s' }}
                onFocus={e => e.currentTarget.style.borderColor = '#EE6983'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(238,105,131,0.2)'}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#850E35', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', opacity: inputText.trim() ? 1 : 0.45, transition: 'all 0.18s', flexShrink: 0, boxShadow: '0 2px 10px rgba(133,14,53,0.3)' }}
                onMouseEnter={e => { if (inputText.trim()) e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Send size={18} style={{ color: 'white' }} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', opacity: 0.5 }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(238,105,131,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <MessageSquare size={30} style={{ color: '#EE6983' }} />
            </div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem', color: '#850E35', margin: '0 0 0.375rem' }}>Select a Conversation</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#9A6472', margin: 0, textAlign: 'center' }}>Pick a contact from the left to start messaging</p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-list { display: flex !important; width: 100% !important; }
          .mobile-back-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Chat;
