// ==========================================
// Database Helper - Neon Postgres (Vercel)
// ==========================================

import { neon } from '@neondatabase/serverless';

// Get SQL client
function getSQL() {
    return neon(process.env.POSTGRES_URL);
}

// Initialize database tables
export async function initDatabase() {
    const sql = getSQL();
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS watchlist (
                id SERIAL PRIMARY KEY,
                type TEXT NOT NULL CHECK (type IN ('stock', 'crypto')),
                symbol TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(type, symbol)
            )
        `;

        // Clean up expired sessions
        await sql`DELETE FROM sessions WHERE expires_at < NOW()`;

        return { success: true };
    } catch (error) {
        console.error('Database init error:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// User operations
// ==========================================

export async function isPasswordSet() {
    const sql = getSQL();
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    return parseInt(result[0].count) > 0;
}

export async function savePasswordHash(hash) {
    const sql = getSQL();
    await sql`DELETE FROM users`;
    await sql`INSERT INTO users (password_hash) VALUES (${hash})`;
}

export async function getPasswordHash() {
    const sql = getSQL();
    const result = await sql`SELECT password_hash FROM users LIMIT 1`;
    return result.length > 0 ? result[0].password_hash : null;
}

// ==========================================
// Session operations
// ==========================================

export async function createSession(token, expiresAt) {
    const sql = getSQL();
    await sql`
        INSERT INTO sessions (token, expires_at) 
        VALUES (${token}, ${expiresAt})
    `;
}

export async function validateSession(token) {
    const sql = getSQL();
    const result = await sql`
        SELECT id FROM sessions 
        WHERE token = ${token} AND expires_at > NOW()
    `;
    return result.length > 0;
}

export async function deleteSession(token) {
    const sql = getSQL();
    await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export async function cleanExpiredSessions() {
    const sql = getSQL();
    await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
}

// ==========================================
// Watchlist operations
// ==========================================

export async function getWatchlist() {
    const sql = getSQL();
    const result = await sql`
        SELECT type, symbol FROM watchlist ORDER BY created_at ASC
    `;

    const watchlist = { stocks: [], cryptos: [] };
    for (const row of result) {
        if (row.type === 'stock') {
            watchlist.stocks.push(row.symbol);
        } else if (row.type === 'crypto') {
            watchlist.cryptos.push(row.symbol);
        }
    }
    return watchlist;
}

export async function addToWatchlist(type, symbol) {
    const sql = getSQL();
    try {
        await sql`
            INSERT INTO watchlist (type, symbol) 
            VALUES (${type}, ${symbol})
            ON CONFLICT (type, symbol) DO NOTHING
        `;
        return true;
    } catch (error) {
        console.error('Add watchlist error:', error);
        return false;
    }
}

export async function removeFromWatchlist(type, symbol) {
    const sql = getSQL();
    await sql`
        DELETE FROM watchlist 
        WHERE type = ${type} AND symbol = ${symbol}
    `;
}
