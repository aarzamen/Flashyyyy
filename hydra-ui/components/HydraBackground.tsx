import React, { useEffect, useRef } from 'react';

interface Props {
    phase: 'idle' | 'diverging' | 'choosing' | 'deepening';
}

export default function HydraBackground({ phase }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0, h = 0;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Particles that split into 3 streams during "diverging"
        const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number; stream: number }[] = [];

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.15 + 0.03,
                stream: Math.floor(Math.random() * 3),
            });
        }

        const streamColors = [
            [139, 92, 246],  // violet
            [59, 130, 246],  // blue
            [16, 185, 129],  // emerald
        ];

        const draw = (time: number) => {
            ctx.clearRect(0, 0, w, h);

            const isDiverging = phase === 'diverging';
            const isChoosing = phase === 'choosing';

            for (const p of particles) {
                if (isDiverging) {
                    // Particles drift toward their stream's column (1/3 of screen)
                    const targetX = (p.stream + 0.5) * (w / 3);
                    p.vx += (targetX - p.x) * 0.0002;
                    p.vy += Math.sin(time * 0.001 + p.stream) * 0.01;
                } else if (isChoosing) {
                    p.vx *= 0.98;
                    p.vy *= 0.98;
                } else {
                    p.vx += (Math.random() - 0.5) * 0.02;
                    p.vy += (Math.random() - 0.5) * 0.02;
                }

                p.vx *= 0.995;
                p.vy *= 0.995;
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                const [cr, cg, cb] = isDiverging || isChoosing
                    ? streamColors[p.stream]
                    : [255, 255, 255];

                const a = isDiverging ? p.alpha * 2 : p.alpha;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
                ctx.fill();
            }

            // Draw faint connection lines between nearby same-stream particles during diverge
            if (isDiverging) {
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        if (particles[i].stream !== particles[j].stream) continue;
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 100) {
                            const [cr, cg, cb] = streamColors[particles[i].stream];
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.04 * (1 - dist / 100)})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }

            frameRef.current = requestAnimationFrame(draw);
        };

        frameRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(frameRef.current);
        };
    }, [phase]);

    return (
        <canvas
            ref={canvasRef}
            className="hydra-background"
        />
    );
}
