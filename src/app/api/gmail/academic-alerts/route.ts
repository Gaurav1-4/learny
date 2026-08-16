import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    message: "Email intelligence has been migrated to Zobox (https://zobox.zorx.tech)",
    notices: [],
  });
}
