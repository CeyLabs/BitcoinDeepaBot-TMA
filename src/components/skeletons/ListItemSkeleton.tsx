"use client";

export function ListItemSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-gray-700 p-4">
            <div className="mb-2 flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-gray-700"></div>
                <div className="h-4 w-16 rounded bg-gray-700"></div>
            </div>
            <div className="h-3 w-32 rounded bg-gray-700"></div>
        </div>
    );
}

export default ListItemSkeleton;
