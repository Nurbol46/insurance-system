document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('status-form');
  const result = document.getElementById('status-result');

  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const number = new FormData(form).get('policyNumber');
    result.innerHTML = '<p>Поиск...</p>';

    try {
      const data = await apiRequest(`/policies/status/${encodeURIComponent(number)}`);
      result.innerHTML = `
        <h2>Результат проверки</h2>
        <p><strong>Номер полиса:</strong> ${data.policyNumber}</p>
        <p><strong>Статус:</strong> <span class="status-${data.status}">${data.statusLabel}</span></p>
        <p><strong>Услуга:</strong> ${data.service}</p>
        <p><strong>Страхователь:</strong> ${data.holder}</p>
        ${
          data.startDate
            ? `<p><strong>Период:</strong> ${formatDate(data.startDate)} — ${formatDate(data.endDate)}</p>`
            : ''
        }
      `;
    } catch (error) {
      result.innerHTML = `<p class="feedback error">${error.message}</p>`;
    }
  });
});

function formatDate(value) {
  return new Date(value).toLocaleDateString('ru-RU');
}
