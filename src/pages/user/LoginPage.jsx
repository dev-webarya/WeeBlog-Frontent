import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/blogApi';
import { useUserAuth } from '../../context/AuthContext';
import { Card, Button, Input, Spinner } from '../../components/ui';
import { Mail, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useUserAuth();
    const [step, setStep] = useState('email'); // email | otp
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStartLogin = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            await authApi.startLogin({ email });
            toast.success('OTP sent to your email!');
            setStep('otp');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) return;
        setLoading(true);
        try {
            const response = await authApi.verifyLogin({ email, otp });
            const { token, user } = response.data;
            login(token, user);
            toast.success(`Welcome, ${user.name || user.email}!`);
            navigate('/account');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-6 py-16">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Sign In</h1>
                <p className="text-text-tertiary">Access premium content and manage your subscriptions</p>
            </div>

            {step === 'email' ? (
                <Card>
                    <form onSubmit={handleStartLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-primary bg-bg-primary text-text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm"
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Spinner size="sm" /> : <><ArrowRight className="w-4 h-4 inline mr-1.5" />Send OTP</>}
                        </Button>
                        <p className="text-xs text-text-tertiary text-center">
                            We&apos;ll send a one-time code to your email. No password needed.
                        </p>
                    </form>
                </Card>
            ) : (
                <Card>
                    <div className="flex items-center gap-2 mb-4 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>OTP sent to <strong>{email}</strong></span>
                    </div>
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-border-primary bg-bg-primary text-text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm text-center tracking-[0.5em] text-lg font-mono"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Spinner size="sm" /> : <><CheckCircle className="w-4 h-4 inline mr-1.5" />Verify & Sign In</>}
                        </Button>
                        <button
                            type="button"
                            onClick={() => { setStep('email'); setOtp(''); }}
                            className="text-sm text-indigo-500 hover:text-indigo-600 w-full text-center"
                        >
                            Change email
                        </button>
                    </form>
                </Card>
            )}

            <div className="mt-8 text-center text-xs text-text-tertiary px-4 border-t border-border-primary pt-6">
                <strong>Copyright Notice:</strong> All content on Weeblogs is protected by copyright law.
                Subscription grants access to read only; it does not transfer reproduction or resale rights.
                Violations may lead to account termination and legal action.
            </div>
        </div>
    );
};
