// Hide login/register buttons and show logout if logged in
document.addEventListener('DOMContentLoaded', function() {
  const isLoggedIn = !!localStorage.getItem('jwt');
  // Hide login/register buttons
  document.querySelectorAll('.login-btn, .register-btn').forEach(btn => {
    if (isLoggedIn) btn.style.display = 'none';
    else btn.style.display = '';
  });

  // Show logout button if not present
  let logoutBtn = document.getElementById('logout-link');
  if (!logoutBtn && isLoggedIn) {
    logoutBtn = document.createElement('a');
    logoutBtn.href = "#";
    logoutBtn.id = "logout-link";
    logoutBtn.innerHTML = '<button class="login-btn">Logout</button>';
    // Try to insert after login/register buttons in navbar
    const navLinks = document.getElementById('navLinks');
    if(navLinks) navLinks.appendChild(logoutBtn);
  }
  if (logoutBtn) {
    logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    logoutBtn.onclick = function(){
      localStorage.removeItem('jwt');
      localStorage.removeItem('loggedInUser');
      window.location.href = "login.html";
      return false;
    };
  }
});
