import { NextResponse } from "next/server";
import { resetStore } from "@/lib/store";
import { query } from "@/lib/db";

// Guarded by ALLOW_E2E_RESET — never expose in production without this flag.
export async function DELETE() {
  if (!process.env.ALLOW_E2E_RESET) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (process.env.DATABASE_URL) {
    await query("TRUNCATE TABLE todos RESTART IDENTITY");
  } else {
    resetStore();
  }

  return new NextResponse(null, { status: 204 });
}
