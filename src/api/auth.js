import apiClient from './client'

export const studentSignup = (data) =>
  apiClient.post('/auth/student/signup', data)
export const studentLogin = (data) =>
  apiClient.post('/auth/student/login', data)
export const adminSignup = (data) =>
  apiClient.post('/auth/admin/signup', data)
export const adminLogin = (data) => apiClient.post('/auth/admin/login', data)
