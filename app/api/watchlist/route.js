// ==========================================
// API: Watchlist CRUD
// GET/POST/DELETE /api/watchlist
// ==========================================

import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/db';
import { validateSession } from '@/lib/db';
import { cookies } from 'next/headers';

// Middleware: check authentication
async function requireAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return false;
    return await validateSession(token);
}

// GET - Get watchlist
export async function GET() {
    try {
        const authenticated = await requireAuth();
        if (!authenticated) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const watchlist = await getWatchlist();
        return Response.json(watchlist);
    } catch (error) {
        console.error('Get watchlist error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Add to watchlist
export async function POST(request) {
    try {
        const authenticated = await requireAuth();
        if (!authenticated) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, symbol } = await request.json();

        if (!type || !symbol) {
            return Response.json({ error: 'type and symbol are required' }, { status: 400 });
        }

        if (!['stock', 'crypto'].includes(type)) {
            return Response.json({ error: 'type must be stock or crypto' }, { status: 400 });
        }

        const success = await addToWatchlist(type, symbol);
        if (success) {
            const watchlist = await getWatchlist();
            return Response.json(watchlist);
        }
        return Response.json({ error: 'Failed to add' }, { status: 500 });
    } catch (error) {
        console.error('Add watchlist error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove from watchlist
export async function DELETE(request) {
    try {
        const authenticated = await requireAuth();
        if (!authenticated) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, symbol } = await request.json();

        if (!type || !symbol) {
            return Response.json({ error: 'type and symbol are required' }, { status: 400 });
        }

        await removeFromWatchlist(type, symbol);
        const watchlist = await getWatchlist();
        return Response.json(watchlist);
    } catch (error) {
        console.error('Remove watchlist error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
