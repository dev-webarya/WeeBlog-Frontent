import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../../api/blogApi';
import { Card, Badge, Spinner, Button, Pagination, TagBadge } from '../../components/ui';
import { Crown, Clock, Heart, MessageCircle, Eye, Search, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useSeo } from '../../hooks/useSeo';

export const BlogListPage = () => {
    useSeo({
        title: 'Explore Blogs',
        description: 'Search and discover amazing articles and stories on Weeblogs.'
    });

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('recent');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [pageSize, setPageSize] = useState(9);
    const [archive, setArchive] = useState([]);

    const fetchBlogs = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const currentSize = params.size !== undefined ? params.size : pageSize;
            const queryParams = {
                page: params.page || 0,
                size: currentSize,
                sort: params.sort || sort,
            };
            // Only add search if non-empty
            const searchVal = params.search !== undefined ? params.search : search;
            if (searchVal) queryParams.search = searchVal;
            // Only add year/month if set
            const yearVal = params.year !== undefined ? params.year : year;
            const monthVal = params.month !== undefined ? params.month : month;
            if (yearVal) queryParams.year = Number(yearVal);
            if (monthVal) queryParams.month = Number(monthVal);

            const response = await blogApi.getBlogs(queryParams);
            setBlogs(response.data.content);
            setPagination({ page: response.data.page, totalPages: response.data.totalPages, totalElements: response.data.totalElements });
        } catch (err) { console.error('Failed to load blogs', err); }
        finally { setLoading(false); }
    }, [sort, search, pageSize, year, month]);

    const fetchArchive = async () => {
        try {
            const response = await blogApi.getArchive();
            setArchive(response.data);
        } catch (err) { console.error('Failed to load archive', err); }
    };

    useEffect(() => { fetchBlogs(); fetchArchive(); }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchBlogs({ search, page: 0 }); };
    const handleSortChange = (s) => { setSort(s); fetchBlogs({ sort: s, page: 0 }); };
    const handlePageChange = (p) => { fetchBlogs({ page: p }); };
    const handleYearMonthChange = (y, m) => {
        setYear(y); setMonth(m);
        fetchBlogs({ year: y, month: m, page: 0 });
    };
    const clearFilters = () => {
        setSearch(''); setSort('recent'); setYear(''); setMonth('');
        fetchBlogs({ search: '', sort: 'recent', year: '', month: '', page: 0 });
    };

    // Build year options from archive
    const years = archive.map(a => a.year);
    const monthsForYear = year ? archive.find(a => a.year === Number(year))?.months?.map(m => m.month) || [] : [];

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-text-primary mb-6">All Blogs</h1>

            {/* Search & Filters */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 mb-8 transition-colors duration-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-text-tertiary" />
                        <input type="text" placeholder="Search blogs by title or content..." value={search}
                            onChange={(e) => setSearch(e.target.value)} className="input-clean w-full pl-10" />
                    </div>
                    <Button type="submit">Search</Button>
                </form>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                    {/* Sort buttons */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-text-tertiary" />
                        {['recent', 'popular', 'oldest', 'most_commented'].map((s) => (
                            <button key={s} onClick={() => handleSortChange(s)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${sort === s ? 'bg-text-primary text-bg-primary' : 'bg-bg-card border border-border-primary text-text-secondary hover:border-text-tertiary'}`}>
                                {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </button>
                        ))}
                    </div>

                    {/* Year/Month filter */}
                    <div className="flex items-center gap-2 ml-auto">
                        <Calendar className="w-4 h-4 text-text-tertiary" />
                        <select value={year} onChange={(e) => handleYearMonthChange(e.target.value, '')}
                            className="bg-bg-card border border-border-primary rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none cursor-pointer">
                            <option value="">All Years</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {year && (
                            <select value={month} onChange={(e) => handleYearMonthChange(year, e.target.value)}
                                className="bg-bg-card border border-border-primary rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none cursor-pointer">
                                <option value="">All Months</option>
                                {monthsForYear.map(m => (
                                    <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        )}
                        {(search || year || month || sort !== 'recent') && (
                            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 underline ml-2">Clear all</button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? <Spinner size="lg" /> : blogs.length === 0 ? (
                <div className="text-center py-16"><p className="text-text-tertiary text-lg">No blogs found</p></div>
            ) : (
                <>
                    <p className="text-text-tertiary text-sm mb-5">{pagination.totalElements} blog(s) found</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <Link to={`/blogs/${blog.slug}`} key={blog.id}>
                                <Card hover className="h-full">
                                    {blog.featuredImageUrl && <img src={blog.featuredImageUrl} alt={blog.title} className="w-full h-44 object-cover rounded-lg mb-4" />}
                                    <div className="space-y-3">
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
                                            <span>{blog.publishedAt && format(new Date(blog.publishedAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        pageSize={pageSize}
                        onPageSizeChange={(newSize) => { setPageSize(newSize); fetchBlogs({ page: 0, size: newSize }); }}
                        pageSizeOptions={[9, 18, 27, 45]}
                    />
                </>
            )}
        </div>
    );
};
