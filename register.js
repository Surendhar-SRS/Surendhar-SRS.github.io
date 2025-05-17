document.addEventListener('DOMContentLoaded', function () {
  const passwordInput = document.getElementById('reg-password');
  const strengthDiv = document.getElementById('password-strength');
  const confirmPassInput = document.getElementById('reg-confirmpass');
  const confirmPassMsg = document.getElementById('confirm-password-message');
  const form = document.getElementById('register-form');
  const emailInput = document.getElementById('reg-email');

  // Create or select the email error message div
  let emailError = emailInput.nextElementSibling;
  // If the next sibling is not a div, create one
  if (!emailError || emailError.tagName.toLowerCase() !== 'div') {
    emailError = document.createElement('div');
    emailError.className = 'password-strength';
    emailError.style.marginTop = '-0.7em';
    emailError.style.marginBottom = '1em';
    emailError.style.fontSize = '0.98em';
    emailError.style.fontWeight = '600';
    emailError.style.textAlign = 'left';
    emailError.style.minHeight = '1.3em';
    emailInput.parentNode.insertBefore(emailError, emailInput.nextSibling);
  }

  function validateEmail(email) {
    // Basic, robust email regex
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

  // Live email validation
  emailInput.addEventListener('input', showEmailValidation);

  // Form validation
  form.addEventListener('submit', function(e) {
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
  });
});
