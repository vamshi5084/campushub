import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    if (!collegeId) return Response.json({ success: false, message: "collegeId required" }, { status: 400 });

    const announcements = await sql`
      SELECT id, title, description, category, department, date, urgent
      FROM announcements WHERE college_id = ${Number(collegeId)} ORDER BY date DESC
    `;
    return Response.json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, title, description, category, department, date, urgent, collegeId } = await request.json();
    if (!id || !title || !description || !category || !department || !date || !collegeId)
      return Response.json({ success: false, message: "All fields required" }, { status: 400 });

    await sql`
      INSERT INTO announcements (id, college_id, title, description, category, department, date, urgent)
      VALUES (${id}, ${Number(collegeId)}, ${title}, ${description}, ${category}, ${department}, ${date}, ${urgent ?? false})
    `;
    return Response.json({ success: true, message: "Announcement added" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to add announcement" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, description, category, department, date, urgent } = await request.json();
    if (!id) return Response.json({ success: false, message: "ID required" }, { status: 400 });

    await sql`
      UPDATE announcements SET title=${title}, description=${description}, category=${category},
        department=${department}, date=${date}, urgent=${urgent ?? false}
      WHERE id=${id}
    `;
    return Response.json({ success: true, message: "Announcement updated" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ success: false, message: "ID required" }, { status: 400 });

    await sql`DELETE FROM announcements WHERE id=${id}`;
    return Response.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
