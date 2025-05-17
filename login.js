document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  const loginInput = document.getElementById('login-username');
  const pwInput = document.getElementById('login-password');
  const msgDiv = document.getElementById('login-message');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    msgDiv.textContent = '';
    msgDiv.className = 'password-strength';

    const input = loginInput.value.trim();
    const pw = pwInput.value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u =>
      (u.username === input || u.email === input) && u.password === pw
    );
    if (user) {
      msgDiv.textContent = 'Login successful! Welcome, ' + user.name;
      msgDiv.className = 'password-strength match';
      // Save session (optional)
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      setTimeout(() => {
        // Redirect or show dashboard as needed
        alert('Login successful! Welcome, ' + user.name);
        // window.location.href = 'dashboard.html';
      }, 600);
    } else {
      msgDiv.textContent = 'Invalid username/email or password.';
      msgDiv.className = 'password-strength nomatch';
    }
  });
});
