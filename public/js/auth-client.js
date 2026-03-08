// ==========================================
// Authentication Client Module
// Calls server API routes instead of localStorage
// ==========================================

const Auth = {
    // Check auth status from server
    async checkStatus() {
        try {
            const res = await fetch('/api/auth/check');
            const data = await res.json();
            return data.status; // 'no_password' | 'not_authenticated' | 'authenticated'
        } catch (error) {
            console.error('Auth check failed:', error);
            return 'not_authenticated';
        }
    },

    // Setup password (first time)
    async setupPassword(password) {
        try {
            const res = await fetch('/api/auth/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Login
    async login(password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return true;
        } catch (error) {
            console.warn('Login failed:', error.message);
            return false;
        }
    },

    // Logout
    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // Initialize auth UI
    async initUI() {
        const loginScreen = document.getElementById('login-screen');
        const loginForm = document.getElementById('login-form');
        const setupSection = document.getElementById('setup-password');
        const app = document.getElementById('app');

        const status = await this.checkStatus();

        if (status === 'no_password') {
            // Show setup section, hide login form
            loginForm.classList.add('hidden');
            setupSection.style.borderTop = 'none';
            setupSection.style.marginTop = '0';
            setupSection.style.paddingTop = '0';

            document.getElementById('setup-btn').addEventListener('click', async () => {
                const newPwd = document.getElementById('new-password').value;
                const confirmPwd = document.getElementById('confirm-password').value;
                const errorEl = document.getElementById('setup-error');

                if (newPwd.length < 4) {
                    errorEl.classList.remove('hidden');
                    errorEl.querySelector('span').textContent = 'Mật khẩu phải có ít nhất 4 ký tự';
                    return;
                }

                if (newPwd !== confirmPwd) {
                    errorEl.classList.remove('hidden');
                    errorEl.querySelector('span').textContent = 'Mật khẩu xác nhận không khớp';
                    return;
                }

                const result = await this.setupPassword(newPwd);
                if (result.success) {
                    loginScreen.classList.add('hidden');
                    app.classList.remove('hidden');
                    if (typeof UI !== 'undefined') UI.showToast('Tạo mật khẩu thành công! 🎉', 'success');
                    if (typeof App !== 'undefined') App.init();
                } else {
                    errorEl.classList.remove('hidden');
                    errorEl.querySelector('span').textContent = result.error;
                }
            });
        } else if (status === 'authenticated') {
            // Already authenticated
            loginScreen.classList.add('hidden');
            app.classList.remove('hidden');
            if (typeof App !== 'undefined') App.init();
        } else {
            // Show login form
            setupSection.classList.add('hidden');

            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const pwd = document.getElementById('login-password').value;
                const errorEl = document.getElementById('login-error');
                const btn = document.getElementById('login-btn');

                btn.disabled = true;
                btn.innerHTML = '<span>Đang xác thực...</span> <i class="fas fa-spinner fa-spin"></i>';

                const isValid = await this.login(pwd);

                if (isValid) {
                    loginScreen.style.animation = 'fadeOut 0.4s ease forwards';
                    setTimeout(() => {
                        loginScreen.classList.add('hidden');
                        app.classList.remove('hidden');
                        if (typeof App !== 'undefined') App.init();
                    }, 400);
                } else {
                    errorEl.classList.remove('hidden');
                    btn.disabled = false;
                    btn.innerHTML = '<span>Đăng nhập</span> <i class="fas fa-arrow-right"></i>';
                    document.getElementById('login-password').value = '';
                    document.getElementById('login-password').focus();
                }
            });
        }
    },
};

// Add fadeOut animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);
