import apiClient from './client'

export const generateRoadmap = (data) =>
  apiClient.post('/roadmap/generate', data)
