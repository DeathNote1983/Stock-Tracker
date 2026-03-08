// ==========================================
// API: Setup Password
// POST /api/auth/setup
// ==========================================

import bcrypt from 'bcryptjs';
import { isPasswordSet, savePasswordHash, createSession } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { password } = await request.json();

        if (!password || password.length < 4) {
            return Response.json(
                { error: 'Mật khẩu phải có ít nhất 4 ký tự' },
                { status: 400 }
            );
        }

        // Check if password already exists
        const exists = await isPasswordSet();
        if (exists) {
            return Response.json(
                { error: 'Mật khẩu đã được thiết lập' },
                { status: 409 }
            );
        }

        // Hash password with bcrypt (10 salt rounds)
        const hash = await bcrypt.hash(password, 10);
        await savePasswordHash(hash);

        // Auto-login: create session
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
        console.error('Setup error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
