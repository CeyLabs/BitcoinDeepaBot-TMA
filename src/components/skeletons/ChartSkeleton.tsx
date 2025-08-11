"use client";

export function ChartSkeleton() {
    return (
        <div className="mb-6 animate-pulse rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
            <div className="mb-4 h-5 w-1/3 rounded bg-gray-700"></div>
            <div className="h-48 w-full rounded bg-gray-700"></div>
        </div>
    );
}

export default ChartSkeleton;
