// src/api/index.js
const API_BASE = "http://localhost:5000";

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (!res.ok) {
    const body = await res.text();
    let parsed;
    try { parsed = JSON.parse(body); } catch { parsed = { message: body }; }
    const err = new Error(parsed.error || parsed.message || "Request failed");
    err.status = res.status;
    err.body = parsed;
    throw err;
  }
  return res.json();
}

export const api = {
  async getEvents() {
    return fetchJson(`${API_BASE}/events`);
  },
  async createEvent(payload) {
    return fetchJson(`${API_BASE}/events`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateEvent(id, payload) {
    return fetchJson(`${API_BASE}/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  async deleteEvent(id) {
    return fetchJson(`${API_BASE}/events/${id}`, { method: "DELETE" });
  },

  // categories
  async getCategories() {
    return fetchJson(`${API_BASE}/categories`);
  },
  async createCategory(payload) {
    return fetchJson(`${API_BASE}/categories`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateCategory(id, payload) {
    return fetchJson(`${API_BASE}/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  async deleteCategory(id) {
    return fetchJson(`${API_BASE}/categories/${id}`, { method: "DELETE" });
  }
};
