import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Image as ImageIcon, Film, FileText, X, Info } from 'lucide-react';
import { usePosts } from '../context/PostContext';

const CreatePost = () => {
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileClear = (type) => {
    if (type === 'image') { setImageFile(null); setImagePreview(null); }
    if (type === 'video') setVideoFile(null);
    if (type === 'doc') setDocFile(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim() && !imageFile && !videoFile && !docFile) {
      toast.warn('Post cannot be empty'); return;
    }
    const formData = new FormData();
    formData.append('text', content);
    if (imageFile) formData.append('image', imageFile);
    if (videoFile) formData.append('video', videoFile);
    if (docFile) formData.append('document', docFile);
    setIsSubmitting(true);
    try {
      const result = await createPost(formData);
      if (result && result.success) navigate('/');
    } catch { toast.error('An unexpected error occurred.'); }
    finally { setIsSubmitting(false); }
  };

  const isEmpty = !content.trim() && !imageFile && !videoFile && !docFile;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem 0' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: '#850E35', margin: '0 0 0.375rem', lineHeight: 1.1 }}>
          New Post
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#9A6472', margin: '0 0 1.75rem' }}>
          Share knowledge or moments with your campus community
        </p>

        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(238,105,131,0.14)', boxShadow: '0 4px 24px rgba(133,14,53,0.08)', overflow: 'hidden' }}>
          <form onSubmit={handleSubmit}>
            {/* Textarea */}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's happening on campus?..."
              style={{
                width: '100%', display: 'block', resize: 'none', border: 'none', outline: 'none',
                padding: '1.5rem', minHeight: '180px',
                fontFamily: "'Inter', sans-serif", fontSize: '1rem', fontWeight: 400,
                color: '#3B0A1F', lineHeight: 1.7, background: 'transparent',
                boxSizing: 'border-box',
              }}
            />

            {/* Char count */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '1.5rem', paddingBottom: '0.5rem' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: content.length > 280 ? '#DC2626' : '#b0899c', fontWeight: 500 }}>
                {content.length} / 500
              </span>
            </div>

            {/* Media previews */}
            <AnimatePresence>
              {(imagePreview || videoFile || docFile) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ padding: '0 1.5rem 1rem' }}
                >
                  {imagePreview && (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', maxHeight: '240px' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <button type="button" onClick={() => handleFileClear('image')}
                        style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: imagePreview ? '0.5rem' : 0 }}>
                    {videoFile && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'rgba(238,105,131,0.07)', borderRadius: '8px', fontSize: '0.8125rem', color: '#3B0A1F', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                        <Film size={14} style={{ color: '#EE6983' }} />
                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{videoFile.name}</span>
                        <button type="button" onClick={() => handleFileClear('video')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A6472', padding: 0, display: 'flex' }}><X size={12} /></button>
                      </div>
                    )}
                    {docFile && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'rgba(238,105,131,0.07)', borderRadius: '8px', fontSize: '0.8125rem', color: '#3B0A1F', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                        <FileText size={14} style={{ color: '#EE6983' }} />
                        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docFile.name}</span>
                        <button type="button" onClick={() => handleFileClear('doc')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A6472', padding: 0, display: 'flex' }}><X size={12} /></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderTop: '1px solid rgba(238,105,131,0.1)', background: 'rgba(252,245,238,0.5)' }}>
              {/* Attach buttons */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[
                  { Icon: ImageIcon, type: 'image', accept: 'image/*', title: 'Add image' },
                  { Icon: Film, type: 'video', accept: 'video/*', title: 'Add video' },
                  { Icon: FileText, type: 'doc', accept: '.pdf,.doc,.docx', title: 'Add document' },
                ].map(({ Icon, type, accept, title }) => (
                  <label key={type} title={title}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9A6472', transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(238,105,131,0.08)'; e.currentTarget.style.color = '#EE6983'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9A6472'; }}
                  >
                    <Icon size={18} />
                    <input type="file" className="hidden" accept={accept} onChange={e => {
                      const file = e.target.files[0];
                      if (type === 'image') handleImageChange(e);
                      else if (type === 'video') setVideoFile(file);
                      else setDocFile(file);
                    }} style={{ display: 'none' }} />
                  </label>
                ))}
              </div>

              {/* Post button */}
              <button
                type="submit"
                disabled={isSubmitting || isEmpty}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', opacity: isEmpty ? 0.45 : 1 }}
              >
                {isSubmitting
                  ? <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  : <><Send size={15} /> Post</>
                }
              </button>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(238,105,131,0.05)', borderRadius: '10px', border: '1px dashed rgba(238,105,131,0.2)' }}>
          <Info size={14} style={{ color: '#9A6472', flexShrink: 0 }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', color: '#9A6472', margin: 0 }}>
            Keep it constructive — share academic content, campus events, or helpful resources.
          </p>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CreatePost;
