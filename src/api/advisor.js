import apiClient from './client'

export const sendChat = (message, history = []) =>
  apiClient.post('/advisor/chat', { message, history })
