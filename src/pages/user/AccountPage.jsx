import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/blogApi';
import { useUserAuth } from '../../context/AuthContext';
import { Card, Spinner, Button, Badge } from '../../components/ui';
import { User, Mail, Calendar, Crown, BookOpen, LogOut, Shield, CreditCard, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
    PER_BLOG: 'Single Blog',
    SUBSCRIPTION_SUBSECTION: 'Subsection',
    SUBSCRIPTION_SECTION: 'Section',
    SUBSCRIPTION_ALL: 'All Access',
};

export const AccountPage = () => {
    const navigate = useNavigate();
    const { user, isLoggedIn, loading: authLoading, logout } = useUserAuth();
    const [entitlements, setEntitlements] = useState([]);
    const [entLoading, setEntLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [payLoading, setPayLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate('/login');
        }
    }, [authLoading, isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn) {
            loadEntitlements();
            loadPayments();
        }
    }, [isLoggedIn]);

    const loadEntitlements = async () => {
        setEntLoading(true);
        try {
            const r = await authApi.getEntitlements();
            setEntitlements(r.data);
        } catch {
            toast.error('Failed to load entitlements');
        } finally {
            setEntLoading(false);
        }
    };

    const loadPayments = async () => {
        setPayLoading(true);
        try {
            const r = await authApi.getPayments({ size: 10 });
            setPayments(r.data.content);
        } catch {
            toast.error('Failed to load billing history');
        } finally {
            setPayLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Signed out');
        navigate('/');
    };

    if (authLoading) return <div className="py-20"><Spinner size="lg" /></div>;
    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-bg-secondary border border-border-primary flex items-center justify-center text-text-primary text-xl font-semibold shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-text-primary">{user.name || 'User'}</h1>
                    <p className="text-text-tertiary flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />{user.email}
                    </p>
                </div>
                <Button variant="secondary" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 inline mr-1.5" />Sign Out
                </Button>
            </div>

            {/* Account Info */}
            <Card className="mb-8">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" /> Profile
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-tertiary">Email</span>
                        <span className="text-text-primary font-medium">{user.email}</span>
                    </div>
                    {user.name && (
                        <div className="flex justify-between text-sm">
                            <span className="text-text-tertiary">Name</span>
                            <span className="text-text-primary font-medium">{user.name}</span>
                        </div>
                    )}
                    {user.emailVerifiedAt && (
                        <div className="flex justify-between text-sm">
                            <span className="text-text-tertiary">Verified</span>
                            <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5" />
                                {format(new Date(user.emailVerifiedAt), 'MMM dd, yyyy')}
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Entitlements */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Crown className="w-5 h-5 text-text-secondary" /> My Subscriptions
                    </h2>
                    <Link to="/pricing" className="text-sm text-text-secondary hover:text-text-primary underline underline-offset-2">
                        View Plans
                    </Link>
                </div>

                {entLoading ? (
                    <Spinner />
                ) : entitlements.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="w-10 h-10 text-text-tertiary mx-auto mb-2 opacity-50" />
                        <p className="text-text-tertiary text-sm mb-3">No active subscriptions</p>
                        <Link to="/pricing">
                            <Button>
                                <Crown className="w-4 h-4 inline mr-1.5" />Explore Premium Plans
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entitlements.map(ent => (
                            <div key={ent.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary">
                                <div>
                                    <span className="text-sm font-medium text-text-primary">
                                        {TYPE_LABELS[ent.type] || ent.type}
                                    </span>
                                    {ent.scopeId && (
                                        <span className="text-xs text-text-tertiary ml-2">({ent.scopeId})</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    {ent.endAt ? (
                                        <span className="text-xs text-text-tertiary">
                                            Expires {format(new Date(ent.endAt), 'MMM dd, yyyy')}
                                        </span>
                                    ) : (
                                        <Badge variant="success">Lifetime</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Billing History */}
            <Card className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-text-secondary" /> Billing History
                    </h2>
                </div>

                {payLoading ? (
                    <Spinner />
                ) : payments.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="w-10 h-10 text-text-tertiary mx-auto mb-2 opacity-50" />
                        <p className="text-text-tertiary text-sm">No past transactions</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.map(pay => (
                            <div key={pay.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary border border-border-secondary">
                                <div>
                                    <span className="text-sm font-medium text-text-primary block">
                                        ₹{(pay.amountPaise / 100).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-text-tertiary">
                                        {format(new Date(pay.createdAt), 'MMM dd, yyyy HH:mm')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    {pay.status === 'SUCCESS' ? (
                                        <Badge variant="success">Success</Badge>
                                    ) : pay.status === 'REFUNDED' ? (
                                        <Badge variant="warning">Refunded</Badge>
                                    ) : (
                                        <Badge variant="danger">Failed</Badge>
                                    )}
                                    <span className="text-xs text-text-tertiary block mt-1">
                                        {TYPE_LABELS[pay.entitlementType] || pay.entitlementType}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
