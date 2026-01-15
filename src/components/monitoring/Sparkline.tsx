import { useEffect, useRef } from 'react';

interface SparklineProps {
    data: number[]; // latency values
    status: 'online' | 'slow' | 'offline';
    width?: number;
    height?: number;
}

export function Sparkline({ data, status, width = 60, height = 20 }: SparklineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>();

    // Get color based on latency value (gradient from green to red)
    const getColorForLatency = (latency: number): string => {
        if (latency === 0 || status === 'offline') return '#ef4444'; // red-500
        if (latency <= 100) return '#10b981'; // green-500
        if (latency >= 300) return '#ef4444'; // red-500

        // Gradient between 100-300ms: green -> yellow -> red
        const ratio = (latency - 100) / 200; // 0 to 1

        if (ratio <= 0.5) {
            // Green to Yellow (100-200ms)
            const r = Math.round(16 + (245 - 16) * (ratio * 2));
            const g = Math.round(185 + (158 - 185) * (ratio * 2));
            const b = Math.round(129 + (11 - 129) * (ratio * 2));
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Yellow to Red (200-300ms)
            const r = Math.round(245 + (239 - 245) * ((ratio - 0.5) * 2));
            const g = Math.round(158 + (68 - 158) * ((ratio - 0.5) * 2));
            const b = Math.round(11 + (68 - 11) * ((ratio - 0.5) * 2));
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const render = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            if (data.length < 2) return;

            // Filter out offline points (0 latency)
            const validData = data.filter(v => v > 0);
            if (validData.length === 0 && status === 'offline') {
                // Draw red line for offline
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.stroke();
                return;
            }

            // Calculate scale
            const max = Math.max(...data.filter(v => v > 0), 100);
            const step = width / (data.length - 1);

            // Draw bars with gradient colors
            data.forEach((value, i) => {
                if (value === 0) return; // Skip offline points

                const x = i * step;
                const barHeight = (value / max) * height;
                const y = height - barHeight;
                const barWidth = Math.max(step * 0.8, 2);

                // Get color for this latency value
                const color = getColorForLatency(value);

                // Draw bar
                ctx.fillStyle = color;
                ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
            });
        };

        rafRef.current = requestAnimationFrame(render);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [data, status, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="opacity-90"
        />
    );
}
