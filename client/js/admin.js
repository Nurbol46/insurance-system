document.addEventListener('DOMContentLoaded', async function () {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  await loadStats();
  await loadServices();
  await loadClients();
  await loadApplications();

  const serviceForm = document.getElementById('service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', handleAddService);
  }
});

async function loadStats() {
  const statsGrid = document.getElementById('stats-grid');
  try {
    const stats = await apiRequest('/admin/stats');
    statsGrid.innerHTML = `
      <article class="stat-card"><h3>${stats.clients}</h3><p>Клиентов</p></article>
      <article class="stat-card"><h3>${stats.services}</h3><p>Услуг</p></article>
      <article class="stat-card"><h3>${stats.applications}</h3><p>Заявок</p></article>
      <article class="stat-card"><h3>${stats.pendingApplications}</h3><p>Ожидают</p></article>
      <article class="stat-card"><h3>${stats.approvedApplications}</h3><p>Одобрено</p></article>
      <article class="stat-card"><h3>${stats.policies}</h3><p>Полисов</p></article>
    `;
  } catch {
    statsGrid.innerHTML = '<p>Ошибка загрузки статистики</p>';
  }
}

async function loadServices() {
  const tbody = document.querySelector('#services-table tbody');
  try {
    const services = await apiRequest('/services');
    tbody.innerHTML = services
      .map(
        (s) => `
      <tr>
        <td>${s.title}</td>
        <td>${s.category}</td>
        <td>${Number(s.price).toLocaleString('ru-RU')} ₸</td>
        <td><button type="button" class="button button-small button-danger" data-delete="${s._id}">Удалить</button></td>
      </tr>
    `
      )
      .join('');

    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Удалить услугу?')) return;
        await apiRequest(`/services/${btn.dataset.delete}`, { method: 'DELETE' });
        loadServices();
        loadStats();
      });
    });
  } catch {
    tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки</td></tr>';
  }
}

async function loadClients() {
  const tbody = document.querySelector('#clients-table tbody');
  try {
    const clients = await apiRequest('/admin/clients');
    tbody.innerHTML = clients
      .map(
        (c) => `
      <tr>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone || '—'}</td>
        <td>${new Date(c.createdAt).toLocaleDateString('ru-RU')}</td>
      </tr>
    `
      )
      .join('');
  } catch {
    tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки</td></tr>';
  }
}

async function loadApplications() {
  const tbody = document.querySelector('#applications-table tbody');
  try {
    const apps = await apiRequest('/applications');
    tbody.innerHTML = apps
      .map(
        (a) => `
      <tr>
        <td>${a.name}</td>
        <td>${a.serviceTitle || (a.service ? a.service.title : '—')}</td>
        <td><span class="status-${a.status}">${appLabel(a.status)}</span></td>
        <td>
          ${
            a.status === 'pending'
              ? `<button type="button" class="button button-small" data-approve="${a._id}">Одобрить</button>
                 <button type="button" class="button button-small button-danger" data-reject="${a._id}">Отклонить</button>`
              : '—'
          }
        </td>
      </tr>
    `
      )
      .join('');

    tbody.querySelectorAll('[data-approve]').forEach((btn) => {
      btn.addEventListener('click', () => updateApp(btn.dataset.approve, 'approved'));
    });
    tbody.querySelectorAll('[data-reject]').forEach((btn) => {
      btn.addEventListener('click', () => updateApp(btn.dataset.reject, 'rejected'));
    });
  } catch {
    tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки</td></tr>';
  }
}

async function updateApp(id, status) {
  await apiRequest(`/applications/${id}`, { method: 'PATCH', body: { status } });
  await loadApplications();
  await loadStats();
}

async function handleAddService(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const feedback = document.getElementById('service-feedback');

  try {
    await apiRequest('/services', {
      method: 'POST',
      body: {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: formData.get('price'),
      },
    });
    feedback.textContent = 'Услуга добавлена';
    feedback.className = 'feedback success';
    form.reset();
    loadServices();
    loadStats();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
}

function appLabel(status) {
  const map = { pending: 'В обработке', approved: 'Одобрена', rejected: 'Отклонена' };
  return map[status] || status;
}
