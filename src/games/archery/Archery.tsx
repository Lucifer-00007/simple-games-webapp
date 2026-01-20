'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './styles.module.css';

interface ArcheryProps {
    onScoreUpdate?: (score: number) => void;
}

export function Archery({ onScoreUpdate }: ArcheryProps) {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [score, setScore] = React.useState(0);
    const [highScore, setHighScore] = React.useState(0);
    const [arrowsLeft, setArrowsLeft] = React.useState(10);
    const [gameStatus, setGameStatus] = React.useState<'idle' | 'drawing' | 'flying' | 'gameOver'>('idle');
    const [messageType, setMessageType] = React.useState<'hit' | 'bullseye' | 'miss' | null>(null);

    const isDragging = React.useRef(false);
    const currentArrowRef = React.useRef<SVGUseElement>(null);
    const randomAngle = React.useRef(0);

    const pivot = { x: 100, y: 250 };
    const target = { x: 900, y: 249.5 };

    const getMouseSVG = (e: MouseEvent | React.MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(svg.getScreenCTM()!.inverse());
    };

    const aim = (e: MouseEvent | React.MouseEvent) => {
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

        // Update arrow
        const arrowGroup = svgRef.current?.querySelector('.arrow-angle');
        if (arrowGroup && currentArrowRef.current) {
            arrowGroup.setAttribute('transform', `rotate(${(angle - Math.PI) * (180 / Math.PI)} 100 250)`);
            currentArrowRef.current.setAttribute('x', String(-distance));
        }

        // Update arc
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
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (gameStatus === 'gameOver' || arrowsLeft <= 0) return;

        isDragging.current = true;
        setGameStatus('drawing');
        randomAngle.current = (Math.random() * Math.PI * 0.03) - 0.015;

        if (currentArrowRef.current) {
            currentArrowRef.current.setAttribute('opacity', '1');
        }
        aim(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
        aim(e);
    };

    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;

        if (gameStatus === 'drawing') {
            shootArrow();
        }
    };

    const shootArrow = () => {
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

        // Hide current arrow and reset arc
        if (currentArrowRef.current) {
            currentArrowRef.current.setAttribute('opacity', '0');
        }

        const arc = svgRef.current?.querySelector('#arc');
        if (arc) {
            arc.setAttribute('opacity', '0');
        }

        // Simulate hit detection
        setTimeout(() => {
            const hitType = Math.random();
            let points = 0;

            if (hitType < 0.15) {
                setMessageType('bullseye');
                points = 10;
            } else if (hitType < 0.5) {
                setMessageType('hit');
                points = 5;
            } else {
                setMessageType('miss');
                points = 0;
            }

            setScore(prev => prev + points);
            setHighScore(prev => Math.max(prev, score + points));

            setTimeout(() => {
                setMessageType(null);
                if (arrowsLeft <= 1) {
                    setGameStatus('gameOver');
                    onScoreUpdate?.(Math.max(highScore, score + points));
                } else {
                    setGameStatus('idle');
                }
            }, 2000);
        }, 500);
    };

    const handleRestart = () => {
        setScore(0);
        setArrowsLeft(10);
        setGameStatus('idle');
        setMessageType(null);
    };

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [gameStatus]);

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
                onMouseDown={handleMouseDown}
            >
                <defs>
                    <linearGradient id="arcGradient">
                        <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <g id="arrow">
                        <line x2="60" fill="none" stroke="#888" strokeWidth="2" />
                        <polygon fill="#888" points="64 0 58 2 56 0 58 -2" />
                        <polygon fill="#88ce02" points="2 -3 -4 -3 -1 0 -4 3 2 3 5 0" />
                    </g>
                </defs>

                <path id="arc" fill="none" stroke="url(#arcGradient)" strokeWidth="4" d="M100,250c250-400,550-400,800,0" opacity="0" />

                <g id="target">
                    <path fill="#FFF" d="M924.2,274.2c-21.5,21.5-45.9,19.9-52,3.2c-4.4-12.1,2.4-29.2,14.2-41c11.8-11.8,29-18.6,41-14.2 C944.1,228.3,945.7,252.8,924.2,274.2z" />
                    <path fill="#F4531C" d="M915.8,265.8c-14.1,14.1-30.8,14.6-36,4.1c-4.1-8.3,0.5-21.3,9.7-30.5s22.2-13.8,30.5-9.7 C930.4,235,929.9,251.7,915.8,265.8z" />
                    <path fill="#FFF" d="M908.9,258.9c-8,8-17.9,9.2-21.6,3.5c-3.2-4.9-0.5-13.4,5.6-19.5c6.1-6.1,14.6-8.8,19.5-5.6 C918.1,241,916.9,250.9,908.9,258.9z" />
                    <path fill="#F4531C" d="M903.2,253.2c-2.9,2.9-6.7,3.6-8.3,1.7c-1.5-1.8-0.6-5.4,2-8c2.6-2.6,6.2-3.6,8-2 C906.8,246.5,906.1,250.2,903.2,253.2z" />
                </g>

                <g id="bow" fill="none" strokeLinecap="round">
                    <polyline fill="none" stroke="#ddd" strokeLinecap="round" points="88,200 88,250 88,300" />
                    <path fill="none" stroke="#88ce02" strokeWidth="3" strokeLinecap="round" d="M88,300 c0-10.1,12-25.1,12-50s-12-39.9-12-50" />
                </g>

                <g className="arrow-angle">
                    <use ref={currentArrowRef} x="100" y="250" xlinkHref="#arrow" opacity="0" />
                </g>

                {messageType === 'bullseye' && (
                    <text x="400" y="100" fontSize="48" fill="#F4531C" textAnchor="middle" className={styles.messageText}>
                        BULLSEYE!
                    </text>
                )}
                {messageType === 'hit' && (
                    <text x="400" y="100" fontSize="48" fill="#ffcc00" textAnchor="middle" className={styles.messageText}>
                        HIT!
                    </text>
                )}
                {messageType === 'miss' && (
                    <text x="400" y="100" fontSize="48" fill="#aaa" textAnchor="middle" className={styles.messageText}>
                        MISS!
                    </text>
                )}
            </svg>

            <div className={styles.instruction}>
                Draw back an arrow and launch it!
            </div>

            {gameStatus === 'gameOver' && (
                <div className={styles.controls}>
                    <Button onClick={handleRestart} className={styles.controlButton}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Play Again
                    </Button>
                </div>
            )}
        </div>
    );
}
