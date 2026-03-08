// ==========================================
// API Module - Data Fetching
// ==========================================

const API = {
    // Cache for API responses
    cache: {
        stocks: new Map(),
        cryptos: new Map(),
        lastFetch: {
            stocks: 0,
            cryptos: 0,
        }
    },

    // ==========================================
    // Vietnamese Stock Data (VPS API)
    // ==========================================

    // Fetch bulk stock data from VPS API
    async fetchStockPrices(symbols) {
        if (!symbols || symbols.length === 0) return [];

        try {
            const tickerString = symbols.join(',');
            const url = `${CONFIG.API.VPS_STOCK_DATA}/${tickerString}`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
                signal: AbortSignal.timeout(8000), // 8 second timeout (API hangs when market closed)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const text = await response.text();
            const data = text ? JSON.parse(text) : [];

            if (data && Array.isArray(data) && data.length > 0) {
                const results = [];
                for (const item of data) {
                    const stockInfo = CONFIG.POPULAR_STOCKS.find(s => s.symbol === item.sym) ||
                        { symbol: item.sym, name: item.sym, exchange: 'HOSE' };

                    // VPS API: prices are in 1000 VND (e.g., 62.4 = 62,400 VND)
                    const lastPrice = parseFloat(item.lastPrice) || 0;
                    const refPrice = parseFloat(item.r) || 0;
                    const change = lastPrice - refPrice;
                    const changePercent = refPrice > 0 ? (change / refPrice) * 100 : 0;

                    const result = {
                        symbol: item.sym,
                        name: stockInfo.name,
                        exchange: stockInfo.exchange,
                        price: lastPrice * 1000, // Convert to VND
                        change: change * 1000,
                        changePercent: parseFloat(changePercent.toFixed(2)),
                        volume: parseInt(item.lot) || 0,
                        high: (parseFloat(item.highPrice) || 0) * 1000,
                        low: (parseFloat(item.lowPrice) || 0) * 1000,
                        open: (parseFloat(item.openPrice) || 0) * 1000,
                        ceiling: (parseFloat(item.c) || 0) * 1000,
                        floor: (parseFloat(item.f) || 0) * 1000,
                        ref: refPrice * 1000,
                        foreignBuy: parseInt(item.fBVol) || 0,
                        foreignSell: parseInt(item.fSVolume) || 0,
                        type: 'stock',
                    };

                    this.cache.stocks.set(item.sym, result);
                    results.push(result);
                }
                this.cache.lastFetch.stocks = Date.now();
                return results;
            }

            // API returned empty data (market closed / weekend)
            console.info('VPS API returned empty data (market may be closed). Using simulated data.');
            return this.generateStockData(symbols);
        } catch (error) {
            console.warn('VPS API failed:', error.message);
            // Return cached data if available
            const cached = symbols.map(s => this.cache.stocks.get(s)).filter(Boolean);
            if (cached.length > 0) return cached;

            // Final fallback: simulated data
            console.info('Using simulated stock data');
            return this.generateStockData(symbols);
        }
    },

    // Generate simulated stock data for demo purposes (fallback only)
    generateStockData(symbols) {
        const results = [];
        for (const symbol of symbols) {
            const stockInfo = CONFIG.POPULAR_STOCKS.find(s => s.symbol === symbol) ||
                { symbol, name: symbol, exchange: 'HOSE' };

            const cached = this.cache.stocks.get(symbol);
            let basePrice = cached ? cached.price : (Math.random() * 80 + 10) * 1000;

            const variation = basePrice * (Math.random() * 0.02 - 0.01);
            const price = Math.round(basePrice + variation);
            const change = Math.round(variation);
            const changePercent = ((change / (price - change)) * 100);

            const data = {
                symbol: symbol,
                name: stockInfo.name,
                exchange: stockInfo.exchange,
                price: price,
                change: change,
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: Math.floor(Math.random() * 10000000) + 100000,
                type: 'stock',
            };

            this.cache.stocks.set(symbol, data);
            results.push(data);
        }
        return results;
    },

    // Get stock data (with fallback)
    async getStockData(symbols) {
        if (!symbols || symbols.length === 0) return [];
        return await this.fetchStockPrices(symbols);
    },

    // ==========================================
    // Cryptocurrency Data (CoinGecko API)
    // ==========================================

    async fetchCryptoData(ids) {
        if (!ids || ids.length === 0) return [];

        try {
            // Try CoinGecko first
            const params = new URLSearchParams({
                ids: ids.join(','),
                vs_currencies: 'usd',
                include_24hr_change: 'true',
                include_market_cap: 'true',
                include_24hr_vol: 'true',
            });

            const response = await fetch(`${CONFIG.API.COINGECKO_SIMPLE}?${params}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);
            const data = await response.json();

            if (data && Object.keys(data).length > 0) {
                return ids.map(id => {
                    const coin = data[id];
                    if (!coin) return null;

                    const cryptoInfo = CONFIG.POPULAR_CRYPTOS.find(c => c.id === id) || {};
                    const result = {
                        id: id,
                        symbol: cryptoInfo.symbol || id.toUpperCase(),
                        name: cryptoInfo.name || id,
                        price: coin.usd || 0,
                        change24h: coin.usd_24h_change || 0,
                        marketCap: coin.usd_market_cap || 0,
                        volume24h: coin.usd_24h_vol || 0,
                        type: 'crypto',
                    };
                    this.cache.cryptos.set(id, result);
                    return result;
                }).filter(Boolean);
            }
            return [];
        } catch (error) {
            console.warn('CoinGecko API failed:', error.message);

            // Try CoinPaprika as backup
            try {
                return await this.fetchCryptoFromPaprika(ids);
            } catch (e) {
                console.warn('CoinPaprika backup also failed:', e.message);
            }

            // Return cached data if available
            return ids.map(id => this.cache.cryptos.get(id)).filter(Boolean);
        }
    },

    // Backup: CoinPaprika API
    async fetchCryptoFromPaprika(ids) {
        // CoinPaprika uses different IDs: btc-bitcoin, eth-ethereum, etc.
        const paprikaIdMap = {
            'bitcoin': 'btc-bitcoin',
            'ethereum': 'eth-ethereum',
            'solana': 'sol-solana',
            'binancecoin': 'bnb-binance-coin',
            'ripple': 'xrp-xrp',
            'cardano': 'ada-cardano',
            'dogecoin': 'doge-dogecoin',
            'polkadot': 'dot-polkadot',
            'avalanche-2': 'avax-avalanche',
            'tron': 'trx-tron',
            'chainlink': 'link-chainlink',
            'uniswap': 'uni-uniswap',
            'litecoin': 'ltc-litecoin',
            'matic-network': 'pol-polygon-ecosystem-token',
            'shiba-inu': 'shib-shiba-inu',
        };

        const results = [];
        for (const id of ids) {
            const paprikaId = paprikaIdMap[id];
            if (!paprikaId) continue;

            try {
                const response = await fetch(`${CONFIG.API.COINPAPRIKA_TICKERS}/${paprikaId}`);
                if (!response.ok) continue;

                const coin = await response.json();
                const cryptoInfo = CONFIG.POPULAR_CRYPTOS.find(c => c.id === id) || {};
                const usdQuote = coin.quotes?.USD || {};

                const result = {
                    id: id,
                    symbol: cryptoInfo.symbol || coin.symbol,
                    name: cryptoInfo.name || coin.name,
                    price: usdQuote.price || 0,
                    change24h: usdQuote.percent_change_24h || 0,
                    marketCap: usdQuote.market_cap || 0,
                    volume24h: usdQuote.volume_24h || 0,
                    rank: coin.rank || 0,
                    type: 'crypto',
                };
                this.cache.cryptos.set(id, result);
                results.push(result);
            } catch (e) {
                console.warn(`CoinPaprika failed for ${id}:`, e.message);
            }
        }
        return results;
    },

    // Fetch all top crypto assets using CoinGecko markets API
    async fetchTopCryptos(limit = 50) {
        try {
            const params = new URLSearchParams({
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: limit.toString(),
                page: '1',
                sparkline: 'false',
                price_change_percentage: '24h',
            });

            const response = await fetch(`${CONFIG.API.COINGECKO_MARKETS}?${params}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (data && Array.isArray(data)) {
                return data.map(coin => ({
                    id: coin.id,
                    symbol: coin.symbol?.toUpperCase(),
                    name: coin.name,
                    price: coin.current_price || 0,
                    change24h: coin.price_change_percentage_24h || 0,
                    marketCap: coin.market_cap || 0,
                    volume24h: coin.total_volume || 0,
                    rank: coin.market_cap_rank || 0,
                    image: coin.image,
                    type: 'crypto',
                }));
            }
            return [];
        } catch (error) {
            console.warn('Failed to fetch top cryptos:', error.message);
            return [];
        }
    },

    // Search crypto by name/symbol using CoinGecko
    async searchCrypto(query) {
        try {
            const response = await fetch(`${CONFIG.API.COINGECKO_SEARCH}?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (data && data.coins) {
                return data.coins.slice(0, 20).map(coin => ({
                    id: coin.id,
                    symbol: coin.symbol?.toUpperCase(),
                    name: coin.name,
                    rank: coin.market_cap_rank || 0,
                    image: coin.thumb,
                    type: 'crypto',
                }));
            }
            return [];
        } catch (error) {
            console.warn('Crypto search failed:', error.message);
            return [];
        }
    },

    // ==========================================
    // Market Index Data
    // ==========================================

    async fetchMarketIndices() {
        // VN-Index is not available via VPS stock data API
        // We'll return null and the UI will show "Đang cập nhật"
        // In a production app, this would use a WebSocket or paid API
        return null;
    },

    // ==========================================
    // Utility Functions
    // ==========================================

    formatVND(price) {
        if (!price && price !== 0) return '--';
        return new Intl.NumberFormat('vi-VN').format(price);
    },

    formatUSD(price) {
        if (!price && price !== 0) return '--';
        if (price >= 1) {
            return '$' + new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(price);
        } else if (price >= 0.01) {
            return '$' + price.toFixed(4);
        } else {
            return '$' + price.toFixed(8);
        }
    },

    formatLargeNumber(num) {
        if (!num && num !== 0) return '--';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toFixed(0);
    },

    formatPercent(value) {
        if (!value && value !== 0) return '--';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    },
};
