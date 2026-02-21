import { useState, useEffect } from 'react';
import { adminApi } from '../../api/blogApi';
import { Card, Button, Input, Spinner } from '../../components/ui';
import { DollarSign, Percent, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminPricingPage = () => {
    const [pricing, setPricing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadPricing(); }, []);

    const loadPricing = async () => {
        setLoading(true);
        try {
            const r = await adminApi.getAdminPricing();
            setPricing(r.data);
        } catch { toast.error('Failed to load pricing'); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await adminApi.updateAdminPricing(pricing);
            setPricing(r.data);
            toast.success('Pricing updated successfully!');
        } catch { toast.error('Failed to update pricing'); }
        finally { setSaving(false); }
    };

    const updateField = (field, value) => {
        setPricing(prev => ({ ...prev, [field]: Number(value) }));
    };

    const updateDiscount = (duration, value) => {
        setPricing(prev => ({
            ...prev,
            durationDiscounts: { ...prev.durationDiscounts, [duration]: Number(value) }
        }));
    };

    if (loading) return <div className="py-20"><Spinner size="lg" /></div>;
    if (!pricing) return null;

    const plans = [
        { key: 'perBlogPaise', label: 'Single Blog (one-time)', icon: '📝' },
        { key: 'subsectionMonthlyPaise', label: 'Subsection (per month)', icon: '📂' },
        { key: 'sectionMonthlyPaise', label: 'Section (per month)', icon: '📚' },
        { key: 'allAccessMonthlyPaise', label: 'All Access (per month)', icon: '👑' },
    ];

    const durations = [
        { key: '1M', label: '1 Month' },
        { key: '3M', label: '3 Months' },
        { key: '6M', label: '6 Months' },
        { key: '12M', label: '12 Months' },
    ];

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <DollarSign className="w-6 h-6" /> Pricing Management
                </h1>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 inline mr-1.5" />{saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Base Prices */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Base Prices (in Paise)</h2>
                <p className="text-xs text-text-tertiary mb-4">₹1 = 100 paise. For example, ₹49 = 4900 paise.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map(plan => (
                        <div key={plan.key}>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {plan.icon} {plan.label}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={pricing[plan.key] || 0}
                                    onChange={(e) => updateField(plan.key, e.target.value)}
                                    className="input-clean w-full"
                                />
                                <span className="text-xs text-text-tertiary whitespace-nowrap">
                                    = ₹{((pricing[plan.key] || 0) / 100).toFixed(0)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Duration Discounts */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5" /> Duration Discounts
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {durations.map(d => (
                        <div key={d.key}>
                            <label className="block text-sm font-medium text-text-secondary mb-1">{d.label}</label>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    min="0" max="100"
                                    value={pricing.durationDiscounts?.[d.key] ?? 0}
                                    onChange={(e) => updateDiscount(d.key, e.target.value)}
                                    className="input-clean w-full"
                                />
                                <span className="text-sm text-text-tertiary">%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Price Preview */}
            <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Price Preview</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border-primary">
                                <th className="text-left py-2 text-text-tertiary font-medium">Plan</th>
                                {durations.map(d => (
                                    <th key={d.key} className="text-right py-2 text-text-tertiary font-medium">{d.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {plans.filter(p => p.key !== 'perBlogPaise').map(plan => (
                                <tr key={plan.key} className="border-b border-border-secondary">
                                    <td className="py-2 text-text-primary font-medium">{plan.icon} {plan.label.split('(')[0]}</td>
                                    {durations.map(d => {
                                        const months = parseInt(d.key);
                                        const base = (pricing[plan.key] || 0) * months;
                                        const discount = pricing.durationDiscounts?.[d.key] ?? 0;
                                        const final_ = base - (base * discount / 100);
                                        return (
                                            <td key={d.key} className="text-right py-2 text-text-primary">
                                                ₹{(final_ / 100).toFixed(0)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
