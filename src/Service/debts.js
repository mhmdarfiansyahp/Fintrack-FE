import { getScrollTop } from 'naive-ui/es/affix/src/utils'
import api from './api'

export default {
  getAll() {
    return api.get('/debts')
  },
  getById(id) {
    return api.get(`/debts/${id}`)
  },
  create(data) {
    return api.post('/debts', data)
  },
  update(id, data) {
    return api.put(`/debts/${id}`, data)
  },
  delete(id) {
    return api.delete(`/debts/${id}`)
  },
  getTopDebts() { 
    return api.get('/debts/top')
  }
}
