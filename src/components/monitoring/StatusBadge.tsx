interface StatusBadgeProps {
    latency: number;
    status: 'online' | 'slow' | 'offline';
}

export function StatusBadge({ latency, status }: StatusBadgeProps) {
    const colors = {
        online: 'text-green-500',
        slow: 'text-yellow-500',
        offline: 'text-red-500'
    };

    return (
        <span className={`text-[10px] font-mono font-medium ${colors[status]}`}>
            {status === 'offline' ? 'Offline' : `${latency}ms`}
        </span>
    );
}
