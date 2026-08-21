import apiClient from './client'

export const startInterview = (data) =>
  apiClient.post('/interview/ai/start', data)
export const submitAnswer = (data) =>
  apiClient.post('/interview/ai/answer', data)
export const getInterviewSummary = (sessionId) =>
  apiClient.get('/interview/ai/summary', { params: { sessionId } })
