// ==========================================
// Authentication Module
// ==========================================

const Auth = {
    // Simple hash function for password (not cryptographic, but sufficient for client-side)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'vn_tracker_salt_2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Check if password is set up
    isPasswordSet() {
        return localStorage.getItem(CONFIG.STORAGE.PASSWORD_HASH) !== null;
    },

    // Set up password
    async setupPassword(password) {
        const hash = await this.hashPassword(password);
        localStorage.setItem(CONFIG.STORAGE.PASSWORD_HASH, hash);
        return true;
    },

    // Verify password
    async verifyPassword(password) {
        const storedHash = localStorage.getItem(CONFIG.STORAGE.PASSWORD_HASH);
        if (!storedHash) return false;
        const inputHash = await this.hashPassword(password);
        return inputHash === storedHash;
    },

    // Login
    async login(password) {
        const isValid = await this.verifyPassword(password);
        if (isValid) {
            // Set auth token with expiry (24 hours)
            const token = {
                hash: await this.hashPassword(Date.now().toString()),
                expiry: Date.now() + 24 * 60 * 60 * 1000,
            };
            localStorage.setItem(CONFIG.STORAGE.AUTH_TOKEN, JSON.stringify(token));
            return true;
        }
        return false;
    },

    // Check if user is authenticated
    isAuthenticated() {
        const tokenStr = localStorage.getItem(CONFIG.STORAGE.AUTH_TOKEN);
        if (!tokenStr) return false;
        try {
            const token = JSON.parse(tokenStr);
            return token.expiry > Date.now();
        } catch {
            return false;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem(CONFIG.STORAGE.AUTH_TOKEN);
    },

    // Initialize auth UI
    initUI() {
        const loginScreen = document.getElementById('login-screen');
        const loginForm = document.getElementById('login-form');
        const setupSection = document.getElementById('setup-password');
        const app = document.getElementById('app');

        if (!this.isPasswordSet()) {
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

                await this.setupPassword(newPwd);
                await this.login(newPwd);
                loginScreen.classList.add('hidden');
                app.classList.remove('hidden');
                UI.showToast('Tạo mật khẩu thành công! 🎉', 'success');
                App.init();
            });
        } else if (this.isAuthenticated()) {
            // Already authenticated
            loginScreen.classList.add('hidden');
            app.classList.remove('hidden');
            App.init();
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
                        App.init();
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
