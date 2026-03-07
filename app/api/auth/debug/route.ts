import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        baseURL: process.env.BETTER_AUTH_URL,
        publicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    });
}
