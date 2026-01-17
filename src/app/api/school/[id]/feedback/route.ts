import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Fetch detailed feedback: User Name, Workshop Name, Rating, Comment, Date
        // Join feedback -> users -> workshops
        const [feedback]: any = await pool.query(
            `SELECT f.id, f.rating, f.comment, f.created_at,
                    u.name as user_name, u.email as user_email,
                    w.name as workshop_name
             FROM feedback f
             JOIN users u ON f.user_id = u.id
             JOIN workshops w ON f.workshop_id = w.id
             WHERE u.school_id = ?
             ORDER BY f.created_at DESC
             LIMIT ? OFFSET ?`,
            [id, limit, offset]
        );

        // Get total count for pagination metadata
        const [countResult]: any = await pool.query(
            `SELECT COUNT(*) as total
             FROM feedback f
             JOIN users u ON f.user_id = u.id
             WHERE u.school_id = ?`,
            [id]
        );

        const total = countResult[0].total;
        const hasMore = offset + feedback.length < total;

        return NextResponse.json({
            feedback,
            pagination: {
                page,
                limit,
                total,
                hasMore
            }
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json(
            { error: 'Failed to fetch feedback' },
            { status: 500 }
        );
    }
}
