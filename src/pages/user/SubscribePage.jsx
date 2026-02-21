import { useState } from 'react';
import { blogApi } from '../../api/blogApi';
import { Card, Input, Button } from '../../components/ui';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const SubscribePage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('subscribe');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await blogApi.startSubscription({ email }); toast.success('OTP sent!'); setStep('verify'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    const handleVerify = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await blogApi.verifySubscription({ email, otp }); toast.success('Subscribed!'); setStep('done'); }
        catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP'); }
        finally { setLoading(false); }
    };

    const handleUnsubscribe = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await blogApi.unsubscribe({ email }); toast.success('Unsubscribed'); setEmail(''); setStep('subscribe'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-md mx-auto px-6 py-10">
            <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-xl bg-bg-tertiary mb-3">
                    <Mail className="w-8 h-8 text-text-secondary" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-1">Stay Updated</h1>
                <p className="text-text-secondary text-sm">Get notified when new blogs are published</p>
            </div>

            {step === 'subscribe' && (
                <Card>
                    <form onSubmit={handleSubscribe} className="space-y-4">
                        <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending OTP...' : 'Subscribe'}</Button>
                    </form>
                    <div className="mt-5 pt-4 border-t border-border-secondary text-center">
                        <button onClick={() => setStep('unsubscribe')} className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">Want to unsubscribe?</button>
                    </div>
                </Card>
            )}

            {step === 'verify' && (
                <Card className="text-center">
                    <Mail className="w-10 h-10 mx-auto text-text-tertiary mb-3" />
                    <h2 className="text-lg font-bold text-text-primary mb-1">Verify Your Email</h2>
                    <p className="text-text-secondary text-sm mb-5">Enter OTP sent to <strong>{email}</strong></p>
                    <form onSubmit={handleVerify} className="max-w-xs mx-auto space-y-4">
                        <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center text-xl tracking-widest" maxLength={6} required />
                        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Verifying...' : 'Verify & Activate'}</Button>
                    </form>
                </Card>
            )}

            {step === 'done' && (
                <Card className="text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                    <h2 className="text-xl font-bold text-text-primary mb-1">Subscribed!</h2>
                    <p className="text-text-secondary text-sm">You'll receive emails when new blogs are published.</p>
                </Card>
            )}

            {step === 'unsubscribe' && (
                <Card>
                    <div className="text-center mb-4">
                        <XCircle className="w-10 h-10 mx-auto text-red-400 mb-2" />
                        <h2 className="text-lg font-bold text-text-primary">Unsubscribe</h2>
                    </div>
                    <form onSubmit={handleUnsubscribe} className="space-y-4">
                        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Button type="submit" variant="danger" disabled={loading} className="w-full">{loading ? 'Processing...' : 'Unsubscribe'}</Button>
                    </form>
                    <div className="mt-4 text-center">
                        <button onClick={() => setStep('subscribe')} className="text-sm text-text-tertiary hover:text-text-secondary">← Back to Subscribe</button>
                    </div>
                </Card>
            )}
        </div>
    );
};
