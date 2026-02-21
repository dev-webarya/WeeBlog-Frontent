import { useState, useEffect } from 'react';
import { adminApi } from '../../api/blogApi';
import { Card, Spinner, Badge, Pagination } from '../../components/ui';
import { MessageCircle, EyeOff, Eye, Trash2, AlertTriangle, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminCommentsPage = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [pageSize, setPageSize] = useState(20);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchComments = async (params = {}) => {
        setLoading(true);
        try {
            const r = await adminApi.getAllComments({
                page: params.page || 0,
                size: params.size || pageSize,
            });
            setComments(r.data.content);
            setPagination({ page: r.data.page, totalPages: r.data.totalPages, totalElements: r.data.totalElements });
        } catch { toast.error('Failed to load comments'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchComments(); }, []);

    const handleHide = async (id) => {
        setActionLoading(true);
        try {
            await adminApi.hideComment(id);
            toast.success('Comment hidden');
            fetchComments({ page: pagination.page });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleUnhide = async (id) => {
        setActionLoading(true);
        try {
            await adminApi.unhideComment(id);
            toast.success('Comment restored');
            fetchComments({ page: pagination.page });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    const handleDelete = async (id) => {
        setActionLoading(true);
        try {
            await adminApi.deleteComment(id);
            toast.success('Comment deleted');
            setDeleteConfirm(null);
            fetchComments({ page: pagination.page });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setActionLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Comment Moderation</h1>
                    <p className="text-sm text-text-tertiary mt-1">
                        {pagination.totalElements} comment{pagination.totalElements !== 1 ? 's' : ''} total
                    </p>
                </div>
            </div>

            {loading ? <Spinner size="lg" /> : comments.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 mx-auto text-text-tertiary mb-3 opacity-40" />
                        <p className="text-text-tertiary">No comments found</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3">
                    {comments.map((c) => (
                        <Card key={c.id}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-bold text-text-secondary">
                                            {c.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary text-sm">{c.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-text-tertiary">
                                                <Clock className="w-3 h-3" />
                                                {c.createdAt && format(new Date(c.createdAt), 'MMM dd, yyyy HH:mm')}
                                                {c.status === 'HIDDEN' && (
                                                    <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 text-[10px] font-bold">HIDDEN</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-2">{c.commentText}</p>
                                    {c.blogTitle && (
                                        <p className="text-xs text-text-tertiary">
                                            On: <span className="font-medium text-text-secondary">{c.blogTitle}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {c.status === 'HIDDEN' ? (
                                        <button onClick={() => handleUnhide(c.id)} disabled={actionLoading}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                            title="Restore comment">
                                            <Eye className="w-3.5 h-3.5" /> Restore
                                        </button>
                                    ) : (
                                        <button onClick={() => handleHide(c.id)} disabled={actionLoading}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                                            title="Hide comment">
                                            <EyeOff className="w-3.5 h-3.5" /> Hide
                                        </button>
                                    )}
                                    <button onClick={() => setDeleteConfirm(c.id)} disabled={actionLoading}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                        title="Delete comment">
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => fetchComments({ page: p })}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => { setPageSize(newSize); fetchComments({ page: 0, size: newSize }); }}
                    />
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-bg-card rounded-2xl border border-border-primary shadow-2xl p-6 max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-primary">Delete Comment</h2>
                                <p className="text-xs text-text-tertiary">This action cannot be undone</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-border-primary text-text-secondary hover:bg-bg-hover transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50">
                                {actionLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
