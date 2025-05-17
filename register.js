document.addEventListener('DOMContentLoaded', function () {
  const API_BASE = 'http://localhost:3001'; // CHANGE to your backend URL on deploy
  const passwordInput = document.getElementById('reg-password');
  const strengthDiv = document.getElementById('password-strength');
  const confirmPassInput = document.getElementById('reg-confirmpass');
  const confirmPassMsg = document.getElementById('confirm-password-message');
  const form = document.getElementById('register-form');
  const emailInput = document.getElementById('reg-email');

  // Insert OTP UI
  let otpSection = document.getElementById('otp-section');
  if (!otpSection) {
    otpSection = document.createElement('div');
    otpSection.id = "otp-section";
    otpSection.style.display = "none";
    otpSection.innerHTML = `
      <label for="reg-otp">Enter OTP sent to your email</label>
      <input type="text" id="reg-otp" name="otp" placeholder="Enter OTP" maxlength="6">
      <div class="password-strength" id="otp-message"></div>
      <button type="button" id="resend-otp-btn" style="margin:10px 0 5px 0;">Resend OTP</button>
    `;
    form.insertBefore(otpSection, form.querySelector('button[type="submit"]'));
  }
  const otpInput = document.getElementById('reg-otp');
  const otpMsg = document.getElementById('otp-message');
  const resendBtn = document.getElementById('resend-otp-btn');
  const registerBtn = form.querySelector('button[type="submit"]');

  // Email validation UI
  let emailError = emailInput.nextElementSibling;
  if (!emailError || emailError.tagName.toLowerCase() !== 'div') {
    emailError = document.createElement('div');
    emailError.className = 'password-strength';
    emailInput.parentNode.insertBefore(emailError, emailInput.nextSibling);
  }
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  function showEmailValidation() {
    const email = emailInput.value;
    if (!email) {
      emailError.textContent = '';
      emailError.className = 'password-strength';
      return true;
    }
    if (!validateEmail(email)) {
      emailError.textContent = 'Please enter a valid email address.';
      emailError.className = 'password-strength weak';
      return false;
    } else {
      emailError.textContent = '';
      emailError.className = 'password-strength';
      return true;
    }
  }
  function evaluatePasswordStrength(pw) {
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[a-z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[\W_]/.test(pw)) strength++;
    if (pw.length < 8) return { label: "Weak (min 8 chars)", class: 'weak' };
    if (!/[A-Z]/.test(pw)) return { label: "Weak (need uppercase)", class: 'weak' };
    if (!/[a-z]/.test(pw)) return { label: "Weak (need lowercase)", class: 'weak' };
    if (!/[\W_]/.test(pw)) return { label: "Weak (need special symbol)", class: 'weak' };
    if (!/[0-9]/.test(pw)) return { label: "Medium (add a digit for strong password)", class: 'medium' };
    if (pw.length >= 12 && strength >= 5) return { label: "Strong", class: 'strong' };
    return { label: "Strong", class: 'strong' };
  }
  function updateStrength() {
    const pw = passwordInput.value;
    if (!pw) {
      strengthDiv.textContent = '';
      strengthDiv.className = 'password-strength';
      return;
    }
    const result = evaluatePasswordStrength(pw);
    strengthDiv.textContent = result.label;
    strengthDiv.className = 'password-strength ' + result.class;
  }
  function checkPasswordMatch() {
    const pw = passwordInput.value;
    const cpw = confirmPassInput.value;
    if (!cpw) {
      confirmPassMsg.textContent = '';
      confirmPassMsg.className = 'password-strength';
      return;
    }
    if (pw !== cpw) {
      confirmPassMsg.textContent = "Passwords do not match";
      confirmPassMsg.className = "password-strength nomatch";
    } else {
      confirmPassMsg.textContent = "Passwords match";
      confirmPassMsg.className = "password-strength match";
    }
  }

  passwordInput.addEventListener('input', updateStrength);
  passwordInput.addEventListener('input', checkPasswordMatch);
  confirmPassInput.addEventListener('input', checkPasswordMatch);
  emailInput.addEventListener('input', showEmailValidation);

  // OTP: resend
  resendBtn.addEventListener('click', async function () {
    const email = emailInput.value.trim();
    if (!email) return;
    resendBtn.disabled = true;
    otpMsg.textContent = "Resending OTP...";
    const resp = await fetch(API_BASE + '/api/resend-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await resp.json();
    otpMsg.textContent = data.msg;
    resendBtn.disabled = false;
  });

  // Registration/OTP flow
  let pendingEmail = '';
  form.addEventListener('submit', async function (e) {
    updateStrength();
    checkPasswordMatch();
    const pw = passwordInput.value;
    const cpw = confirmPassInput.value;
    const result = evaluatePasswordStrength(pw);

    if (!showEmailValidation()) { emailInput.focus(); e.preventDefault(); return false; }
    if (result.class !== 'strong') { strengthDiv.textContent = "Password is not strong enough: " + result.label; strengthDiv.className = 'password-strength weak'; passwordInput.focus(); e.preventDefault(); return false; }
    if (pw !== cpw) { confirmPassMsg.textContent = "Passwords do not match"; confirmPassMsg.className = "password-strength nomatch"; confirmPassInput.focus(); e.preventDefault(); return false; }

    // If OTP is visible, verify
    if (otpSection.style.display === "block") {
      e.preventDefault();
      const email = emailInput.value.trim();
      const otp = otpInput.value.trim();
      const resp = await fetch(API_BASE + '/api/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await resp.json();
      otpMsg.textContent = data.msg;
      if (data.success) {
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 900);
      }
      return false;
    }

    // First registration step
    e.preventDefault();
    registerBtn.disabled = true;
    const body = {
      name: document.getElementById('reg-name').value.trim(),
      username: document.getElementById('reg-username').value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value
    };
    const resp = await fetch(API_BASE + '/api/register', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
    const data = await resp.json();
    registerBtn.disabled = false;
    if (data.success) {
      otpSection.style.display = "block";
      otpMsg.textContent = "OTP sent to your email.";
      pendingEmail = body.email;
      registerBtn.textContent = "Verify OTP & Register";
      otpInput.focus();
    } else {
      alert(data.msg);
    }
  });
});
