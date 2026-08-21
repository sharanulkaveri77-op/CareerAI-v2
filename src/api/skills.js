import apiClient from './client'

export const getSkills = () => apiClient.get('/skills')
export const addSkill = (data) => apiClient.post('/skills', data)
export const analyzeSkills = () => apiClient.post('/skills/analyze')
