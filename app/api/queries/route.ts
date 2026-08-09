import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { studentRoll, name, department, message, collegeId } = await request.json();
    if (!studentRoll || !name || !department || !message || !collegeId)
      return Response.json({ success: false, message: "All fields are required" }, { status: 400 });

    await sql`
      INSERT INTO queries (id, college_id, student_roll, name, department, message, answer, answered, created_at)
      VALUES (${crypto.randomUUID()}, ${Number(collegeId)}, ${String(studentRoll).toUpperCase()}, ${name}, ${department}, ${message}, NULL, false, ${Date.now()})
    `;
    return Response.json({ success: true, message: "Query submitted successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to submit query" }, { status: 500 });
  }
}
