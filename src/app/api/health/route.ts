import { NextResponse } from "next/server";
import { version } from "../../../lib/version";

export function GET() {
  return NextResponse.json({
    status: "ok",
    version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: process.env.DATABASE_URL ? "postgres" : "memory",
  });
}
