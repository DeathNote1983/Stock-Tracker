// ==========================================
// API: Logout
// POST /api/auth/logout
// ==========================================

import { deleteSession } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session_token')?.value;

        if (token) {
            await deleteSession(token);
        }

        // Clear cookie
        cookieStore.set('session_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(0),
            path: '/',
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
