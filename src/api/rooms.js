import apiClient from './client'

export const createRoom = (data) => apiClient.post('/rooms/create', data)
export const joinRoom = (data) => apiClient.post('/rooms/join', data)
