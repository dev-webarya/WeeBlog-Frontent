import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi, sectionApi } from '../../api/blogApi';
import { Card, Badge, Spinner, TagBadge } from '../../components/ui';
import { Clock, Heart, MessageCircle, Eye, ArrowRight, BookOpen, Sparkles, Mail, PenTool, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { useSeo } from '../../hooks/useSeo';

const sectionIcons = {
    'literature': '📚',
    'lifestyle': '🌿',
    'perspectives': '💡',
    'academics': '🎓',
    'creative-non-fiction': '✍️',
};

export const HomePage = () => {
    useSeo({
        title: 'Home',
        description: 'India\'s curated blog platform for literature, lifestyle, perspectives, and academics.',
        url: window.location.href
    });

    const [blogs, setBlogs] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [blogsRes, sectionsRes] = await Promise.all([
                    blogApi.getBlogs({ size: 6, sort: 'popular' }),
                    sectionApi.getSections(),
                ]);
                setBlogs(blogsRes.data.content);
                setSections(sectionsRes.data);
            } catch (err) {
                console.error('Failed to load', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div>
            {/* Hero */}
            <section className="relative bg-bg-secondary border-b border-border-primary transition-colors duration-200">
                <div className="max-w-3xl mx-auto px-6 py-20 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-bg-primary border border-border-primary rounded-full text-xs font-medium text-text-secondary mb-6 animate-fade-in">
                        <BookOpen className="w-4 h-4 text-text-secondary" />
                        <span>Read. Write. Explore.</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight animate-slide-down">
                        Weeblogs
                    </h1>
                    <p className="text-base md:text-lg text-text-secondary mb-8 animate-slide-up max-w-xl mx-auto">
                        Discover curated stories, perspectives, and knowledge across literature, lifestyle, academics, and more.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center animate-fade-in">
                        <Link to="/blogs"><button className="btn-primary flex items-center">Explore Blogs <ArrowRight className="w-4 h-4 ml-1.5" /></button></Link>
                        <Link to="/submit"><button className="btn-secondary flex items-center">Write Your Blog <PenTool className="w-4 h-4 ml-1.5" /></button></Link>
                    </div>
                </div>
            </section>

            {/* Sections Grid */}
            {sections.length > 0 && (
                <section className="max-w-6xl mx-auto px-6 py-14">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-text-primary">Browse by Section</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {sections.map(sec => (
                            <Link key={sec.id} to={`/section/${sec.slug}`}
                                className="group p-5 rounded-xl border border-border-primary bg-bg-card hover:bg-bg-hover transition-colors duration-200 text-center">
                                <div className="text-2xl mb-3 grayscale group-hover:grayscale-0 transition-all opacity-80">
                                    {sectionIcons[sec.slug] || '📖'}
                                </div>
                                <h3 className="font-semibold text-text-primary text-sm">
                                    {sec.name}
                                </h3>
                                {sec.subsectionCount > 0 && (
                                    <p className="text-xs text-text-tertiary mt-1">{sec.subsectionCount} topics</p>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Popular Blogs */}
            <section className="max-w-6xl mx-auto px-6 py-14">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-text-primary">Popular Blogs</h2>
                    <Link to="/blogs" className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <Spinner size="lg" />
                ) : blogs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-text-tertiary text-lg">No blogs yet. <Link to="/submit" className="text-text-primary underline">Submit the first one</Link>!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <Link to={`/blogs/${blog.slug}`} key={blog.id}>
                                <Card hover className="h-full">
                                    {blog.featuredImageUrl && (
                                        <img src={blog.featuredImageUrl} alt={blog.title} className="w-full h-44 object-cover rounded-lg mb-4" />
                                    )}
                                    <div className="space-y-2.5">
                                        <div className="flex items-start gap-2">
                                            <h3 className="text-lg font-semibold text-text-primary line-clamp-2 flex-1">{blog.title}</h3>
                                            {blog.premium && (
                                                <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold">
                                                    <Crown className="w-2.5 h-2.5" /> PRO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-text-secondary text-sm line-clamp-2">{blog.excerpt}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {blog.tags?.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-text-tertiary pt-3 border-t border-border-secondary">
                                            <div className="flex items-center space-x-3">
                                                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{blog.likesCount}</span>
                                                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{blog.commentsCount}</span>
                                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{blog.viewsCount}</span>
                                            </div>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {blog.publishedAt && format(new Date(blog.publishedAt), 'MMM dd')}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-14">
                <div className="bg-bg-secondary border border-border-primary rounded-xl p-8 md:p-12 text-center text-text-primary">
                    <Mail className="w-8 h-8 mx-auto mb-4 text-text-secondary" />
                    <h2 className="text-xl md:text-2xl font-bold mb-2">Stay in the loop</h2>
                    <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
                        Subscribe to our newsletter and never miss a new post. We send a weekly digest of the best curated articles.
                    </p>
                    <Link to="/subscribe">
                        <button className="btn-primary">
                            Subscribe Now <ArrowRight className="inline w-4 h-4 ml-1" />
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
};
