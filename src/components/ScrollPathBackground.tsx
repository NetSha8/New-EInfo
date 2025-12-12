import React, { useEffect, useRef, useState } from 'react';

export default function ScrollPathBackground() {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [pathString, setPathString] = useState('');
    const pathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Measure page and generate path
    useEffect(() => {
        const updateDimensions = () => {
            const width = document.documentElement.clientWidth;
            const height = document.documentElement.scrollHeight;

            // Only update if dimensions actually changed enough to matter
            setDimensions(prev => {
                if (Math.abs(prev.height - height) < 50 && Math.abs(prev.width - width) < 50) return prev;
                return { width, height };
            });
        };

        // Initial measure
        updateDimensions();

        // Use ResizeObserver for robust updates
        const observer = new ResizeObserver(() => {
            updateDimensions();
        });

        if (document.body) {
            observer.observe(document.body);
        }

        window.addEventListener('resize', updateDimensions);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    // Regenerate path when dimensions change
    useEffect(() => {
        const { width, height } = dimensions;
        if (width === 0 || height === 0) return;

        // Generate a path with smoother loops and natural flow
        const sectionHeight = 600;
        const steps = Math.ceil(height / sectionHeight);

        // Start near top center
        let d = `M ${width * 0.5} 0`;

        // Previous point for continuity
        let prevX = width * 0.5;
        let prevY = 0;

        for (let i = 0; i < steps; i++) {
            const isEven = i % 2 === 0;
            const yEnd = Math.min((i + 1) * sectionHeight, height);
            const segmentHeight = yEnd - (prevY);

            // Randomize slightly the x positions to look natural
            // zigzag between 20% and 80% width
            const targetX = isEven ? width * 0.2 : width * 0.8;

            // Create a loop at the turning point?
            // Actually, to make it "natural" and "loop", we want the path to overshoot and come back.
            // Beziers: Start -> Control1 -> Control2 -> End

            // Let's make big swooping curves that sometimes loop.
            // C cp1x cp1y, cp2x cp2y, x y

            const cp1x = isEven ? width * 0.9 : width * 0.1;
            const cp1y = prevY + segmentHeight * 0.5;

            const cp2x = isEven ? -width * 0.1 : width * 1.1; // Extends outside to pull the loop
            const cp2y = prevY + segmentHeight * 0.8;

            // To make a real loop, we need multiple segments or extreme control points.
            // Let's use two curves per section to create a "loop" effect.

            // 1. Curve out
            const midY = prevY + segmentHeight * 0.6;
            const midX = isEven ? width * 0.8 : width * 0.2;

            // Loop control points
            const loopCp1X = isEven ? width * 1.2 : -width * 0.2;
            const loopCp1Y = prevY + segmentHeight * 0.2;

            const loopCp2X = isEven ? width * 0.5 : width * 0.5;
            const loopCp2Y = midY + 100;

            d += ` C ${loopCp1X} ${loopCp1Y}, ${loopCp2X} ${loopCp2Y}, ${midX} ${midY}`;

            // 2. Curve back to center/next point
            const nextX = width * 0.5; // Back to centerish for next segment start? Or zigzag?
            // Let's oscillate properly.

            d += ` S ${targetX} ${yEnd}, ${nextX} ${yEnd}`;

            prevX = nextX;
            prevY = yEnd;
        }

        setPathString(d);
    }, [dimensions]);

    // Handle scroll animation
    useEffect(() => {
        const handleScroll = () => {
            if (!pathRef.current) return;

            const totalLength = pathRef.current.getTotalLength();
            // Default to hiding the path if calculation fails
            if (totalLength === 0) return;

            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Calculate progress
            // We want the line to be drawn up to roughly where the user is looking.
            // Let's say the line tip is at: scrollY + windowHeight/2 (center of screen)
            // But mapped to the total height.

            const scrollPercent = scrollY / (docHeight - windowHeight);

            // Or simpler: The line should conceptually reach "scrollY + buffer"
            // But since the line is a specific length L, and the page is height H,
            // we map the scroll fraction 0..1 to length fraction 0..1

            // To make it "filling as we go", we sync 0% scroll to 0% path, and 100% scroll to 100% path.
            // Add a little lead so it feels like it's leading the way
            const lead = 0.05;
            let progress = scrollPercent + lead;
            progress = Math.min(Math.max(progress, 0), 1);

            pathRef.current.style.strokeDasharray = `${totalLength} ${totalLength}`;
            pathRef.current.style.strokeDashoffset = `${totalLength * (1 - progress)}`;
        };

        // Should update whenever path changes or scroll happens
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Also call it immediately to set initial state
        // We use a small timeout to ensure DOM update of the path attributes has processed
        const timeout = setTimeout(handleScroll, 50);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeout);
        };
    }, [pathString]); // Re-bind when path changes to ensure length is correct

    return (
        <div
            ref={containerRef}
            className="absolute top-0 left-0 w-full pointer-events-none z-0 overflow-hidden"
            style={{ height: dimensions.height > 0 ? dimensions.height : '100%' }}
            aria-hidden="true"
        >
            {dimensions.height > 0 && (
                <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    style={{ overflow: 'visible' }}
                >
                    <path
                        ref={pathRef}
                        d={pathString}
                        fill="none"
                        stroke="var(--color-primary-500, #3385ff)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transition: 'stroke-dashoffset 0.1s linear',
                        }}
                    />
                </svg>
            )}
        </div>
    );
}
