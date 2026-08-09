import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Drop existing tables for a clean/fresh start as requested
    await sql`DROP TABLE IF EXISTS queries CASCADE`;
    await sql`DROP TABLE IF EXISTS events CASCADE`;
    await sql`DROP TABLE IF EXISTS announcements CASCADE`;
    await sql`DROP TABLE IF EXISTS colleges CASCADE`;

    await sql`
      CREATE TABLE IF NOT EXISTS colleges (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        color TEXT NOT NULL,
        admin_password TEXT NOT NULL
      )
    `;

    await sql`
      INSERT INTO colleges (code, name, short_name, color, admin_password) VALUES
        ('vignan', 'Vignan Institute of Technology and Science', 'VITS', '#6366f1', 'vignan@123'),
        ('cbit',   'Chaitanya Bharathi Institute of Technology', 'CBIT', '#0ea5e9', 'cbit@123'),
        ('anurag', 'Anurag University',                          'AU',   '#10b981', 'anurag@123')
      ON CONFLICT (code) DO NOTHING
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        date TEXT NOT NULL,
        urgent BOOLEAN DEFAULT false
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        venue TEXT NOT NULL,
        registration_link TEXT,
        created_at BIGINT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS queries (
        id TEXT PRIMARY KEY,
        college_id INT REFERENCES colleges(id) ON DELETE CASCADE,
        student_roll TEXT NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        message TEXT NOT NULL,
        answer TEXT,
        answered BOOLEAN DEFAULT false,
        created_at BIGINT
      )
    `;

    return Response.json({
      success: true,
      message: "Database setup complete! Tables created and 3 colleges seeded (Vignan, CBIT, Anurag).",
    });
  } catch (error) {
    console.error("Setup DB error:", error);
    return Response.json(
      { success: false, message: "Setup failed", error: String(error) },
      { status: 500 }
    );
  }
}
