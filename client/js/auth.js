document.addEventListener('DOMContentLoaded', function () {
  const user = getUser();
  if (user && document.body.dataset.authPage) {
    window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

async function handleLogin(event) {
  event.preventDefault();
  const feedback = document.getElementById('auth-feedback');
  const form = event.target;
  const formData = new FormData(form);

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: formData.get('email'),
        password: formData.get('password'),
      },
    });
    setAuth(data.token, data.user);
    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const feedback = document.getElementById('auth-feedback');
  const form = event.target;
  const formData = new FormData(form);

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
      },
    });
    setAuth(data.token, data.user);
    window.location.href = 'dashboard.html';
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
}
