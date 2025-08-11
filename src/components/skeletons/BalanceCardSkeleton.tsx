"use client";

export function BalanceCardSkeleton() {
    return (
        <div className="mb-8 animate-pulse rounded-3xl border border-gray-700 bg-gradient-to-r from-gray-600/20 to-gray-500/20 p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-gray-700"></div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                    <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                </div>
            </div>
            <div className="mb-6 h-8 w-1/2 rounded bg-gray-700"></div>
            <div className="h-40 w-full rounded-xl bg-gray-700"></div>
        </div>
    );
}

export default BalanceCardSkeleton;
