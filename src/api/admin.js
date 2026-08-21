import apiClient from './client'

export const getAdminSummary = () => apiClient.get('/admin/summary')
export const getStudents = () => apiClient.get('/admin/students')
export const getInterviews = () => apiClient.get('/admin/interviews')
export const getMaterials = () => apiClient.get('/admin/materials')
export const getQuizzes = () => apiClient.get('/admin/quizzes')
export const getAssignments = () => apiClient.get('/admin/assignments')
export const getPerformance = () => apiClient.get('/admin/performance')
