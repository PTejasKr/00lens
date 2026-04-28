import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Info, Calendar, MessageSquare, Plus, UserPlus, Check, Settings, Image as ImageIcon, Send, UserCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { toast } from 'react-toastify';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated } = useAuth();
    const { messages, sendMessage, fetchMessages, activeChat, setActiveChat, joinGroupChat, queuePost, postQueue } = useChat();
    
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('feed');
    const [joining, setJoining] = useState(false);
    
    // Post State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postText, setPostText] = useState('');
    const [posting, setPosting] = useState(false);
    
    // Chat State
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);
    
    // Settings State
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', description: '', avatar: '', banner: '' });
    
    // Invite State
    const [followers, setFollowers] = useState([]);
    const [selectedFollowers, setSelectedFollowers] = useState([]);
    const [inviting, setInviting] = useState(false);
    
    // File upload state
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const fetchGroupData = useCallback(async () => {
        try {
            const [{ data: groupData }, { data: postsData }] = await Promise.all([
                api.get(`/groups/${id}`),
                api.get(`/groups/${id}/posts`)
            ]);
            setGroup(groupData);
            setPosts(postsData);
            setEditData({
                name: groupData.name,
                description: groupData.description,
                avatar: groupData.avatar,
                banner: groupData.banner
            });
        } catch (error) {
            toast.error('Failed to load group details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchFollowers = useCallback(async () => {
        try {
            const { data } = await api.get('/users/followers');
            setFollowers(data);
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    }, []);

    useEffect(() => {
        fetchGroupData();
        if (isAuthenticated) fetchFollowers();
    }, [fetchGroupData, fetchFollowers, isAuthenticated]);

    useEffect(() => {
        if (activeTab === 'chat') {
            fetchMessages(id, true);
            joinGroupChat(id);
            setActiveChat({ _id: id, name: group?.name, isGroup: true });
        }
    }, [activeTab, id, fetchMessages, joinGroupChat, group?.name, setActiveChat]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleJoin = async () => {
        if (!isAuthenticated) return toast.info('Please login to join groups');
        setJoining(true);
        try {
            await api.post(`/groups/${id}/join`);
            toast.success(`Welcome to ${group.name}! 👋`);
            fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join group');
        } finally {
            setJoining(false);
        }
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        setEditing(true);
        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('description', editData.description);
            if (avatarFile) formData.append('avatar', avatarFile);
            if (bannerFile) formData.append('banner', bannerFile);

            await api.put(`/groups/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Group updated successfully! ✨');
            fetchGroupData();
            setAvatarFile(null);
            setBannerFile(null);
        } catch (error) {
            toast.error('Failed to update group');
        } finally {
            setEditing(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postText.trim()) return;
        
        // Use batch queuing as requested
        queuePost(id, postText);
        
        setPostText('');
        setIsPostModalOpen(false);
        // fetchGroupData(); // Not needed immediately since it's queued
    };

    const handleInvite = async () => {
        if (selectedFollowers.length === 0) return;
        setInviting(true);
        try {
            await api.post(`/groups/${id}/invite`, { userIds: selectedFollowers });
            toast.success('Invitations sent! ✉️');
            setSelectedFollowers([]);
            fetchGroupData();
        } catch (error) {
            toast.error('Failed to send invites');
        } finally {
            setInviting(false);
        }
    };

    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        await sendMessage(null, chatInput, id);
        setChatInput('');
    };

    const isMember = group?.members?.some(m => (m._id || m) === currentUser?._id);
    const isCreator = group?.creator?._id === currentUser?._id;

    if (loading) return <Loader fullPage />;
    if (!group) return <div className="p-20 text-center font-bold text-primary text-2xl">Group not found</div>;

    const tabs = [
        { id: 'feed', label: 'Feed', icon: <MessageSquare size={18} /> },
        { id: 'chat', label: 'Chat', icon: <Send size={18} />, hidden: !isMember },
        { id: 'invite', label: 'Invite', icon: <UserPlus size={18} />, hidden: !isMember },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} />, hidden: !isCreator },
    ].filter(t => !t.hidden);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Group Header - Premium Design */}
            <div className="relative rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl border border-white/10 group">
                {/* Banner */}
                <div className="h-64 relative bg-surface">
                    <img 
                        src={group.banner || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'} 
                        alt="Banner" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Header Info Over Banner */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row items-end gap-6">
                        <div className="relative group/avatar">
                            <img 
                                src={group.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name}`} 
                                alt={group.name}
                                className="w-32 h-32 rounded-3xl object-cover border-4 border-surface shadow-2xl"
                            />
                            {isCreator && (
                                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                    <ImageIcon className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-white tracking-tight">{group.name}</h1>
                                {isCreator && <Shield size={20} className="text-yellow-400" title="Founder" />}
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <span className="flex items-center gap-1.5 text-sm font-bold text-white/70">
                                    <Users size={16} className="text-button" />
                                    {group.members?.length} Members
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-bold text-white/70">
                                    <Calendar size={16} className="text-button" />
                                    Active since {new Date(group.createdAt).getFullYear()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {!isMember ? (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="px-8 py-3 bg-button text-ink rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <UserPlus size={20} />
                                    {joining ? 'Joining...' : 'Join Now'}
                                </button>
                            ) : (
                                <div className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold border border-white/20 flex items-center gap-2">
                                    <UserCheck size={20} />
                                    Member
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 bg-surface/50 p-2 rounded-[2rem] border border-accent/5 backdrop-blur-xl w-fit mx-auto md:mx-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === tab.id 
                            ? 'bg-button text-ink shadow-lg shadow-button/20' 
                            : 'text-ink/40 hover:text-ink hover:bg-accent/5'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'feed' && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                {isMember && (
                                    <div 
                                        onClick={() => setIsPostModalOpen(true)}
                                        className="glass-card p-6 flex items-center gap-4 cursor-pointer hover:border-button transition-all group"
                                    >
                                        <img src={currentUser.profilePic} className="w-12 h-12 rounded-2xl" />
                                        <div className="flex-1 bg-background/50 py-3 px-6 rounded-2xl text-ink/40 font-bold group-hover:bg-background/80">
                                            Share something with {group.name}...
                                        </div>
                                        <div className="p-3 bg-button rounded-xl text-ink shadow-lg">
                                            <Plus size={24} />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-6">
                                    {/* Display Queued/Pending Posts */}
                                    {postQueue.filter(p => p.groupId === id).map(p => (
                                        <div key={p.tempId} className="glass-card p-6 opacity-60 border-dashed border-button/40">
                                            <div className="flex items-center gap-3 mb-4">
                                                <img src={currentUser.profilePic} className="w-10 h-10 rounded-xl" />
                                                <div>
                                                    <p className="font-black text-sm">{currentUser.name}</p>
                                                    <p className="text-[10px] font-bold text-button uppercase tracking-widest animate-pulse">Queued for sync...</p>
                                                </div>
                                            </div>
                                            <p className="text-ink/70">{p.text}</p>
                                        </div>
                                    ))}

                                    {posts.length > 0 ? (
                                        posts.map(post => <PostCard key={post._id} post={post} />)
                                    ) : (
                                        <div className="glass-card p-20 text-center border-dashed border-2 border-accent/20">
                                            <MessageSquare size={48} className="mx-auto mb-4 text-ink/10" />
                                            <h3 className="text-xl font-bold text-ink/30 uppercase tracking-widest">No posts yet</h3>
                                            <p className="text-ink/20 mt-2">Be the first to share something!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-full lg:w-80 space-y-6">
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <Info size={18} className="text-primary" />
                                        About
                                    </h3>
                                    <p className="text-ink/60 text-sm leading-relaxed">{group.description}</p>
                                </div>
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <Users size={18} className="text-primary" />
                                        Members ({group.members?.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {group.members?.slice(0, 12).map(m => (
                                            <Link key={m._id} to={`/profile/${m._id}`} title={m.name}>
                                                <img 
                                                    src={m.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${m.name}`} 
                                                    className="w-10 h-10 rounded-xl hover:scale-110 transition-transform shadow-md"
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="glass-card h-[600px] flex flex-col overflow-hidden border border-button/10">
                            <div className="p-4 border-b border-accent/10 flex items-center gap-3 bg-surface/50">
                                <img src={group.avatar} className="w-10 h-10 rounded-xl" />
                                <div>
                                    <h3 className="font-black text-ink">{group.name} Chat</h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Live Community
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90">
                                {messages.map((msg, i) => {
                                    const isMe = msg.sender === currentUser._id;
                                    return (
                                        <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-3xl ${
                                                isMe 
                                                ? 'bg-button text-ink rounded-tr-none' 
                                                : 'bg-white text-ink rounded-tl-none shadow-sm'
                                            }`}>
                                                {!isMe && <p className="text-[10px] font-black text-primary mb-1">{msg.senderName || 'Member'}</p>}
                                                <p className="font-medium">{msg.text}</p>
                                                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-ink/40' : 'text-ink/20'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.status === 'pending' && ' • Sending...'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleSendChatMessage} className="p-4 bg-surface border-t border-accent/10 flex gap-2">
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message to the group..."
                                    className="flex-1 bg-background border-none rounded-2xl px-6 font-bold focus:ring-2 ring-button transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="p-4 bg-button text-ink rounded-2xl shadow-lg shadow-button/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'invite' && (
                        <div className="glass-card p-8">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black mb-2">Invite your followers</h2>
                                <p className="text-ink/50 font-bold">Bring more people into {group.name} to grow your community.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {followers.length > 0 ? (
                                    followers.map(f => {
                                        const isAlreadyIn = group.members.some(m => (m._id || m) === f._id);
                                        const isSelected = selectedFollowers.includes(f._id);
                                        return (
                                            <div 
                                                key={f._id}
                                                onClick={() => !isAlreadyIn && setSelectedFollowers(prev => 
                                                    isSelected ? prev.filter(id => id !== f._id) : [...prev, f._id]
                                                )}
                                                className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-4 cursor-pointer ${
                                                    isAlreadyIn 
                                                    ? 'opacity-50 grayscale bg-background border-transparent cursor-not-allowed' 
                                                    : isSelected 
                                                        ? 'border-button bg-button/5 shadow-inner' 
                                                        : 'border-accent/10 hover:border-button/30'
                                                }`}
                                            >
                                                <img src={f.profilePic} className="w-12 h-12 rounded-2xl" />
                                                <div className="flex-1">
                                                    <p className="font-black text-sm">{f.name}</p>
                                                    <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">
                                                        {isAlreadyIn ? 'Already a member' : 'Follower'}
                                                    </p>
                                                </div>
                                                {!isAlreadyIn && (
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${
                                                        isSelected ? 'bg-button border-button text-ink' : 'border-accent/20'
                                                    }`}>
                                                        {isSelected && <Check size={14} />}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full py-12 text-center text-ink/30 font-bold">
                                        You don't have any followers to invite yet.
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleInvite}
                                    disabled={inviting || selectedFollowers.length === 0}
                                    className="btn-primary px-12 py-4 font-black shadow-2xl shadow-button/30 disabled:opacity-50"
                                >
                                    {inviting ? 'Sending Invites...' : `Send ${selectedFollowers.length} Invites`}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="glass-card p-8">
                            <h2 className="text-2xl font-black mb-6">Group Settings</h2>
                            <form onSubmit={handleUpdateGroup} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-ink/40 mb-2">Community Name</label>
                                        <input
                                            value={editData.name}
                                            onChange={e => setEditData({...editData, name: e.target.value})}
                                            className="input-field"
                                            placeholder="Enter name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-ink/40 mb-2">Description</label>
                                        <textarea
                                            value={editData.description}
                                            onChange={e => setEditData({...editData, description: e.target.value})}
                                            className="input-field"
                                            rows="3"
                                            placeholder="What is this group about?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-ink/40 mb-2">Group Avatar</label>
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={avatarPreview || editData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${editData.name}`} 
                                                className="w-16 h-16 rounded-2xl object-cover border border-accent/10"
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files[0];
                                                    setAvatarFile(file);
                                                    setAvatarPreview(URL.createObjectURL(file));
                                                }}
                                                className="block w-full text-sm text-ink/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-button file:text-ink hover:file:opacity-80 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-ink/40 mb-2">Group Banner</label>
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={bannerPreview || editData.banner || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'} 
                                                className="w-32 h-16 rounded-2xl object-cover border border-accent/10"
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => {
                                                    const file = e.target.files[0];
                                                    setBannerFile(file);
                                                    setBannerPreview(URL.createObjectURL(file));
                                                }}
                                                className="block w-full text-sm text-ink/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-button file:text-ink hover:file:opacity-80 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={editing}
                                        className="btn-primary px-12 py-4 font-black shadow-xl"
                                    >
                                        {editing ? 'Saving Changes...' : 'Save Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Post in Group Modal */}
            <AnimatePresence>
                {isPostModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPostModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-surface rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
                        >
                            <form onSubmit={handleCreatePost} className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-button flex items-center justify-center text-ink shadow-lg shadow-button/20">
                                        <Plus size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-ink">Post to {group.name}</h2>
                                        <p className="text-xs font-bold text-ink/30 uppercase tracking-widest">Feed Update</p>
                                    </div>
                                </div>
                                <textarea
                                    required
                                    rows="5"
                                    autoFocus
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    placeholder="Share your thoughts with the community..."
                                    className="input-field px-6 py-5 font-semibold resize-none text-lg bg-background/30 border-none shadow-inner"
                                />
                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsPostModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-ink/40 hover:text-ink hover:bg-accent/5 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={posting || !postText.trim()}
                                        className="flex-[2] btn-primary py-4 font-black uppercase tracking-widest shadow-xl shadow-button/30 disabled:opacity-50"
                                    >
                                        {posting ? 'Publishing...' : 'Publish Post'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GroupDetail;
