'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, User, Calendar, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Feedback {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user_name: string;
    user_email: string;
    workshop_name: string;
}

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolId: string;
}

export default function FeedbackModal({ isOpen, onClose, schoolId }: FeedbackModalProps) {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && schoolId) {
            setFeedback([]);
            setPage(1);
            setHasMore(true);
            setError(null);
            fetchFeedback(1);
        }
    }, [isOpen, schoolId]);

    const fetchFeedback = async (pageNum: number) => {
        if (loading) return; // Prevent multiple calls
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/school/${schoolId}/feedback?page=${pageNum}&limit=10`);
            if (!res.ok) throw new Error('Failed to fetch feedback');
            const data = await res.json();

            setFeedback(prev => pageNum === 1 ? data.feedback : [...prev, ...data.feedback]);
            setHasMore(data.pagination.hasMore);
            setPage(pageNum);
        } catch (err) {
            console.error(err);
            setError('Failed to load feedback. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const lastFeedbackElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchFeedback(page + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, page]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <MessageSquare className="w-6 h-6 text-violet-500" />
                                        User Feedback
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                                        See what your teachers are saying about the workshops.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50 custom-scrollbar">
                                {error && page === 1 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-red-500">
                                        <AlertCircle className="w-10 h-10 mb-2" />
                                        <p>{error}</p>
                                        <button
                                            onClick={() => fetchFeedback(1)}
                                            className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : feedback.length === 0 && !loading ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No feedback yet</p>
                                        <p className="text-sm">Feedback will appear here once teachers submit reviews.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {feedback.map((item, index) => (
                                            <div
                                                key={`${item.id}-${index}`}
                                                ref={index === feedback.length - 1 ? lastFeedbackElementRef : null}
                                                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group"
                                            >
                                                {/* Rating Badge */}
                                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-100 dark:bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-200 dark:border-yellow-500/20">
                                                    <Star className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500 fill-yellow-500" />
                                                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">{item.rating}</span>
                                                </div>

                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 text-violet-600 dark:text-violet-400 font-bold">
                                                        {item.user_name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                            {item.user_name}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                                        </p>

                                                        <div className="mb-3">
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                                                "{item.comment || "No comment provided."}"
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-1">
                                                                {item.workshop_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Loading Indicator for Pagination */}
                                {loading && (
                                    <div className="flex justify-center py-4 w-full">
                                        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-right">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
