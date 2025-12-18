import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // 1. Fetch School Details
        const [schools]: any = await pool.query(
            'SELECT id, name, email, mobile, is_active FROM schools WHERE id = ?',
            [id]
        );

        if (schools.length === 0) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const school = schools[0];

        // 2. Fetch Teachers Count
        const [teachersCount]: any = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE school_id = ?',
            [id]
        );

        // 3. Fetch Workshops Assigned to School
        const [workshops]: any = await pool.query(
            `SELECT w.id, w.name, w.image, w.duration, w.start_date, w.status 
       FROM school_links sl 
       JOIN workshops w ON sl.workshop_id = w.id 
       WHERE sl.school_id = ?`,
            [id]
        );

        // 4. Fetch Payment/Enrollment Data (This contains progress info linked to school)
        // We use payments table as it links user, workshop and school directly
        const [enrollments]: any = await pool.query(
            `SELECT p.user_id, p.workshop_id, p.is_attended, p.attended_duration, p.payment_status,
              u.name as user_name, w.name as workshop_name, w.duration as total_duration
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN workshops w ON p.workshop_id = w.id
       WHERE p.school_id = ?`,
            [id]
        );

        // 5. Calculate Stats from Enrollments
        const activeLearners = new Set(enrollments.filter((e: any) => e.is_attended === 1 || e.attended_duration > 0).map((e: any) => e.user_id)).size;
        const totalEnrollments = enrollments.length;

        let completedCount = 0;
        let inProgressCount = 0;
        let notStartedCount = 0;

        enrollments.forEach((e: any) => {
            // Logic for completion
            // If is_attended is 1, we consider it completed or at least attended.
            // We can also check attended_duration vs total_duration
            const duration = parseInt(e.total_duration) || 60;
            const attended = e.attended_duration || 0;

            if (e.is_attended === 1 || attended >= duration * 0.9) {
                completedCount++;
            } else if (attended > 0) {
                inProgressCount++;
            } else {
                notStartedCount++;
            }
        });

        const completionRate = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;

        // 6. Monthly Activity (Logins)
        // We still need Attendees for login timestamps, but we filter by users who are in the school
        const [monthlyActivity]: any = await pool.query(
            `SELECT MONTH(a.login) as month, COUNT(*) as count 
       FROM Attendees a 
       JOIN users u ON a.user_id = u.id 
       WHERE u.school_id = ? AND YEAR(a.login) = 2025 
       GROUP BY MONTH(a.login)`,
            [id]
        );

        // 7. Top Performing Teachers (Extra Stat)
        const teacherStats = new Map();
        enrollments.forEach((e: any) => {
            if (!teacherStats.has(e.user_id)) {
                teacherStats.set(e.user_id, { name: e.user_name, completed: 0, attended: 0 });
            }
            const stats = teacherStats.get(e.user_id);
            if (e.is_attended === 1) stats.completed++;
            if (e.attended_duration > 0) stats.attended++;
        });

        const topTeachers = Array.from(teacherStats.values())
            .sort((a: any, b: any) => b.completed - a.completed)
            .slice(0, 5);

        return NextResponse.json({
            school,
            stats: {
                totalTeachers: teachersCount[0].count,
                totalWorkshops: workshops.length,
                activeLearners,
                completionRate,
                totalEnrollments,
                statusDistribution: {
                    completed: completedCount,
                    inProgress: inProgressCount,
                    notStarted: notStartedCount
                }
            },
            workshops,
            monthlyActivity,
            topTeachers
        });

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
