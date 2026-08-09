// Roll number format: 24891A0548, 22CS1A0512, 23881B0301
const ROLL_REGEX = /^[0-9]{2}[0-9A-Z]{2,4}[A-Z][0-9]{4}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rollNumber, collegeId, collegeName, collegeCode, collegeColor } = body;

    if (!rollNumber || !collegeId) {
      return Response.json(
        { success: false, message: "Roll number and college are required" },
        { status: 400 }
      );
    }

    const roll = String(rollNumber).trim().toUpperCase();

    if (!ROLL_REGEX.test(roll)) {
      return Response.json(
        { success: false, message: "Invalid roll number. Expected format: 24891A0548" },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      student: {
        rollNumber: roll,
        collegeId: Number(collegeId),
        collegeName: collegeName || "",
        collegeCode: collegeCode || "",
        collegeColor: collegeColor || "#6366f1",
      },
    });
  } catch (error) {
    console.error("Student login error:", error);
    return Response.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}
