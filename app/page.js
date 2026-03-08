'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function Home() {
    const [dbReady, setDbReady] = useState(false);

    // Initialize database on first load
    useEffect(() => {
        fetch('/api/init', { method: 'POST' })
            .then(r => r.json())
            .then(() => setDbReady(true))
            .catch(() => setDbReady(true)); // Continue even if DB init fails (might already exist)
    }, []);

    return (
        <>
            {/* Login Screen */}
            <div id="login-screen" className="login-screen">
                <div className="login-bg-animation">
                    <div className="floating-orb orb-1"></div>
                    <div className="floating-orb orb-2"></div>
                    <div className="floating-orb orb-3"></div>
                    <div className="floating-orb orb-4"></div>
                </div>
                <div className="login-container">
                    <div className="login-card">
                        <div className="login-logo">
                            <div className="logo-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h1>VN Tracker</h1>
                            <p className="login-subtitle">Chứng khoán &amp; Crypto Real-time</p>
                        </div>
                        <form id="login-form" className="login-form">
                            <div className="input-group">
                                <div className="input-icon">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <input type="password" id="login-password" placeholder="Nhập mật khẩu..." required autoComplete="current-password" />
                            </div>
                            <div id="login-error" className="login-error hidden">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>Mật khẩu không chính xác</span>
                            </div>
                            <button type="submit" id="login-btn" className="login-btn">
                                <span>Đăng nhập</span>
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </form>
                        <div id="setup-password" className="setup-section">
                            <p className="setup-text">Lần đầu? Tạo mật khẩu mới</p>
                            <div className="input-group">
                                <div className="input-icon">
                                    <i className="fas fa-key"></i>
                                </div>
                                <input type="password" id="new-password" placeholder="Tạo mật khẩu mới..." autoComplete="new-password" />
                            </div>
                            <div className="input-group">
                                <div className="input-icon">
                                    <i className="fas fa-shield-halved"></i>
                                </div>
                                <input type="password" id="confirm-password" placeholder="Xác nhận mật khẩu..." autoComplete="new-password" />
                            </div>
                            <div id="setup-error" className="login-error hidden">
                                <i className="fas fa-exclamation-circle"></i>
                                <span></span>
                            </div>
                            <button type="button" id="setup-btn" className="login-btn setup-btn">
                                <span>Tạo mật khẩu</span>
                                <i className="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main App */}
            <div id="app" className="app hidden">
                {/* Sidebar */}
                <aside id="sidebar" className="sidebar">
                    <div className="sidebar-header">
                        <div className="sidebar-logo">
                            <div className="logo-icon-sm">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <span className="sidebar-title">VN Tracker</span>
                        </div>
                        <button id="sidebar-toggle" className="sidebar-toggle">
                            <i className="fas fa-bars"></i>
                        </button>
                    </div>
                    <nav className="sidebar-nav">
                        <a href="#" className="nav-item active" data-page="dashboard" id="nav-dashboard">
                            <i className="fas fa-chart-pie"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="#" className="nav-item" data-page="stocks" id="nav-stocks">
                            <i className="fas fa-building-columns"></i>
                            <span>Chứng khoán VN</span>
                        </a>
                        <a href="#" className="nav-item" data-page="crypto" id="nav-crypto">
                            <i className="fab fa-bitcoin"></i>
                            <span>Crypto</span>
                        </a>
                        <a href="#" className="nav-item" data-page="news" id="nav-news">
                            <i className="fas fa-newspaper"></i>
                            <span>Tin tức 24h</span>
                        </a>
                    </nav>
                    <div className="sidebar-footer">
                        <div className="market-status" id="market-status">
                            <div className="status-dot"></div>
                            <span>Đang kết nối...</span>
                        </div>
                        <button id="logout-btn" className="logout-btn">
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {/* Header */}
                    <header className="top-header">
                        <div className="header-left">
                            <button id="mobile-menu-btn" className="mobile-menu-btn">
                                <i className="fas fa-bars"></i>
                            </button>
                            <h2 id="page-title" className="page-title">Dashboard</h2>
                            <span className="page-subtitle" id="current-time"></span>
                        </div>
                        <div className="header-right">
                            <button id="add-watchlist-btn" className="btn-primary" title="Thêm mã theo dõi">
                                <i className="fas fa-plus"></i>
                                <span>Thêm mã</span>
                            </button>
                            <button id="refresh-btn" className="btn-icon" title="Làm mới dữ liệu">
                                <i className="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </header>

                    {/* Dashboard Page */}
                    <div id="page-dashboard" className="page active">
                        <div className="market-summary" id="market-summary">
                            <div className="summary-card vnindex" id="vnindex-card">
                                <div className="summary-header">
                                    <span className="summary-label">VN-Index</span>
                                    <span className="summary-exchange">HOSE</span>
                                </div>
                                <div className="summary-price" id="vnindex-price">--</div>
                                <div className="summary-change" id="vnindex-change"><span>--</span></div>
                            </div>
                            <div className="summary-card hnxindex" id="hnxindex-card">
                                <div className="summary-header">
                                    <span className="summary-label">HNX-Index</span>
                                    <span className="summary-exchange">HNX</span>
                                </div>
                                <div className="summary-price" id="hnxindex-price">--</div>
                                <div className="summary-change" id="hnxindex-change"><span>--</span></div>
                            </div>
                            <div className="summary-card btc" id="btc-summary-card">
                                <div className="summary-header">
                                    <span className="summary-label">Bitcoin</span>
                                    <span className="summary-exchange">BTC</span>
                                </div>
                                <div className="summary-price" id="btc-summary-price">--</div>
                                <div className="summary-change" id="btc-summary-change"><span>--</span></div>
                            </div>
                            <div className="summary-card eth" id="eth-summary-card">
                                <div className="summary-header">
                                    <span className="summary-label">Ethereum</span>
                                    <span className="summary-exchange">ETH</span>
                                </div>
                                <div className="summary-price" id="eth-summary-price">--</div>
                                <div className="summary-change" id="eth-summary-change"><span>--</span></div>
                            </div>
                        </div>

                        <div className="section-header">
                            <h3><i className="fas fa-eye"></i> Danh sách theo dõi</h3>
                            <div className="section-actions">
                                <div className="filter-tabs">
                                    <button className="filter-tab active" data-filter="all" id="filter-all">Tất cả</button>
                                    <button className="filter-tab" data-filter="stock" id="filter-stock">Chứng khoán</button>
                                    <button className="filter-tab" data-filter="crypto" id="filter-crypto">Crypto</button>
                                </div>
                            </div>
                        </div>

                        <div id="watchlist-grid" className="watchlist-grid"></div>

                        <div id="empty-watchlist" className="empty-state hidden">
                            <div className="empty-icon">
                                <i className="fas fa-binoculars"></i>
                            </div>
                            <h3>Chưa có mã nào được theo dõi</h3>
                            <p>Nhấn &quot;Thêm mã&quot; để bắt đầu theo dõi chứng khoán và crypto</p>
                            <button className="btn-primary add-first-btn" id="add-first-btn">
                                <i className="fas fa-plus"></i>
                                <span>Thêm mã đầu tiên</span>
                            </button>
                        </div>
                    </div>

                    {/* Stocks Page */}
                    <div id="page-stocks" className="page">
                        <div className="section-header">
                            <h3><i className="fas fa-building-columns"></i> Chứng khoán Việt Nam</h3>
                        </div>
                        <div className="stock-table-container">
                            <div className="table-toolbar">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" id="stock-search" placeholder="Tìm mã chứng khoán..." autoComplete="off" />
                                </div>
                                <div className="exchange-filter">
                                    <button className="exchange-btn active" data-exchange="all" id="exchange-all">Tất cả</button>
                                    <button className="exchange-btn" data-exchange="HOSE" id="exchange-hose">HOSE</button>
                                    <button className="exchange-btn" data-exchange="HNX" id="exchange-hnx">HNX</button>
                                    <button className="exchange-btn" data-exchange="UPCOM" id="exchange-upcom">UPCOM</button>
                                </div>
                            </div>
                            <div className="table-wrapper">
                                <table className="stock-table" id="stock-table">
                                    <thead>
                                        <tr>
                                            <th>Mã CK</th>
                                            <th>Sàn</th>
                                            <th>Giá</th>
                                            <th>Thay đổi</th>
                                            <th>% Thay đổi</th>
                                            <th>KL</th>
                                            <th>Theo dõi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="stock-table-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Crypto Page */}
                    <div id="page-crypto" className="page">
                        <div className="section-header">
                            <h3><i className="fab fa-bitcoin"></i> Thị trường Crypto</h3>
                        </div>
                        <div className="crypto-grid" id="crypto-grid"></div>
                    </div>

                    {/* News Page */}
                    <div id="page-news" className="page">
                        <div className="section-header">
                            <h3><i className="fas fa-newspaper"></i> Tin tức 24h</h3>
                            <div className="section-actions">
                                <div className="filter-tabs">
                                    <button className="filter-tab active" data-news-filter="all" id="news-filter-all">Tất cả</button>
                                    <button className="filter-tab" data-news-filter="stock" id="news-filter-stock">Chứng khoán</button>
                                    <button className="filter-tab" data-news-filter="crypto" id="news-filter-crypto">Crypto</button>
                                </div>
                            </div>
                        </div>
                        <div id="news-list" className="news-list"></div>
                        <div id="news-loading" className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải tin tức...</p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Watchlist Modal */}
            <div id="add-modal" className="modal hidden">
                <div className="modal-overlay"></div>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3><i className="fas fa-plus-circle"></i> Thêm mã theo dõi</h3>
                        <button className="modal-close" id="modal-close">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="modal-tabs">
                            <button className="modal-tab active" data-modal-tab="stock" id="modal-tab-stock">
                                <i className="fas fa-building-columns"></i> Chứng khoán VN
                            </button>
                            <button className="modal-tab" data-modal-tab="crypto" id="modal-tab-crypto">
                                <i className="fab fa-bitcoin"></i> Crypto
                            </button>
                        </div>

                        {/* Stock Tab */}
                        <div id="modal-stock-content" className="modal-tab-content active">
                            <div className="modal-search">
                                <i className="fas fa-search"></i>
                                <input type="text" id="modal-stock-search" placeholder="Tìm mã chứng khoán (VD: VNM, FPT, VIC...)" autoComplete="off" />
                            </div>
                            <div className="popular-stocks">
                                <p className="popular-label">Phổ biến:</p>
                                <div className="popular-tags" id="popular-stock-tags">
                                    <button className="tag-btn" data-symbol="VNM">VNM</button>
                                    <button className="tag-btn" data-symbol="FPT">FPT</button>
                                    <button className="tag-btn" data-symbol="VIC">VIC</button>
                                    <button className="tag-btn" data-symbol="VHM">VHM</button>
                                    <button className="tag-btn" data-symbol="HPG">HPG</button>
                                    <button className="tag-btn" data-symbol="PDR">PDR</button>
                                    <button className="tag-btn" data-symbol="VNZ">VNZ</button>
                                    <button className="tag-btn" data-symbol="VCB">VCB</button>
                                    <button className="tag-btn" data-symbol="TCB">TCB</button>
                                    <button className="tag-btn" data-symbol="SSI">SSI</button>
                                </div>
                            </div>
                            <div id="modal-stock-results" className="modal-results"></div>
                        </div>

                        {/* Crypto Tab */}
                        <div id="modal-crypto-content" className="modal-tab-content">
                            <div className="modal-search">
                                <i className="fas fa-search"></i>
                                <input type="text" id="modal-crypto-search" placeholder="Tìm crypto (VD: BTC, ETH, SOL...)" autoComplete="off" />
                            </div>
                            <div className="popular-stocks">
                                <p className="popular-label">Phổ biến:</p>
                                <div className="popular-tags" id="popular-crypto-tags">
                                    <button className="tag-btn" data-crypto="bitcoin">BTC</button>
                                    <button className="tag-btn" data-crypto="ethereum">ETH</button>
                                    <button className="tag-btn" data-crypto="solana">SOL</button>
                                    <button className="tag-btn" data-crypto="binancecoin">BNB</button>
                                    <button className="tag-btn" data-crypto="ripple">XRP</button>
                                    <button className="tag-btn" data-crypto="cardano">ADA</button>
                                    <button className="tag-btn" data-crypto="dogecoin">DOGE</button>
                                    <button className="tag-btn" data-crypto="polkadot">DOT</button>
                                </div>
                            </div>
                            <div id="modal-crypto-results" className="modal-results"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <div id="toast-container" className="toast-container"></div>

            {/* Scripts - loaded in order */}
            {dbReady && (
                <>
                    <Script src="/js/config.js" strategy="afterInteractive" />
                    <Script src="/js/api.js" strategy="afterInteractive" />
                    <Script src="/js/auth-client.js" strategy="afterInteractive" />
                    <Script src="/js/ui.js" strategy="afterInteractive" />
                    <Script src="/js/news.js" strategy="afterInteractive" />
                    <Script src="/js/app-client.js" strategy="afterInteractive" />
                </>
            )}
        </>
    );
}
