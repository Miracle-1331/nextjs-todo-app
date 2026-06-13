import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: process.env.DATABASE_URL ? "postgres" : "memory",
  });
}
