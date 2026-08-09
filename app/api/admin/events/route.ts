import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get("collegeId");
    if (!collegeId) return Response.json({ success: false, message: "collegeId required" }, { status: 400 });

    const events = await sql`
      SELECT id, title, description, category, department, date, time, venue, registration_link, created_at
      FROM events WHERE college_id = ${Number(collegeId)} ORDER BY date ASC
    `;
    return Response.json({ success: true, events });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, title, description, category, department, date, time, venue, registration_link, collegeId } = await request.json();
    if (!id || !title || !description || !category || !department || !date || !time || !venue || !collegeId)
      return Response.json({ success: false, message: "All fields required" }, { status: 400 });

    await sql`
      INSERT INTO events (id, college_id, title, description, category, department, date, time, venue, registration_link, created_at)
      VALUES (${id}, ${Number(collegeId)}, ${title}, ${description}, ${category}, ${department}, ${date}, ${time}, ${venue}, ${registration_link || null}, ${Date.now()})
    `;
    return Response.json({ success: true, message: "Event added" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to add event" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, description, category, department, date, time, venue, registration_link } = await request.json();
    if (!id) return Response.json({ success: false, message: "ID required" }, { status: 400 });

    await sql`
      UPDATE events SET title=${title}, description=${description}, category=${category},
        department=${department}, date=${date}, time=${time}, venue=${venue}, registration_link=${registration_link || null}
      WHERE id=${id}
    `;
    return Response.json({ success: true, message: "Event updated" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ success: false, message: "ID required" }, { status: 400 });

    await sql`DELETE FROM events WHERE id=${id}`;
    return Response.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
