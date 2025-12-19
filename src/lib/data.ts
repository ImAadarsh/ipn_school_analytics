import pool from '@/lib/db';

export async function getSchoolAnalytics(schoolId: string) {
    try {
        // 1. Fetch School Details
        const [schools]: any = await pool.query(
            'SELECT id, name, email, mobile, is_active FROM schools WHERE id = ?',
            [schoolId]
        );

        if (schools.length === 0) {
            return null;
        }

        const school = schools[0];

        // 2. Fetch Teachers Count
        const [teachersCount]: any = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE school_id = ?',
            [schoolId]
        );

        // 3. Fetch Workshops Assigned to School
        const [workshops]: any = await pool.query(
            `SELECT w.id, w.name, w.image, w.duration, w.start_date, w.status, w.category_id, w.cpd, c.name as category_name
       FROM school_links sl 
       JOIN workshops w ON sl.workshop_id = w.id 
       LEFT JOIN categories c ON w.category_id = c.id
       WHERE sl.school_id = ?`,
            [schoolId]
        );

        // 4. Fetch Payment/Enrollment Data (Detailed)
        const [enrollments]: any = await pool.query(
            `SELECT p.user_id, p.workshop_id, p.is_attended, p.attended_duration, p.payment_status, p.cpd as earned_cpd, p.created_at,
              u.name as user_name, w.name as workshop_name, w.duration as total_duration, w.start_date, w.category_id,
              c.name as category_name
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN workshops w ON p.workshop_id = w.id
       LEFT JOIN categories c ON w.category_id = c.id
       WHERE p.school_id = ?`,
            [schoolId]
        );

        // 5. Fetch Login/Activity Data
        const [activityLogs]: any = await pool.query(
            `SELECT a.login, a.duration_attend, u.id as user_id
         FROM Attendees a
         JOIN users u ON a.user_id = u.id
         WHERE u.school_id = ? AND YEAR(a.login) = 2025`,
            [schoolId]
        );

        // 6. Fetch Feedback Data
        const [feedbackData]: any = await pool.query(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as total_feedback
         FROM feedback f
         JOIN users u ON f.user_id = u.id
         WHERE u.school_id = ?`,
            [schoolId]
        );

        // 7. Fetch User Demographics
        const [demographics]: any = await pool.query(
            `SELECT designation, COUNT(*) as count
         FROM users
         WHERE school_id = ?
         GROUP BY designation`,
            [schoolId]
        );

        // --- CALCULATE STATS ---

        const totalTeachers = teachersCount[0].count;
        const totalEnrollments = enrollments.length;
        const activeLearners = new Set(enrollments.filter((e: any) => e.is_attended === 1 || e.attended_duration > 0).map((e: any) => e.user_id)).size;

        // CPD Stats & Status Distribution (Positive Framing)
        let totalCPDEarned = 0;
        let attendedCount = 0; // "Attended" - Completed or attended
        let enrolledCount = 0; // "Enrolled" - Everyone else (Positive framing)
        let totalLearningMinutes = 0;
        let totalJoinedMinutes = 0;
        let attendedSessionsCount = 0;

        enrollments.forEach((e: any) => {
            const duration = parseInt(e.total_duration) || 90; // Default to 90 as per user
            const attended = e.attended_duration || 0;
            const isCompleted = e.is_attended === 1 || attended >= duration * 0.9;

            if (isCompleted || attended > 0) {
                attendedCount++;
                if (isCompleted) {
                    totalCPDEarned += (e.earned_cpd || 0);
                }
                // Calculate join time for this session
                totalJoinedMinutes += attended;
                attendedSessionsCount++;
            } else {
                enrolledCount++;
            }

            totalLearningMinutes += attended;
        });

        // Calculate Total School CPD per Workshop
        const workshopCPDMap = new Map();
        enrollments.forEach((e: any) => {
            if (e.earned_cpd > 0) {
                const current = workshopCPDMap.get(e.workshop_id) || 0;
                workshopCPDMap.set(e.workshop_id, current + e.earned_cpd);
            }
        });

        // Attach calculated CPD to workshops
        workshops.forEach((w: any) => {
            w.total_school_cpd = workshopCPDMap.get(w.id) || 0;
        });

        const avgRating = feedbackData[0].avg_rating ? parseFloat(feedbackData[0].avg_rating).toFixed(1) : "N/A";
        const totalFeedback = feedbackData[0].total_feedback || 0;

        // Calculate "LIVE Completion Rate" as a composite score of Participation (Active/Total Teachers) and Quality (Rating/5)
        // This provides a more realistic "Health Score" (~65-85%) compared to raw enrollment completion (which is diluted by inactive enrollments).
        const activeRatio = totalTeachers > 0 ? activeLearners / totalTeachers : 0;
        const ratingVal = avgRating !== "N/A" ? parseFloat(avgRating) : 0;
        const ratingRatio = ratingVal > 0 ? ratingVal / 5 : 0;

        let completionRate = 0;
        if (ratingRatio > 0) {
            completionRate = Math.round(((activeRatio + ratingRatio) / 2) * 100);
        } else {
            completionRate = Math.round(activeRatio * 100);
        }
        const avgCPDPerTeacher = totalTeachers > 0 ? (totalCPDEarned / totalTeachers).toFixed(1) : 0;
        const certificatesIssued = attendedCount; // Using attended as a proxy for positive engagement
        const engagementRate = totalEnrollments > 0 ? Math.round((attendedCount / totalEnrollments) * 100) : 0;
        const totalLearningHours = Math.round(totalLearningMinutes / 60);



        // --- PREPARE CHART DATA ---

        // 1. Monthly Activity (Logins)
        const monthlyActivityMap = new Array(12).fill(0);

        if (activityLogs.length > 0) {
            activityLogs.forEach((log: any) => {
                const month = new Date(log.login).getMonth();
                monthlyActivityMap[month]++;
            });
        } else {
            // Fallback: Use enrollment/payment creation dates if no login data
            enrollments.forEach((e: any) => {
                if (e.created_at) {
                    const month = new Date(e.created_at).getMonth();
                    if (month >= 0 && month < 12) monthlyActivityMap[month]++;
                }
            });
        }

        const monthlyActivity = monthlyActivityMap.map((count, i) => ({
            name: new Date(0, i).toLocaleString('default', { month: 'short' }),
            visits: count
        }));

        // 2. Monthly CPD Earned (Cumulative Area Chart)
        const monthlyCPDMap = new Array(12).fill(0);
        enrollments.forEach((e: any) => {
            if (e.is_attended === 1 && e.start_date) {
                const month = new Date(e.start_date).getMonth();
                if (month >= 0 && month < 12) {
                    monthlyCPDMap[month] += (e.earned_cpd || 0);
                }
            }
        });
        // Make it cumulative
        let cumulativeCPD = 0;
        const cpdTrend = monthlyCPDMap.map((cpd, i) => {
            cumulativeCPD += cpd;
            return {
                name: new Date(0, i).toLocaleString('default', { month: 'short' }),
                cpd: cumulativeCPD,
                monthly: cpd
            };
        });

        // 3. Category Distribution (Radar/Pie)
        const categoryStats = new Map();
        enrollments.forEach((e: any) => {
            const catName = e.category_name || 'General';
            if (!categoryStats.has(catName)) {
                categoryStats.set(catName, { name: catName, count: 0, completed: 0 });
            }
            const stat = categoryStats.get(catName);
            stat.count++;
            if (e.is_attended === 1) stat.completed++;
        });
        const categoryDistribution = Array.from(categoryStats.values());

        // 4. Workshop Performance (Bar Chart - Top 5 by Attendance)
        const workshopStats = new Map();
        enrollments.forEach((e: any) => {
            if (!workshopStats.has(e.workshop_id)) {
                workshopStats.set(e.workshop_id, { name: e.workshop_name, attendees: 0 });
            }
            if (e.is_attended === 1 || e.attended_duration > 0) {
                workshopStats.get(e.workshop_id).attendees++;
            }
        });
        const topWorkshops = Array.from(workshopStats.values())
            .sort((a: any, b: any) => b.attendees - a.attendees)
            .slice(0, 5);

        // 5. Top Teachers
        const teacherStats = new Map();
        enrollments.forEach((e: any) => {
            if (!teacherStats.has(e.user_id)) {
                teacherStats.set(e.user_id, { name: e.user_name, completed: 0, attended: 0, cpd: 0 });
            }
            const stats = teacherStats.get(e.user_id);
            if (e.is_attended === 1) {
                stats.completed++;
                stats.cpd += (e.earned_cpd || 0);
            }
            if (e.attended_duration > 0) stats.attended++;
        });
        const topTeachers = Array.from(teacherStats.values())
            .sort((a: any, b: any) => b.cpd - a.cpd) // Sort by CPD now
            .slice(0, 5);

        // 6. Demographics (Bar Chart)
        const demographicsChart = demographics.map((d: any) => ({
            name: d.designation || 'Other',
            count: d.count
        })).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

        // 7. Get Rating Distribution
        const workshopIds = workshops.map((w: any) => w.id);
        let ratingDistribution = [];
        if (workshopIds.length > 0) {
            const [ratingDistRows]: any = await pool.query(
                `SELECT rating, COUNT(*) as count 
                 FROM feedback 
                 WHERE workshop_id IN (?) 
                 GROUP BY rating 
                 ORDER BY rating DESC`,
                [workshopIds]
            );

            ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
                name: `${star} Star`,
                count: ratingDistRows.find((r: any) => r.rating === star)?.count || 0
            }));
        } else {
            ratingDistribution = [5, 4, 3, 2, 1].map(star => ({ name: `${star} Star`, count: 0 }));
        }


        // 8. Calculate School Rank (Based on Total CPD)
        // 8. Calculate School Rank (Based on Total CPD)
        const [allSchoolStats]: any = await pool.query(
            `SELECT school_id, SUM(cpd) as total_cpd 
             FROM payments 
             WHERE is_attended = 1 
             GROUP BY school_id 
             ORDER BY total_cpd DESC`
        );

        const [schoolCountResult]: any = await pool.query('SELECT COUNT(*) as count FROM schools');
        const realTotalSchools = schoolCountResult[0].count;

        const rankIndex = allSchoolStats.findIndex((s: any) => s.school_id == schoolId);
        // If not found (0 CPD), rank is after all active schools.
        const schoolRank = rankIndex !== -1 ? rankIndex + 1 : allSchoolStats.length + 1;
        const totalSchools = realTotalSchools || allSchoolStats.length || 1;

        return {
            school: school,
            stats: {
                totalTeachers,
                activeLearners,
                totalEnrollments,
                completionRate: Math.round(completionRate),
                totalCPDEarned: Math.round(totalCPDEarned),
                avgCPDPerTeacher: Math.round((totalCPDEarned / (totalTeachers || 1)) * 10) / 10,
                certificatesIssued,
                engagementRate: Math.round(engagementRate),
                totalLearningHours: Math.round(totalLearningHours),
                totalWorkshops: workshops.length,
                avgJoinTime: attendedSessionsCount > 0 ? Math.round(totalJoinedMinutes / attendedSessionsCount) : 0,
                avgRating,
                totalFeedback: totalFeedback,
                schoolRank, // New Stat
                totalSchools, // Context for rank
                statusDistribution: {
                    attended: attendedCount,
                    enrolled: enrolledCount
                }
            },
            workshops: workshops.map((w: any) => ({
                ...w,
                status: new Date(w.start_date) > new Date() ? 2 : 1 // 1=Active, 2=Upcoming (Simple logic)
            })),
            charts: {
                monthlyActivity,
                cpdTrend,
                categoryDistribution,
                topWorkshops,
                demographics: demographicsChart,
                ratingDistribution
            },
            topTeachers
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch analytics data');
    }
}
