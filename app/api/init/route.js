// ==========================================
// API: Database Initialization
// POST /api/init — also GET for easy browser testing
// ==========================================

import { initDatabase } from '@/lib/db';

export async function POST() {
    try {
        // Check if POSTGRES_URL is set
        if (!process.env.POSTGRES_URL) {
            return Response.json(
                { error: 'POSTGRES_URL environment variable is not set. Please configure it in Vercel dashboard → Settings → Environment Variables.' },
                { status: 500 }
            );
        }

        const result = await initDatabase();

        if (result.success) {
            return Response.json({ message: 'Database initialized successfully' });
        } else {
            return Response.json({ error: `Database init failed: ${result.error}` }, { status: 500 });
        }
    } catch (error) {
        return Response.json(
            { error: `Unexpected error: ${error.message}` },
            { status: 500 }
        );
    }
}

// Also allow GET for easy browser access
export async function GET() {
    return POST();
}
