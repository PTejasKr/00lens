import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, Search, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load groups'); }
    finally { setLoading(false); }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/groups', newGroup);
      toast.success('Community created!');
      setIsCreateModalOpen(false);
      setNewGroup({ name: '', description: '' });
      fetchGroups();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create group'); }
    finally { setCreating(false); }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader fullPage />;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0.5rem 0' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-burgundy)', margin: '0 0 0.375rem', lineHeight: 1.1 }}>
            Campus Communities
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: '0.9rem', color: 'var(--color-muted)', margin: 0 }}>
            Join groups, share interests, and grow together
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'var(--color-burgundy)', color: 'white', border: 'none', borderRadius: '10px', fontFamily: "var(--font-body)", fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(160, 82, 45, 0.3)', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={18} /> Create Group
        </motion.button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search groups by name or topic…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '12px', border: '1.5px solid rgba(227, 83, 54, 0.2)', outline: 'none', fontFamily: "var(--font-body)", fontSize: '0.9375rem', color: 'var(--color-ink)', background: 'white', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(160, 82, 45, 0.05)', transition: 'border-color 0.18s' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(227, 83, 54, 0.2)'}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredGroups.length > 0 ? filteredGroups.map((group, i) => (
          <motion.div
            key={group._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(227, 83, 54, 0.13)', boxShadow: '0 2px 12px rgba(160, 82, 45, 0.06)', overflow: 'hidden', transition: 'box-shadow 0.2s, border-color 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(160, 82, 45, 0.12)'; e.currentTarget.style.borderColor = 'rgba(227, 83, 54, 0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(160, 82, 45, 0.06)'; e.currentTarget.style.borderColor = 'rgba(227, 83, 54, 0.13)'; }}
          >
            {/* Banner */}
            <div style={{ height: '72px', background: 'linear-gradient(135deg, rgba(255,196,196,0.4), rgba(227, 83, 54, 0.15))', display: 'flex', alignItems: 'flex-end', padding: '0 1.25rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 2px 10px rgba(227, 83, 54, 0.3)', transform: 'translateY(26px)', overflow: 'hidden' }}>
                {group.image
                  ? <img src={group.image} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Users size={24} style={{ color: 'white' }} />
                }
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '2.25rem 1.25rem 1.25rem' }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: '1.125rem', color: 'var(--color-ink)', margin: '0 0 0.375rem', lineHeight: 1.2 }}>{group.name}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 1rem', lineHeight: 1.55, height: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {group.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: "var(--font-body)", fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Users size={13} />
                  {group.members?.length || 0} members
                </div>
                <Link to={`/groups/${group._id}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: "var(--font-body)", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', transition: 'color 0.15s, gap 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-burgundy)'; e.currentTarget.style.gap = '0.5rem'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.gap = '0.25rem'; }}
                >
                  View <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        )) : (
          <div style={{ gridColumn: '1/-1', padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid rgba(227, 83, 54, 0.12)' }}>
            <Users size={48} style={{ color: 'rgba(227, 83, 54, 0.25)', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: '1.375rem', color: 'var(--color-burgundy)', margin: '0 0 0.375rem' }}>No communities found</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>Try a different search or create one!</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(59,10,31,0.5)', backdropFilter: 'blur(6px)' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative', width: '100%', maxWidth: '480px', background: 'white', borderRadius: '20px', boxShadow: '0 24px 64px rgba(133,14,53,0.18)', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(227, 83, 54, 0.12)' }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: '1.5rem', color: 'var(--color-burgundy)', margin: 0 }}>New Community</h2>
                <button onClick={() => setIsCreateModalOpen(false)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(227, 83, 54, 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateGroup} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>Group Name</label>
                  <input
                    type="text" required value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g. Coding Club, Photography Society"
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "var(--font-body)", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>Description</label>
                  <textarea
                    required rows={4} value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="What is this community about?"
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1.5px solid rgba(227, 83, 54, 0.2)', outline: 'none', fontFamily: "var(--font-body)", fontSize: '0.9375rem', color: 'var(--color-ink)', background: '#FCF5EE', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.18s' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(227, 83, 54, 0.2)'}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.375rem' }}>
                  <button type="button" onClick={() => setIsCreateModalOpen(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1.5px solid rgba(227, 83, 54, 0.2)', background: 'transparent', fontFamily: "var(--font-body)", fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-muted)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(227, 83, 54, 0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    style={{ flex: 2, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'var(--color-burgundy)', color: 'white', fontFamily: "var(--font-body)", fontSize: '0.9375rem', fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, boxShadow: '0 4px 16px rgba(160, 82, 45, 0.3)', transition: 'opacity 0.2s' }}
                  >
                    {creating ? 'Creating…' : 'Create Community'}
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

export default Groups;
