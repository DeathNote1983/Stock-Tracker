// ==========================================
// Configuration & Constants
// ==========================================

const CONFIG = {
    // App settings
    APP_NAME: 'VN Stock & Crypto Tracker',
    VERSION: '1.0.0',

    // Default password (first-time setup will override)
    DEFAULT_PASSWORD_HASH: null,

    // API endpoints
    API: {
        // Vietnamese Stock API (VPS - working & reliable)
        VPS_STOCK_DATA: 'https://bgapidatafeed.vps.com.vn/getliststockdata',

        // Crypto API (CoinGecko - free, no key, CORS friendly)
        COINGECKO_SIMPLE: 'https://api.coingecko.com/api/v3/simple/price',
        COINGECKO_MARKETS: 'https://api.coingecko.com/api/v3/coins/markets',
        COINGECKO_SEARCH: 'https://api.coingecko.com/api/v3/search',

        // Backup Crypto API (CoinPaprika - free, no key)
        COINPAPRIKA_TICKERS: 'https://api.coinpaprika.com/v1/tickers',

        // News APIs
        GOOGLE_NEWS_RSS: 'https://news.google.com/rss/search',
    },

    // Refresh intervals (ms)
    REFRESH: {
        STOCK: 15000,       // 15 seconds
        CRYPTO: 10000,      // 10 seconds
        NEWS: 300000,       // 5 minutes
        MARKET_INDEX: 30000, // 30 seconds
    },

    // Storage keys
    STORAGE: {
        PASSWORD_HASH: 'vn_tracker_pwd_hash',
        WATCHLIST: 'vn_tracker_watchlist',
        AUTH_TOKEN: 'vn_tracker_auth',
        SETTINGS: 'vn_tracker_settings',
    },

    // Default watchlist
    DEFAULT_WATCHLIST: {
        stocks: [],
        cryptos: ['bitcoin', 'ethereum', 'solana'],
    },

    // Popular Vietnamese stocks with metadata
    POPULAR_STOCKS: [
        // ===== HOSE - Ngân hàng =====
        { symbol: 'VCB', name: 'Vietcombank', exchange: 'HOSE' },
        { symbol: 'BID', name: 'BIDV', exchange: 'HOSE' },
        { symbol: 'CTG', name: 'VietinBank', exchange: 'HOSE' },
        { symbol: 'TCB', name: 'Techcombank', exchange: 'HOSE' },
        { symbol: 'MBB', name: 'MB Bank', exchange: 'HOSE' },
        { symbol: 'VPB', name: 'VPBank', exchange: 'HOSE' },
        { symbol: 'ACB', name: 'ACB Bank', exchange: 'HOSE' },
        { symbol: 'STB', name: 'Sacombank', exchange: 'HOSE' },
        { symbol: 'TPB', name: 'TPBank', exchange: 'HOSE' },
        { symbol: 'HDB', name: 'HDBank', exchange: 'HOSE' },
        { symbol: 'SHB', name: 'SHB Bank', exchange: 'HOSE' },
        { symbol: 'LPB', name: 'LienVietPostBank', exchange: 'HOSE' },
        { symbol: 'EIB', name: 'Eximbank', exchange: 'HOSE' },
        { symbol: 'OCB', name: 'OCB Bank', exchange: 'HOSE' },
        { symbol: 'MSB', name: 'MSB Bank', exchange: 'HOSE' },
        { symbol: 'VIB', name: 'VIB Bank', exchange: 'HOSE' },
        // ===== HOSE - Bất động sản =====
        { symbol: 'VIC', name: 'Vingroup', exchange: 'HOSE' },
        { symbol: 'VHM', name: 'Vinhomes', exchange: 'HOSE' },
        { symbol: 'VRE', name: 'Vincom Retail', exchange: 'HOSE' },
        { symbol: 'NVL', name: 'Novaland', exchange: 'HOSE' },
        { symbol: 'KDH', name: 'Khang Điền', exchange: 'HOSE' },
        { symbol: 'PDR', name: 'Phát Đạt Corp', exchange: 'HOSE' },
        { symbol: 'DXG', name: 'Đất Xanh Group', exchange: 'HOSE' },
        { symbol: 'NLG', name: 'Nam Long Group', exchange: 'HOSE' },
        { symbol: 'HDG', name: 'Hà Đô Group', exchange: 'HOSE' },
        { symbol: 'KBC', name: 'KBC Industrial', exchange: 'HOSE' },
        { symbol: 'IJC', name: 'Becamex IJC', exchange: 'HOSE' },
        { symbol: 'DIG', name: 'DIC Corp', exchange: 'HOSE' },
        { symbol: 'AGG', name: 'An Gia Group', exchange: 'HOSE' },
        { symbol: 'CII', name: 'CII Corp', exchange: 'HOSE' },
        // ===== HOSE - Công nghệ =====
        { symbol: 'FPT', name: 'FPT Corporation', exchange: 'HOSE' },
        { symbol: 'VNZ', name: 'VNG Corporation', exchange: 'HOSE' },
        { symbol: 'CMG', name: 'CMC Group', exchange: 'HOSE' },
        // ===== HOSE - Thép / Vật liệu =====
        { symbol: 'HPG', name: 'Hòa Phát Group', exchange: 'HOSE' },
        { symbol: 'HSG', name: 'Hoa Sen Group', exchange: 'HOSE' },
        { symbol: 'NKG', name: 'Nam Kim Steel', exchange: 'HOSE' },
        // ===== HOSE - Thực phẩm / Tiêu dùng =====
        { symbol: 'VNM', name: 'Vinamilk', exchange: 'HOSE' },
        { symbol: 'MSN', name: 'Masan Group', exchange: 'HOSE' },
        { symbol: 'MWG', name: 'Thế Giới Di Động', exchange: 'HOSE' },
        { symbol: 'SAB', name: 'Sabeco', exchange: 'HOSE' },
        { symbol: 'PNJ', name: 'PNJ Jewelry', exchange: 'HOSE' },
        { symbol: 'DBC', name: 'Dabaco Group', exchange: 'HOSE' },
        { symbol: 'HAG', name: 'HAGL Group', exchange: 'HOSE' },
        { symbol: 'HVN', name: 'Vietnam Airlines', exchange: 'HOSE' },
        { symbol: 'VJC', name: 'Vietjet Air', exchange: 'HOSE' },
        // ===== HOSE - Chứng khoán =====
        { symbol: 'SSI', name: 'SSI Securities', exchange: 'HOSE' },
        { symbol: 'VND', name: 'VNDirect', exchange: 'HOSE' },
        { symbol: 'HCM', name: 'HSC Securities', exchange: 'HOSE' },
        { symbol: 'VCI', name: 'Vietcap Securities', exchange: 'HOSE' },
        { symbol: 'CTS', name: 'CTS Securities', exchange: 'HOSE' },
        { symbol: 'AGR', name: 'Agriseco', exchange: 'HOSE' },
        { symbol: 'ORS', name: 'Tiên Phong Securities', exchange: 'HOSE' },
        // ===== HOSE - Năng lượng / Dầu khí =====
        { symbol: 'GAS', name: 'PV Gas', exchange: 'HOSE' },
        { symbol: 'PLX', name: 'Petrolimex', exchange: 'HOSE' },
        { symbol: 'POW', name: 'PV Power', exchange: 'HOSE' },
        { symbol: 'PVD', name: 'PV Drilling', exchange: 'HOSE' },
        { symbol: 'PVS', name: 'PV Technical', exchange: 'HNX' },
        { symbol: 'PPC', name: 'Phả Lại Power', exchange: 'HOSE' },
        { symbol: 'PC1', name: 'PC1 Group', exchange: 'HOSE' },
        { symbol: 'GEX', name: 'Gelex Group', exchange: 'HOSE' },
        // ===== HOSE - Hóa chất / Phân bón =====
        { symbol: 'DGC', name: 'Đức Giang Chem', exchange: 'HOSE' },
        { symbol: 'DPM', name: 'Đạm Phú Mỹ', exchange: 'HOSE' },
        { symbol: 'DCM', name: 'Đạm Cà Mau', exchange: 'HOSE' },
        // ===== HOSE - Khác =====
        { symbol: 'REE', name: 'REE Corp', exchange: 'HOSE' },
        { symbol: 'DGW', name: 'Digiworld', exchange: 'HOSE' },
        { symbol: 'GMD', name: 'Gemadept', exchange: 'HOSE' },
        { symbol: 'VTP', name: 'Viettel Post', exchange: 'HOSE' },
        { symbol: 'PHR', name: 'Phước Hòa Rubber', exchange: 'HOSE' },
        { symbol: 'BWE', name: 'Biwase Water', exchange: 'HOSE' },
        { symbol: 'CTD', name: 'Cotec Construction', exchange: 'HOSE' },
        { symbol: 'HT1', name: 'Hà Tiên Cement', exchange: 'HOSE' },
        { symbol: 'BVH', name: 'Bảo Việt Holdings', exchange: 'HOSE' },
        { symbol: 'BCM', name: 'Becamex IDC', exchange: 'HOSE' },
        { symbol: 'NT2', name: 'Nhơn Trạch 2 Power', exchange: 'HOSE' },
        { symbol: 'VOS', name: 'VOSCO Shipping', exchange: 'HOSE' },
        { symbol: 'ANV', name: 'Nam Việt Corp', exchange: 'HOSE' },
        { symbol: 'VHC', name: 'Vĩnh Hoàn Corp', exchange: 'HOSE' },
        { symbol: 'IDC', name: 'IDICO Corp', exchange: 'HOSE' },
        { symbol: 'SZC', name: 'Sonadezi Châu Đức', exchange: 'HOSE' },
        { symbol: 'CSV', name: 'Container Việt Nam', exchange: 'HOSE' },
        { symbol: 'AAA', name: 'An Phát Holdings', exchange: 'HOSE' },
        { symbol: 'EVF', name: 'EVN Finance', exchange: 'HOSE' },
        { symbol: 'FRT', name: 'FPT Retail', exchange: 'HOSE' },
        // ===== HNX =====
        { symbol: 'SHS', name: 'SHS Securities', exchange: 'HNX' },
        { symbol: 'TNG', name: 'TNG Invest & Trade', exchange: 'HNX' },
        { symbol: 'PVB', name: 'PV Coating', exchange: 'HNX' },
        { symbol: 'DTD', name: 'ĐT Phát Triển ĐT', exchange: 'HNX' },
        { symbol: 'IDJ', name: 'IDJ Vietnam', exchange: 'HNX' },
        { symbol: 'NDN', name: 'NDN Invest', exchange: 'HNX' },
        { symbol: 'HUT', name: 'TASCO Corp', exchange: 'HNX' },
        // ===== UPCOM =====
        { symbol: 'BSR', name: 'Bình Sơn Refinery', exchange: 'UPCOM' },
        { symbol: 'ACV', name: 'Airports Corp', exchange: 'UPCOM' },
        { symbol: 'QNS', name: 'Quảng Ngãi Sugar', exchange: 'UPCOM' },
        { symbol: 'MCH', name: 'Masan Consumer', exchange: 'UPCOM' },
        { symbol: 'VGI', name: 'Viettel Global', exchange: 'UPCOM' },
        { symbol: 'FOX', name: 'FPT Telecom', exchange: 'UPCOM' },
        { symbol: 'DVN', name: 'Dược Việt Nam', exchange: 'UPCOM' },
        { symbol: 'CEO', name: 'C.E.O Group', exchange: 'UPCOM' },
        { symbol: 'OIL', name: 'PV Oil', exchange: 'UPCOM' },
        { symbol: 'VEA', name: 'VEAM Corp', exchange: 'UPCOM' },
        { symbol: 'VGT', name: 'Viettel Construction', exchange: 'UPCOM' },
        { symbol: 'DNP', name: 'DNP Corp', exchange: 'UPCOM' },
        { symbol: 'DDV', name: 'DAP - VINACHEM', exchange: 'UPCOM' },
        { symbol: 'LTG', name: 'Lộc Trời Group', exchange: 'UPCOM' },
    ],

    // Popular crypto with metadata (using CoinGecko IDs)
    POPULAR_CRYPTOS: [
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
        { id: 'solana', symbol: 'SOL', name: 'Solana' },
        { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
        { id: 'ripple', symbol: 'XRP', name: 'XRP' },
        { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
        { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
        { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
        { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
        { id: 'tron', symbol: 'TRX', name: 'TRON' },
        { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
        { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
        { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
        { id: 'matic-network', symbol: 'POL', name: 'Polygon' },
        { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
    ],
};
