import { useEffect, useRef, useState } from 'react';

interface PixelatedCanvasProps {
    src: string;
    width?: number;
    height?: number;
    cellSize?: number;
    dotScale?: number;
    interactive?: boolean;
    distortionStrength?: number;
    distortionRadius?: number;
    backgroundColor?: string;
    className?: string;
}

interface Dot {
    x: number;
    y: number;
    originX: number;
    originY: number;
    color: string;
    baseColor: string;
    size: number;
    baseSize: number;
    isLogo: boolean;
}

export default function PixelatedCanvas({
    src,
    width = 300,
    height = 300,
    cellSize = 8,
    dotScale = 0.85,
    interactive = true,
    distortionStrength = 25,
    distortionRadius = 80,
    backgroundColor = 'transparent',
    className = '',
}: PixelatedCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const dotsRef = useRef<Dot[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000, active: false });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            if (!tempCtx) return;

            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCtx.drawImage(img, 0, 0, width, height);

            const imageData = tempCtx.getImageData(0, 0, width, height);
            const data = imageData.data;

            const dots: Dot[] = [];
            const halfCell = cellSize / 2;
            const centerX = width / 2;
            const centerY = height / 2;
            const maxRadius = Math.min(width, height) / 2 - cellSize;

            for (let y = halfCell; y < height; y += cellSize) {
                for (let x = halfCell; x < width; x += cellSize) {
                    const distFromCenter = Math.sqrt(
                        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                    );

                    if (distFromCenter > maxRadius) continue;

                    const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
                    const r = data[pixelIndex];
                    const g = data[pixelIndex + 1];
                    const b = data[pixelIndex + 2];
                    const a = data[pixelIndex + 3];

                    const isLogoPixel = a > 50;

                    if (isLogoPixel) {
                        dots.push({
                            x: x,
                            y: y,
                            originX: x,
                            originY: y,
                            color: `rgba(${r}, ${g}, ${b}, ${a / 255})`,
                            baseColor: `rgba(${r}, ${g}, ${b}, ${a / 255})`,
                            size: (cellSize * dotScale) / 2,
                            baseSize: (cellSize * dotScale) / 2,
                            isLogo: true,
                        });
                    } else {
                        dots.push({
                            x: x,
                            y: y,
                            originX: x,
                            originY: y,
                            color: 'rgba(51, 133, 255, 0.06)',
                            baseColor: 'rgba(51, 133, 255, 0.06)',
                            size: (cellSize * dotScale) / 3,
                            baseSize: (cellSize * dotScale) / 3,
                            isLogo: false,
                        });
                    }
                }
            }

            dotsRef.current = dots;
            setIsLoaded(true);
        };

        img.src = src;

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [src, width, height, cellSize, dotScale]);

    useEffect(() => {
        if (!isLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }

            const mouse = mouseRef.current;
            const dots = dotsRef.current;

            for (const dot of dots) {
                let targetX = dot.originX;
                let targetY = dot.originY;
                let interactionIntensity = 0;

                const dx = dot.originX - mouse.x;
                const dy = dot.originY - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (interactive && mouse.active && distance < distortionRadius) {
                    interactionIntensity = 1 - distance / distortionRadius;
                    const force = interactionIntensity * distortionStrength;
                    const angle = Math.atan2(dy, dx);
                    const jitter = Math.sin(Date.now() * 0.01 + dot.originX + dot.originY) * 2;

                    targetX = dot.originX + Math.cos(angle) * force + jitter * 0.3;
                    targetY = dot.originY + Math.sin(angle) * force + jitter * 0.3;
                }

                dot.x += (targetX - dot.x) * 0.12;
                dot.y += (targetY - dot.y) * 0.12;

                let drawSize = dot.baseSize;
                let drawColor = dot.baseColor;

                if (!dot.isLogo) {
                    const glowOpacity = 0.06 + interactionIntensity * 0.7;
                    const sizeMultiplier = 1 + interactionIntensity * 1.5;
                    drawSize = dot.baseSize * sizeMultiplier;
                    drawColor = `rgba(51, 133, 255, ${glowOpacity})`;
                } else {
                    const sizeMultiplier = 1 + interactionIntensity * 0.2;
                    drawSize = dot.baseSize * sizeMultiplier;
                }

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, drawSize, 0, Math.PI * 2);
                ctx.fillStyle = drawColor;
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isLoaded, width, height, backgroundColor, interactive, distortionStrength, distortionRadius]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true,
            };
        }
    };

    const handleMouseLeave = () => {
        mouseRef.current = { ...mouseRef.current, active: false };
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width,
                height,
                cursor: interactive ? 'pointer' : 'default',
                position: 'relative'
            }}
            className={className}
        >
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
}
