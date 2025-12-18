'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    Users, BookOpen, Activity, Award, Calendar, TrendingUp,
    CheckCircle, Clock, Star, Zap, Target, Layers, ThumbsUp, Sun, Moon,
    BarChart2, MessageSquare, PieChart as PieChartIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

const COLORS = ['#22c55e', '#3b82f6', '#94a3b8', '#f59e0b', '#8b5cf6'];

interface DashboardClientProps {
    data: any;
}

export default function DashboardClient({ data }: DashboardClientProps) {
    const { school, stats, workshops, charts, topTeachers } = data;
    const [theme, setTheme] = useState('dark');
    const [isRankingRevealed, setIsRankingRevealed] = useState(false);

    // Toggle theme
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleRevealRanking = () => {
        setIsRankingRevealed(true);
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className={`${theme} min-h-screen transition-colors duration-300`}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 md:p-10 font-sans transition-colors duration-300">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-7xl mx-auto space-y-6 md:space-y-8"
                >
                    {/* Header */}
                    <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center md:items-center border-b border-slate-200 dark:border-slate-800 pb-4 md:pb-6 gap-3 md:gap-0">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
                            <img
                                src={theme === 'dark' ? "https://ipnacademy.in/new_assets/img/ipn/ipn.png" : "https://workshops.ipnacademy.in/logo.svg"}
                                alt="IPN Academy Logo"
                                className="h-10 md:h-12 w-auto"
                            />
                            <div>
                                <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
                                    {school.name}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-xs md:text-base">School Analytics Dashboard • 2025</p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-end">
                            <button
                                onClick={toggleTheme}
                                className="p-1.5 md:p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                            </button>
                            <div className="bg-white dark:bg-slate-900 px-2.5 py-1 md:px-4 md:py-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 md:gap-2 shadow-sm">
                                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500 dark:text-blue-400" />
                                <span className="text-[10px] md:text-sm text-slate-600 dark:text-slate-300">Academic Year 2025</span>
                            </div>
                        </div>
                    </motion.header>

                    {/* Stats Grid (3 cards per row) */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <StatCard title="Total Teachers" value={stats.totalTeachers} icon={<Users />} trend="Registered" color="blue" description="Total number of educators registered under your school." />
                        <StatCard title="Active Learners" value={stats.activeLearners} icon={<Activity />} trend="Engaged" color="green" description="Teachers who have started or completed at least one workshop." />
                        <StatCard title="Total Enrollments" value={stats.totalEnrollments} icon={<BookOpen />} trend="All Time" color="purple" description="Total number of workshop enrollments by your teachers." />

                        <StatCard title="LIVE Completion Rate" value={`${stats.completionRate}%`} icon={<CheckCircle />} trend="Success" color="orange" description="Percentage of enrolled workshops that have been successfully completed." />
                        <StatCard title="CPD Hours Earned" value={stats.totalCPDEarned} icon={<Zap />} trend="Total Impact" color="pink" description="Total Continuous Professional Development hours earned by all teachers." />
                        <StatCard title="Avg Rating" value={stats.avgRating} icon={<Star />} trend="Feedback" color="teal" description="Average rating given by your teachers for attended workshops." />

                        <StatCard title="Avg CPD / Teacher" value={stats.avgCPDPerTeacher} icon={<BarChart2 />} trend="Per Capita" color="indigo" description="Average CPD hours earned per registered teacher." />
                        <StatCard title="Certificates Issued" value={stats.certificatesIssued} icon={<Award />} trend="Achievements" color="cyan" description="Total number of certificates issued for completed workshops." />
                        <StatCard title="LIVE Engagement Rate" value={`${stats.engagementRate}%`} icon={<TrendingUp />} trend="Participation" color="amber" description="Percentage of enrollments that are either in-progress or completed." />

                        <StatCard title="LIVE Learning Hours" value={stats.totalLearningHours} icon={<Clock />} trend="Time Spent" color="rose" description="Total estimated time teachers have spent learning on the platform." />
                        <StatCard title="Workshops Assigned" value={stats.totalWorkshops} icon={<Layers />} trend="Available" color="emerald" description="Total number of workshops currently available to your school." />
                        <StatCard title="Total Feedback" value={stats.totalFeedback} icon={<Star />} trend="Reviews" color="violet" description="Total number of feedback reviews submitted by your teachers." />
                    </motion.div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* ... (Charts code remains same) ... */}
                        {/* 1. Activity Chart (Bar) - Full Width on Mobile, 2 Cols on Desktop */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                Learning Activity (2025)
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.monthlyActivity}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-text)' }}
                                            itemStyle={{ color: 'var(--tooltip-text)' }}
                                        />
                                        <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* 2. Top Learners List (1 Col) */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Award className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                                Top Learners (CPD)
                            </h3>
                            <div className="space-y-4">
                                {topTeachers.length > 0 ? (
                                    topTeachers.map((teacher: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{teacher.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{teacher.completed} Completed</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{teacher.cpd} CPD</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-center py-4">No data available</p>
                                )}
                            </div>
                        </motion.div>

                        {/* ROW 2: 3 Equal Cards */}

                        {/* 3. Status Distribution (Pie) */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                                Status Distribution
                            </h3>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'LIVE Attended', value: stats.statusDistribution.attended },
                                                { name: 'Enrolled', value: stats.statusDistribution.enrolled }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell key="cell-0" fill="#22c55e" />
                                            <Cell key="cell-1" fill="#3b82f6" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-2 flex-wrap">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-slate-500 dark:text-slate-400 text-xs">LIVE Attended</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-slate-500 dark:text-slate-400 text-xs">Enrolled</span></div>
                            </div>
                        </motion.div>

                        {/* 4. Learner Demographics (Bar - Compact) */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Users className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                                Demographics
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.demographics} layout="vertical" margin={{ left: 0, right: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#2dd4bf" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* 5. Rating Distribution (Bar - New) */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Star className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                                Rating Distribution
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.ratingDistribution} layout="vertical" margin={{ left: 0, right: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={50} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* ROW 3 */}

                        {/* 6. CPD Trend (Area) */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                                Cumulative CPD Hours Earned
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.cpdTrend}>
                                        <defs>
                                            <linearGradient id="colorCpd" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="cpd" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCpd)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* 7. Category Distribution (Radar) */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                Skill Distribution
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={charts.categoryDistribution.slice(0, 6)}>
                                        <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                        <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                        <Radar name="Enrollments" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* 8. Top Workshops (Bar) - Full Width */}
                        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <Star className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                                Most Popular Workshops
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.topWorkshops} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" horizontal={false} />
                                        <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" width={150} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="attendees" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                    </div>

                    <div className="space-y-6">

                        {/* Completed Workshops (Previously Live Classes) */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-green-500 rounded-full blur opacity-40 animate-pulse"></div>
                                    <Activity className="relative w-5 h-5 text-green-500 dark:text-green-400" />
                                </div>
                                Completed Workshops
                            </h3>
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                                        <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                            <th className="py-3 px-4 font-medium text-sm">Workshop Name</th>
                                            <th className="py-3 px-4 font-medium text-sm">Date</th>
                                            <th className="py-3 px-4 font-medium text-sm">Total CPD Earned (School)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workshops.filter((w: any) => w.status === 1).length > 0 ? (
                                            workshops.filter((w: any) => w.status === 1).map((workshop: any) => (
                                                <tr key={workshop.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-4 px-4 text-slate-900 dark:text-white font-medium">{workshop.name}</td>
                                                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-sm">
                                                        {workshop.start_date ? format(new Date(workshop.start_date), 'dd/MM/yyyy') : 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-4 text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-yellow-500" />
                                                        {workshop.total_school_cpd || 0}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                                    No completed workshops yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Upcoming Workshops */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                                    <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                    Upcoming Workshops
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-7">Upcoming workshops for Teachers</p>
                            </div>
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                                        <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                            <th className="py-3 px-4 font-medium text-sm">Workshop Name</th>
                                            <th className="py-3 px-4 font-medium text-sm">Date</th>
                                            <th className="py-3 px-4 font-medium text-sm">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workshops.filter((w: any) => w.status !== 1).map((workshop: any) => (
                                            <tr key={workshop.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium text-sm">{workshop.name}</td>
                                                <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-sm">
                                                    {workshop.start_date ? format(new Date(workshop.start_date), 'dd/MM/yyyy') : 'TBA'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                                        Upcoming
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {workshops.filter((w: any) => w.status !== 1).length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                                    No upcoming workshops scheduled.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                    </div>

                    {/* Grand Ranking Card - Reveal Effect */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl mt-8"
                    >
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl"></div>

                        <div className={`relative z-10 transition-all duration-700 ${!isRankingRevealed ? 'filter blur-xl scale-95 opacity-50 select-none' : 'filter-none scale-100 opacity-100'}`}>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">IPN Academy Ranking</h2>
                                    <p className="text-amber-100 text-lg max-w-xl">
                                        Your school's standing based on total CPD hours earned by your teachers compared to other institutions.
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30">
                                    <div className="p-4 bg-white text-amber-600 rounded-full shadow-lg">
                                        <Award size={40} />
                                    </div>
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium uppercase tracking-wider">Current Rank</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-extrabold">#{stats.schoolRank}</span>
                                            <span className="text-xl text-amber-200">/ {stats.totalSchools}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isRankingRevealed && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-3xl cursor-pointer" onClick={handleRevealRanking}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-amber-600 font-bold text-xl rounded-full shadow-2xl flex items-center gap-3 hover:bg-amber-50 transition-colors"
                                >
                                    <Award className="w-6 h-6" />
                                    Reveal School Ranking
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

// StatCard Component with 3D Flip Effect
function StatCard({ title, value, icon, trend, color, description }: any) {
    const colors: any = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        orange: "from-orange-500 to-orange-600",
        pink: "from-pink-500 to-pink-600",
        teal: "from-teal-500 to-teal-600",
        indigo: "from-indigo-500 to-indigo-600",
        rose: "from-rose-500 to-rose-600",
        emerald: "from-emerald-500 to-emerald-600",
        cyan: "from-cyan-500 to-cyan-600",
        amber: "from-amber-500 to-amber-600",
        violet: "from-violet-500 to-violet-600",
        yellow: "from-yellow-500 to-yellow-600",
    };

    return (
        <div className="group h-32 w-full perspective-1000">
            <div className="relative h-full w-full transition-all duration-500 transform-style-3d group-hover:rotate-y-180">
                {/* Front Face */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-none flex flex-col justify-between overflow-hidden">
                    {/* Metallic Sheen Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-slate-700/30 dark:via-transparent dark:to-transparent opacity-50 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color] || colors.blue} text-white shadow-lg`}>
                            {React.cloneElement(icon, { size: 20 })}
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
                            {trend}
                        </span>
                    </div>
                </div>

                {/* Back Face */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col justify-center items-center text-center">
                    <p className="text-sm text-slate-200 leading-relaxed">
                        {description || "No description available."}
                    </p>
                </div>
            </div>
        </div>
    );
}
