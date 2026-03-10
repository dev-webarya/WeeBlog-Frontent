import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { pricingApi, checkoutApi } from '../../api/blogApi';
import { useUserAuth } from '../../context/AuthContext';
import { Card, Spinner, Button } from '../../components/ui';
import { Crown, Check, Zap, BookOpen, LayoutGrid, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_META = {
    perBlog: { icon: BookOpen, color: 'from-blue-500 to-cyan-500', label: 'Single Blog' },
    subsection: { icon: Layers, color: 'from-purple-500 to-indigo-500', label: 'Subsection' },
    section: { icon: LayoutGrid, color: 'from-orange-500 to-red-500', label: 'Section' },
    allAccess: { icon: Crown, color: 'from-amber-500 to-yellow-500', label: 'All Access' },
};

const DURATION_LABELS = { '1M': '1 Month', '3M': '3 Months', '6M': '6 Months', '12M': '12 Months' };

export const PricingPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { isLoggedIn } = useUserAuth();
    const [pricing, setPricing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDuration, setSelectedDuration] = useState('1M');

    useEffect(() => {
        loadPricing();
    }, []);

    const loadPricing = async () => {
        try {
            const r = await pricingApi.getPricing();
            setPricing(r.data);
        } catch {
            toast.error('Failed to load pricing');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async (planType, duration) => {
        if (!isLoggedIn) {
            toast('Please sign in to purchase', { icon: '🔒' });
            navigate('/login');
            return;
        }

        let finalBlogId = null;
        let finalScopeId = null;

        if (planType === 'PER_BLOG') {
            if (!state?.blogId) {
                toast.error('Please select a specific blog article to purchase first.');
                return;
            }
            finalBlogId = state.blogId;
        } else if (planType === 'SUBSCRIPTION_SUBSECTION') {
            if (!state?.subsectionId) {
                toast.error('Please initiate purchase from a specific subsection.');
                return;
            }
            finalScopeId = state.subsectionId;
        } else if (planType === 'SUBSCRIPTION_SECTION') {
            if (!state?.sectionId) {
                toast.error('Please initiate purchase from a specific section.');
                return;
            }
            finalScopeId = state.sectionId;
        }

        try {
            const r = await checkoutApi.createOrder({
                planType,
                duration: planType === 'PER_BLOG' ? null : duration,
                blogId: finalBlogId,
                scopeId: finalScopeId,
            });
            // Open Razorpay checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: r.data.amountPaise,
                currency: 'INR',
                name: 'Weeblogs',
                description: `${planType} Access`,
                order_id: r.data.providerOrderId,
                handler: async (response) => {
                    try {
                        await checkoutApi.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        toast.success('Payment successful! Entitlement granted.');
                        navigate('/account');
                    } catch {
                        toast.error('Payment verification failed');
                    }
                },
                theme: { color: '#6366f1' },
            };

            if (window.Razorpay) {
                new window.Razorpay(options).open();
            } else {
                toast.error('Payment gateway not loaded. Please refresh.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create order');
        }
    };

    if (loading) return <div className="py-20"><Spinner size="lg" /></div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Hero */}
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">Choose Your Plan</h1>
                <p className="text-text-tertiary max-w-xl mx-auto">Unlock premium educational content. Pay per blog or subscribe for unlimited access.</p>
            </div>

            {/* Duration Selector (for subscriptions) */}
            <div className="flex justify-center gap-2 mb-10">
                {Object.entries(DURATION_LABELS).map(([key, label]) => (
                    <button key={key}
                        onClick={() => setSelectedDuration(key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedDuration === key
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'}`}>
                        {label}
                        {pricing?.durationDiscounts?.[key] > 0 && (
                            <span className="ml-1.5 text-xs opacity-80">-{pricing.durationDiscounts[key]}%</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {pricing && Object.entries(PLAN_META).map(([key, meta]) => {
                    const plan = pricing[key];
                    if (!plan) return null;
                    const Icon = meta.icon;
                    const isPerBlog = key === 'perBlog';
                    const duration = isPerBlog ? null : plan.durations?.[selectedDuration];
                    const displayPrice = isPerBlog ? plan.priceFormatted : (duration?.totalFormatted || plan.monthlyPriceFormatted);
                    const effectiveMonthly = !isPerBlog && duration ? duration.effectiveMonthlyFormatted : null;
                    const planType = key === 'perBlog' ? 'PER_BLOG' : key === 'subsection' ? 'SUBSCRIPTION_SUBSECTION' : key === 'section' ? 'SUBSCRIPTION_SECTION' : 'SUBSCRIPTION_ALL';

                    return (
                        <div key={key} className={`relative rounded-2xl border border-border-primary bg-bg-primary p-6 flex flex-col transition-all hover:shadow-lg hover:-translate-y-0.5 ${key === 'allAccess' ? 'ring-2 ring-amber-400' : ''}`}>
                            {key === 'allAccess' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-0.5 rounded-full">
                                    BEST VALUE
                                </div>
                            )}
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center mb-4 shadow`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-1">{meta.label}</h3>
                            <p className="text-sm text-text-tertiary mb-4">{plan.label}</p>

                            <div className="mb-4">
                                <span className="text-2xl font-bold text-text-primary">{displayPrice}</span>
                                {!isPerBlog && <span className="text-sm text-text-tertiary ml-1">/ {DURATION_LABELS[selectedDuration]?.toLowerCase()}</span>}
                            </div>

                            {effectiveMonthly && selectedDuration !== '1M' && (
                                <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                                    Effectively {effectiveMonthly}/mo
                                </p>
                            )}

                            <ul className="space-y-2 mb-6 flex-1">
                                <li className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {isPerBlog ? 'One-time access to a single blog' : `Access to all ${meta.label.toLowerCase()} content`}
                                </li>
                                <li className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {isPerBlog ? 'Lifetime access' : 'Cancel anytime'}
                                </li>
                            </ul>

                            <Button
                                onClick={() => handleCheckout(planType, selectedDuration)}
                                className={`w-full ${key === 'allAccess' ? '!bg-gradient-to-r !from-amber-500 !to-yellow-500 !text-amber-900 hover:!shadow-lg' : ''}`}
                            >
                                <Zap className="w-4 h-4 inline mr-1" />
                                Get {meta.label}
                            </Button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 text-center text-xs text-text-tertiary px-4 border-t border-border-primary pt-8">
                <strong>Copyright Notice:</strong> All content on Weeblogs is protected by copyright law.
                Subscription grants access to read only; it does not transfer reproduction or resale rights.
                Violations may lead to account termination and legal action.
            </div>
        </div>
    );
};
