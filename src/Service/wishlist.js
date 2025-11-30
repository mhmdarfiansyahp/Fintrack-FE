import api from './api'

export default {
  getAll() {
    return api.get('/wishlist')
  },
  getById(id) {
    return api.get(`/wishlist/${id}`)
  },
  create(data) {
    return api.post('/wishlist', data)
  },
  update(id, data) {
    return api.put(`/wishlist/${id}`, data)
  },
  delete(id) {
    return api.delete(`/wishlist/${id}`)
  },
}