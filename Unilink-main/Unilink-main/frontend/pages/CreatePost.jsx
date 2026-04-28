import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Image as ImageIcon, Film, FileText, X, Info, UploadCloud } from 'lucide-react';
import { usePosts } from '../context/PostContext';

const CreatePost = () => {
  const { createPost } = usePosts();
  const [content, setContent]       = useState('');
  const [imageFile, setImageFile]   = useState(null);
  const [videoFile, setVideoFile]   = useState(null);
  const [docFile, setDocFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  // Separate refs so we can reset each input independently
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const docRef   = useRef(null);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      e.target.value = '';
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Video must be under 20 MB');
      e.target.value = '';
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
  };

  const handleFileClear = (type) => {
    if (type === 'image') {
      setImageFile(null);
      setImagePreview(null);
      if (imageRef.current) imageRef.current.value = '';
    }
    if (type === 'video') {
      setVideoFile(null);
      setVideoPreview(null);
      if (videoRef.current) videoRef.current.value = '';
    }
    if (type === 'doc') {
      setDocFile(null);
      if (docRef.current) docRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim() && !imageFile && !videoFile && !docFile) {
      toast.warn('Post cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('text', content);
    if (imageFile) formData.append('image', imageFile);
    if (videoFile) formData.append('video', videoFile);
    if (docFile)   formData.append('document', docFile);

    setIsSubmitting(true);
    setUploadProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 10, 85));
    }, 200);

    try {
      const result = await createPost(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (result && result.success) {
        setTimeout(() => navigate('/'), 400);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const isEmpty = !content.trim() && !imageFile && !videoFile && !docFile;

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-serif text-3xl sm:text-4xl text-burgundy mb-1 leading-tight">
          New Post
        </h1>
        <p className="font-sans text-sm text-burgundy/80 mb-7">
          Share knowledge or moments with your campus community
        </p>

        <div className="bg-surface rounded-3xl border border-accent/20 shadow-xl overflow-hidden relative">
          {/* Upload progress bar */}
          {isSubmitting && (
            <motion.div
              className="absolute top-0 left-0 h-1 bg-accent z-10"
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          )}

          <form onSubmit={handleSubmit}>
            {/* Textarea */}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's happening on campus?..."
              className="w-full block resize-none border-none outline-none p-6 min-h-[180px] font-sans text-base font-medium text-ink leading-relaxed bg-transparent"
              maxLength={1000}
            />

            {/* Char count */}
            <div className="flex justify-end pr-6 pb-2">
              <span className={`font-sans text-xs font-semibold ${content.length > 450 ? 'text-red-600' : 'text-muted'}`}>
                {content.length} / 500
              </span>
            </div>

            {/* Media Previews */}
            <AnimatePresence>
              {(imagePreview || videoPreview || docFile) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4 space-y-3"
                >
                  {/* Image preview */}
                  {imagePreview && (
                    <div className="relative rounded-2xl overflow-hidden max-h-[240px] shadow-md border border-accent/10">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover block" />
                      <button
                        type="button"
                        onClick={() => handleFileClear('image')}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border-none cursor-pointer text-white flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Video preview */}
                  {videoPreview && (
                    <div className="relative rounded-2xl overflow-hidden shadow-md border border-accent/10">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full rounded-2xl max-h-[240px] object-contain bg-black"
                      />
                      <button
                        type="button"
                        onClick={() => handleFileClear('video')}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border-none cursor-pointer text-white flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Document chip */}
                  {docFile && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-xl text-sm text-ink font-semibold border border-accent/20 shadow-sm">
                      <FileText size={15} className="text-accent flex-shrink-0" />
                      <span className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{docFile.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileClear('doc')}
                        className="bg-transparent border-none cursor-pointer text-ink/60 p-0.5 hover:text-red-500 transition-colors flex"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer toolbar */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-accent/10 bg-accent/5 backdrop-blur-md">
              {/* Attach buttons — each is a proper <button> that triggers a hidden <input> via ref */}
              <div className="flex gap-1.5">
                {/* Image button */}
                <button
                  type="button"
                  id="add-image-btn"
                  title="Add image"
                  onClick={() => imageRef.current?.click()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${
                    imageFile
                      ? 'bg-accent/20 text-accent border-accent/30'
                      : 'text-ink/60 hover:bg-accent/10 hover:text-accent border-transparent hover:border-accent/20'
                  }`}
                >
                  <ImageIcon size={18} strokeWidth={2.5} />
                </button>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden' }}
                  tabIndex={-1}
                  aria-hidden="true"
                />

                {/* Video button */}
                <button
                  type="button"
                  id="add-video-btn"
                  title="Add video"
                  onClick={() => videoRef.current?.click()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${
                    videoFile
                      ? 'bg-accent/20 text-accent border-accent/30'
                      : 'text-ink/60 hover:bg-accent/10 hover:text-accent border-transparent hover:border-accent/20'
                  }`}
                >
                  <Film size={18} strokeWidth={2.5} />
                </button>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden' }}
                  tabIndex={-1}
                  aria-hidden="true"
                />

                {/* Document button */}
                <button
                  type="button"
                  id="add-doc-btn"
                  title="Add document"
                  onClick={() => docRef.current?.click()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${
                    docFile
                      ? 'bg-accent/20 text-accent border-accent/30'
                      : 'text-ink/60 hover:bg-accent/10 hover:text-accent border-transparent hover:border-accent/20'
                  }`}
                >
                  <FileText size={18} strokeWidth={2.5} />
                </button>
                <input
                  ref={docRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleDocChange}
                  style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden' }}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              {/* Post button */}
              <button
                type="submit"
                id="submit-post-btn"
                disabled={isSubmitting || isEmpty}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                  isEmpty || isSubmitting
                    ? 'bg-ink/10 text-ink/40 cursor-not-allowed shadow-none'
                    : 'bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/30 hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block animate-spin" /> Posting…</>
                  : <><Send size={16} strokeWidth={2.5} /> Post</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Tip */}
        <div className="flex items-start sm:items-center gap-3 mt-6 p-4 bg-accent/5 rounded-2xl border border-accent/20 border-dashed">
          <div className="p-1.5 bg-accent/10 rounded-lg text-accent flex-shrink-0">
            <Info size={16} strokeWidth={2.5} />
          </div>
          <p className="font-sans text-sm font-medium text-ink/70 m-0">
            Keep it constructive — share academic content, campus events, or helpful resources.
            Images up to 5 MB · Videos up to 20 MB · PDFs/DOCX supported.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePost;
