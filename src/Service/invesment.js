import api from './api'

export default {
  getAll() {
    return api.get('/invesments')
  },
  getById(id) {
    return api.get(`/invesments/${id}`)
  },
  create(data) {
    return api.post('/invesments', data)
  },
  update(id, data) {
    return api.put(`/invesments/${id}`, data)
  },
  delete(id) {
    return api.delete(`/invesments/${id}`)
  },
}
