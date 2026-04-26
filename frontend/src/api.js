const BASE = import.meta.env.VITE_API_URL || ''

export const fetchStats = () =>
  fetch(`${BASE}/api/stats`).then(r => r.json())

export const fetchMonthlyRevenue = () =>
  fetch(`${BASE}/api/revenue/monthly`).then(r => r.json())

export const fetchTopCustomers = () =>
  fetch(`${BASE}/api/customers/top`).then(r => r.json())

export const fetchTopProducts = () =>
  fetch(`${BASE}/api/products/top`).then(r => r.json())

export const fetchSegments = () =>
  fetch(`${BASE}/api/segments`).then(r => r.json())

export const fetchProducts = () =>
  fetch(`${BASE}/api/products`).then(r => r.json())

export const postRecommend = (stock_code, top_n = 5) =>
  fetch(`${BASE}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock_code, top_n }),
  }).then(r => r.json())

export const uploadFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return fetch(`${BASE}/api/upload`, { method: 'POST', body: form }).then(r => {
    if (!r.ok) return r.json().then(e => Promise.reject(e.detail))
    return r.json()
  })
}

export const addTransaction = (data) =>
  fetch(`${BASE}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json())
