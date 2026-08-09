import { sql } from "@/lib/db";

export async function GET() {
  try {
    const colleges = await sql`
      SELECT id, code, name, short_name, color FROM colleges ORDER BY id ASC
    `;
    return Response.json({ success: true, colleges });
  } catch (error) {
    console.error("GET colleges error:", error);
    return Response.json({ success: false, message: "Failed to fetch colleges" }, { status: 500 });
  }
}
