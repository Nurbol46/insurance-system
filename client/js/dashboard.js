document.addEventListener('DOMContentLoaded', async function () {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }

  const policiesList = document.getElementById('policies-list');
  const applicationsList = document.getElementById('applications-list');
  const userName = document.getElementById('user-name');

  if (userName) userName.textContent = user.name;

  try {
    const policies = await apiRequest('/policies/my');
    if (policies.length === 0) {
      policiesList.innerHTML = '<li>У вас пока нет активных полисов.</li>';
    } else {
      policiesList.innerHTML = policies
        .map(
          (p) =>
            `<li><strong>${p.service ? p.service.title : 'Страхование'}</strong> — ${p.policyNumber} (${statusLabel(p.status)})</li>`
        )
        .join('');
    }
  } catch {
    policiesList.innerHTML = '<li>Ошибка загрузки полисов.</li>';
  }

  try {
    const applications = await apiRequest('/applications/my');
    if (applications.length === 0) {
      applicationsList.innerHTML = '<li>Заявок пока нет.</li>';
    } else {
      applicationsList.innerHTML = applications
        .map(
          (a) =>
            `<li>${a.serviceTitle || 'Заявка'} — <span class="status-${a.status}">${appStatusLabel(a.status)}</span></li>`
        )
        .join('');
    }
  } catch {
    applicationsList.innerHTML = '<li>Ошибка загрузки заявок.</li>';
  }
});

function statusLabel(status) {
  const map = { active: 'Активен', pending: 'В обработке', expired: 'Истёк', rejected: 'Отклонён' };
  return map[status] || status;
}

function appStatusLabel(status) {
  const map = { pending: 'В обработке', approved: 'Одобрена', rejected: 'Отклонена' };
  return map[status] || status;
}
