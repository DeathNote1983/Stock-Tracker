// ==========================================
// API: Login
// POST /api/auth/login
// ==========================================

import bcrypt from 'bcryptjs';
import { getPasswordHash, createSession } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { password } = await request.json();

        if (!password) {
            return Response.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 });
        }

        // Get stored hash
        const storedHash = await getPasswordHash();
        if (!storedHash) {
            return Response.json({ error: 'Chưa thiết lập mật khẩu' }, { status: 404 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, storedHash);
        if (!isValid) {
            return Response.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
        }

        // Create session
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await createSession(token, expiresAt.toISOString());

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
