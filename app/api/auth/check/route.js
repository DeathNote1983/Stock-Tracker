// ==========================================
// API: Check Auth Status
// GET /api/auth/check
// ==========================================

import { isPasswordSet, validateSession } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Check if POSTGRES_URL is configured
        if (!process.env.POSTGRES_URL) {
            return Response.json({
                status: 'no_password',
                error: 'Database not configured'
            });
        }

        const passwordExists = await isPasswordSet();

        if (!passwordExists) {
            return Response.json({ status: 'no_password' });
        }

        // Check session cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('session_token')?.value;

        if (!token) {
            return Response.json({ status: 'not_authenticated' });
        }

        const isValid = await validateSession(token);
        if (!isValid) {
            return Response.json({ status: 'not_authenticated' });
        }

        return Response.json({ status: 'authenticated' });
    } catch (error) {
        console.error('Auth check error:', error);
        // If DB tables don't exist yet, treat as no password set
        if (error.message && error.message.includes('does not exist')) {
            return Response.json({ status: 'no_password' });
        }
        return Response.json({
            error: `Auth check failed: ${error.message}`,
            status: 'no_password'  // Fallback: show setup screen
        }, { status: 200 }); // Return 200 so frontend doesn't break
    }
}
