import apiClient from './client'

export const getSummary = () => apiClient.get('/dashboard/summary')
export const getTrends = () => apiClient.get('/dashboard/trends')
