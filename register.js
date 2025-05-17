 document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('reg-password');
    const strengthDiv = document.getElementById('password-strength');
    const confirmPassInput = document.getElementById('reg-confirmpass');
    const confirmPassMsg = document.getElementById('confirm-password-message');
    const form = document.getElementById('register-form');
    const togglePassword = document.getElementById('toggle-password');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');

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

    // Eye icon toggle (SVG design switch)
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type');
      const show = type === 'password';
      passwordInput.setAttribute('type', show ? 'text' : 'password');
      eyeOpen.style.display = show ? 'none' : 'block';
      eyeClosed.style.display = show ? 'block' : 'none';
    });

    // Form validation
    form.addEventListener('submit', function(e) {
      updateStrength();
      checkPasswordMatch();
      const pw = passwordInput.value;
      const cpw = confirmPassInput.value;
      const result = evaluatePasswordStrength(pw);
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
