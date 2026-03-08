// ==========================================
// Main App Module - Initialization & Logic
// ==========================================

const App = {
    intervals: {},
    isRefreshing: false,

    // ==========================================
    // Initialize Application
    // ==========================================

    async init() {
        console.log('🚀 VN Stock & Crypto Tracker is starting...');

        // Setup event listeners
        this.setupEventListeners();

        // Start clock
        UI.updateClock();
        setInterval(() => UI.updateClock(), 1000);

        // Initial data load
        await this.refreshData();

        // Start auto-refresh intervals
        this.startAutoRefresh();

        // Update market status
        UI.updateMarketStatus(true);

        console.log('✅ App initialized successfully');
    },

    // ==========================================
    // Event Listeners
    // ==========================================

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                UI.switchPage(item.dataset.page);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Mobile menu
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });

        // Add watchlist button
        document.getElementById('add-watchlist-btn').addEventListener('click', () => UI.openModal());
        const addFirstBtn = document.getElementById('add-first-btn');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => UI.openModal());
        }

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', async () => {
            const btn = document.getElementById('refresh-btn');
            btn.classList.add('spinning');
            await this.refreshData();
            setTimeout(() => btn.classList.remove('spinning'), 500);
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            Auth.logout();
            location.reload();
        });

        // Modal events
        document.getElementById('modal-close').addEventListener('click', () => UI.closeModal());
        document.querySelector('.modal-overlay').addEventListener('click', () => UI.closeModal());

        // Modal tabs
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', () => UI.switchModalTab(tab.dataset.modalTab));
        });

        // Modal stock search
        let stockSearchTimer;
        document.getElementById('modal-stock-search').addEventListener('input', (e) => {
            clearTimeout(stockSearchTimer);
            stockSearchTimer = setTimeout(() => {
                UI.renderModalStockResults(e.target.value);
            }, 200);
        });

        // Modal crypto search
        let cryptoSearchTimer;
        document.getElementById('modal-crypto-search').addEventListener('input', (e) => {
            clearTimeout(cryptoSearchTimer);
            cryptoSearchTimer = setTimeout(() => {
                UI.renderModalCryptoResults(e.target.value);
            }, 400);
        });

        // Stock tags in modal
        document.querySelectorAll('#popular-stock-tags .tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const symbol = btn.dataset.symbol;
                if (Watchlist.hasStock(symbol)) {
                    UI.showToast(`${symbol} đã có trong danh sách`, 'info');
                    return;
                }
                Watchlist.addStock(symbol);
                btn.classList.add('active');
                UI.showToast(`Đã thêm ${symbol} vào danh sách`, 'success');
                UI.renderModalStockResults(document.getElementById('modal-stock-search').value);
                this.refreshData();
            });
        });

        // Crypto tags in modal
        document.querySelectorAll('#popular-crypto-tags .tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cryptoId = btn.dataset.crypto;
                if (Watchlist.hasCrypto(cryptoId)) {
                    UI.showToast(`Đã có trong danh sách`, 'info');
                    return;
                }
                Watchlist.addCrypto(cryptoId);
                btn.classList.add('active');
                UI.showToast(`Đã thêm vào danh sách`, 'success');
                UI.renderModalCryptoResults(document.getElementById('modal-crypto-search').value);
                this.refreshData();
            });
        });

        // Dashboard filter tabs
        document.querySelectorAll('.filter-tab[data-filter]').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab[data-filter]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                UI.currentFilter = tab.dataset.filter;
                this.refreshDashboard();
            });
        });

        // Stock page search
        let tableSearchTimer;
        document.getElementById('stock-search').addEventListener('input', (e) => {
            clearTimeout(tableSearchTimer);
            tableSearchTimer = setTimeout(() => {
                const exchange = document.querySelector('.exchange-btn.active').dataset.exchange;
                UI.renderStockTable(exchange, e.target.value);
            }, 300);
        });

        // Exchange filter buttons
        document.querySelectorAll('.exchange-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.exchange-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const search = document.getElementById('stock-search').value;
                UI.renderStockTable(btn.dataset.exchange, search);
            });
        });

        // News filter tabs
        document.querySelectorAll('.filter-tab[data-news-filter]').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab[data-news-filter]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                News.loadNews(tab.dataset.newsFilter);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modal
            if (e.key === 'Escape') {
                UI.closeModal();
            }
            // Ctrl+K to open add modal
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                UI.openModal();
            }
        });

        // Close sidebar on outside click (mobile)
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const mobileBtn = document.getElementById('mobile-menu-btn');
            if (sidebar.classList.contains('mobile-open') &&
                !sidebar.contains(e.target) &&
                !mobileBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    },

    // ==========================================
    // Data Refresh
    // ==========================================

    async refreshData() {
        if (this.isRefreshing) return;
        this.isRefreshing = true;

        try {
            const watchlist = Watchlist.get();

            // Fetch data in parallel
            const [stockData, cryptoData, indexData] = await Promise.allSettled([
                watchlist.stocks.length > 0 ? API.getStockData(watchlist.stocks) : Promise.resolve([]),
                watchlist.cryptos.length > 0 ? API.fetchCryptoData(watchlist.cryptos) : Promise.resolve([]),
                API.fetchMarketIndices(),
            ]);

            const stocks = stockData.status === 'fulfilled' ? stockData.value : [];
            const cryptos = cryptoData.status === 'fulfilled' ? cryptoData.value : [];
            const indices = indexData.status === 'fulfilled' ? indexData.value : null;

            // Also fetch BTC and ETH for summary if not in watchlist
            let summaryCryptos = cryptos;
            const cryptoIds = watchlist.cryptos;
            if (!cryptoIds.includes('bitcoin') || !cryptoIds.includes('ethereum')) {
                const extraIds = ['bitcoin', 'ethereum'].filter(id => !cryptoIds.includes(id));
                const extraData = await API.fetchCryptoData(extraIds);
                summaryCryptos = [...cryptos, ...extraData];
            }

            // Update UI
            UI.updateMarketSummary(indices, summaryCryptos);

            // Store data for dashboard refresh
            this._lastStockData = stocks;
            this._lastCryptoData = cryptos;

            // Update dashboard
            this.refreshDashboard();

            UI.updateMarketStatus(true);
        } catch (error) {
            console.error('Data refresh failed:', error);
            UI.updateMarketStatus(false);
        } finally {
            this.isRefreshing = false;
        }
    },

    refreshDashboard() {
        if (UI.currentPage === 'dashboard' || UI.currentPage === undefined) {
            UI.renderWatchlist(
                this._lastStockData || [],
                this._lastCryptoData || [],
                UI.currentFilter
            );
        }
    },

    // ==========================================
    // Auto Refresh
    // ==========================================

    startAutoRefresh() {
        // Refresh stock & crypto data
        this.intervals.data = setInterval(() => {
            if (UI.currentPage === 'dashboard') {
                this.refreshData();
            }
        }, CONFIG.REFRESH.STOCK);

        // Refresh crypto on crypto page
        this.intervals.crypto = setInterval(() => {
            if (UI.currentPage === 'crypto') {
                UI.renderCryptoPage();
            }
        }, CONFIG.REFRESH.CRYPTO * 3); // Every 30 seconds on crypto page
    },

    stopAutoRefresh() {
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
        this.intervals = {};
    },

    // Internal data store
    _lastStockData: [],
    _lastCryptoData: [],
};

// ==========================================
// Bootstrap Application
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    Auth.initUI();
});
