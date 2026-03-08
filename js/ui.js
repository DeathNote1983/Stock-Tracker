// ==========================================
// UI Module - Rendering & DOM Manipulation
// ==========================================

const UI = {
    currentPage: 'dashboard',
    currentFilter: 'all',
    previousPrices: new Map(),

    // ==========================================
    // Toast Notifications
    // ==========================================

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
        };

        toast.innerHTML = `
            <span class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></span>
            <span class="toast-message">${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('leaving');
            setTimeout(() => toast.remove(), 300);
        });

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('leaving');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    },

    // ==========================================
    // Page Navigation
    // ==========================================

    switchPage(page) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            stocks: 'Chứng khoán Việt Nam',
            crypto: 'Thị trường Crypto',
            news: 'Tin tức 24h',
        };
        document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

        this.currentPage = page;

        // Close mobile menu
        document.getElementById('sidebar').classList.remove('mobile-open');

        // Load page data
        if (page === 'stocks') {
            this.renderStockTable();
        } else if (page === 'crypto') {
            this.renderCryptoPage();
        } else if (page === 'news') {
            News.loadNews();
        }
    },

    // ==========================================
    // Market Summary Cards
    // ==========================================

    updateMarketSummary(indexData, cryptoData) {
        // VN-Index - show "Đang cập nhật" since index API is not available for free
        const vnIndexPriceEl = document.getElementById('vnindex-price');
        const vnIndexChangeEl = document.getElementById('vnindex-change');
        const hnxIndexPriceEl = document.getElementById('hnxindex-price');
        const hnxIndexChangeEl = document.getElementById('hnxindex-change');

        if (indexData) {
            const vnIndex = indexData.find(d => d.t === 'VNINDEX');
            if (vnIndex) {
                const price = (vnIndex.cp || 0);
                const change = (vnIndex.pcp || 0);
                const changePercent = vnIndex.tcp || 0;
                vnIndexPriceEl.textContent = price.toFixed(2);
                const dir = change >= 0 ? 'up' : 'down';
                vnIndexChangeEl.className = `summary-change ${dir}`;
                vnIndexChangeEl.innerHTML = `<span>${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)} (${API.formatPercent(changePercent)})</span>`;
            }

            const hnxIndex = indexData.find(d => d.t === 'HNXINDEX');
            if (hnxIndex) {
                const price = (hnxIndex.cp || 0);
                const change = (hnxIndex.pcp || 0);
                const changePercent = hnxIndex.tcp || 0;
                hnxIndexPriceEl.textContent = price.toFixed(2);
                const dir = change >= 0 ? 'up' : 'down';
                hnxIndexChangeEl.className = `summary-change ${dir}`;
                hnxIndexChangeEl.innerHTML = `<span>${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)} (${API.formatPercent(changePercent)})</span>`;
            }
        } else {
            // Show that index data is updating
            vnIndexPriceEl.textContent = 'Đang cập nhật';
            vnIndexPriceEl.style.fontSize = '0.9rem';
            vnIndexChangeEl.innerHTML = '<span style="color: var(--text-muted); font-size: 0.75rem;">Dữ liệu chỉ số thị trường</span>';
            hnxIndexPriceEl.textContent = 'Đang cập nhật';
            hnxIndexPriceEl.style.fontSize = '0.9rem';
            hnxIndexChangeEl.innerHTML = '<span style="color: var(--text-muted); font-size: 0.75rem;">Dữ liệu chỉ số thị trường</span>';
        }

        // BTC & ETH summary
        if (cryptoData) {
            const btc = cryptoData.find(c => c.id === 'bitcoin');
            if (btc) {
                document.getElementById('btc-summary-price').textContent = API.formatUSD(btc.price);
                const changeEl = document.getElementById('btc-summary-change');
                const dir = btc.change24h >= 0 ? 'up' : 'down';
                changeEl.className = `summary-change ${dir}`;
                changeEl.innerHTML = `<span>${btc.change24h >= 0 ? '▲' : '▼'} ${API.formatPercent(btc.change24h)}</span>`;
            }

            const eth = cryptoData.find(c => c.id === 'ethereum');
            if (eth) {
                document.getElementById('eth-summary-price').textContent = API.formatUSD(eth.price);
                const changeEl = document.getElementById('eth-summary-change');
                const dir = eth.change24h >= 0 ? 'up' : 'down';
                changeEl.className = `summary-change ${dir}`;
                changeEl.innerHTML = `<span>${eth.change24h >= 0 ? '▲' : '▼'} ${API.formatPercent(eth.change24h)}</span>`;
            }
        }
    },

    // ==========================================
    // Watchlist Rendering
    // ==========================================

    renderWatchlist(stockData, cryptoData, filter = 'all') {
        const grid = document.getElementById('watchlist-grid');
        const emptyState = document.getElementById('empty-watchlist');
        const watchlist = Watchlist.get();

        let items = [];

        // Add stock items
        if (filter === 'all' || filter === 'stock') {
            for (const symbol of watchlist.stocks) {
                const data = stockData.find(s => s.symbol === symbol);
                if (data) items.push(data);
            }
        }

        // Add crypto items
        if (filter === 'all' || filter === 'crypto') {
            for (const id of watchlist.cryptos) {
                const data = cryptoData.find(c => c.id === id);
                if (data) items.push(data);
            }
        }

        if (items.length === 0 && watchlist.stocks.length === 0 && watchlist.cryptos.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        emptyState.classList.add('hidden');

        grid.innerHTML = items.map(item => this.createWatchlistCard(item)).join('');

        // Add remove button handlers
        grid.querySelectorAll('.card-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = btn.dataset.type;
                const id = btn.dataset.id;
                Watchlist.remove(type, id);
                this.showToast(`Đã xóa ${id.toUpperCase()} khỏi danh sách`, 'info');
                App.refreshData();
            });
        });
    },

    createWatchlistCard(item) {
        const isStock = item.type === 'stock';
        const change = isStock ? item.change : item.change24h;
        const changePercent = isStock ? item.changePercent : item.change24h;
        const dir = change >= 0 ? 'up' : change < 0 ? 'down' : 'neutral';
        const price = isStock ? API.formatVND(item.price) : API.formatUSD(item.price);

        // Check for price flash
        const prevPrice = this.previousPrices.get(item.symbol || item.id);
        let flashClass = '';
        if (prevPrice !== undefined) {
            const currentPrice = item.price;
            if (currentPrice > prevPrice) flashClass = 'price-up';
            else if (currentPrice < prevPrice) flashClass = 'price-down';
        }
        this.previousPrices.set(item.symbol || item.id, item.price);

        return `
            <div class="watchlist-card ${dir}" data-type="${item.type}" data-id="${isStock ? item.symbol : item.id}">
                <div class="card-header">
                    <div class="card-info">
                        <div class="card-icon ${item.type}">
                            ${isStock ? '<i class="fas fa-chart-bar"></i>' : '<i class="fab fa-bitcoin"></i>'}
                        </div>
                        <div>
                            <div class="card-symbol">${isStock ? item.symbol : item.symbol.toUpperCase()}</div>
                            <div class="card-name">${item.name}</div>
                        </div>
                    </div>
                    <button class="card-remove" data-type="${item.type}" data-id="${isStock ? item.symbol : item.id}" title="Xóa khỏi danh sách">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="card-price-section">
                    <div class="card-price ${flashClass}">${price}${isStock ? ' ₫' : ''}</div>
                    <div class="card-change ${dir}">
                        ${isStock ? `<span class="card-change-value">${change >= 0 ? '+' : ''}${API.formatVND(change)} ₫</span>` : ''}
                        <span class="card-change-percent">${change >= 0 ? '▲' : '▼'} ${Math.abs(changePercent).toFixed(2)}%</span>
                    </div>
                </div>
                <div class="card-meta">
                    <span class="card-volume">
                        <i class="fas fa-chart-bar"></i>
                        ${isStock ? 'KL: ' + API.formatLargeNumber(item.volume) : 'MCap: ' + API.formatLargeNumber(item.marketCap)}
                    </span>
                    <span class="card-exchange-badge">
                        ${isStock ? item.exchange : '#' + (item.rank || '--')}
                    </span>
                </div>
            </div>
        `;
    },

    // ==========================================
    // Stock Table
    // ==========================================

    async renderStockTable(exchange = 'all', searchQuery = '') {
        const tbody = document.getElementById('stock-table-body');

        // Show loading
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 40px;">
                <div class="spinner" style="margin: 0 auto 12px;"></div>
                <p style="color: var(--text-secondary);">Đang tải dữ liệu...</p>
            </td></tr>
        `;

        // Fetch all popular stocks data
        const symbols = CONFIG.POPULAR_STOCKS.map(s => s.symbol);
        const data = await API.getStockData(symbols);

        let filtered = data;

        // Filter by exchange
        if (exchange !== 'all') {
            filtered = filtered.filter(s => s.exchange === exchange);
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.symbol.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    Không tìm thấy kết quả
                </td></tr>
            `;
            return;
        }

        const watchlist = Watchlist.get();

        tbody.innerHTML = filtered.map(stock => {
            const dir = stock.change >= 0 ? 'up' : stock.change < 0 ? 'down' : 'neutral';
            const isWatching = watchlist.stocks.includes(stock.symbol);

            return `
                <tr>
                    <td class="symbol-cell">${stock.symbol}</td>
                    <td><span class="card-exchange-badge">${stock.exchange}</span></td>
                    <td class="price-cell">${API.formatVND(stock.price)} ₫</td>
                    <td class="change-cell ${dir}">${stock.change >= 0 ? '+' : ''}${API.formatVND(stock.change)}</td>
                    <td class="change-cell ${dir}">${API.formatPercent(stock.changePercent)}</td>
                    <td class="volume-cell">${API.formatLargeNumber(stock.volume)}</td>
                    <td>
                        <button class="watch-btn ${isWatching ? 'watching' : 'add'}" 
                                data-symbol="${stock.symbol}" 
                                data-action="${isWatching ? 'remove' : 'add'}">
                            ${isWatching ? '<i class="fas fa-eye"></i> Đang theo dõi' : '<i class="fas fa-plus"></i> Theo dõi'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners for watch buttons
        tbody.querySelectorAll('.watch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const symbol = btn.dataset.symbol;
                const action = btn.dataset.action;

                if (action === 'add') {
                    Watchlist.addStock(symbol);
                    btn.className = 'watch-btn watching';
                    btn.dataset.action = 'remove';
                    btn.innerHTML = '<i class="fas fa-eye"></i> Đang theo dõi';
                    UI.showToast(`Đã thêm ${symbol} vào danh sách`, 'success');
                } else {
                    Watchlist.removeStock(symbol);
                    btn.className = 'watch-btn add';
                    btn.dataset.action = 'add';
                    btn.innerHTML = '<i class="fas fa-plus"></i> Theo dõi';
                    UI.showToast(`Đã xóa ${symbol} khỏi danh sách`, 'info');
                }
            });
        });
    },

    // ==========================================
    // Crypto Page
    // ==========================================

    async renderCryptoPage() {
        const grid = document.getElementById('crypto-grid');
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="spinner" style="margin: 0 auto 12px;"></div>
                <p style="color: var(--text-secondary);">Đang tải dữ liệu crypto...</p>
            </div>
        `;

        const data = await API.fetchTopCryptos(30);
        const watchlist = Watchlist.get();

        if (data.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    Không thể tải dữ liệu. Vui lòng thử lại sau.
                </div>
            `;
            return;
        }

        grid.innerHTML = data.map(crypto => {
            const dir = crypto.change24h >= 0 ? 'up' : 'down';
            const isWatching = watchlist.cryptos.includes(crypto.id);

            return `
                <div class="crypto-card">
                    <div class="crypto-header">
                        <div class="crypto-info">
                            <div class="crypto-icon-wrapper">
                                <span style="font-size: 1.4rem; font-weight: 800; color: var(--accent-primary);">${crypto.symbol.substring(0, 2)}</span>
                            </div>
                            <div>
                                <div class="crypto-symbol">${crypto.symbol}</div>
                                <div class="crypto-name">${crypto.name}</div>
                            </div>
                        </div>
                        <span class="crypto-rank">#${crypto.rank}</span>
                    </div>
                    <div class="crypto-price-section">
                        <div class="crypto-price">${API.formatUSD(crypto.price)}</div>
                        <span class="crypto-change-badge ${dir}">
                            ${crypto.change24h >= 0 ? '▲' : '▼'} ${Math.abs(crypto.change24h).toFixed(2)}%
                        </span>
                    </div>
                    <div class="crypto-stats">
                        <div class="crypto-stat">
                            <div class="crypto-stat-label">Market Cap</div>
                            <div class="crypto-stat-value">${API.formatLargeNumber(crypto.marketCap)}</div>
                        </div>
                        <div class="crypto-stat">
                            <div class="crypto-stat-label">Volume 24h</div>
                            <div class="crypto-stat-value">${API.formatLargeNumber(crypto.volume24h)}</div>
                        </div>
                        <div class="crypto-stat">
                            <div class="crypto-stat-label">Supply</div>
                            <div class="crypto-stat-value">${API.formatLargeNumber(crypto.supply)}</div>
                        </div>
                    </div>
                    <div class="crypto-actions">
                        <button class="crypto-watch-btn ${isWatching ? 'watching' : 'add'}" 
                                data-crypto-id="${crypto.id}"
                                data-action="${isWatching ? 'remove' : 'add'}">
                            ${isWatching ? '<i class="fas fa-eye"></i> Đang theo dõi' : '<i class="fas fa-plus"></i> Thêm theo dõi'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        grid.querySelectorAll('.crypto-watch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.cryptoId;
                const action = btn.dataset.action;

                if (action === 'add') {
                    Watchlist.addCrypto(id);
                    btn.className = 'crypto-watch-btn watching';
                    btn.dataset.action = 'remove';
                    btn.innerHTML = '<i class="fas fa-eye"></i> Đang theo dõi';
                    UI.showToast(`Đã thêm ${id.toUpperCase()} vào danh sách`, 'success');
                } else {
                    Watchlist.removeCrypto(id);
                    btn.className = 'crypto-watch-btn add';
                    btn.dataset.action = 'add';
                    btn.innerHTML = '<i class="fas fa-plus"></i> Thêm theo dõi';
                    UI.showToast(`Đã xóa ${id.toUpperCase()} khỏi danh sách`, 'info');
                }
            });
        });
    },

    // ==========================================
    // Modal
    // ==========================================

    openModal() {
        document.getElementById('add-modal').classList.remove('hidden');
        document.getElementById('modal-stock-search').focus();
        this.renderModalStockResults('');
        this.renderModalCryptoResults('');
    },

    closeModal() {
        document.getElementById('add-modal').classList.add('hidden');
    },

    switchModalTab(tab) {
        document.querySelectorAll('.modal-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.modalTab === tab);
        });
        document.getElementById('modal-stock-content').classList.toggle('active', tab === 'stock');
        document.getElementById('modal-crypto-content').classList.toggle('active', tab === 'crypto');

        if (tab === 'stock') {
            document.getElementById('modal-stock-search').focus();
        } else {
            document.getElementById('modal-crypto-search').focus();
        }
    },

    renderModalStockResults(query) {
        const container = document.getElementById('modal-stock-results');
        const watchlist = Watchlist.get();

        let stocks = CONFIG.POPULAR_STOCKS;
        if (query) {
            const q = query.toLowerCase();
            stocks = stocks.filter(s =>
                s.symbol.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q)
            );
        }

        container.innerHTML = stocks.map(stock => {
            const isAdded = watchlist.stocks.includes(stock.symbol);
            return `
                <div class="result-item">
                    <div class="result-info">
                        <span class="result-symbol">${stock.symbol}</span>
                        <span class="result-name">${stock.name}</span>
                        <span class="result-exchange">${stock.exchange}</span>
                    </div>
                    <button class="result-add-btn ${isAdded ? 'added' : 'add'}" 
                            data-symbol="${stock.symbol}"
                            ${isAdded ? 'disabled' : ''}>
                        ${isAdded ? '<i class="fas fa-check"></i> Đã thêm' : '<i class="fas fa-plus"></i> Thêm'}
                    </button>
                </div>
            `;
        }).join('');

        if (stocks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Không tìm thấy mã chứng khoán</p>';
        }

        // Add click handlers
        container.querySelectorAll('.result-add-btn.add').forEach(btn => {
            btn.addEventListener('click', () => {
                const symbol = btn.dataset.symbol;
                Watchlist.addStock(symbol);
                btn.className = 'result-add-btn added';
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
                UI.showToast(`Đã thêm ${symbol} vào danh sách theo dõi`, 'success');
                App.refreshData();
            });
        });
    },

    async renderModalCryptoResults(query) {
        const container = document.getElementById('modal-crypto-results');
        const watchlist = Watchlist.get();

        let cryptos;
        if (query && query.length >= 2) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Đang tìm...</p>';
            cryptos = await API.searchCrypto(query);
        } else {
            // Show popular cryptos from config
            cryptos = CONFIG.POPULAR_CRYPTOS.map(c => ({
                id: c.id,
                symbol: c.symbol,
                name: c.name,
                type: 'crypto',
            }));
        }

        container.innerHTML = cryptos.map(crypto => {
            const isAdded = watchlist.cryptos.includes(crypto.id);
            return `
                <div class="result-item">
                    <div class="result-info">
                        <span class="result-symbol">${crypto.symbol.toUpperCase()}</span>
                        <span class="result-name">${crypto.name}</span>
                        ${crypto.rank ? `<span class="result-exchange">#${crypto.rank}</span>` : ''}
                    </div>
                    <button class="result-add-btn ${isAdded ? 'added' : 'add'}" 
                            data-crypto-id="${crypto.id}"
                            ${isAdded ? 'disabled' : ''}>
                        ${isAdded ? '<i class="fas fa-check"></i> Đã thêm' : '<i class="fas fa-plus"></i> Thêm'}
                    </button>
                </div>
            `;
        }).join('');

        if (cryptos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Không tìm thấy crypto</p>';
        }

        // Add click handlers
        container.querySelectorAll('.result-add-btn.add').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.cryptoId;
                Watchlist.addCrypto(id);
                btn.className = 'result-add-btn added';
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
                UI.showToast(`Đã thêm vào danh sách theo dõi`, 'success');
                App.refreshData();
            });
        });
    },

    // ==========================================
    // Update Clock
    // ==========================================

    updateClock() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        };
        document.getElementById('current-time').textContent = now.toLocaleDateString('vi-VN', options);
    },

    // ==========================================
    // Market Status
    // ==========================================

    updateMarketStatus(connected) {
        const statusEl = document.getElementById('market-status');
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('span');

        if (connected) {
            dot.className = 'status-dot connected';
            text.textContent = 'Đã kết nối';
        } else {
            dot.className = 'status-dot error';
            text.textContent = 'Mất kết nối';
        }
    },
};

// ==========================================
// Watchlist Manager
// ==========================================

const Watchlist = {
    get() {
        const data = localStorage.getItem(CONFIG.STORAGE.WATCHLIST);
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return { ...CONFIG.DEFAULT_WATCHLIST };
            }
        }
        return { ...CONFIG.DEFAULT_WATCHLIST };
    },

    save(watchlist) {
        localStorage.setItem(CONFIG.STORAGE.WATCHLIST, JSON.stringify(watchlist));
    },

    addStock(symbol) {
        const wl = this.get();
        if (!wl.stocks.includes(symbol)) {
            wl.stocks.push(symbol);
            this.save(wl);
        }
    },

    removeStock(symbol) {
        const wl = this.get();
        wl.stocks = wl.stocks.filter(s => s !== symbol);
        this.save(wl);
    },

    addCrypto(id) {
        const wl = this.get();
        if (!wl.cryptos.includes(id)) {
            wl.cryptos.push(id);
            this.save(wl);
        }
    },

    removeCrypto(id) {
        const wl = this.get();
        wl.cryptos = wl.cryptos.filter(c => c !== id);
        this.save(wl);
    },

    remove(type, id) {
        if (type === 'stock') this.removeStock(id);
        else if (type === 'crypto') this.removeCrypto(id);
    },

    hasStock(symbol) {
        return this.get().stocks.includes(symbol);
    },

    hasCrypto(id) {
        return this.get().cryptos.includes(id);
    },
};
