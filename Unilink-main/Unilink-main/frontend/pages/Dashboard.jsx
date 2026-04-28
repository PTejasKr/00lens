import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, RotateCcw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const S = {
  card: {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid rgba(227, 83, 54, 0.12)',
    boxShadow: '0 2px 12px rgba(160, 82, 45, 0.06)',
    padding: '1.25rem',
  },
  cardTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'var(--color-ink)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
};

const Dashboard = () => {
  const { posts, loading, fetchPosts } = usePosts();
  const { user, isAuthenticated, toggleFollow } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [peers, setPeers] = useState([]);
  const [loadingPeers, setLoadingPeers] = useState(true);
  const [trending, setTrending] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tag = searchParams.get('tag') || '';

  useEffect(() => {
    fetchPosts();
    const fetchPeers = async () => {
      try {
        const { data } = await api.get('/users');
        if (Array.isArray(data)) setPeers(data.filter(u => u._id !== user?._id).slice(0, 5));
        else setPeers([]);
      } catch { setPeers([]); }
      finally { setLoadingPeers(false); }
    };
    const fetchTrending = async () => {
      try {
        const { data } = await api.get('/posts/trending');
        setTrending((data || []).slice(0, 6));
      } catch { setTrending([]); }
    };
    const fetchGroups = async () => {
      try {
        const { data } = await api.get('/groups');
        setGroups((data || []).slice(0, 3));
      } catch { setGroups([]); }
      finally { setLoadingGroups(false); }
    };
    fetchPeers();
    fetchTrending();
    fetchGroups();
  }, [user]);

  useEffect(() => { fetchPosts(1, tag); }, [fetchPosts, tag]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts(1, tag);
    setIsRefreshing(false);
  };

  if (loading && posts.length === 0) return <Loader fullPage />;

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>

      {/* ── Center: Feed ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Feed header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--color-burgundy)', margin: 0, lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} style={{ color: 'var(--color-primary)' }} />
              {tag ? `#${tag}` : 'Campus Feed'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                {tag ? `Filtered by #${tag}` : 'Latest from your network'}
              </p>
              {tag && (
                <Link to="/feed" style={{ fontFamily: "var(--font-body)", fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', background: 'rgba(227, 83, 54, 0.08)', padding: '0.125rem 0.5rem', borderRadius: '6px' }}>
                  × Clear
                </Link>
              )}
            </div>
          </motion.div>

          <button
            onClick={handleRefresh}
            title="Refresh feed"
            style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid rgba(227, 83, 54, 0.18)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-muted)', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'rgba(227, 83, 54, 0.18)'; }}
          >
            <RotateCcw size={15} style={{ animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence mode="popLayout">
            {Array.isArray(posts) && posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </AnimatePresence>

          {(!posts || posts.length === 0) && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ ...S.card, padding: '4rem 2rem', textAlign: 'center' }}
            >
              <div style={{ width: '56px', height: '56px', background: 'rgba(227, 83, 54, 0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Users size={26} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: '1.375rem', color: 'var(--color-burgundy)', margin: '0 0 0.5rem' }}>No posts yet</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.875rem', color: 'var(--color-muted)', maxWidth: '280px', margin: '0 auto' }}>Be the first to share something with your campus network.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Right: Sidebar panels ── */}
      <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}
        className="dash-sidebar">

        {/* Trending */}
        <div style={S.card}>
          <p style={S.cardTitle}><TrendingUp size={14} /> Trending</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {trending.length > 0 ? trending.map(item => (
              <Link key={item.tag} to={`/feed?tag=${item.tag.replace('#', '')}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0.5rem', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(227, 83, 54, 0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-ink)' }}>{item.tag}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: '0.75rem', color: 'var(--color-muted)', background: 'rgba(227, 83, 54, 0.08)', padding: '0 0.5rem', borderRadius: '6px', fontWeight: 600 }}>{item.count}</span>
              </Link>
            )) : (
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>No trending tags yet</p>
            )}
          </div>
        </div>

        {/* Peers */}
        <div style={S.card}>
          <p style={S.cardTitle}><Users size={14} /> Discover Peers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loadingPeers ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>Finding peers...</p>
            ) : peers.map(peer => {
              const isFollowing = (user?.following || []).some(id => {
                const followId = id?._id ? String(id._id) : String(id);
                return followId === String(peer._id);
              });
              return (
                <div key={peer._id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Link to={`/profile/${peer._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <img
                      src={peer.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${peer.name}&backgroundColor=ffc4c4&textColor=a0522d`}
                      alt={peer.name}
                      style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover', background: 'var(--color-accent)', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{peer.name}</p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: '0.6875rem', color: 'var(--color-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{peer.bio?.substring(0, 22) || 'UniLink Student'}</p>
                    </div>
                  </Link>
                  {isAuthenticated && (
                    <button
                      onClick={() => toggleFollow(peer._id)}
                      style={{ flexShrink: 0, padding: '0.25rem 0.625rem', borderRadius: '6px', fontFamily: "var(--font-body)", fontSize: '0.6875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid', borderColor: isFollowing ? 'rgba(227, 83, 54, 0.25)' : 'var(--color-primary)', background: isFollowing ? 'transparent' : 'var(--color-primary)', color: isFollowing ? 'var(--color-muted)' : 'white' }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })}
            {!loadingPeers && peers.length === 0 && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>No peers to discover yet</p>
            )}
          </div>
        </div>

        {/* Communities */}
        <div style={S.card}>
          <p style={S.cardTitle}>🏘 Communities</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {loadingGroups ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: 'var(--color-muted)', fontStyle: 'italic' }}>Loading groups...</p>
            ) : groups.map(group => (
              <Link key={group._id} to={`/groups/${group._id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0.5rem', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(227, 83, 54, 0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(227, 83, 54, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {group.image
                    ? <img src={group.image} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Users size={16} style={{ color: 'var(--color-primary)' }} />
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: '0.6875rem', color: 'var(--color-muted)', margin: 0 }}>{group.members?.length || 0} members</p>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/groups"
            style={{ display: 'block', marginTop: '0.875rem', padding: '0.5rem', textAlign: 'center', borderRadius: '8px', border: '1px solid rgba(227, 83, 54, 0.2)', fontFamily: "var(--font-body)", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          >
            Explore all communities →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .dash-sidebar { display: none !important; } }
      `}</style>
    </div>
  );
};

export default Dashboard;
