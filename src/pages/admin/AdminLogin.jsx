import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useBlogs';
import { Card, Input, Button } from '../../components/ui';
import { Shield, Lock, User } from 'lucide-react';

export const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(credentials.username, credentials.password);
        if (success) {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="w-full max-w-sm animate-fade-in">
                <div className="text-center mb-6">
                    <div className="inline-flex p-3 rounded-xl bg-bg-tertiary mb-3">
                        <Shield className="w-8 h-8 text-text-secondary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">Admin Login</h2>
                    <p className="text-text-secondary text-sm mt-1">Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-[2.35rem] text-text-tertiary w-4 h-4" />
                        <Input label="Username" type="text" placeholder="admin"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            className="pl-10" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-[2.35rem] text-text-tertiary w-4 h-4" />
                        <Input label="Password" type="password" placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            className="pl-10" required />
                    </div>
                    <Button type="submit" className="w-full">Login to Dashboard</Button>
                </form>

                <div className="mt-5 text-center">
                    <p className="text-xs text-text-tertiary">Default: admin / SecureAdmin@2026</p>
                </div>
            </Card>
        </div>
    );
};
