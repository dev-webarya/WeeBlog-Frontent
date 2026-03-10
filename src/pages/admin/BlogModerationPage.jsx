import { useState, useEffect } from 'react';
import { adminApi, sectionApi } from '../../api/blogApi';
import { Card, Badge, Spinner, Button, TextArea, Input, Pagination, TagBadge } from '../../components/ui';
import { ContentEditor } from '../../components/editor/ContentEditor';
import { CheckCircle, XCircle, Edit3, Eye, X, ArrowLeft, Save, AlertTriangle, Star, Crown, Lock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BlogModerationPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [pageSize, setPageSize] = useState(10);
    const [viewBlog, setViewBlog] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [approveModal, setApproveModal] = useState(null);
    const [approveRating, setApproveRating] = useState(5);
    const [approveSectionId, setApproveSectionId] = useState('');
    const [approveSubsectionId, setApproveSubsectionId] = useState('');
    const [sections, setSections] = useState([]);
    const [subsections, setSubsections] = useState([]);

    const fetchBlogs = async (params = {}) => {
        setLoading(true);
        try {
            const currentSize = params.size !== undefined ? params.size : pageSize;
            const r = await adminApi.getAdminBlogs({ status: params.status !== undefined ? params.status : statusFilter, page: params.page || 0, size: currentSize });
            setBlogs(r.data.content);
            setPagination({ page: r.data.page, totalPages: r.data.totalPages, totalElements: r.data.totalElements });
        } catch (err) { toast.error('Failed to load blogs'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBlogs(); loadSections(); }, []);

    const loadSections = async () => {
        try {
            const r = await sectionApi.getSections();
            setSections(r.data);
        } catch { /* silent */ }
    };

    const loadSubsections = async (sectionId) => {
        if (!sectionId) { setSubsections([]); return; }
        const sec = sections.find(s => s.id === sectionId);
        if (sec) {
            try {
                const r = await sectionApi.getSubsections(sec.slug);
                setSubsections(r.data);
            } catch { setSubsections([]); }
        }
    };

    const handleStatusFilter = (s) => { setStatusFilter(s); fetchBlogs({ status: s, page: 0 }); };

    const openApproveModal = (blog) => {
        setApproveModal(blog);
        setApproveRating(blog.internalRating || 5);
        setApproveSectionId(blog.sectionId || '');
        setApproveSubsectionId(blog.subsectionId || '');
    };

    const handleApprove = async () => {
        if (!approveModal) return;
        setActionLoading(true);
        try {
            await adminApi.approveBlog(approveModal.id, {
                adminId: 'admin',
                internalRating: approveRating,
                sectionId: approveSectionId || null,
                subsectionId: approveSubsectionId || null,
            });
            toast.success('Blog approved successfully!');
            setApproveModal(null);
            fetchBlogs();
            setViewBlog(null);
            setIsEditing(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) { toast.error('Reason required'); return; }
        setActionLoading(true);
        try { await adminApi.rejectBlog(rejectModal.id, { reason: rejectReason }); toast.success('Blog rejected'); setRejectModal(null); setRejectReason(''); fetchBlogs(); setViewBlog(null); setIsEditing(false); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleSaveEdit = async () => {
        setActionLoading(true);
        try {
            await adminApi.editBlog(viewBlog.id, {
                title: editForm.title, excerpt: editForm.excerpt, contentHtml: editForm.contentHtml,
                tags: typeof editForm.tags === 'string' ? editForm.tags.split(',').map(t => t.trim()) : editForm.tags,
                featuredImageUrl: editForm.featuredImageUrl,
                internalRating: editForm.internalRating,
                sectionId: editForm.sectionId,
                subsectionId: editForm.subsectionId
            });
            toast.success('Changes saved!');
            // Update the viewBlog with new data
            setViewBlog(prev => ({ ...prev, ...editForm, tags: typeof editForm.tags === 'string' ? editForm.tags.split(',').map(t => t.trim()) : editForm.tags }));
            setIsEditing(false);
            fetchBlogs();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
        finally { setActionLoading(false); }
    };

    const openView = (blog) => {
        setViewBlog(blog);
        setIsEditing(false);
        setEditForm({
            title: blog.title, excerpt: blog.excerpt,
            contentHtml: blog.contentHtml || blog.content || '',
            tags: blog.tags?.join(', ') || '',
            featuredImageUrl: blog.featuredImageUrl || '',
            internalRating: blog.internalRating || 5,
            sectionId: blog.sectionId || '',
            subsectionId: blog.subsectionId || ''
        });
        if (blog.sectionId) {
            loadSubsections(blog.sectionId);
        }
    };

    const toggleEdit = () => {
        if (!isEditing) {
            setEditForm({
                title: viewBlog.title, excerpt: viewBlog.excerpt,
                contentHtml: viewBlog.contentHtml || viewBlog.content || '',
                tags: viewBlog.tags?.join(', ') || '',
                featuredImageUrl: viewBlog.featuredImageUrl || '',
                internalRating: viewBlog.internalRating || 5,
                sectionId: viewBlog.sectionId || '',
                subsectionId: viewBlog.subsectionId || ''
            });
            if (viewBlog.sectionId) {
                loadSubsections(viewBlog.sectionId);
            }
        }
        setIsEditing(!isEditing);
    };

    const statusBadge = (status) => {
        const map = { PUBLISHED: 'success', PENDING: 'warning', REJECTED: 'danger', DRAFT: 'info' };
        return <Badge variant={map[status] || 'info'}>{status}</Badge>;
    };

    // Full-page blog view/edit
    if (viewBlog) {
        return (
            <div className="min-h-screen bg-bg-primary">
                {/* Sticky top bar */}
                <div className="sticky top-0 z-20 bg-bg-card/90 backdrop-blur-lg border-b border-border-primary shadow-sm">
                    <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                        <button onClick={() => { setViewBlog(null); setIsEditing(false); }}
                            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to list
                        </button>
                        <div className="flex items-center gap-2">
                            {statusBadge(viewBlog.status)}

                            {/* Edit / View toggle */}
                            <div className="flex items-center bg-bg-tertiary rounded-lg p-0.5 ml-2">
                                <button onClick={() => setIsEditing(false)}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!isEditing ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}>
                                    <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                <button onClick={toggleEdit}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isEditing ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}>
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                            </div>

                            {isEditing && (
                                <button onClick={handleSaveEdit} disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-text-primary text-bg-primary hover:opacity-90 transition-all disabled:opacity-50">
                                    <Save className="w-3.5 h-3.5" /> {actionLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content area */}
                <div className="max-w-3xl mx-auto px-6 py-10">
                    {isEditing ? (
                        /* ── Edit Mode ── */
                        <div className="space-y-6">
                            {/* Featured Image */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Featured Image URL</label>
                                <Input value={editForm.featuredImageUrl} onChange={(e) => setEditForm({ ...editForm, featuredImageUrl: e.target.value })} placeholder="https://images.unsplash.com/..." />
                                {editForm.featuredImageUrl && (
                                    <img src={editForm.featuredImageUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl mt-3 border border-border-secondary" />
                                )}
                            </div>

                            {/* Section & Subsection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Section</label>
                                    <select
                                        className="w-full bg-transparent border border-border-primary rounded-lg px-4 py-2 text-text-primary outline-none focus:border-indigo-500 transition-colors"
                                        value={editForm.sectionId}
                                        onChange={(e) => {
                                            const newSectionId = e.target.value;
                                            setEditForm({ ...editForm, sectionId: newSectionId, subsectionId: '' });
                                            loadSubsections(newSectionId);
                                        }}
                                        required
                                    >
                                        <option value="" disabled className="bg-bg-primary">Select a section</option>
                                        {sections.map(s => (
                                            <option key={s.id} value={s.id} className="bg-bg-primary">{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Subsection</label>
                                    <select
                                        className="w-full bg-transparent border border-border-primary rounded-lg px-4 py-2 text-text-primary outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                                        value={editForm.subsectionId}
                                        onChange={(e) => setEditForm({ ...editForm, subsectionId: e.target.value })}
                                        disabled={!editForm.sectionId}
                                        required
                                    >
                                        <option value="" disabled className="bg-bg-primary">Select a subsection</option>
                                        {subsections.map(s => (
                                            <option key={s.id} value={s.id} className="bg-bg-primary">{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Title</label>
                                <input type="text" value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full text-3xl font-bold text-text-primary bg-transparent border-b-2 border-border-primary focus:border-text-primary outline-none pb-2 transition-colors"
                                    placeholder="Blog title..." />
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Excerpt</label>
                                <textarea value={editForm.excerpt}
                                    onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                                    className="w-full text-lg text-text-secondary bg-transparent border border-border-primary rounded-lg p-3 outline-none focus:border-text-tertiary transition-colors resize-none"
                                    rows={2} placeholder="Brief summary..." />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Tags (comma separated)</label>
                                <Input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="react, tutorial, web-dev" />
                            </div>

                            {/* Internal Rating */}
                            <div className="bg-bg-tertiary/50 p-4 rounded-xl border border-border-secondary">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Internal Rating</label>
                                <div className="flex items-center gap-3">
                                    <input type="range" min="1" max="10" value={editForm.internalRating}
                                        onChange={(e) => setEditForm({ ...editForm, internalRating: Number(e.target.value) })}
                                        className="flex-1 accent-indigo-500" />
                                    <span className={`text-xl font-bold w-8 text-center ${editForm.internalRating > 6 ? 'text-amber-500' : 'text-text-primary'}`}>
                                        {editForm.internalRating}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    {editForm.internalRating > 6 ? (
                                        <span className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                                            <Crown className="w-3 h-3" /> Premium — content will be paywalled
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                                            <Star className="w-3 h-3" /> Free — fully accessible
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Content</label>
                                <ContentEditor
                                    initialContent={editForm.contentHtml}
                                    onChange={(html) => setEditForm(prev => ({ ...prev, contentHtml: html }))}
                                />
                            </div>
                        </div>
                    ) : (
                        /* ── View Mode ── */
                        <>
                            {/* Featured Image */}
                            {viewBlog.featuredImageUrl && (
                                <img src={viewBlog.featuredImageUrl} alt={viewBlog.title}
                                    className="w-full h-64 md:h-80 object-cover rounded-xl mb-8 border border-border-secondary" />
                            )}

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">{viewBlog.title}</h1>

                            {/* Excerpt */}
                            <p className="text-text-secondary text-lg mb-6 leading-relaxed italic">{viewBlog.excerpt}</p>

                            {/* Meta bar */}
                            <div className="flex flex-wrap items-center gap-4 text-text-tertiary text-sm mb-6 pb-6 border-b border-border-secondary">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    <strong className="text-text-secondary">{viewBlog.authorName}</strong>
                                </span>
                                <span>{viewBlog.authorEmail}</span>
                                {viewBlog.createdAt && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        {format(new Date(viewBlog.createdAt), 'MMMM dd, yyyy')}
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            {viewBlog.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-8">
                                    {viewBlog.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                                </div>
                            )}

                            {/* Blog Content */}
                            <div className="blog-content mb-10"
                                ref={(el) => {
                                    if (!el) return;
                                    el.querySelectorAll('img').forEach(img => {
                                        img.onerror = function () {
                                            const fb = document.createElement('div');
                                            fb.className = 'blog-img-fallback';
                                            fb.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline><line x1="2" y1="2" x2="22" y2="22"></line></svg><span>Image not available</span>';
                                            this.replaceWith(fb);
                                        };
                                    });
                                }}
                                dangerouslySetInnerHTML={{ __html: viewBlog.contentHtml || viewBlog.content || '' }} />
                        </>
                    )}

                    {/* ── Action Buttons (always visible at bottom) ── */}
                    {viewBlog.status === 'PENDING' && (
                        <div className="mt-10 pt-8 border-t border-border-secondary">
                            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Moderation Actions</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Approve Button */}
                                <button onClick={() => openApproveModal(viewBlog)} disabled={actionLoading}
                                    className="group flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50
                                        bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25
                                        hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]">
                                    <CheckCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    Approve & Publish
                                </button>

                                {/* Reject Button */}
                                <button onClick={() => { setRejectModal(viewBlog); setRejectReason(''); }} disabled={actionLoading}
                                    className="group flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50
                                        bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25
                                        hover:from-red-600 hover:to-red-700 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]">
                                    <XCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    Reject Blog
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Reject Reason Dialog */}
                {rejectModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setRejectModal(null)}>
                        <div className="bg-bg-card rounded-2xl border border-border-primary shadow-2xl p-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-primary">Reject Blog</h2>
                                    <p className="text-xs text-text-tertiary">{rejectModal.title}</p>
                                </div>
                            </div>
                            <TextArea label="Reason for rejection *" placeholder="Explain why this blog is being rejected..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
                            <div className="flex gap-2 mt-5">
                                <button onClick={() => setRejectModal(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border-primary text-text-secondary hover:bg-bg-hover transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleReject} disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50">
                                    {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Blog list view
    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-text-primary mb-8">Blog Moderation</h1>

            <div className="flex flex-wrap gap-2 mb-6">
                {['', 'PENDING', 'PUBLISHED', 'REJECTED', 'DRAFT'].map((s) => (
                    <button key={s} onClick={() => handleStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${statusFilter === s ? 'bg-text-primary text-bg-primary' : 'border border-border-primary text-text-secondary hover:border-text-secondary'}`}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {loading ? <Spinner size="lg" /> : blogs.length === 0 ? (
                <Card><p className="text-center text-text-tertiary py-8">No blogs found</p></Card>
            ) : (
                <div className="space-y-4">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="cursor-pointer hover:border-text-tertiary transition-colors" onClick={() => openView(blog)}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-text-primary truncate">{blog.title}</h3>
                                        {statusBadge(blog.status)}
                                    </div>
                                    <p className="text-text-secondary text-sm truncate">{blog.excerpt}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-text-tertiary">
                                        <span>By {blog.authorName}</span>
                                        {blog.createdAt && <span>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openView(blog)}
                                        className="p-2 rounded-lg border border-border-primary text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all" title="View">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { openView(blog); setIsEditing(true); }}
                                        className="p-2 rounded-lg border border-border-primary text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all" title="Edit">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    {blog.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => openApproveModal(blog)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all" title="Approve">
                                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                                            </button>
                                            <button onClick={() => { setRejectModal(blog); setRejectReason(''); }}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all" title="Reject">
                                                <XCircle className="w-3.5 h-3.5" /> Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => fetchBlogs({ page: p })}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => { setPageSize(newSize); fetchBlogs({ page: 0, size: newSize }); }}
                    />
                </div>
            )}

            {/* Reject modal for list view */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setRejectModal(null)}>
                    <div className="bg-bg-card rounded-2xl border border-border-primary shadow-2xl p-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-primary">Reject Blog</h2>
                                <p className="text-xs text-text-tertiary">{rejectModal.title}</p>
                            </div>
                        </div>
                        <TextArea label="Reason for rejection *" placeholder="Explain why this blog is being rejected..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => setRejectModal(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border-primary text-text-secondary hover:bg-bg-hover transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleReject} disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50">
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal with Rating & Section */}
            {approveModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setApproveModal(null)}>
                    <div className="bg-bg-card rounded-2xl border border-border-primary shadow-2xl p-6 max-w-lg w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-primary">Approve Blog</h2>
                                <p className="text-xs text-text-tertiary truncate max-w-xs">{approveModal.title}</p>
                            </div>
                        </div>

                        {/* Internal Rating */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Internal Rating</label>
                            <div className="flex items-center gap-3">
                                <input type="range" min="1" max="10" value={approveRating}
                                    onChange={(e) => setApproveRating(Number(e.target.value))}
                                    className="flex-1 accent-indigo-500" />
                                <span className={`text-xl font-bold w-8 text-center ${approveRating > 6 ? 'text-amber-500' : 'text-text-primary'}`}>
                                    {approveRating}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {approveRating > 6 ? (
                                    <span className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                                        <Crown className="w-3 h-3" /> Premium — content will be paywalled
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                                        <Star className="w-3 h-3" /> Free — fully accessible
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Section */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Section</label>
                            <select value={approveSectionId}
                                onChange={(e) => { setApproveSectionId(e.target.value); setApproveSubsectionId(''); loadSubsections(e.target.value); }}
                                className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-primary text-text-primary text-sm outline-none focus:border-indigo-500">
                                <option value="">No section</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* Subsection */}
                        {subsections.length > 0 && (
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">Subsection</label>
                                <select value={approveSubsectionId}
                                    onChange={(e) => setApproveSubsectionId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-primary text-text-primary text-sm outline-none focus:border-indigo-500">
                                    <option value="">No subsection</option>
                                    {subsections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button onClick={() => setApproveModal(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border-primary text-text-secondary hover:bg-bg-hover transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleApprove} disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50">
                                {actionLoading ? 'Approving...' : 'Confirm & Publish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
