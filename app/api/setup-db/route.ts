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

    // Seed the 3 colleges
    await sql`
      INSERT INTO colleges (code, name, short_name, color, admin_password) VALUES
        ('vignan', 'Vignan Institute of Technology and Science', 'VITS', '#6366f1', 'vignan@123'),
        ('cbit',   'Chaitanya Bharathi Institute of Technology', 'CBIT', '#0ea5e9', 'cbit@123'),
        ('anurag', 'Anurag University',                          'AU',   '#10b981', 'anurag@123')
      ON CONFLICT (code) DO NOTHING
    `;

    // Create announcements with college_id
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

    // Create events with college_id
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

    // Create queries with college_id + student_roll
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

    // Query seeded college IDs for scoped inserts
    const collegesList = await sql`SELECT id, code FROM colleges`;
    const vignan = collegesList.find(c => c.code === 'vignan');
    const cbit = collegesList.find(c => c.code === 'cbit');
    const anurag = collegesList.find(c => c.code === 'anurag');

    const vignanId = vignan ? vignan.id : 1;
    const cbitId = cbit ? cbit.id : 2;
    const anuragId = anurag ? anurag.id : 3;

    // Seed Scoped Announcements
    await sql`
      INSERT INTO announcements (id, college_id, title, description, category, department, date, urgent) VALUES
        ('vig-ann-1', ${vignanId}, 'End Semester Examinations Timetable', 'Timetable for VITS End Semester Exams starting Aug 25 is published on the portal.', 'Exam', 'Exam Branch', '2026-08-25', true),
        ('vig-ann-2', ${vignanId}, 'Vignan Placement Orientation', 'Orientation session for all pre-final year students regarding upcoming campus recruitment drives.', 'Placement', 'T&P Cell', '2026-08-14', false),
        ('vig-ann-3', ${vignanId}, 'Library Extended Revision Timings', 'Central Library will remain open until 10:00 PM for study and revision during exam weeks.', 'General', 'Library Admin', '2026-08-16', false),
        
        ('cbit-ann-1', ${cbitId}, 'CBIT Sudhee Fest Registrations', 'Annual national technical symposium registrations are officially open. Register online.', 'General', 'Student Council', '2026-09-02', false),
        ('cbit-ann-2', ${cbitId}, 'Mid Term Exam Hall Ticket Release', 'Students can download their mid-term exam hall tickets from next Monday from the portal.', 'Exam', 'Exam Branch', '2026-08-18', true),
        ('cbit-ann-3', ${cbitId}, 'CBIT Robotics Club Workshop', 'Hands-on workshop on Arduino and IoT systems scheduled this Friday in labs.', 'Academic', 'Robotics Club', '2026-08-15', false),

        ('anu-ann-1', ${anuragId}, 'Anurag Hackathon 2026 Guidelines', 'Guidelines and team registration details for Anurag University Hackathon.', 'Academic', 'CSE Dept', '2026-08-20', true),
        ('anu-ann-2', ${anuragId}, 'Campus Sports Meet Registration', 'Annual sports championships registrations are open for cricket, football, and basket.', 'General', 'Physical Education', '2026-08-13', false),
        ('anu-ann-3', ${anuragId}, 'Anurag Entrepreneurship Bootcamp', 'Learn how to pitch ideas to venture capitalists. Limited seats available.', 'General', 'E-Cell', '2026-08-17', false)
      ON CONFLICT (id) DO NOTHING
    `;

    // Seed Scoped Events
    await sql`
      INSERT INTO events (id, college_id, title, description, category, department, date, time, venue, registration_link, created_at) VALUES
        ('vig-evt-1', ${vignanId}, 'AeroDesign Challenge Workshop', 'Learn basic aerodynamic designing using modern simulation software.', 'Technical', 'Mechanical Dept', '2026-08-22', '10:00 AM - 04:00 PM', 'Seminar Hall 2', 'https://vignan.ac.in', ${Date.now()}),
        ('vig-evt-2', ${vignanId}, 'Independence Day Celebrations', 'Cultural performances and flag hoisting ceremony at central ground.', 'Cultural', 'Student Activities', '2026-08-15', '08:30 AM Onwards', 'Central Plaza', '', ${Date.now()}),

        ('cbit-evt-1', ${cbitId}, 'Smart India Hackathon Internal Hack', 'Internal hackathon to select college representatives for SIH 2026.', 'Technical', 'CSE & IT Dept', '2026-08-19', '09:00 AM - 05:00 PM', 'IoT Research Lab', 'https://cbit.ac.in', ${Date.now()}),
        ('cbit-evt-2', ${cbitId}, 'CBIT Alumni Reunion Meet', 'Interactive panel session with top alumni working in tech.', 'Placement', 'Alumni Relations', '2026-08-26', '03:00 PM - 06:00 PM', 'Main Auditorium', '', ${Date.now()}),

        ('anu-evt-1', ${anuragId}, 'AI & Machine Learning Symposium', 'Guest lectures from leading data scientists on future AI models.', 'Technical', 'AI & ML Dept', '2026-08-23', '10:00 AM - 03:00 PM', 'Block C Auditorium', 'https://anurag.edu.in', ${Date.now()}),
        ('anu-evt-2', ${anuragId}, 'Anurag Cultural Music Fest', 'Battle of bands and classical music performances by students.', 'Cultural', 'Music Club', '2026-08-29', '05:00 PM - 08:30 PM', 'Open Air Theatre', '', ${Date.now()})
      ON CONFLICT (id) DO NOTHING
    `;

    return Response.json({
      success: true,
      message: "Database setup complete! Tables created and seeded with announcements, events, and credentials for all colleges.",
    });
  } catch (error) {
    console.error("Setup DB error:", error);
    return Response.json(
      { success: false, message: "Setup failed", error: String(error) },
      { status: 500 }
    );
  }
}
