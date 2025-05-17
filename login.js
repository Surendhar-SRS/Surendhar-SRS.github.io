document.addEventListener('DOMContentLoaded', function () {
  const API_BASE = 'http://localhost:3001'; // CHANGE to your backend URL on deploy
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = document.getElementById('login-username').value.trim();
    const pw = document.getElementById('login-password').value;
    const resp = await fetch(API_BASE + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: input, password: pw })
    });
    const data = await resp.json();
    if (data.success) {
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } else {
      alert(data.msg);
    }
  });
});
