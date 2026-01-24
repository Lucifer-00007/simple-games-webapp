'use client';

import * as React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileControlsProps {
    onDirection?: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
    onAction?: () => void;
    className?: string;
    showDirectional?: boolean;
    showAction?: boolean;
    actionLabel?: string;
}

export function MobileControls({
    onDirection,
    onAction,
    className,
    showDirectional = true,
    showAction = false,
    actionLabel = 'Action',
}: MobileControlsProps) {
    // Prevent default touch behavior to stop scrolling/zooming while playing
    const handleTouch = (e: React.TouchEvent, callback: () => void) => {
        e.preventDefault();
        callback();
    };

    return (
        <div className={cn("flex flex-col items-center gap-4 mt-4 touch-none select-none sm:hidden", className)}>
            <div className="flex items-center gap-8">
                {showDirectional && (
                    <div className="grid grid-cols-3 gap-2">
                        <div />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-12 w-12 rounded-full opacity-80 active:scale-95 transition-transform"
                            onTouchStart={(e) => handleTouch(e, () => onDirection?.('UP'))}
                            onMouseDown={() => onDirection?.('UP')}
                        >
                            <ArrowUp className="h-6 w-6" />
                        </Button>
                        <div />
                        
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-12 w-12 rounded-full opacity-80 active:scale-95 transition-transform"
                            onTouchStart={(e) => handleTouch(e, () => onDirection?.('LEFT'))}
                            onMouseDown={() => onDirection?.('LEFT')}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-12 w-12 rounded-full opacity-80 active:scale-95 transition-transform"
                            onTouchStart={(e) => handleTouch(e, () => onDirection?.('DOWN'))}
                            onMouseDown={() => onDirection?.('DOWN')}
                        >
                            <ArrowDown className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-12 w-12 rounded-full opacity-80 active:scale-95 transition-transform"
                            onTouchStart={(e) => handleTouch(e, () => onDirection?.('RIGHT'))}
                            onMouseDown={() => onDirection?.('RIGHT')}
                        >
                            <ArrowRight className="h-6 w-6" />
                        </Button>
                    </div>
                )}

                {showAction && (
                    <Button
                        variant="default"
                        size="lg"
                        className="h-16 w-16 rounded-full opacity-90 active:scale-95 transition-transform shadow-lg"
                        onTouchStart={(e) => handleTouch(e, () => onAction?.())}
                        onMouseDown={() => onAction?.()}
                    >
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
