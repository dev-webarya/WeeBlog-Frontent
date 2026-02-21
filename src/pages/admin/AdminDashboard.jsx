import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/blogApi';
import { Card, Spinner } from '../../components/ui';
import { FileText, Clock, Users, CheckCircle, Eye, Layers, MessageCircle } from 'lucide-react';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, subscribers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [all, pending, subs] = await Promise.all([
                    adminApi.getAdminBlogs({ size: 1 }),
                    adminApi.getAdminBlogs({ status: 'PENDING', size: 1 }),
                    adminApi.getSubscribers({ size: 1 }),
                ]);
                setStats({
                    total: all.data.totalElements,
                    pending: pending.data.totalElements,
                    published: all.data.totalElements - pending.data.totalElements,
                    subscribers: subs.data.totalElements,
                });
            } catch (err) { console.error('Failed to load stats', err); }
            finally { setLoading(false); }
        };
        loadStats();
    }, []);

    if (loading) return <div className="py-20"><Spinner size="lg" /></div>;

    const cards = [
        { label: 'Total Blogs', value: stats.total, icon: FileText, link: '/admin/moderation' },
        { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-600', link: '/admin/moderation?status=PENDING' },
        { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-600', link: '/admin/moderation?status=PUBLISHED' },
        { label: 'Subscribers', value: stats.subscribers, icon: Users, color: 'text-blue-600', link: '/admin/subscribers' },
    ];

    const quickLinks = [
        { title: 'Blog Moderation', desc: 'Approve, reject, or edit submissions', icon: Eye, link: '/admin/moderation' },
        { title: 'Manage Sections', desc: 'Create, edit, and delete sections & subsections', icon: Layers, link: '/admin/sections', color: 'text-indigo-500' },
        { title: 'Comment Moderation', desc: 'Hide or delete inappropriate comments', icon: MessageCircle, link: '/admin/comments', color: 'text-purple-500' },
        { title: 'Manage Subscribers', desc: 'View and manage email subscribers', icon: Users, link: '/admin/subscribers' },
        { title: 'Pricing Management', desc: 'Update paywall base prices and discount curves', icon: FileText, link: '/admin/pricing', color: 'text-amber-500' },
        { title: 'Finance & Subscriptions', desc: 'Track payments and active entitlements', icon: Users, link: '/admin/finance', color: 'text-emerald-500' },
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {cards.map((c) => (
                    <Link to={c.link} key={c.label}>
                        <Card hover>
                            <c.icon className={`w-6 h-6 mb-2 ${c.color || 'text-text-secondary'}`} />
                            <p className="text-sm text-text-secondary">{c.label}</p>
                            <p className="text-3xl font-bold text-text-primary mt-1">{c.value}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((item) => (
                    <Link to={item.link} key={item.title}>
                        <Card hover>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-bg-tertiary"><item.icon className={`w-5 h-5 ${item.color || 'text-text-secondary'}`} /></div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">{item.title}</h3>
                                    <p className="text-text-secondary text-sm">{item.desc}</p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};
