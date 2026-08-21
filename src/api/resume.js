import apiClient from './client'

export const analyzeResume = (formData) =>
  apiClient.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
