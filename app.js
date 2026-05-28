/* ==========================================================================
   Sora POS Landing Page Javascript Logic
   Handles: Configurable URLs, Form submission, API request, Toast system,
   and dynamic POS redirect with auto-login token.
   ========================================================================== */

// Configurable target URLs - Edit these when deploying to production (e.g. Vercel)
const CONFIG = {
  API_URL: 'https://sora-pos-backend.vercel.app', // Backend API URL
  POS_URL: 'https://sora-pos.vercel.app', // Frontend React POS App URL
};

document.addEventListener('DOMContentLoaded', () => {
  // Update static links to redirect dynamically to POS login page
  const btnLoginRedirect = document.getElementById('btn-login-redirect');
  const linkLogin = document.getElementById('link-login');
  
  if (btnLoginRedirect) {
    btnLoginRedirect.href = `${CONFIG.POS_URL}/login`;
  }
  if (linkLogin) {
    linkLogin.href = `${CONFIG.POS_URL}/login`;
  }

  // Handle registration form submit
  const registerForm = document.getElementById('register-form');
  const btnSubmit = document.getElementById('btn-submit');
  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Retrieve form values
      const fullName = document.getElementById('full_name').value.trim();
      const storeName = document.getElementById('store_name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;

      // Basic client-side validation
      if (fullName.length < 2) {
        showToast('Họ tên chủ cửa hàng phải tối thiểu 2 ký tự.', 'error');
        return;
      }
      if (storeName.length < 2) {
        showToast('Tên cửa hàng phải tối thiểu 2 ký tự.', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Mật khẩu tối thiểu phải 6 ký tự.', 'error');
        return;
      }

      // Set Loading State
      setLoading(true);

      try {
        const response = await fetch(`${CONFIG.API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            full_name: `${fullName} (${storeName})`, // Combine name and store name for the user full_name field
            phone,
            store_name: storeName,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Có lỗi xảy ra trong quá trình đăng ký.');
        }

        // Show Success Toast
        showToast('Đăng ký tài khoản cửa hàng thành công!', 'success');

        // Extract token and redirect to POS
        const token = result.data.token;
        if (token) {
          showToast('Đang chuyển hướng bạn đến ứng dụng POS...', 'success');
          setTimeout(() => {
            // Redirect with token query parameter so POS does auto-login
            window.location.href = `${CONFIG.POS_URL}/?token=${token}`;
          }, 1500);
        } else {
          // Fallback if no token is returned
          setTimeout(() => {
            window.location.href = `${CONFIG.POS_URL}/login`;
          }, 1500);
        }

      } catch (error) {
        showToast(error.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.', 'error');
        setLoading(false);
      }
    });
  }

  // Loader state manager
  function setLoading(isLoading) {
    if (isLoading) {
      btnSubmit.disabled = true;
      btnText.classList.add('hidden');
      btnLoader.classList.remove('hidden');
    } else {
      btnSubmit.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  }

  // Toast Notification System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Append to container
    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      // Remove element from DOM after transition completes
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 4000);
  }
});
