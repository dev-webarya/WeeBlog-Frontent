import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogApi } from '../../api/blogApi';
import { useUserAuth } from '../../context/AuthContext';
import { Card, Badge, Spinner, Button, TextArea, Input, TagBadge } from '../../components/ui';
import { Heart, ThumbsDown, MessageCircle, Eye, Clock, ArrowLeft, Send, User, Lock, Crown, CreditCard, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useSeo } from '../../hooks/useSeo';

const getVisitorKey = () => {
    let key = localStorage.getItem('visitorKey');
    if (!key) { key = 'visitor_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9); localStorage.setItem('visitorKey', key); }
    return key;
};

export const BlogDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useUserAuth();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [reactionStatus, setReactionStatus] = useState(null);
    const [commentForm, setCommentForm] = useState({ name: '', commentText: '', website: '' });
    const [submitting, setSubmitting] = useState(false);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [readingProgress, setReadingProgress] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);

    useSeo({
        title: blog?.title,
        description: blog?.excerpt,
        url: window.location.href,
        imageUrl: blog?.featuredImageUrl
    });

    // Reading progress bar
    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? Math.min((window.scrollY / scrollHeight) * 100, 100) : 0;
            setReadingProgress(progress);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Anti-copy keyboard shortcuts (Ctrl+C, Ctrl+P, Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (blog?.premium && blog?.hasEntitlement) {
                if ((e.ctrlKey || e.metaKey) && ['c', 'p', 's', 'a'].includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    toast('This action is disabled for premium content', { icon: '🔒' });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [blog]);

    useEffect(() => {
        const loadBlog = async () => {
            setLoading(true);
            try {
                const response = await blogApi.getBlogBySlug(slug);
                setBlog(response.data);
                loadComments(response.data.id);
                loadReactions(response.data.id);
                loadRelatedPosts(response.data);
            } catch (err) { toast.error('Blog not found'); }
            finally { setLoading(false); }
        };
        loadBlog();
    }, [slug]);

    const loadComments = async (blogId) => {
        setCommentsLoading(true);
        try { const r = await blogApi.getComments(blogId, { size: 50 }); setComments(r.data.content); }
        catch (err) { console.error('Failed to load comments'); }
        finally { setCommentsLoading(false); }
    };

    const loadReactions = async (blogId) => {
        try { const r = await blogApi.getReactionStatus(blogId, getVisitorKey()); setReactionStatus(r.data); }
        catch (err) { console.error('Failed to load reactions'); }
    };

    const loadRelatedPosts = async (blogData) => {
        try {
            const params = { size: 3, sort: 'popular' };
            if (blogData.sectionId) params.sectionId = blogData.sectionId;
            const r = await blogApi.getBlogs(params);
            setRelatedPosts(r.data.content.filter(b => b.slug !== blogData.slug).slice(0, 3));
        } catch { /* ignore */ }
    };

    const handleReaction = async (reactionType) => {
        if (!blog) return;
        try {
            const r = await blogApi.toggleReaction(blog.id, { reactionType, visitorKey: getVisitorKey() });
            setReactionStatus(r.data);
            setBlog(prev => ({ ...prev, likesCount: r.data.likesCount, dislikesCount: r.data.dislikesCount }));
        } catch (err) { toast.error('Failed to react'); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!blog || !commentForm.name.trim() || !commentForm.commentText.trim()) return;
        setSubmitting(true);
        try {
            await blogApi.postComment(blog.id, commentForm);
            toast.success('Comment posted!');
            setCommentForm({ name: '', commentText: '', website: '' });
            loadComments(blog.id);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to post comment'); }
        finally { setSubmitting(false); }
    };

    const shareUrl = window.location.href;
    const shareTitle = blog?.title || '';

    const shareLinks = [
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, color: 'hover:text-sky-500' },
        { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: 'hover:text-blue-600' },
        { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, color: 'hover:text-blue-700' },
        { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, color: 'hover:text-emerald-500' },
    ];

    if (loading) return <div className="py-20"><Spinner size="lg" /></div>;
    if (!blog) return <div className="text-center py-20 text-text-tertiary text-lg">Blog not found</div>;

    const isPremium = blog.premium;
    const hasAccess = blog.hasEntitlement;
    const showPaywall = isPremium && !hasAccess;

    return (
        <>
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent">
                <div className="h-full bg-text-primary transition-all duration-150"
                    style={{ width: `${readingProgress}%` }} />
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10">
                <Link to="/blogs" className="inline-flex items-center text-text-tertiary hover:text-text-primary mb-6 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Blogs
                </Link>

                <article>
                    {blog.featuredImageUrl && (
                        <img src={blog.featuredImageUrl} alt={blog.title} className="w-full h-64 md:h-80 object-cover rounded-xl mb-8" />
                    )}

                    <div className="flex items-center gap-2 mb-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">{blog.title}</h1>
                        {isPremium && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold">
                                <Crown className="w-3 h-3" /> Premium
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-text-tertiary text-sm mb-6">
                        <span className="flex items-center gap-1"><User className="w-4 h-4" />{blog.authorName}</span>
                        {blog.publishedAt && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{format(new Date(blog.publishedAt), 'MMMM dd, yyyy')}</span>}
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{blog.viewsCount} views</span>
                        {blog.sectionName && (
                            <Link to={`/section/${blog.sectionSlug}`} className="text-indigo-500 hover:text-indigo-600 transition-colors">
                                {blog.sectionName}
                            </Link>
                        )}

                        {/* Share button */}
                        <div className="relative ml-auto">
                            <button onClick={() => setShowShareMenu(!showShareMenu)}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all text-xs font-medium">
                                <Share2 className="w-3.5 h-3.5" /> Share
                            </button>
                            {showShareMenu && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-bg-primary border border-border-primary rounded-xl shadow-lg py-2 z-50">
                                    {shareLinks.map(link => (
                                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                                            className={`block px-4 py-2 text-sm text-text-secondary ${link.color} transition-colors`}
                                            onClick={() => setShowShareMenu(false)}>
                                            {link.name}
                                        </a>
                                    ))}
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(shareUrl);
                                        toast.success('Link copied!');
                                        setShowShareMenu(false);
                                    }}
                                        className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                                        Copy Link
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-8">
                        {blog.tags?.map((tag) => <TagBadge key={tag} tag={tag} />)}
                    </div>

                    {/* Blog Content */}
                    <div className={`blog-content mb-2 border-t border-border-secondary pt-8 ${showPaywall ? 'relative' : ''}`}
                        ref={(el) => {
                            if (!el) return;
                            el.querySelectorAll('img').forEach(img => {
                                img.onerror = function () {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'blog-img-fallback';
                                    fallback.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline><line x1="2" y1="2" x2="22" y2="22"></line></svg><span>Image not available</span>`;
                                    this.replaceWith(fallback);
                                };
                            });
                        }}
                        dangerouslySetInnerHTML={{ __html: blog.contentHtml || '' }} />

                    {/* Paywall Prompt */}
                    {showPaywall && (
                        <div className="relative -mt-16 pt-24 pb-0">
                            <div className="absolute inset-x-0 -top-20 h-24 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
                            <div className="text-center bg-bg-secondary border border-border-primary rounded-2xl p-8 shadow-sm">
                                <div className="w-14 h-14 bg-bg-primary border border-border-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Lock className="w-6 h-6 text-text-secondary" />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Premium Content</h3>
                                <p className="text-text-tertiary mb-6 max-w-md mx-auto">
                                    The rest of this article is available to premium subscribers.
                                    Unlock it with a single purchase or a subscription plan.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <Button onClick={() => navigate('/pricing', { state: { blogId: blog.id, sectionId: blog.sectionId, subsectionId: blog.subsectionId, title: blog.title } })} className="shadow-sm">
                                        <CreditCard className="w-4 h-4 inline mr-1.5" />
                                        View Plans & Unlock
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Anti-copy for premium content (Part 2) */}
                    {isPremium && hasAccess && (
                        <div className="relative overflow-hidden">
                            {/* Watermark Overlay */}
                            <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.04] dark:opacity-[0.02] flex flex-wrap gap-x-12 gap-y-24 justify-center items-center select-none" aria-hidden="true">
                                {Array.from({ length: 40 }).map((_, i) => (
                                    <span key={i} className="transform -rotate-45 whitespace-nowrap text-xl font-bold text-text-primary uppercase tracking-widest break-all">
                                        WEEBLOGS - PREMIUM
                                    </span>
                                ))}
                            </div>

                            <div className="blog-content mb-10 select-none relative z-20"
                                onCopy={(e) => { e.preventDefault(); toast('Content copying is disabled', { icon: '🔒' }); }}
                                onContextMenu={(e) => { e.preventDefault(); }}
                                style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
                                dangerouslySetInnerHTML={{ __html: blog.contentPart2Html || '' }} />
                        </div>
                    )}

                    {/* Reactions */}
                    <div className="flex items-center gap-3 mb-10 pb-8 border-b border-border-secondary mt-8">
                        <button onClick={() => handleReaction('LIKE')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm ${reactionStatus?.userReaction === 'LIKE' ? 'bg-text-primary text-bg-primary border-text-primary' : 'border-border-primary text-text-secondary hover:border-text-tertiary'
                                }`}>
                            <Heart className={`w-4 h-4 ${reactionStatus?.userReaction === 'LIKE' ? 'fill-current' : ''}`} />
                            <span className="font-medium">{blog.likesCount}</span>
                        </button>
                        <button onClick={() => handleReaction('DISLIKE')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm ${reactionStatus?.userReaction === 'DISLIKE' ? 'bg-red-600 text-white border-red-600' : 'border-border-primary text-text-secondary hover:border-text-tertiary'
                                }`}>
                            <ThumbsDown className={`w-4 h-4 ${reactionStatus?.userReaction === 'DISLIKE' ? 'fill-current' : ''}`} />
                            <span className="font-medium">{blog.dislikesCount}</span>
                        </button>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-text-primary mb-5">Related Posts</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {relatedPosts.map((post) => (
                                    <Link to={`/blogs/${post.slug}`} key={post.id}>
                                        <Card hover className="h-full">
                                            {post.featuredImageUrl && (
                                                <img src={post.featuredImageUrl} alt={post.title} className="w-full h-28 object-cover rounded-lg mb-3" />
                                            )}
                                            <div className="flex items-start gap-1.5 mb-1">
                                                <h3 className="text-sm font-semibold text-text-primary line-clamp-2 flex-1">{post.title}</h3>
                                                {post.premium && (
                                                    <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold">
                                                        <Crown className="w-2.5 h-2.5" /> PRO
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-tertiary line-clamp-2">{post.excerpt}</p>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Comments */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" /> Comments ({comments.length})
                        </h2>

                        <Card className="mb-8">
                            <form onSubmit={handleComment} className="space-y-4">
                                <Input label="Your Name" placeholder="Enter your name" value={commentForm.name}
                                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })} required />
                                <input type="hidden" name="website" value={commentForm.website}
                                    onChange={(e) => setCommentForm({ ...commentForm, website: e.target.value })} />
                                <TextArea label="Comment" placeholder="Write your comment..." value={commentForm.commentText}
                                    onChange={(e) => setCommentForm({ ...commentForm, commentText: e.target.value })} rows={3} required />
                                <Button type="submit" disabled={submitting}>
                                    <Send className="w-4 h-4 inline mr-1.5" />{submitting ? 'Posting...' : 'Post Comment'}
                                </Button>
                            </form>
                        </Card>

                        {commentsLoading ? <Spinner /> : comments.length === 0 ? (
                            <p className="text-text-tertiary text-center py-6 text-sm">No comments yet. Be the first to comment!</p>
                        ) : (
                            <div className="space-y-3">
                                {comments.map((c) => (
                                    <Card key={c.id}>
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-semibold text-text-secondary">
                                                {c.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary text-sm">{c.name}</p>
                                                <p className="text-xs text-text-tertiary">{c.createdAt && format(new Date(c.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                                            </div>
                                        </div>
                                        <p className="text-text-secondary text-sm">{c.commentText}</p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </article>
            </div>
        </>
    );
};
