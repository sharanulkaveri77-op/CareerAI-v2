import apiClient from './client'

export const searchRoles = (q) =>
  apiClient.get('/roles/search', { params: { q } })
export const getSavedRoles = () => apiClient.get('/roles/saved')
export const saveRole = (role) => apiClient.post('/roles/saved', role)
export const removeSavedRole = (id) => apiClient.delete(`/roles/saved/${id}`)
