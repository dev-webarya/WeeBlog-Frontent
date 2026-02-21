import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogApi, sectionApi } from '../../api/blogApi';
import { Card, Spinner, TagBadge, Pagination, Badge } from '../../components/ui';
import { Crown, BookOpen, Clock, Eye, ChevronRight, Lock, Search } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useSeo } from '../../hooks/useSeo';

export const SectionPage = () => {
    const { sectionSlug, subsectionSlug } = useParams();
    const [sections, setSections] = useState([]);
    const [subsections, setSubsections] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [archive, setArchive] = useState([]);
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [currentSection, setCurrentSection] = useState(null);
    const [currentSubsection, setCurrentSubsection] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useSeo({
        title: currentSubsection?.name ? `${currentSubsection.name} | ${currentSection?.name}` : currentSection?.name || 'Sections',
        description: `Browse latest blogs in ${currentSubsection?.name || currentSection?.name || 'our curated sections'}.`
    });

    const loadBlogs = async (page = 0, secId = null, subId = null) => {
        setLoading(true);
        try {
            const params = { page, size: 10 };
            if (secId) params.sectionId = secId;
            if (subId) params.subsectionId = subId;
            if (searchQuery) params.search = searchQuery;

            const r = await blogApi.getBlogs(params);
            setBlogs(r.data.content);
            setPagination({ page: r.data.page, totalPages: r.data.totalPages, totalElements: r.data.totalElements });
        } catch (err) {
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSections();
        loadArchive();
    }, []);

    useEffect(() => {
        if (sections.length > 0) {
            setCurrentSection(sectionSlug ? sections.find(s => s.slug === sectionSlug) || null : null);
        }
    }, [sectionSlug, sections]);

    useEffect(() => {
        if (sectionSlug) {
            loadSubsections(sectionSlug);
        } else {
            setSubsections([]);
        }
    }, [sectionSlug]);

    useEffect(() => {
        if (subsections.length > 0 && subsectionSlug) {
            setCurrentSubsection(subsections.find(s => s.slug === subsectionSlug) || null);
        } else {
            setCurrentSubsection(null);
        }
    }, [subsectionSlug, subsections]);

    useEffect(() => {
        // Wait until slugs are fully resolved into state objects
        if (sectionSlug && (!currentSection || currentSection.slug !== sectionSlug)) return;
        if (subsectionSlug && (!currentSubsection || currentSubsection.slug !== subsectionSlug)) return;

        loadBlogs(0, currentSection?.id, currentSubsection?.id);
    }, [currentSection, currentSubsection, sectionSlug, subsectionSlug, searchQuery]); // Added searchQuery to dependencies

    const loadSections = async () => {
        try {
            const r = await sectionApi.getSections();
            setSections(r.data);
        } catch { /* silent */ }
    };

    const loadSubsections = async (slug) => {
        try {
            const r = await sectionApi.getSubsections(slug);
            setSubsections(r.data);
        } catch { /* silent */ }
    };

    const loadArchive = async () => {
        try {
            const r = await blogApi.getArchive();
            setArchive(r.data || []);
        } catch { /* silent */ }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadBlogs(0);
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-text-tertiary mb-6">
                <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                {currentSection ? (
                    <>
                        <Link to={`/section/${currentSection.slug}`}
                            className={`hover:text-text-primary transition-colors ${!subsectionSlug ? 'text-text-primary font-medium' : ''}`}>
                            {currentSection.name}
                        </Link>
                        {currentSubsection && (
                            <>
                                <ChevronRight className="w-3.5 h-3.5" />
                                <span className="text-text-primary font-medium">{currentSubsection.name}</span>
                            </>
                        )}
                    </>
                ) : (
                    <span className="text-text-primary font-medium">Sections</span>
                )}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_200px] gap-6">
                {/* Left: Subsection Sidebar */}
                <aside className="hidden lg:block">
                    <div className="sticky top-20">
                        <h3 className="text-xs uppercase font-semibold text-text-tertiary mb-3 tracking-wider">
                            {currentSection ? 'Subsections' : 'Sections'}
                        </h3>
                        <nav className="space-y-0.5">
                            {currentSection ? (
                                <>
                                    <Link to={`/section/${sectionSlug}`}
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!subsectionSlug ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-text-secondary hover:bg-bg-secondary'}`}>
                                        All
                                    </Link>
                                    {subsections.map(sub => (
                                        <Link key={sub.id} to={`/section/${sectionSlug}/${sub.slug}`}
                                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${subsectionSlug === sub.slug ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-text-secondary hover:bg-bg-secondary'}`}>
                                            {sub.name}
                                        </Link>
                                    ))}
                                </>
                            ) : (
                                sections.map(sec => (
                                    <Link key={sec.id} to={`/section/${sec.slug}`}
                                        className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-secondary transition-colors">
                                        {sec.name}
                                    </Link>
                                ))
                            )}
                        </nav>
                    </div>
                </aside>

                {/* Center: Blog Feed */}
                <main>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-text-primary">
                            {currentSubsection?.name || currentSection?.name || 'All Sections'}
                        </h1>
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search here..."
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border-primary bg-bg-primary text-text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        </form>
                    </div>

                    {loading ? (
                        <div className="py-12"><Spinner size="lg" /></div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-16">
                            <BookOpen className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
                            <p className="text-text-tertiary">No blogs in this section yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {blogs.map(blog => (
                                <Link key={blog.id} to={`/blogs/${blog.slug}`} className="block group">
                                    <Card hover>
                                        <div className="flex gap-4">
                                            {blog.featuredImageUrl && (
                                                <img src={blog.featuredImageUrl} alt=""
                                                    className="w-24 h-24 md:w-32 md:h-24 object-cover rounded-lg flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h2 className="text-base font-semibold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                        {blog.title}
                                                    </h2>
                                                    {blog.premium && (
                                                        <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-tertiary line-clamp-2 mb-2">{blog.excerpt}</p>
                                                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                                                    <span>{blog.authorName}</span>
                                                    {blog.publishedAt && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(blog.publishedAt), 'MMM dd, yyyy')}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />{blog.viewsCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                page={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(p) => loadBlogs(p)}
                            />
                        </div>
                    )}
                </main>

                {/* Right: Archive Sidebar */}
                <aside className="hidden lg:block">
                    <div className="sticky top-20">
                        <h3 className="text-xs uppercase font-semibold text-text-tertiary mb-3 tracking-wider">Archive</h3>
                        {archive.length === 0 ? (
                            <p className="text-sm text-text-tertiary">No archives yet.</p>
                        ) : (
                            <div className="space-y-1">
                                {(archive || []).flatMap((a) => (a.months || []).map((m) => (
                                    <Link key={`${a.year}-${m.month}`}
                                        to={`/blogs?year=${a.year}&month=${m.month}`}
                                        className="flex items-center justify-between px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-secondary rounded-lg transition-colors">
                                        <span>{format(new Date(a.year, m.month - 1), 'MMM yyyy')}</span>
                                        <span className="text-xs text-text-tertiary">{m.count}</span>
                                    </Link>
                                )))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Mobile: Subsection tabs (visible on small screens) */}
            {currentSection && subsections.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-primary px-4 py-2 flex gap-2 overflow-x-auto z-40">
                    <Link to={`/section/${sectionSlug}`}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!subsectionSlug ? 'bg-indigo-500 text-white' : 'bg-bg-secondary text-text-secondary'}`}>
                        All
                    </Link>
                    {subsections.map(sub => (
                        <Link key={sub.id} to={`/section/${sectionSlug}/${sub.slug}`}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${subsectionSlug === sub.slug ? 'bg-indigo-500 text-white' : 'bg-bg-secondary text-text-secondary'}`}>
                            {sub.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
