import apiClient from './client';

// Auth API
export const authAPI = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    getMe: () => apiClient.get('/auth/me'),
    updatePassword: (passwords) => apiClient.put('/auth/password', passwords),
};

// Company API
export const companyAPI = {
    getAll: (params) => apiClient.get('/companies', { params }),
    getOne: (id) => apiClient.get(`/companies/${id}`),
    getStats: (id) => apiClient.get(`/companies/${id}/stats`),
    create: (formData) => apiClient.post('/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => apiClient.put(`/companies/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => apiClient.delete(`/companies/${id}`),
};

// User API
export const userAPI = {
    getAll: (params) => apiClient.get('/users', { params }),
    getOne: (id) => apiClient.get(`/users/${id}`),
    create: (userData) => apiClient.post('/users', userData),
    update: (id, userData) => apiClient.put(`/users/${id}`, userData),
    delete: (id) => apiClient.delete(`/users/${id}`),
    assignCompanies: (id, companyIds) => apiClient.post(`/users/${id}/companies`, { company_ids: companyIds }),
};

// Item API
export const itemAPI = {
    getAll: (params) => apiClient.get('/items', { params }),
    getOne: (id) => apiClient.get(`/items/${id}`),
    getCategories: (companyId) => apiClient.get(`/items/categories/${companyId}`),
    create: (formData) => apiClient.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => apiClient.put(`/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => apiClient.delete(`/items/${id}`),
};

// Quotation API
export const quotationAPI = {
    getAll: (params) => apiClient.get('/quotations', { params }),
    getOne: (id) => apiClient.get(`/quotations/${id}`),
    create: (quotationData) => apiClient.post('/quotations', quotationData),
    update: (id, quotationData) => apiClient.put(`/quotations/${id}`, quotationData),
    delete: (id) => apiClient.delete(`/quotations/${id}`),
};

// History API
export const historyAPI = {
    getAll: (params) => apiClient.get('/history', { params }),
    getOne: (id) => apiClient.get(`/history/${id}`),
};

// Category API
export const categoryAPI = {
    getAll: (params) => apiClient.get('/categories', { params }),
    getOne: (id) => apiClient.get(`/categories/${id}`),
    create: (categoryData) => apiClient.post('/categories', categoryData),
    update: (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData),
    delete: (id) => apiClient.delete(`/categories/${id}`),
};

// PDF Template API
export const pdfTemplateAPI = {
    getAll: (params) => apiClient.get('/pdf-templates', { params }),
    getOne: (id) => apiClient.get(`/pdf-templates/${id}`),
    create: (templateData) => apiClient.post('/pdf-templates', templateData),
    update: (id, templateData) => apiClient.put(`/pdf-templates/${id}`, templateData),
    delete: (id) => apiClient.delete(`/pdf-templates/${id}`),
};
