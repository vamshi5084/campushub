import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    if (!collegeId) return NextResponse.json({ success: false, message: "collegeId required" }, { status: 400 });

    const queries = await sql`
      SELECT id, student_roll, name, department, message, answer, answered, created_at
      FROM queries WHERE college_id = ${Number(collegeId)} ORDER BY created_at DESC
    `;
    return NextResponse.json({ success: true, queries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to load queries" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, answer } = await request.json();
    if (!id || !answer?.trim()) return NextResponse.json({ success: false, message: "ID and answer required" }, { status: 400 });

    const updated = await sql`
      UPDATE queries SET answer=${answer.trim()}, answered=true WHERE id=${id}
      RETURNING id, student_roll, name, department, message, answer, answered, created_at
    `;
    if (updated.length === 0) return NextResponse.json({ success: false, message: "Query not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Answer submitted", query: updated[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to submit answer" }, { status: 500 });
  }
}
