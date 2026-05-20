document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('application-form');
  if (!form) return;

  const feedback = document.getElementById('application-feedback');
  const serviceSelect = form.querySelector('[name="service"]');

  loadServicesIntoSelect(serviceSelect);

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    feedback.textContent = 'Отправка...';
    feedback.className = 'feedback';

    const formData = new FormData(form);
    const serviceId = formData.get('service');

    try {
      await apiRequest('/applications', {
        method: 'POST',
        body: {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          serviceId: serviceId || undefined,
          message: formData.get('message'),
        },
      });
      feedback.textContent = 'Заявка принята. Наш менеджер скоро свяжется с вами.';
      feedback.className = 'feedback success';
      form.reset();
      loadServicesIntoSelect(serviceSelect);
    } catch (error) {
      feedback.textContent = error.message;
      feedback.className = 'feedback error';
    }
  });
});

async function loadServicesIntoSelect(select) {
  if (!select) return;
  try {
    const services = await apiRequest('/services');
    const current = select.value;
    select.innerHTML = '<option value="">Выберите услугу</option>';
    services.forEach((service) => {
      const option = document.createElement('option');
      option.value = service._id;
      option.textContent = `${service.title} — от ${service.price.toLocaleString('ru-RU')} ₸`;
      select.appendChild(option);
    });
    if (current) select.value = current;
  } catch {
    select.innerHTML = `
      <option value="">Выберите услугу</option>
      <option value="">Автострахование</option>
      <option value="">Медицинское страхование</option>
    `;
  }
}
