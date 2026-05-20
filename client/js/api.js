const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка запроса');
  }
  return data;
}

function updateNav() {
  const user = getUser();
  const authLinks = document.querySelector('.auth-links');
  if (!authLinks) return;

  if (user) {
    const dashboardLink = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    const label = user.role === 'admin' ? 'Админ-панель' : 'Кабинет';
    authLinks.innerHTML = `
      <span class="user-greeting">${user.name}</span>
      <a href="${dashboardLink}">${label}</a>
      <button type="button" class="button button-outline" id="logout-btn">Выйти</button>
    `;
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearAuth();
        window.location.href = 'index.html';
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
