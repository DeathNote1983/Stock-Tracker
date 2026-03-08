// ==========================================
// API: Check Auth Status
// GET /api/auth/check
// ==========================================

import { isPasswordSet, validateSession } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
    try {
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
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
