import { useState, useEffect } from 'react';
import { adminApi } from '../../api/blogApi';
import { Card, Badge, Spinner, Pagination, Button } from '../../components/ui';
import { CreditCard, ShieldCheck, Clock, CheckCircle, XCircle, MoreVertical, RotateCcw, Trash, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const AdminPaymentsPage = () => {
    const [activeTab, setActiveTab] = useState('payments');

    // Payments State
    const [payments, setPayments] = useState([]);
    const [payPagination, setPayPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [payLoading, setPayLoading] = useState(true);
    const [payStatus, setPayStatus] = useState('');

    // Subscriptions State
    const [subs, setSubs] = useState([]);
    const [subPagination, setSubPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [subLoading, setSubLoading] = useState(true);
    const [subStatus, setSubStatus] = useState('active');

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'payments') loadPayments();
        else loadSubs();
    }, [activeTab, payStatus, subStatus]);

    const loadPayments = async (page = 0) => {
        setPayLoading(true);
        try {
            const params = { page, size: 20 };
            if (payStatus) params.status = payStatus;
            const r = await adminApi.getPayments(params);
            setPayments(r.data.content);
            setPayPagination({ page: r.data.page.number, totalPages: r.data.page.totalPages, totalElements: r.data.page.totalElements });
        } catch { toast.error('Failed to load payments'); }
        finally { setPayLoading(false); }
    };

    const loadSubs = async (page = 0) => {
        setSubLoading(true);
        try {
            const params = { page, size: 20 };
            if (subStatus) params.status = subStatus;
            const r = await adminApi.getSubscriptions(params);
            setSubs(r.data.content);
            setSubPagination({ page: r.data.page.number, totalPages: r.data.page.totalPages, totalElements: r.data.page.totalElements });
        } catch { toast.error('Failed to load subscriptions'); }
        finally { setSubLoading(false); }
    };

    const handleRefundPayment = async (id) => {
        if (!window.confirm("Mark as refunded?")) return;
        setActionLoading(true);
        try {
            await adminApi.updatePaymentStatus(id, 'REFUNDED');
            toast.success('Payment marked as refunded');
            loadPayments(payPagination.page);
        } catch { toast.error('Failed to refund'); }
        finally { setActionLoading(false); }
    };

    const handleRevokeSub = async (id) => {
        if (!window.confirm("Revoke this entitlement permanently?")) return;
        setActionLoading(true);
        try {
            await adminApi.deleteSubscription(id);
            toast.success('Entitlement revoked');
            loadSubs(subPagination.page);
        } catch { toast.error('Failed to revoke'); }
        finally { setActionLoading(false); }
    };

    const handleExtendSub = async (sub) => {
        if (!sub.endAt) {
            toast.error("Cannot extend lifetime access.");
            return;
        }
        setActionLoading(true);
        try {
            const currentEnd = new Date(sub.endAt);
            currentEnd.setMonth(currentEnd.getMonth() + 1); // Extend by 1 month
            await adminApi.updateSubscription(sub.id, { endAt: currentEnd.toISOString() });
            toast.success('Extended by 1 month');
            loadSubs(subPagination.page);
        } catch { toast.error('Failed to extend'); }
        finally { setActionLoading(false); }
    };

    const statusBadge = (s) => {
        switch (s) {
            case 'SUCCESS': return <Badge variant="success">Success</Badge>;
            case 'FAILED': return <Badge variant="danger">Failed</Badge>;
            case 'REFUNDED': return <Badge variant="warning">Refunded</Badge>;
            case 'CREATED': return <Badge variant="neutral">Pending</Badge>;
            default: return <Badge variant="neutral">{s}</Badge>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-text-primary mb-8">Finance & Subscriptions</h1>

            {/* Tabs & Filters */}
            <div className="flex border-b border-border-primary mb-6 gap-6 justify-between items-center">
                <div className="flex gap-6">
                    <button
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-text-tertiary hover:text-text-primary'}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        <CreditCard className="w-4 h-4 inline mr-2" /> Payments
                    </button>
                    <button
                        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'subs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-text-tertiary hover:text-text-primary'}`}
                        onClick={() => setActiveTab('subs')}
                    >
                        <ShieldCheck className="w-4 h-4 inline mr-2" /> Entitlements
                    </button>
                </div>

                {/* Filters */}
                {activeTab === 'payments' ? (
                    <select
                        value={payStatus}
                        onChange={(e) => setPayStatus(e.target.value)}
                        className="input-clean bg-bg-secondary text-sm py-1 mb-2"
                    >
                        <option value="">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                ) : (
                    <select
                        value={subStatus}
                        onChange={(e) => setSubStatus(e.target.value)}
                        className="input-clean bg-bg-secondary text-sm py-1 mb-2"
                    >
                        <option value="all">All Entitlements</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                    </select>
                )}
            </div>

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-bg-tertiary text-text-tertiary uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Transaction Details</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-secondary">
                                {payLoading ? (
                                    <tr><td colSpan="6" className="py-10 text-center"><Spinner /></td></tr>
                                ) : payments.length === 0 ? (
                                    <tr><td colSpan="6" className="py-10 text-center text-text-tertiary">No payments found</td></tr>
                                ) : payments.map(p => (
                                    <tr key={p.id} className="hover:bg-bg-secondary transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-text-primary">{p.providerOrderId}</p>
                                            <p className="text-xs text-text-tertiary">{format(new Date(p.createdAt), 'MMM d, yyyy HH:mm')}</p>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{p.userId}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-1 rounded text-xs font-medium border border-primary-200 dark:border-primary-800">
                                                {p.entitlementType}
                                            </span>
                                            <p className="text-xs text-text-tertiary mt-1 max-w-[150px] truncate">{p.scopeId}</p>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-text-primary">₹{(p.amountPaise / 100).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">{statusBadge(p.status)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {p.status === 'SUCCESS' && (
                                                <Button size="sm" variant="ghost" onClick={() => handleRefundPayment(p.id)} disabled={actionLoading}>
                                                    <RotateCcw className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {payPagination.totalPages > 1 && (
                        <div className="p-4 border-t border-border-secondary">
                            <Pagination
                                currentPage={payPagination.page}
                                totalPages={payPagination.totalPages}
                                onPageChange={loadPayments}
                            />
                        </div>
                    )}
                </Card>
            )}

            {/* SUBSCRIPTIONS TAB */}
            {activeTab === 'subs' && (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-bg-tertiary text-text-tertiary uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Entitlement Scope</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Granted On</th>
                                    <th className="px-6 py-4">Validity</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-secondary">
                                {subLoading ? (
                                    <tr><td colSpan="5" className="py-10 text-center"><Spinner /></td></tr>
                                ) : subs.length === 0 ? (
                                    <tr><td colSpan="5" className="py-10 text-center text-text-tertiary">No entitlements found</td></tr>
                                ) : subs.map(s => {
                                    const isExpired = s.endAt && new Date(s.endAt) < new Date();
                                    return (
                                        <tr key={s.id} className="hover:bg-bg-secondary transition-colors">
                                            <td className="px-6 py-4">
                                                <Badge className="mb-1">{s.type}</Badge>
                                                <p className="text-xs text-text-secondary mt-1 max-w-[200px] truncate font-mono">
                                                    Target: {s.scopeId || s.blogId || 'GLOBAL'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">{s.userId}</td>
                                            <td className="px-6 py-4 text-text-secondary">
                                                {format(new Date(s.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {!s.endAt ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lifetime Access</span>
                                                ) : isExpired ? (
                                                    <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Expired {format(new Date(s.endAt), 'MMM d, yy')}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Until {format(new Date(s.endAt), 'MMM d, yy')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {s.endAt && !isExpired && (
                                                        <Button size="sm" variant="ghost" title="Extend 1 Month" onClick={() => handleExtendSub(s)} disabled={actionLoading}>
                                                            <Plus className="w-4 h-4 text-emerald-500" />
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" title="Revoke" onClick={() => handleRevokeSub(s.id)} disabled={actionLoading}>
                                                        <Trash className="w-4 h-4 text-rose-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {subPagination.totalPages > 1 && (
                        <div className="p-4 border-t border-border-secondary">
                            <Pagination
                                currentPage={subPagination.page}
                                totalPages={subPagination.totalPages}
                                onPageChange={loadSubs}
                            />
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};
