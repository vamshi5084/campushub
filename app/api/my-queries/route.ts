import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roll = searchParams.get("roll");
    const collegeId = searchParams.get("collegeId");

    if (!roll || !collegeId)
      return Response.json({ success: false, message: "roll and collegeId are required" }, { status: 400 });

    const queries = await sql`
      SELECT id, student_roll, name, department, message, answer, answered, created_at
      FROM queries
      WHERE student_roll = ${String(roll).toUpperCase()} AND college_id = ${Number(collegeId)}
      ORDER BY created_at DESC
    `;
    return Response.json({ success: true, queries });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to fetch queries" }, { status: 500 });
  }
}
