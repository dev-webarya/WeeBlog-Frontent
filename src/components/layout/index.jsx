import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, PenTool, Mail, Shield, LogOut, Sun, Moon, ChevronDown, Crown, User, CreditCard, Layers, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useBlogs';
import { useTheme } from '../../hooks/useTheme';
import { useUserAuth } from '../../context/AuthContext';
import { sectionApi } from '../../api/blogApi';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth(); // Admin auth
    const { isLoggedIn, user, logout: userLogout } = useUserAuth(); // User auth
    const { theme, toggleTheme } = useTheme();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const [sections, setSections] = useState([]);
    const [showSections, setShowSections] = useState(false);

    useEffect(() => {
        sectionApi.getSections().then(r => setSections(r.data)).catch(() => { });
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path ? 'text-text-primary font-semibold' : 'text-text-secondary';

    const NavLink = ({ to, icon: Icon, label, hiddenOnMobile = false }) => (
        <Link to={to} className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:bg-neutral-300 dark:hover:bg-white/10 ${isActive(to)}`}>
            {Icon && <Icon className="w-4 h-4" />}
            <span className={hiddenOnMobile ? "hidden md:inline text-sm font-medium" : "text-sm font-medium"}>{label}</span>
        </Link>
    );

    return (
        <header className="glass border-b border-border-primary sticky top-0 z-50 transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center">
                        <BookOpen className="w-4.5 h-4.5 text-bg-primary" />
                    </div>
                    <span className="text-xl font-bold text-text-primary tracking-tight">Weeblogs</span>
                </Link>

                <div className="flex items-center gap-4">
                    {!isAdminRoute ? (
                        <nav className="flex items-center space-x-1">
                            <NavLink to="/" icon={Home} label="Home" hiddenOnMobile />
                            <NavLink to="/blogs" icon={BookOpen} label="Blogs" hiddenOnMobile />

                            {/* Sections Dropdown */}
                            <div className="relative hidden md:block"
                                onMouseEnter={() => setShowSections(true)}
                                onMouseLeave={() => setShowSections(false)}>
                                <button className="flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all duration-200 hover:bg-neutral-300 dark:hover:bg-white/10 text-text-secondary text-sm font-medium">
                                    <span>Sections</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                {showSections && sections.length > 0 && (
                                    <div className="absolute top-full left-0 mt-1 w-52 bg-bg-primary border border-border-primary rounded-xl shadow-lg py-2 z-50">
                                        {sections.map(sec => (
                                            <Link key={sec.id} to={`/section/${sec.slug}`}
                                                className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
                                                onClick={() => setShowSections(false)}>
                                                {sec.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <NavLink to="/pricing" icon={Crown} label="Pricing" hiddenOnMobile />
                            <NavLink to="/submit" icon={PenTool} label="Write" hiddenOnMobile />

                            <div className="w-px h-6 bg-border-primary mx-1" />

                            {/* User auth toggle */}
                            {isLoggedIn ? (
                                <Link to="/account" className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium">Account</span>
                                </Link>
                            ) : (
                                <Link to="/login" className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-neutral-300 dark:hover:bg-white/10 transition-all text-text-secondary hover:text-text-primary">
                                    <User className="w-4 h-4" />
                                    <span className="hidden md:inline text-sm font-medium">Sign In</span>
                                </Link>
                            )}

                            <Link to="/admin/login" className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-neutral-300 dark:hover:bg-white/10 transition-all text-text-tertiary hover:text-text-primary">
                                <Shield className="w-4 h-4" />
                            </Link>
                        </nav>
                    ) : (
                        <nav className="flex items-center space-x-1">
                            <NavLink to="/admin/dashboard" label="Dashboard" />
                            <NavLink to="/admin/moderation" label="Moderate" />
                            <NavLink to="/admin/sections" label="Sections" />
                            <NavLink to="/admin/comments" label="Comments" />
                            <NavLink to="/admin/subscribers" label="Subscribers" />
                            {isAuthenticated && (
                                <>
                                    <div className="w-px h-6 bg-border-primary mx-1" />
                                    <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/10 text-red-500 transition-all text-sm font-medium">
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            )}
                        </nav>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full hover:bg-neutral-300 dark:hover:bg-white/10 text-text-secondary transition-all"
                        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export const Footer = () => {
    return (
        <footer className="border-t border-border-primary mt-16 transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Top row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-md bg-text-primary flex items-center justify-center">
                                <BookOpen className="w-3.5 h-3.5 text-bg-primary" />
                            </div>
                            <span className="text-lg font-bold text-text-primary">Weeblogs</span>
                        </Link>
                        <p className="text-xs text-text-tertiary max-w-xs mb-4">
                            India's curated blog platform for literature, lifestyle, perspectives, and academics.
                        </p>
                        <div className="flex items-center gap-3 text-text-tertiary">
                            <a href="#" className="hover:text-pink-600 transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                            <a href="#" className="hover:text-blue-600 transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                            <a href="#" className="hover:text-blue-400 transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>
                            <a href="#" className="hover:text-blue-700 transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
                            <a href="#" className="hover:text-red-600 transition-colors"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
                        <Link to="/blogs" className="hover:text-text-primary transition-colors">Blogs</Link>
                        <Link to="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
                        <Link to="/subscribe" className="hover:text-text-primary transition-colors">Newsletter</Link>
                        <Link to="/submit" className="hover:text-text-primary transition-colors">Write for Us</Link>
                    </div>
                </div>

                <div className="border-t border-border-secondary pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-text-tertiary">© 2026 Weeblogs.in — All rights reserved. All content is protected by copyright law.</p>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                        <Link to="/about" className="hover:text-text-primary transition-colors">About</Link>
                        <span>·</span>
                        <Link to="/contact" className="hover:text-text-primary transition-colors">Contact Us</Link>
                        <span>·</span>
                        <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
                        <span>·</span>
                        <Link to="/copyright" className="hover:text-text-primary transition-colors">Copyright Policy</Link>
                        <span>·</span>
                        <Link to="/report" className="hover:text-text-primary transition-colors">Report Infringement</Link>
                        <span>·</span>
                        <Link to="/terms" className="hover:text-text-primary transition-colors">Terms of Use</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
