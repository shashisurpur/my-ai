
export const MAX_TOKENS_LIMT = 5;
export const MAX_DURATION = 60; //seconds

import { getAuth } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";

import { NextResponse } from "next/server";

// Simple in-memory store for rate limiting (for demonstration purposes)
const rateLimitStore = {};

export async function POST(req) {
    try {
        const { userId } = getAuth(req)
        if (!userId) {
            const requestHeaders = await headers();
            const forwardedFor = requestHeaders.get('x-forwarded-for');
            const ip = forwardedFor?.split(',')[0] ?? 'unknown';

            console.log("Request IP:", ip);

            rateLimitStore[ip] = rateLimitStore[ip] || { count: 0, startTime: Date.now() };
            rateLimitStore[ip].count++;
            console.log("Rate Limit Store:", rateLimitStore);
            // Check if the limit has been exceeded
            if (rateLimitStore[ip].count > MAX_TOKENS_LIMT) {
                return NextResponse.json({ success: false, message: "Rate limit exceeded" }, { status: 429 });
            }

            return NextResponse.json({ success: false, message: "You're in limit" }, { status: 401 })
        }

        return NextResponse.json({ success: true, message: 'Authorized' }, { status: 200 })
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}