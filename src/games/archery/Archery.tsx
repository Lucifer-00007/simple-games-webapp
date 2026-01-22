'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './styles.module.css';

interface ArcheryProps {
    onScoreUpdate?: (score: number) => void;
}

interface FlyingArrow {
    id: string;
    x: number;
    y: number;
    rotation: number;
}

interface LineSegment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

// Bezier curve calculation
const calculateBezierPoint = (t: number, p0: { x: number, y: number }, p1: { x: number, y: number }, p2: { x: number, y: number }, p3: { x: number, y: number }) => {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;
    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const tSquared = t * t;
    const tCubed = tSquared * t;

    const x = (ax * tCubed) + (bx * tSquared) + (cx * t) + p0.x;
    const y = (ay * tCubed) + (by * tSquared) + (cy * t) + p0.y;

    return { x, y };
};

// Line intersection check
const getIntersection = (seg1: LineSegment, seg2: LineSegment) => {
    const dx1 = seg1.x2 - seg1.x1;
    const dy1 = seg1.y2 - seg1.y1;
    const dx2 = seg2.x2 - seg2.x1;
    const dy2 = seg2.y2 - seg2.y1;
    const cx = seg1.x1 - seg2.x1;
    const cy = seg1.y1 - seg2.y1;
    const denominator = dy2 * dx1 - dx2 * dy1;

    if (denominator === 0) return null;

    const ua = (dx2 * cy - dy2 * cx) / denominator;
    const ub = (dx1 * cy - dy1 * cx) / denominator;

    return {
        x: seg1.x1 + ua * dx1,
        y: seg1.y1 + ua * dy1,
        segment1: ua >= 0 && ua <= 1,
        segment2: ub >= 0 && ub <= 1
    };
};

