import api from './api'

export default {
  getAll() {
    return api.get('/transactions')
  },
  getById(id) {
    return api.get(`/transactions/${id}`)
  },
  create(data) {
    return api.post('/transactions', data)
  },
  update(id, data) {
    return api.put(`/transactions/${id}`, data)
  },
  delete(id) {
    return api.delete(`/transactions/${id}`)
  },
  getWeekly() {
    return api.get('/transactions/weekly')
  },
  getExpenseCategories() {
    return api.get('/transactions/expense-categories')
  }

}
