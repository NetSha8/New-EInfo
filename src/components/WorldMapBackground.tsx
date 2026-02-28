import { useEffect, useRef, useState, useMemo } from 'react';

interface Point {
    x: number;
    y: number;
    connections: number[];
}

interface MessagePath {
    from: number;
    to: number;
    progress: number;
    speed: number;
}

interface WorldMapBackgroundProps {
    className?: string;
}

// Dense world map coordinates (normalized 0-1)
const WORLD_MAP_COORDS = [
    // North America - West Coast
    { x: 0.08, y: 0.22 }, { x: 0.10, y: 0.24 }, { x: 0.09, y: 0.28 },
    { x: 0.08, y: 0.32 }, { x: 0.10, y: 0.35 }, { x: 0.12, y: 0.38 },
    // North America - Central/Mountain
    { x: 0.12, y: 0.22 }, { x: 0.14, y: 0.20 }, { x: 0.16, y: 0.18 },
    { x: 0.18, y: 0.16 }, { x: 0.14, y: 0.25 }, { x: 0.16, y: 0.28 },
    { x: 0.18, y: 0.25 }, { x: 0.15, y: 0.32 }, { x: 0.17, y: 0.35 },
    { x: 0.19, y: 0.32 }, { x: 0.16, y: 0.40 }, { x: 0.18, y: 0.42 },
    // North America - East Coast
    { x: 0.20, y: 0.22 }, { x: 0.22, y: 0.25 }, { x: 0.24, y: 0.28 },
    { x: 0.21, y: 0.30 }, { x: 0.23, y: 0.33 }, { x: 0.25, y: 0.35 },
    { x: 0.22, y: 0.38 }, { x: 0.24, y: 0.40 }, { x: 0.20, y: 0.42 },
    // North America - Gulf/Mexico
    { x: 0.15, y: 0.45 }, { x: 0.17, y: 0.48 }, { x: 0.19, y: 0.46 },
    { x: 0.21, y: 0.48 }, { x: 0.23, y: 0.50 }, { x: 0.18, y: 0.52 },
    // Central America
    { x: 0.20, y: 0.52 }, { x: 0.22, y: 0.54 }, { x: 0.24, y: 0.52 },

    // South America - North
    { x: 0.26, y: 0.55 }, { x: 0.28, y: 0.53 }, { x: 0.30, y: 0.55 },
    { x: 0.32, y: 0.54 }, { x: 0.27, y: 0.58 }, { x: 0.29, y: 0.60 },
    { x: 0.31, y: 0.58 }, { x: 0.33, y: 0.56 },
    // South America - Central
    { x: 0.28, y: 0.63 }, { x: 0.30, y: 0.65 }, { x: 0.32, y: 0.62 },
    { x: 0.29, y: 0.68 }, { x: 0.31, y: 0.70 }, { x: 0.27, y: 0.72 },
    // South America - South
    { x: 0.28, y: 0.75 }, { x: 0.26, y: 0.78 }, { x: 0.29, y: 0.80 },
    { x: 0.27, y: 0.83 }, { x: 0.25, y: 0.86 }, { x: 0.26, y: 0.90 },

    // Europe - Scandinavia
    { x: 0.48, y: 0.15 }, { x: 0.50, y: 0.13 }, { x: 0.52, y: 0.16 },
    { x: 0.54, y: 0.14 }, { x: 0.56, y: 0.18 },
    // Europe - British Isles
    { x: 0.44, y: 0.22 }, { x: 0.43, y: 0.25 }, { x: 0.45, y: 0.28 },
    // Europe - Western
    { x: 0.46, y: 0.30 }, { x: 0.44, y: 0.33 }, { x: 0.47, y: 0.35 },
    { x: 0.45, y: 0.38 }, { x: 0.48, y: 0.32 }, { x: 0.46, y: 0.40 },
    // Europe - Central
    { x: 0.50, y: 0.25 }, { x: 0.52, y: 0.28 }, { x: 0.50, y: 0.32 },
    { x: 0.53, y: 0.30 }, { x: 0.51, y: 0.35 }, { x: 0.54, y: 0.33 },
    // Europe - Eastern
    { x: 0.55, y: 0.22 }, { x: 0.58, y: 0.25 }, { x: 0.56, y: 0.28 },
    { x: 0.60, y: 0.22 }, { x: 0.58, y: 0.30 }, { x: 0.55, y: 0.35 },
    // Europe - Mediterranean
    { x: 0.48, y: 0.38 }, { x: 0.50, y: 0.40 }, { x: 0.52, y: 0.42 },
    { x: 0.49, y: 0.44 }, { x: 0.54, y: 0.40 },

    // Africa - North
    { x: 0.46, y: 0.45 }, { x: 0.48, y: 0.42 }, { x: 0.50, y: 0.45 },
    { x: 0.52, y: 0.44 }, { x: 0.54, y: 0.46 }, { x: 0.56, y: 0.45 },
    { x: 0.47, y: 0.48 }, { x: 0.49, y: 0.50 }, { x: 0.51, y: 0.48 },
    { x: 0.53, y: 0.50 }, { x: 0.55, y: 0.48 },
    // Africa - West
    { x: 0.44, y: 0.52 }, { x: 0.46, y: 0.55 }, { x: 0.45, y: 0.58 },
    { x: 0.47, y: 0.60 }, { x: 0.44, y: 0.62 },
    // Africa - Central
    { x: 0.48, y: 0.55 }, { x: 0.50, y: 0.58 }, { x: 0.52, y: 0.55 },
    { x: 0.49, y: 0.62 }, { x: 0.51, y: 0.60 }, { x: 0.53, y: 0.58 },
    { x: 0.50, y: 0.65 }, { x: 0.52, y: 0.63 },
    // Africa - East
    { x: 0.55, y: 0.52 }, { x: 0.57, y: 0.55 }, { x: 0.56, y: 0.58 },
    { x: 0.58, y: 0.60 }, { x: 0.55, y: 0.62 },
    // Africa - South
    { x: 0.48, y: 0.68 }, { x: 0.50, y: 0.70 }, { x: 0.52, y: 0.68 },
    { x: 0.49, y: 0.73 }, { x: 0.51, y: 0.75 }, { x: 0.53, y: 0.72 },

    // Middle East
    { x: 0.58, y: 0.42 }, { x: 0.60, y: 0.40 }, { x: 0.62, y: 0.43 },
    { x: 0.59, y: 0.46 }, { x: 0.61, y: 0.48 }, { x: 0.63, y: 0.45 },

    // Asia - Russia
    { x: 0.62, y: 0.18 }, { x: 0.65, y: 0.15 }, { x: 0.68, y: 0.18 },
    { x: 0.70, y: 0.15 }, { x: 0.73, y: 0.18 }, { x: 0.76, y: 0.16 },
    { x: 0.78, y: 0.20 }, { x: 0.80, y: 0.18 }, { x: 0.82, y: 0.22 },
    { x: 0.85, y: 0.20 }, { x: 0.88, y: 0.22 },
    { x: 0.63, y: 0.22 }, { x: 0.66, y: 0.25 }, { x: 0.69, y: 0.22 },
    { x: 0.72, y: 0.25 }, { x: 0.75, y: 0.22 }, { x: 0.78, y: 0.26 },
    // Asia - Central
    { x: 0.65, y: 0.32 }, { x: 0.68, y: 0.30 }, { x: 0.70, y: 0.33 },
    { x: 0.72, y: 0.30 }, { x: 0.67, y: 0.36 }, { x: 0.70, y: 0.38 },
    // Asia - South (India)
    { x: 0.68, y: 0.45 }, { x: 0.70, y: 0.48 }, { x: 0.72, y: 0.45 },
    { x: 0.69, y: 0.52 }, { x: 0.71, y: 0.55 }, { x: 0.73, y: 0.50 },
    { x: 0.70, y: 0.58 },
    // Asia - Southeast
    { x: 0.75, y: 0.48 }, { x: 0.77, y: 0.50 }, { x: 0.79, y: 0.52 },
    { x: 0.76, y: 0.55 }, { x: 0.78, y: 0.58 }, { x: 0.80, y: 0.55 },
    { x: 0.82, y: 0.58 }, { x: 0.84, y: 0.55 },
    // Asia - East (China/Japan/Korea)
    { x: 0.80, y: 0.32 }, { x: 0.82, y: 0.35 }, { x: 0.84, y: 0.32 },
    { x: 0.81, y: 0.38 }, { x: 0.83, y: 0.40 }, { x: 0.85, y: 0.38 },
    { x: 0.87, y: 0.35 }, { x: 0.86, y: 0.42 }, { x: 0.88, y: 0.40 },
    { x: 0.90, y: 0.38 }, { x: 0.78, y: 0.42 }, { x: 0.80, y: 0.45 },

    // Australia
    { x: 0.82, y: 0.62 }, { x: 0.84, y: 0.60 }, { x: 0.86, y: 0.62 },
    { x: 0.88, y: 0.60 }, { x: 0.83, y: 0.65 }, { x: 0.85, y: 0.68 },
    { x: 0.87, y: 0.65 }, { x: 0.89, y: 0.68 }, { x: 0.84, y: 0.72 },
    { x: 0.86, y: 0.75 }, { x: 0.88, y: 0.72 }, { x: 0.90, y: 0.70 },
    // New Zealand
    { x: 0.94, y: 0.78 }, { x: 0.95, y: 0.82 },

    // Pacific Islands
    { x: 0.92, y: 0.50 }, { x: 0.95, y: 0.55 },
    // Hawaii area
    { x: 0.05, y: 0.45 }, { x: 0.03, y: 0.48 },
];

