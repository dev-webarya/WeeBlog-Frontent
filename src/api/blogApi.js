import api from './api';

export const blogApi = {
    // Public endpoints
    getBlogs: (params) => api.get('/api/blogs', { params }),
    getBlogBySlug: (slug) => api.get(`/api/blogs/${slug}`),
    getArchive: () => api.get('/api/blogs/archive'),

    // Reactions
    toggleReaction: (blogId, data) => api.post(`/api/blogs/${blogId}/reaction`, data),
    getReactionStatus: (blogId, visitorKey) => api.get(`/api/blogs/${blogId}/reaction`, { params: { visitorKey } }),

    // Comments
    getComments: (blogId, params) => api.get(`/api/blogs/${blogId}/comments`, { params }),
    postComment: (blogId, data) => api.post(`/api/blogs/${blogId}/comments`, data),

    // Subscription (newsletter)
    startSubscription: (data) => api.post('/api/blogs/subscribe/start', data),
    verifySubscription: (params) => api.post('/api/blogs/subscribe/verify-otp', null, { params }),
    unsubscribe: (params) => api.post('/api/blogs/subscribe/unsubscribe', null, { params }),

    // Submission (3-step)
    startSubmission: (data) => api.post('/api/blogs/submission/start', data),
    verifySubmission: (data) => api.post('/api/blogs/submission/verify', data),
    finishSubmission: (data) => api.post('/api/blogs/submission/finish', data),
};

export const sectionApi = {
    getSections: () => api.get('/api/sections'),
    getSubsections: (sectionSlug) => api.get(`/api/sections/${sectionSlug}/subsections`),
};

export const authApi = {
    startLogin: (data) => api.post('/api/auth/start', data),
    verifyLogin: (data) => api.post('/api/auth/verify', data),
    getProfile: () => api.get('/api/account/me'),
    getEntitlements: () => api.get('/api/account/entitlements'),
    getPayments: (params) => api.get('/api/account/payments', { params }),
};

export const pricingApi = {
    getPricing: () => api.get('/api/pricing'),
};

export const checkoutApi = {
    createOrder: (data) => api.post('/api/checkout/create-order', data),
    verifyPayment: (data) => api.post('/api/checkout/verify', data),
};

export const adminApi = {
    // Blog moderation
    getAdminBlogs: (params) => api.get('/api/admin/blogs', { params }),
    getBlogById: (id) => api.get(`/api/admin/blogs/${id}`),
    approveBlog: (id, data) => api.post(`/api/admin/blogs/${id}/approve`, data),
    rejectBlog: (id, data) => api.post(`/api/admin/blogs/${id}/reject`, data),
    editBlog: (id, data) => api.patch(`/api/admin/blogs/${id}`, data),

    // Comment moderation
    getAllComments: (params) => api.get('/api/admin/comments', { params }),
    hideComment: (id) => api.post(`/api/admin/comments/${id}/hide`),
    unhideComment: (id) => api.post(`/api/admin/comments/${id}/unhide`),
    deleteComment: (id) => api.delete(`/api/admin/comments/${id}`),

    // Subscribers
    getSubscribers: (params) => api.get('/api/admin/subscribers', { params }),

    // Sections (admin CRUD)
    getSections: () => api.get('/api/admin/sections'),
    createSection: (data) => api.post('/api/admin/sections', data),
    updateSection: (id, data) => api.put(`/api/admin/sections/${id}`, data),
    deleteSection: (id) => api.delete(`/api/admin/sections/${id}`),
    createSubsection: (data) => api.post(`/api/admin/sections/${data.sectionId}/subsections`, data),
    updateSubsection: (id, data) => api.put(`/api/admin/sections/subsections/${id}`, data),
    deleteSubsection: (id) => api.delete(`/api/admin/sections/subsections/${id}`),

    // Finance — Full CRUD
    getPayments: (params) => api.get('/api/admin/finance/payments', { params }),
    getPaymentById: (id) => api.get(`/api/admin/finance/payments/${id}`),
    updatePaymentStatus: (id, status) => api.patch(`/api/admin/finance/payments/${id}/status`, { status }),
    deletePayment: (id) => api.delete(`/api/admin/finance/payments/${id}`),
    getSubscriptions: (params) => api.get('/api/admin/finance/subscriptions', { params }),
    getSubscriptionById: (id) => api.get(`/api/admin/finance/subscriptions/${id}`),
    updateSubscription: (id, data) => api.patch(`/api/admin/finance/subscriptions/${id}`, data),
    deleteSubscription: (id) => api.delete(`/api/admin/finance/subscriptions/${id}`),

    // Pricing management
    getAdminPricing: () => api.get('/api/admin/pricing'),
    updateAdminPricing: (data) => api.put('/api/admin/pricing', data),
};
