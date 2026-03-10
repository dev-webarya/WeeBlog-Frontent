import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useAsync = (asyncFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (...params) => {
        setLoading(true);
        setError(null);

        try {
            const result = await asyncFunction(...params);
            setData(result.data);
            return result.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, execute };
};

export const useBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });

    const fetchBlogs = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const { blogApi } = await import('../api/blogApi');
            const response = await blogApi.getBlogs(params);
            setBlogs(response.data.content);
            setPagination({
                page: response.data.page,
                size: response.data.size,
                totalElements: response.data.totalElements,
                totalPages: response.data.totalPages,
            });
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load blogs';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return { blogs, loading, error, pagination, fetchBlogs };
};

export const useBlogDetail = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBlog = async (slug) => {
        setLoading(true);
        setError(null);

        try {
            const { blogApi } = await import('../api/blogApi');
            const response = await blogApi.getBlogBySlug(slug);
            setBlog(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Blog not found';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { blog, loading, error, fetchBlog };
};

export const useComments = (blogId) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchComments = async (params = {}) => {
        setLoading(true);
        try {
            const { blogApi } = await import('../api/blogApi');
            const response = await blogApi.getComments(blogId, params);
            setComments(response.data.content);
        } catch (err) {
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const postComment = async (data) => {
        try {
            const { blogApi } = await import('../api/blogApi');
            const response = await blogApi.postComment(blogId, data);
            toast.success('Comment posted!');
            await fetchComments(); // Refresh
            return response.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post comment');
            throw err;
        }
    };

    useEffect(() => {
        if (blogId) {
            fetchComments();
        }
    }, [blogId]);

    return { comments, loading, fetchComments, postComment };
};

export const useReaction = () => {
    const toggleReaction = async (blogId, reactionType, visitorKey) => {
        try {
            const { blogApi } = await import('../api/blogApi');
            const response = await blogApi.toggleReaction(blogId, { reactionType, visitorKey });
            return response.data;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to react');
            throw err;
        }
    };

    return { toggleReaction };
};

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem('adminAuth');
            setIsAuthenticated(!!auth);
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const login = async (username, password) => {
        try {
            // First, optimistically set the credentials in localStorage
            // The Axios interceptor will use these for the subsequent request
            const credentials = { username, password };
            localStorage.setItem('adminAuth', JSON.stringify(credentials));

            // Enforce strict segregation: if an admin logs in, nuke the user session
            localStorage.removeItem('userToken');
            window.dispatchEvent(new Event('storage'));

            // Make a test request to the backend to verify the credentials
            // Assuming /api/admin/blogs works as a simple verification endpoint
            // In a real app, there should ideally be a dedicated /api/admin/login endpoint
            const { adminApi } = await import('../api/blogApi');
            await adminApi.getAdminBlogs({ page: 0, size: 1 });

            setIsAuthenticated(true);
            toast.success('Login successful!');
            return true;
        } catch (error) {
            // If the request fails (e.g., 401 Unauthorized), the Axios response interceptor 
            // will automatically remove 'adminAuth' from localStorage, but we can also clean up here.
            localStorage.removeItem('adminAuth');
            window.dispatchEvent(new Event('storage'));
            toast.error('Invalid credentials');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        toast.success('Logged out');
    };

    return { isAuthenticated, login, logout };
};
