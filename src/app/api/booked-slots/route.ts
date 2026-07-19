import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  // Mock - return empty slots until database is configured
  return NextResponse.json({ slots: [] });
}
