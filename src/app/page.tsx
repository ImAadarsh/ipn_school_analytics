import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
        School Analytics Dashboard
      </h1>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        Please access the dashboard using your School ID in the URL.
      </p>
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <p className="text-sm text-slate-500 mb-2">Example URL:</p>
        <code className="bg-slate-950 px-4 py-2 rounded text-blue-400 font-mono block">
          /dashboard/123
        </code>
      </div>
    </div>
  );
}