export default function WorldMapBackground({ className = '' }: WorldMapBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const pointsRef = useRef<Point[]>([]);
    const messagesRef = useRef<MessagePath[]>([]);
    const pulseRef = useRef(0);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Memoize points generation
    const generatePoints = useMemo(() => {
        return (width: number, height: number): Point[] => {
            const points: Point[] = [];
            const padding = 20;
            const effectiveWidth = width - padding * 2;
            const effectiveHeight = height - padding * 2;

            for (const coord of WORLD_MAP_COORDS) {
                points.push({
                    x: padding + coord.x * effectiveWidth,
                    y: padding + coord.y * effectiveHeight,
                    connections: []
                });
            }

            // Build connections - connect to nearest neighbors
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const distances: { index: number; dist: number }[] = [];

                for (let j = 0; j < points.length; j++) {
                    if (i === j) continue;
                    const other = points[j];
                    const dx = point.x - other.x;
                    const dy = point.y - other.y;
                    distances.push({ index: j, dist: dx * dx + dy * dy }); // Skip sqrt for perf
                }

                distances.sort((a, b) => a.dist - b.dist);
                const maxDist = effectiveWidth * effectiveWidth * 0.04; // ~20% of width squared

                for (let k = 0; k < 3 && k < distances.length; k++) {
                    if (distances[k].dist < maxDist && !point.connections.includes(distances[k].index)) {
                        point.connections.push(distances[k].index);
                    }
                }
            }

            return points;
        };
    }, []);

    // Spawn message on random connection
    const spawnMessage = () => {
        const points = pointsRef.current;
        if (points.length === 0) return;
        if (messagesRef.current.length >= 14) return; // Cap active messages for performance

        const validPoints = points.filter(p => p.connections.length > 0);
        if (validPoints.length === 0) return;

        const idx = Math.floor(Math.random() * points.length);
        const point = points[idx];
        if (point.connections.length === 0) return;

        const toIdx = point.connections[Math.floor(Math.random() * point.connections.length)];

        messagesRef.current.push({
            from: idx,
            to: toIdx,
            progress: 0,
            speed: 0.008 + Math.random() * 0.007
        });
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;
        pointsRef.current = generatePoints(dimensions.width, dimensions.height);
        messagesRef.current = [];
    }, [dimensions, generatePoints]);

    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let lastSpawn = 0;
        const spawnInterval = 500;

        const animate = (timestamp: number) => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            const points = pointsRef.current;
            const messages = messagesRef.current;

            // Spawn messages
            if (timestamp - lastSpawn > spawnInterval) {
                spawnMessage();
                lastSpawn = timestamp;
            }

            // Global pulse for dots
            pulseRef.current += 0.02;

            // Batch draw all connections
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(51, 133, 255, 0.20)';
            ctx.lineWidth = 0.8;

            for (const point of points) {
                for (const connIdx of point.connections) {
                    const other = points[connIdx];
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(other.x, other.y);
                }
            }
            ctx.stroke();

            // Draw messages (animated lines)
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                const from = points[msg.from];
                const to = points[msg.to];

                const headX = from.x + (to.x - from.x) * msg.progress;
                const headY = from.y + (to.y - from.y) * msg.progress;

                // Trail
                const trailStart = Math.max(0, msg.progress - 0.2);
                const tailX = from.x + (to.x - from.x) * trailStart;
                const tailY = from.y + (to.y - from.y) * trailStart;

                const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
                gradient.addColorStop(0, 'rgba(51, 133, 255, 0)');
                gradient.addColorStop(1, 'rgba(51, 133, 255, 1)');

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2.5;
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(headX, headY);
                ctx.stroke();

                // Head glow (simplified)
                // Outer glow
                ctx.beginPath();
                ctx.arc(headX, headY, 7, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(51, 133, 255, 0.25)';
                ctx.fill();

                // Head dot
                ctx.beginPath();
                ctx.arc(headX, headY, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(51, 133, 255, 1)';
                ctx.fill();

                msg.progress += msg.speed;
                if (msg.progress >= 1) {
                    messages.splice(i, 1);
                }
            }

            // Batch draw all dots (simplified, no individual glow)
            ctx.fillStyle = 'rgba(51, 133, 255, 0.6)';
            const basePulse = Math.sin(pulseRef.current) * 0.3 + 1;

            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                const localPulse = Math.sin(pulseRef.current + i * 0.1) * 0.2 + basePulse;
                const size = 2 * localPulse;

                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [dimensions]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
            aria-hidden="true"
        >
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ width: '100%', height: '100%', filter: 'blur(0.8px)' }}
            />
        </div>
    );
}
