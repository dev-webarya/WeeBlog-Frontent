import { useState, useEffect } from 'react';
import { adminApi } from '../../api/blogApi';
import { Card, Badge, Spinner, Pagination } from '../../components/ui';
import { Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const SubscribersPage = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [pageSize, setPageSize] = useState(20);

    const fetchSubscribers = async (params = {}) => {
        setLoading(true);
        try {
            const currentSize = params.size !== undefined ? params.size : pageSize;
            const r = await adminApi.getSubscribers({ status: params.status !== undefined ? params.status : statusFilter, page: params.page || 0, size: currentSize });
            setSubscribers(r.data.content);
            setPagination({ page: r.data.page, totalPages: r.data.totalPages, totalElements: r.data.totalElements });
        } catch (err) { toast.error('Failed to load subscribers'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSubscribers(); }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-text-secondary" />
                    <h1 className="text-3xl font-bold text-text-primary">Subscribers</h1>
                </div>
                <span className="text-text-tertiary text-sm">{pagination.totalElements} total</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {['', 'ACTIVE', 'UNSUBSCRIBED'].map((s) => (
                    <button key={s} onClick={() => { setStatusFilter(s); fetchSubscribers({ status: s, page: 0 }); }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${statusFilter === s ? 'bg-text-primary text-bg-primary' : 'border border-border-primary text-text-secondary hover:border-text-secondary'}`}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {loading ? <Spinner size="lg" /> : subscribers.length === 0 ? (
                <Card><p className="text-center text-text-tertiary py-8">No subscribers found</p></Card>
            ) : (
                <>
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        <div className="col-span-5">Email</div>
                        <div className="col-span-3">Status</div>
                        <div className="col-span-4">Date</div>
                    </div>

                    <div className="space-y-3">
                        {subscribers.map((sub) => (
                            <Card key={sub.id}>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                    <div className="col-span-5 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-semibold text-text-secondary shrink-0">
                                            {sub.email?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="text-text-primary text-sm truncate">{sub.email}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'danger'}>{sub.status}</Badge>
                                    </div>
                                    <div className="col-span-4 text-text-tertiary text-sm flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {(sub.subscribedAt || sub.createdAt) ? format(new Date(sub.subscribedAt || sub.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => fetchSubscribers({ page: p })}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => { setPageSize(newSize); fetchSubscribers({ page: 0, size: newSize }); }}
                    />
                </>
            )}
        </div>
    );
};
