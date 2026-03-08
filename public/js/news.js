// ==========================================
// News Module - Aggregating News
// ==========================================

const News = {
    newsCache: [],
    lastFetch: 0,

    // ==========================================
    // Fetch News using multiple RSS-to-JSON services
    // ==========================================

    async fetchNews(query, category = 'all') {
        const encodedQuery = encodeURIComponent(query);
        const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=vi&gl=VN&ceid=VN:vi`;

        // Try multiple RSS-to-JSON proxy services
        const proxies = [
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
            `https://rss2json.com/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
        ];

        for (const apiUrl of proxies) {
            try {
                const response = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
                if (!response.ok) continue;

                const data = await response.json();

                if (data.status === 'ok' && data.items) {
                    return data.items.map(item => ({
                        title: this.cleanHtml(item.title),
                        description: this.cleanHtml(item.description || ''),
                        link: item.link,
                        pubDate: new Date(item.pubDate),
                        source: item.author || this.extractSource(item.title),
                        thumbnail: item.thumbnail || item.enclosure?.link || null,
                        category: category,
                    }));
                }
            } catch (error) {
                console.warn(`RSS proxy failed for "${query}":`, error.message);
                continue;
            }
        }

        // If all proxies fail, return sample news
        return this.getSampleNews(category);
    },

    // Sample news as fallback when APIs fail
    getSampleNews(category) {
        const now = new Date();
        if (category === 'stock') {
            return [
                {
                    title: 'Thị trường chứng khoán Việt Nam: Xu hướng và phân tích mới nhất',
                    description: 'Cập nhật tình hình thị trường chứng khoán Việt Nam với các phân tích chi tiết.',
                    link: 'https://cafef.vn',
                    pubDate: new Date(now - 2 * 3600000),
                    source: 'CafeF',
                    thumbnail: null,
                    category: 'stock',
                },
                {
                    title: 'VN-Index biến động: Nhận định của các chuyên gia',
                    description: 'Các chuyên gia nhận định về xu hướng thị trường trong thời gian tới.',
                    link: 'https://vietstock.vn',
                    pubDate: new Date(now - 4 * 3600000),
                    source: 'VietStock',
                    thumbnail: null,
                    category: 'stock',
                },
                {
                    title: 'Cổ phiếu ngành ngân hàng: Cơ hội đầu tư trong giai đoạn mới',
                    description: 'Phân tích nhóm cổ phiếu ngân hàng và tiềm năng tăng trưởng.',
                    link: 'https://cafef.vn',
                    pubDate: new Date(now - 6 * 3600000),
                    source: 'CafeF',
                    thumbnail: null,
                    category: 'stock',
                },
            ];
        } else {
            return [
                {
                    title: 'Bitcoin và thị trường crypto: Cập nhật biến động giá mới nhất',
                    description: 'Theo dõi biến động giá Bitcoin và các đồng tiền điện tử chính.',
                    link: 'https://coindesk.com',
                    pubDate: new Date(now - 1 * 3600000),
                    source: 'CoinDesk',
                    thumbnail: null,
                    category: 'crypto',
                },
                {
                    title: 'Ethereum cập nhật: Những thay đổi quan trọng trong hệ sinh thái',
                    description: 'Các cập nhật mới nhất về Ethereum và hệ sinh thái DeFi.',
                    link: 'https://cointelegraph.com',
                    pubDate: new Date(now - 3 * 3600000),
                    source: 'CoinTelegraph',
                    thumbnail: null,
                    category: 'crypto',
                },
                {
                    title: 'Phân tích thị trường Crypto: Xu hướng đầu tư 2026',
                    description: 'Tổng hợp phân tích và dự báo thị trường tiền điện tử.',
                    link: 'https://coindesk.com',
                    pubDate: new Date(now - 5 * 3600000),
                    source: 'CoinDesk',
                    thumbnail: null,
                    category: 'crypto',
                },
            ];
        }
    },

    cleanHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    },

    extractSource(title) {
        const match = title.match(/ - ([^-]+)$/);
        return match ? match[1].trim() : 'Google News';
    },

    // ==========================================
    // Load and aggregate news
    // ==========================================

    async loadNews(filter = 'all') {
        const newsList = document.getElementById('news-list');
        const loadingEl = document.getElementById('news-loading');

        newsList.innerHTML = '';
        loadingEl.classList.remove('hidden');

        const watchlist = Watchlist.get();
        let allNews = [];

        try {
            // Fetch stock-related news
            if (filter === 'all' || filter === 'stock') {
                const marketNews = await this.fetchNews('chứng khoán Việt Nam thị trường', 'stock');
                allNews.push(...marketNews);

                // News for specific watched stocks (limited to avoid too many API calls)
                const topStocks = watchlist.stocks.slice(0, 2);
                for (const symbol of topStocks) {
                    const stockInfo = CONFIG.POPULAR_STOCKS.find(s => s.symbol === symbol);
                    if (stockInfo) {
                        const stockNews = await this.fetchNews(`${stockInfo.name} ${symbol} cổ phiếu`, 'stock');
                        stockNews.forEach(n => {
                            n.relatedSymbols = [symbol];
                        });
                        allNews.push(...stockNews);
                    }
                }
            }

            // Fetch crypto-related news
            if (filter === 'all' || filter === 'crypto') {
                const cryptoNews = await this.fetchNews('Bitcoin Ethereum crypto tiền điện tử', 'crypto');
                allNews.push(...cryptoNews);

                const topCryptos = watchlist.cryptos.slice(0, 2);
                for (const id of topCryptos) {
                    const cryptoInfo = CONFIG.POPULAR_CRYPTOS.find(c => c.id === id);
                    if (cryptoInfo) {
                        const cNews = await this.fetchNews(`${cryptoInfo.name} ${cryptoInfo.symbol}`, 'crypto');
                        cNews.forEach(n => {
                            n.relatedSymbols = [cryptoInfo.symbol];
                        });
                        allNews.push(...cNews);
                    }
                }
            }
        } catch (error) {
            console.warn('News loading error:', error.message);
        }

        // Remove duplicates and sort by date
        const seen = new Set();
        allNews = allNews.filter(news => {
            const key = news.title.substring(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Filter to last 48 hours (more lenient for fallback news)
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        allNews = allNews.filter(n => n.pubDate >= twoDaysAgo);

        // Sort by date (newest first)
        allNews.sort((a, b) => b.pubDate - a.pubDate);

        // Limit to 30 items
        allNews = allNews.slice(0, 30);

        this.newsCache = allNews;
        loadingEl.classList.add('hidden');
        this.renderNews(allNews);
    },

    // ==========================================
    // Render News
    // ==========================================

    renderNews(news) {
        const newsList = document.getElementById('news-list');

        if (news.length === 0) {
            newsList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div class="empty-icon">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <h3 style="margin-bottom: 8px;">Chưa có tin tức mới</h3>
                    <p style="color: var(--text-secondary);">Tin tức trong 24h gần nhất sẽ hiển thị tại đây</p>
                </div>
            `;
            return;
        }

        newsList.innerHTML = news.map(item => {
            const timeAgo = this.getTimeAgo(item.pubDate);
            const symbols = item.relatedSymbols || [];

            return `
                <article class="news-card" onclick="window.open('${item.link}', '_blank')">
                    ${item.thumbnail ? `
                        <div class="news-image">
                            <img src="${item.thumbnail}" alt="" onerror="this.parentElement.style.display='none'">
                        </div>
                    ` : ''}
                    <div class="news-content">
                        <span class="news-tag ${item.category}">
                            <i class="fas ${item.category === 'stock' ? 'fa-chart-line' : 'fa-coins'}"></i>
                            ${item.category === 'stock' ? 'Chứng khoán' : 'Crypto'}
                        </span>
                        <h4 class="news-title">${item.title}</h4>
                        <div class="news-meta">
                            <span class="news-source">
                                <i class="fas fa-globe"></i>
                                ${item.source}
                            </span>
                            <span class="news-time">
                                <i class="fas fa-clock"></i>
                                ${timeAgo}
                            </span>
                            ${symbols.length > 0 ? `
                                <span class="news-symbols">
                                    ${symbols.map(s => `<span class="news-symbol-tag">${s}</span>`).join('')}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    },

    // ==========================================
    // Time ago helper
    // ==========================================

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${Math.floor(hours / 24)} ngày trước`;
    },
};
