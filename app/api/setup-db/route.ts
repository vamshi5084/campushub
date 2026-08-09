import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Create tables fresh (drop first for clean state)
    await sql`DROP TABLE IF EXISTS queries CASCADE`;
    await sql`DROP TABLE IF EXISTS events CASCADE`;
    await sql`DROP TABLE IF EXISTS announcements CASCADE`;
    await sql`DROP TABLE IF EXISTS colleges CASCADE`;

    // colleges table
    await sql`
      CREATE TABLE colleges (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        color TEXT NOT NULL,
        admin_password TEXT NOT NULL
      )
    `;

    // Seed 3 colleges
    await sql`
      INSERT INTO colleges (code, name, short_name, color, admin_password) VALUES
        ('vignan', 'Vignan Institute of Technology and Science', 'VITS', '#6366f1', 'vignan@123'),
        ('cbit',   'Chaitanya Bharathi Institute of Technology', 'CBIT', '#0ea5e9', 'cbit@123'),
        ('anurag', 'Anurag University',                          'AU',   '#10b981', 'anurag@123')
    `;

    // announcements table
    await sql`
      CREATE TABLE announcements (
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

    // events table
    await sql`
      CREATE TABLE events (
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

    // queries table
    await sql`
      CREATE TABLE queries (
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

    // Fetch inserted college IDs
    const cols = await sql`SELECT id, code FROM colleges`;
    const idOf = (code: string) => (cols.find((c: any) => c.code === code)?.id ?? 1);

    const vId = idOf('vignan');
    const cId = idOf('cbit');
    const aId = idOf('anurag');
    const now = Date.now();

    // ---------- ANNOUNCEMENTS ----------
    await sql`
      INSERT INTO announcements (id, college_id, title, description, category, department, date, urgent) VALUES
        -- Vignan
        ('vig-a1', ${vId},
          'End Semester Exam Timetable Released',
          'The End Semester Examination timetable for all branches has been published on the college portal. Students are advised to download their hall tickets by 20th August.',
          'Exam', 'Examination Branch', '2026-08-25', true),
        ('vig-a2', ${vId},
          'Campus Recruitment Drive – TCS',
          'TCS will be conducting on-campus recruitment for B.Tech final year students on September 5th. Eligible students with 65% aggregate and above may register through T&P Cell.',
          'Placement', 'Training & Placement Cell', '2026-09-05', false),
        ('vig-a3', ${vId},
          'Library Extended Hours During Exams',
          'The Central Library will remain open till 10:00 PM from 18th August to 10th September to facilitate exam preparation.',
          'General', 'Library Administration', '2026-08-18', false),

        -- CBIT
        ('cbit-a1', ${cId},
          'Sudhee 2026 – National Tech Fest Registrations Open',
          'CBIT''s annual national-level technical symposium "Sudhee 2026" registrations are now open. Students from all colleges may participate in coding, robotics, paper presentations and more.',
          'General', 'Student Council', '2026-09-02', false),
        ('cbit-a2', ${cId},
          'Mid-Term Exam Hall Tickets Available',
          'Hall tickets for Mid-Term Examinations starting August 22nd are now available on the student portal. Students must carry a physical copy to the exam hall.',
          'Exam', 'Examination Branch', '2026-08-20', true),
        ('cbit-a3', ${cId},
          'CBIT Robotics & IoT Workshop',
          'A two-day hands-on workshop on Arduino, IoT sensors, and embedded systems will be conducted on 16th and 17th August in the Electronics Lab.',
          'Academic', 'Robotics Club', '2026-08-16', false),

        -- Anurag
        ('anu-a1', ${aId},
          'Anurag Hackathon 2026 – Problem Statements Released',
          'Official problem statements for Anurag University''s 36-hour hackathon are now live. Teams of 3–4 can register via the official portal before 15th August.',
          'Academic', 'CSE Department', '2026-08-20', true),
        ('anu-a2', ${aId},
          'Annual Sports Championship Registrations',
          'Registrations are open for Annual Sports Meet 2026. Events include cricket, football, basketball, badminton, and athletics. Register through the Physical Education Office.',
          'General', 'Physical Education Dept', '2026-08-13', false),
        ('anu-a3', ${aId},
          'Entrepreneurship Bootcamp – Limited Seats',
          'E-Cell is hosting a 2-day bootcamp for student entrepreneurs with mentorship from industry leaders and VCs. Only 40 seats available – apply now.',
          'General', 'Entrepreneurship Cell', '2026-08-17', false)
    `;

    // ---------- EVENTS ----------
    await sql`
      INSERT INTO events (id, college_id, title, description, category, department, date, time, venue, registration_link, created_at) VALUES
        -- Vignan
        ('vig-e1', ${vId},
          'AeroDesign Challenge Workshop',
          'A practical workshop on aerodynamic design using simulation tools like ANSYS and SolidWorks. Open to all Mechanical and Civil engineering students.',
          'Technical', 'Mechanical Department', '2026-08-22', '10:00 AM – 04:00 PM', 'Seminar Hall 2',
          'https://vignan.ac.in/events', ${now}),
        ('vig-e2', ${vId},
          '78th Independence Day Celebrations',
          'Flag hoisting ceremony followed by cultural performances, NCC parade, and patriotic song competition at the Central Ground.',
          'Cultural', 'Student Activities', '2026-08-15', '08:30 AM Onwards', 'Central Ground',
          '', ${now}),
        ('vig-e3', ${vId},
          'National Science Day Guest Lecture',
          'Distinguished lecture by Dr. Ravi Shankar, Senior Scientist at DRDO, on "Future of Materials Science and Defense Technology".',
          'Academic', 'Science & Humanities Dept', '2026-08-28', '11:00 AM – 01:00 PM', 'Auditorium Block A',
          '', ${now}),

        -- CBIT
        ('cbit-e1', ${cId},
          'Smart India Hackathon Internal Selection',
          'Internal 24-hour hackathon to select CBIT''s representation team for SIH 2026 Grand Finale. Open to all B.Tech and M.Tech students.',
          'Technical', 'CSE & IT Department', '2026-08-19', '09:00 AM – Next Day 09:00 AM', 'Innovation & Incubation Lab',
          'https://cbit.ac.in/sih', ${now}),
        ('cbit-e2', ${cId},
          'Alumni Connect – Panel Discussion on Industry Trends',
          'Interactive Q&A and panel discussion with top CBIT alumni working in Google, Microsoft, Amazon, and leading startups.',
          'Placement', 'Alumni Relations Cell', '2026-08-26', '03:00 PM – 06:00 PM', 'Main Auditorium',
          '', ${now}),
        ('cbit-e3', ${cId},
          'Cultural Night – Sudhee Pre-Fest',
          'Music, dance, drama and standup comedy night as a warm-up for the Sudhee 2026 Tech Fest. Open to all students.',
          'Cultural', 'Cultural Club', '2026-09-01', '06:00 PM – 09:30 PM', 'Open Air Amphitheatre',
          '', ${now}),

        -- Anurag
        ('anu-e1', ${aId},
          'AI & Machine Learning Symposium 2026',
          'Day-long symposium featuring keynote talks from leading AI researchers, paper presentations by students, and live demo competitions.',
          'Technical', 'AI & ML Department', '2026-08-23', '09:30 AM – 04:00 PM', 'Block C Auditorium',
          'https://anurag.edu.in/ai-symposium', ${now}),
        ('anu-e2', ${aId},
          'Anurag Cultural Fest – Rhythm 2026',
          'Annual cultural festival featuring battle of bands, western and classical dance performances, fashion walk, and street plays.',
          'Cultural', 'Cultural Committee', '2026-08-29', '05:00 PM – 09:30 PM', 'Open Air Theatre',
          '', ${now}),
        ('anu-e3', ${aId},
          'Industry Visit – Cyient Technologies',
          'Guided industrial visit for ECE and EEE 3rd year students to Cyient Technologies, Hyderabad. Registration mandatory by 20th August.',
          'Academic', 'ECE Department', '2026-09-03', '08:00 AM – 06:00 PM', 'Departing from Main Gate',
          'https://anurag.edu.in/visits', ${now})
    `;

    return Response.json({
      success: true,
      message: "Database initialized! Colleges, announcements and events seeded successfully for Vignan, CBIT and Anurag.",
    });
  } catch (error) {
    console.error("Setup DB error:", error);
    return Response.json(
      { success: false, message: "Setup failed", error: String(error) },
      { status: 500 }
    );
  }
}
