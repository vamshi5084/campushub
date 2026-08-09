import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, collegeCode } = body;

    if (!username || !password || !collegeCode) {
      return Response.json(
        { success: false, message: "Username, password and college are required" },
        { status: 400 }
      );
    }

    if (username !== "admin") {
      return Response.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const colleges = await sql`
      SELECT id, code, name, short_name, color
      FROM colleges
      WHERE code = ${collegeCode} AND admin_password = ${password}
      LIMIT 1
    `;

    if (colleges.length === 0) {
      return Response.json(
        { success: false, message: "Invalid credentials for this college" },
        { status: 401 }
      );
    }

    const college = colleges[0];
    return Response.json({
      success: true,
      message: "Login successful",
      college: {
        id: college.id,
        code: college.code,
        name: college.name,
        shortName: college.short_name,
        color: college.color,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return Response.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}
