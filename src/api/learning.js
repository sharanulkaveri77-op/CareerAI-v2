import apiClient from './client'

export const getLearning = (params) => apiClient.get('/learning', { params })