export function Archery({ onScoreUpdate }: ArcheryProps) {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [score, setScore] = React.useState(0);
    const [highScore, setHighScore] = React.useState(0);
    const [arrowsLeft, setArrowsLeft] = React.useState(10);
    const [gameStatus, setGameStatus] = React.useState<'idle' | 'drawing' | 'flying' | 'gameOver'>('idle');
    const [messageType, setMessageType] = React.useState<'hit' | 'bullseye' | 'miss' | null>(null);
    const [flyingArrows, setFlyingArrows] = React.useState<FlyingArrow[]>([]);

    const isDragging = React.useRef(false);
    const currentArrowRef = React.useRef<SVGUseElement>(null);
    const randomAngle = React.useRef(0);
    const arcPathRef = React.useRef<string>('');

    const pivot = React.useMemo(() => ({ x: 100, y: 250 }), []);
    const target = React.useMemo(() => ({ x: 900, y: 249.5 }), []);
    const targetLineSegment = React.useMemo(() => ({ x1: 875, y1: 280, x2: 925, y2: 220 }), []);

    const getMouseSVG = React.useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(svg.getScreenCTM()!.inverse());
    }, []);

    const aim = React.useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!isDragging.current || gameStatus === 'gameOver' || arrowsLeft <= 0) return;

        const point = getMouseSVG(e);
        const clampedX = Math.min(point.x, pivot.x - 7);
        const clampedY = Math.max(point.y, pivot.y + 7);
        const dx = clampedX - pivot.x;
        const dy = clampedY - pivot.y;
        const angle = Math.atan2(dy, dx) + randomAngle.current;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 50);
        const scale = Math.min(Math.max(distance / 30, 1), 2);

        // Update bow
        const bow = svgRef.current?.querySelector('#bow');
        if (bow) {
            bow.setAttribute('transform', `rotate(${(angle - Math.PI) * (180 / Math.PI)} 100 250) scale(${scale} 1)`);
        }

        // Update bow string
        const bowString = svgRef.current?.querySelector('#bow polyline');
        if (bowString) {
            const arrowX = Math.min(pivot.x - distance / scale, 88);
            bowString.setAttribute('points', `88,200 ${arrowX},250 88,300`);
        }

        // Update arrow - position it at the bow string's pulled-back position
        const arrowGroup = svgRef.current?.querySelector('.arrow-angle');
        if (arrowGroup && currentArrowRef.current) {
            const bowAngle = (angle - Math.PI) * (180 / Math.PI);
            arrowGroup.setAttribute('transform', `rotate(${bowAngle} 100 250)`);
            currentArrowRef.current.setAttribute('transform', `translate(${-distance}, 0)`);
        }

        // Update and store arc path
        const arc = svgRef.current?.querySelector('#arc');
        if (arc) {
            const radius = distance * 9;
            const offset = {
                x: Math.cos(angle - Math.PI) * radius,
                y: Math.sin(angle - Math.PI) * radius
            };
            const arcWidth = offset.x * 3;
            const d = `M100,250c${offset.x},${offset.y},${arcWidth - offset.x},${offset.y + 50},${arcWidth},50`;
            arc.setAttribute('d', d);
            arc.setAttribute('opacity', String(distance / 60));
            arcPathRef.current = d;
        }
    }, [arrowsLeft, gameStatus, getMouseSVG, pivot]);

    const shootArrow = React.useCallback(() => {
        setGameStatus('flying');
        setArrowsLeft(prev => prev - 1);

        // Reset bow
        const bow = svgRef.current?.querySelector('#bow');
        if (bow) {
            bow.setAttribute('transform', 'rotate(0 100 250) scale(1 1)');
        }

        const bowString = svgRef.current?.querySelector('#bow polyline');
        if (bowString) {
            bowString.setAttribute('points', '88,200 88,250 88,300');
        }

        // Hide current arrow
        if (currentArrowRef.current) {
            currentArrowRef.current.setAttribute('opacity', '0');
        }

        const arc = svgRef.current?.querySelector('#arc');
        if (arc) {
            arc.setAttribute('opacity', '0');
        }

        // Parse the arc path to get bezier control points
        const pathMatch = arcPathRef.current.match(/M([\d.]+),([\d.]+)c([\d.\-]+),([\d.\-]+),([\d.\-]+),([\d.\-]+),([\d.\-]+),([\d.\-]+)/);
        if (!pathMatch) return;

        const p0 = { x: parseFloat(pathMatch[1]), y: parseFloat(pathMatch[2]) };
        const p1 = { x: p0.x + parseFloat(pathMatch[3]), y: p0.y + parseFloat(pathMatch[4]) };
        const p2 = { x: p0.x + parseFloat(pathMatch[5]), y: p0.y + parseFloat(pathMatch[6]) };
        const p3 = { x: p0.x + parseFloat(pathMatch[7]), y: p0.y + parseFloat(pathMatch[8]) };

        // Animate arrow along path
        const arrowId = `arrow-${Date.now()}`;
        let t = 0;
        let hitDetected = false;

        const animate = () => {
            t += 0.008;

            if (t >= 1 || hitDetected) {
                setFlyingArrows(prev => prev.filter(a => a.id !== arrowId));

                if (!hitDetected) {
                    // Miss
                    setMessageType('miss');
                    setTimeout(() => {
                        setMessageType(null);
                        if (arrowsLeft <= 1) {
                            setGameStatus('gameOver');
                            onScoreUpdate?.(highScore);
                        } else {
                            setGameStatus('idle');
                        }
                    }, 2000);
                }
                return;
            }

            const pos = calculateBezierPoint(t, p0, p1, p2, p3);
            const nextPos = calculateBezierPoint(Math.min(t + 0.01, 1), p0, p1, p2, p3);
            const rotation = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x) * (180 / Math.PI);

            setFlyingArrows(prev => {
                const existing = prev.find(a => a.id === arrowId);
                if (existing) {
                    return prev.map(a => a.id === arrowId ? { ...a, x: pos.x, y: pos.y, rotation } : a);
                }
                return [...prev, { id: arrowId, x: pos.x, y: pos.y, rotation }];
            });

            // Check for hit
            const arrowSegment = {
                x1: pos.x,
                y1: pos.y,
                x2: pos.x + Math.cos(rotation * Math.PI / 180) * 60,
                y2: pos.y + Math.sin(rotation * Math.PI / 180) * 60
            };

            const intersection = getIntersection(arrowSegment, targetLineSegment);
            if (intersection && intersection.segment1 && intersection.segment2) {
                hitDetected = true;
                const dx = intersection.x - target.x;
                const dy = intersection.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let points = 0;
                if (distance < 7) {
                    setMessageType('bullseye');
                    points = 10;
                } else {
                    setMessageType('hit');
                    points = 5;
                }

                setScore(prev => {
                    const newScore = prev + points;
                    setHighScore(h => Math.max(h, newScore));
                    return newScore;
                });
                
                // Keep arrow stuck in target for 2 seconds
                setTimeout(() => {
                    setMessageType(null);
                    setFlyingArrows(prev => prev.filter(a => a.id !== arrowId));
                    if (arrowsLeft <= 1) {
                        setGameStatus('gameOver');
                        setHighScore(currentHigh => {
                             onScoreUpdate?.(currentHigh);
                             return currentHigh;
                        });
                    } else {
                        setGameStatus('idle');
                    }
                }, 2500);
                return;
            }

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [arrowsLeft, highScore, onScoreUpdate, target, targetLineSegment]);

    const handleMouseDown = React.useCallback((e: MouseEvent) => {
        if (gameStatus === 'gameOver' || arrowsLeft <= 0) return;

        // Check if click is within SVG bounds
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom) return;

        isDragging.current = true;
        setGameStatus('drawing');
        randomAngle.current = (Math.random() * Math.PI * 0.03) - 0.015;

        if (currentArrowRef.current) {
            currentArrowRef.current.setAttribute('opacity', '1');
        }
        aim(e);
    }, [gameStatus, arrowsLeft, aim]);

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        aim(e);
    }, [aim]);

    const handleMouseUp = React.useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;

        if (gameStatus === 'drawing') {
            shootArrow();
        }
    }, [gameStatus, shootArrow]);

    const handleRestart = () => {
        setScore(0);
        setArrowsLeft(10);
        setGameStatus('idle');
        setMessageType(null);
        setFlyingArrows([]);
    };

    React.useEffect(() => {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp]);

    return (
        <div className={styles.container}>
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Score</span>
                    <span className={styles.statValue}>{score}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Arrows</span>
                    <span className={styles.statValue}>{arrowsLeft}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Best</span>
                    <span className={styles.statValue}>{highScore}</span>
                </div>
            </div>

            <svg
                ref={svgRef}
                className={styles.svg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 500"
            >
                <defs>
                    <linearGradient id="arcGradient">
                        <stop offset="0" stopColor="var(--foreground)" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="var(--foreground)" stopOpacity="0" />
                    </linearGradient>
                    <g id="arrow">
                        <line x2="60" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" />
                        <polygon fill="var(--muted-foreground)" points="64 0 58 2 56 0 58 -2" />
                        <polygon fill="var(--primary)" points="2 -3 -4 -3 -1 0 -4 3 2 3 5 0" />
                    </g>
                </defs>

                <path id="arc" fill="none" stroke="url(#arcGradient)" strokeWidth="4" d="M100,250c250-400,550-400,800,0" opacity="0" />

                <g id="target">
                    {/* Outer White Ring */}
                    <path fill="var(--background)" stroke="var(--border)" strokeWidth="2" d="M924.2,274.2c-21.5,21.5-45.9,19.9-52,3.2c-4.4-12.1,2.4-29.2,14.2-41c11.8-11.8,29-18.6,41-14.2 C944.1,228.3,945.7,252.8,924.2,274.2z" />
                    {/* Orange Ring */}
                    <path fill="#F4531C" d="M915.8,265.8c-14.1,14.1-30.8,14.6-36,4.1c-4.1-8.3,0.5-21.3,9.7-30.5s22.2-13.8,30.5-9.7 C930.4,235,929.9,251.7,915.8,265.8z" />
                    {/* Inner White Ring */}
                    <path fill="var(--background)" stroke="var(--border)" strokeWidth="1" d="M908.9,258.9c-8,8-17.9,9.2-21.6,3.5c-3.2-4.9-0.5-13.4,5.6-19.5c6.1-6.1,14.6-8.8,19.5-5.6 C918.1,241,916.9,250.9,908.9,258.9z" />
                    {/* Bullseye */}
                    <path fill="#F4531C" d="M903.2,253.2c-2.9,2.9-6.7,3.6-8.3,1.7c-1.5-1.8-0.6-5.4,2-8c2.6-2.6,6.2-3.6,8-2 C906.8,246.5,906.1,250.2,903.2,253.2z" />
                </g>

                {/* 1. Curved bow (back layer) */}
                <path
                    id="bow-curve"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    d="M88,300 c0-10.1,12-25.1,12-50s-12-39.9-12-50"
                />

                {/* 2. Arrow (middle layer - behind the string) */}
                <g className="arrow-angle">
                    <use ref={currentArrowRef} x="100" y="250" xlinkHref="#arrow" opacity="0" />
                </g>

                {/* 3. Bow string (front layer - in front of arrow) */}
                <polyline
                    id="bow-string"
                    fill="none"
                    stroke="var(--foreground)"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                    points="88,200 88,250 88,300"
                />

                {/* Flying arrows */}
                {flyingArrows.map((arrow) => (
                    <use
                        key={arrow.id}
                        xlinkHref="#arrow"
                        x={arrow.x}
                        y={arrow.y}
                        transform={`rotate(${arrow.rotation} ${arrow.x} ${arrow.y})`}
                    />
                ))}

                {messageType === 'bullseye' && (
                    <text x="400" y="100" fontSize="48" fill="#F4531C" textAnchor="middle" className={styles.messageText}>
                        BULLSEYE!
                    </text>
                )}
                {messageType === 'hit' && (
                    <text x="400" y="100" fontSize="48" fill="var(--primary)" textAnchor="middle" className={styles.messageText}>
                        HIT!
                    </text>
                )}
                {messageType === 'miss' && (
                    <text x="400" y="100" fontSize="48" fill="var(--muted-foreground)" textAnchor="middle" className={styles.messageText}>
                        MISS!
                    </text>
                )}
            </svg>

            <div className={styles.instruction}>
                Draw back an arrow and launch it!
            </div>

            {gameStatus === 'gameOver' && (
                <div className={styles.gameOverOverlay}>
                    <div className={styles.gameOverBanner}>
                        <h2 className={styles.gameOverTitle}>Game Over!</h2>
                        <div className={styles.gameOverScore}>
                            <span className={styles.gameOverLabel}>Final Score</span>
                            <span className={styles.gameOverValue}>{score}</span>
                        </div>
                        {score > 0 && score === highScore && (
                            <div className={styles.newHighScore}>🏆 New High Score!</div>
                        )}
                        <Button onClick={handleRestart} className={styles.controlButton}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Play Again
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}