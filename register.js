document.addEventListener('DOMContentLoaded', function () {
  const passwordInput = document.getElementById('reg-password');
  const strengthDiv = document.getElementById('password-strength');
  const confirmPassInput = document.getElementById('reg-confirmpass');
  const confirmPassMsg = document.getElementById('confirm-password-message');
  const form = document.getElementById('register-form');
  const emailInput = document.getElementById('reg-email');
  const otpSection = document.getElementById('otp-section');
  const otpInput = document.getElementById('reg-otp');
  const otpMsg = document.getElementById('otp-message');
  const resendBtn = document.getElementById('resend-otp-btn');
  const registerBtn = document.getElementById('register-btn');

  // Helper functions
  function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }
  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  function userExists(username, email) {
    return getUsers().some(u => u.username === username || u.email === email);
  }
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  function sendOTPToEmail(email, otp) {
    // Since we can't send real email, show OTP in alert (for demo)
    alert(`OTP for ${email}: ${otp}`);
  }

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

  // --- OTP Logic ---
  let currentOTP = '';
  let currentEmail = '';
  let otpTimeout = null;
  let otpResendDelay = 30; // seconds
  let resendTimer = null;

  function startResendCooldown() {
    let seconds = otpResendDelay;
    resendBtn.disabled = true;
    resendBtn.textContent = `Resend OTP (${seconds})`;
    resendTimer = setInterval(() => {
      seconds--;
      resendBtn.textContent = `Resend OTP (${seconds})`;
      if (seconds <= 0) {
        clearInterval(resendTimer);
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend OTP";
      }
    }, 1000);
  }

  resendBtn.addEventListener('click', function () {
    if (!currentEmail) {
      otpMsg.textContent = "Enter your email first!";
      otpMsg.className = 'password-strength weak';
      return;
    }
    currentOTP = generateOTP();
    sendOTPToEmail(currentEmail, currentOTP);
    otpMsg.textContent = "A new OTP has been sent to your email (see alert box).";
    otpMsg.className = "password-strength strong";
    startResendCooldown();
  });

  // --- Registration and OTP verification flow ---
  let pendingUser = null;
  form.addEventListener('submit', function (e) {
    updateStrength();
    checkPasswordMatch();
    const pw = passwordInput.value;
    const cpw = confirmPassInput.value;
    const result = evaluatePasswordStrength(pw);

    // Email validation
    if (!showEmailValidation()) {
      emailInput.focus();
      e.preventDefault();
      return false;
    }
    if (result.class !== 'strong') {
      strengthDiv.textContent = "Password is not strong enough: " + result.label;
      strengthDiv.className = 'password-strength weak';
      passwordInput.focus();
      e.preventDefault();
      return false;
    }
    if (pw !== cpw) {
      confirmPassMsg.textContent = "Passwords do not match";
      confirmPassMsg.className = "password-strength nomatch";
      confirmPassInput.focus();
      e.preventDefault();
      return false;
    }

    // If OTP section is visible, verify OTP
    if (otpSection.style.display === "block") {
      e.preventDefault();
      if (!otpInput.value || otpInput.value.length !== 6) {
        otpMsg.textContent = "Please enter the 6-digit OTP.";
        otpMsg.className = "password-strength weak";
        return false;
      }
      if (otpInput.value !== currentOTP) {
        otpMsg.textContent = "Incorrect OTP. Please check again or resend.";
        otpMsg.className = "password-strength weak";
        return false;
      }
      // OTP is correct, save user
      otpMsg.textContent = "OTP verified! Completing registration...";
      otpMsg.className = "password-strength strong";
      let users = getUsers();
      users.push(pendingUser);
      saveUsers(users);
      // Clean up
      pendingUser = null;
      currentOTP = '';
      currentEmail = '';
      setTimeout(() => {
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
      }, 800);
      return false;
    }

    // First step: check if user exists
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    if (userExists(username, email)) {
      alert('Username or email already exists!');
      e.preventDefault();
      return false;
    }
    // Store pending data and show OTP UI
    pendingUser = {
      name: document.getElementById('reg-name').value.trim(),
      username,
      email,
      password: passwordInput.value // Plaintext for demo only!
    };
    currentEmail = email;
    currentOTP = generateOTP();
    sendOTPToEmail(currentEmail, currentOTP);

    otpSection.style.display = "block";
    otpMsg.textContent = "An OTP has been sent to your email (see alert box).";
    otpMsg.className = "password-strength strong";
    registerBtn.textContent = "Verify OTP & Register";
    otpInput.focus();
    startResendCooldown();
    e.preventDefault();
    return false;
  });
});
