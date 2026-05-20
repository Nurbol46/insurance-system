document.addEventListener('DOMContentLoaded', async function () {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  try {
    const services = await apiRequest('/services');
    grid.innerHTML = services
      .map(
        (service) => `
      <article class="service-card">
        <span class="badge">${service.category}</span>
        <h2>${service.title}</h2>
        <p>${service.description}</p>
        <p class="price">от ${Number(service.price).toLocaleString('ru-RU')} ₸ / год</p>
        <a href="application.html" class="button">Оформить</a>
      </article>
    `
      )
      .join('');
  } catch {
    grid.innerHTML = '<p class="feedback error">Не удалось загрузить каталог услуг.</p>';
  }
});
