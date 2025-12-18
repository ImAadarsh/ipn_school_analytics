import { getSchoolAnalytics } from '@/lib/data';
import DashboardClient from './DashboardClient';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
    const { id } = await params;

    try {
        const data = await getSchoolAnalytics(id);

        if (!data) {
            notFound();
        }

        return <DashboardClient data={data} />;
    } catch (error) {
        console.error(error);
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <p className="text-slate-400">Could not load dashboard data.</p>
                </div>
            </div>
        );
    }
}
