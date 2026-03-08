// ==========================================
// API: Database Initialization
// POST /api/init
// ==========================================

import { initDatabase } from '@/lib/db';

export async function POST() {
    const result = await initDatabase();

    if (result.success) {
        return Response.json({ message: 'Database initialized successfully' });
    } else {
        return Response.json({ error: result.error }, { status: 500 });
    }
}
