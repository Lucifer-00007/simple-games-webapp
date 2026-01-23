
'use client';

import * as React from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  createInitialState,
  project,
  updatePlayer,
  updateCars,
  checkCollision,
  resetCars,
  SEGMENT_LENGTH,
  DRAW_DISTANCE,
  ROAD_WIDTH,
  CAMERA_DEPTH,
  CAMERA_HEIGHT,
} from './game-logic';
import { GameState, TrafficDensity, TrafficCar } from './types';

// Helper to draw a polygon
function polygon(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
  ctx.fill();
}

// Helper to render background
function renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Sky
  const gradient = ctx.createLinearGradient(0, 0, 0, height / 2);
  gradient.addColorStop(0, '#1a91bd');
  gradient.addColorStop(1, '#72D7EE');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Ground
  ctx.fillStyle = '#10AA10'; // Basic green
  ctx.fillRect(0, height / 2, width, height / 2);
}

// Helper to render a generic car (player or traffic)
function renderCar(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string, isPlayer: boolean) {
  // scale translates World Units to Pixels. 
  // Standard car width ~500 units.
  const carW = 500 * scale;
  const carH = 250 * scale; 
  const carX = x - carW / 2;
  const carY = y - carH;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y - carH * 0.1, carW * 0.55, carH * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#111111';
  const wheelW = carW * 0.18;
  const wheelH = carH * 0.4;
  const wheelY = carY + carH - wheelH * 0.5;
  ctx.fillRect(carX + carW * 0.1, wheelY, wheelW, wheelH); // FL
  ctx.fillRect(carX + carW * 0.72, wheelY, wheelW, wheelH); // FR

  // Car Body (Lower)
  ctx.fillStyle = color;
  // Main chassis with rounded corners
  ctx.beginPath();
  ctx.roundRect(carX, carY + carH * 0.3, carW, carH * 0.6, carH * 0.1);
  ctx.fill();

  // Car Body (Upper/Cabin) - Trapezoid
  ctx.fillStyle = adjustColor(color);
  const cabinW = carW * 0.6;
  const cabinX = x - cabinW / 2;
  const cabinH = carH * 0.35;
  ctx.beginPath();
  ctx.moveTo(cabinX, carY + carH * 0.35);
  ctx.lineTo(cabinX + cabinW * 0.1, carY); // Roof left
  ctx.lineTo(cabinX + cabinW * 0.9, carY); // Roof right
  ctx.lineTo(cabinX + cabinW, carY + carH * 0.35);
  ctx.closePath();
  ctx.fill();

  // Rear Window / Windshield (Dark)
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.moveTo(cabinX + cabinW * 0.15, carY + carH * 0.05);
  ctx.lineTo(cabinX + cabinW * 0.85, carY + carH * 0.05);
  ctx.lineTo(cabinX + cabinW * 0.92, carY + carH * 0.32);
  ctx.lineTo(cabinX + cabinW * 0.08, carY + carH * 0.32);
  ctx.closePath();
  ctx.fill();

  // Lights
  if (isPlayer) {
      // Rear lights
      ctx.fillStyle = '#ef4444'; // Brake lights
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10 * scale;
      ctx.fillRect(carX + carW * 0.08, carY + carH * 0.5, carW * 0.15, carH * 0.1);
      ctx.fillRect(carX + carW * 0.77, carY + carH * 0.5, carW * 0.15, carH * 0.1);
      ctx.shadowBlur = 0;
      
      // Exhaust
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(carX + carW * 0.2, carY + carH * 0.85, carW * 0.04, 0, Math.PI * 2);
      ctx.arc(carX + carW * 0.8, carY + carH * 0.85, carW * 0.04, 0, Math.PI * 2);
      ctx.fill();
  } else {
      // Traffic cars (Oncoming - Headlights)
      ctx.fillStyle = '#fef08a'; // Yellow/White headlights
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 15 * scale;
      ctx.fillRect(carX + carW * 0.08, carY + carH * 0.5, carW * 0.15, carH * 0.15);
      ctx.fillRect(carX + carW * 0.77, carY + carH * 0.5, carW * 0.15, carH * 0.15);
      ctx.shadowBlur = 0;
      
      // Grill
      ctx.fillStyle = '#111';
      ctx.fillRect(carX + carW * 0.3, carY + carH * 0.6, carW * 0.4, carH * 0.15);
  }
}

// Simple color adjuster
function adjustColor(color: string) {
    // Return a slightly darker shade for the roof
    return color === '#ef4444' ? '#b91c1c' : // Red -> Dark Red
           color === '#3b82f6' ? '#1d4ed8' : // Blue -> Dark Blue
           color === '#22c55e' ? '#15803d' : // Green -> Dark Green
           color === '#eab308' ? '#a16207' : // Yellow -> Dark Yellow
           color === '#a855f7' ? '#7e22ce' : // Purple -> Dark Purple
           '#555555'; // Default
} 

export function CarRacing({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
  // Game State Ref (Mutable for loop)
  const gameStateRef = React.useRef<GameState>(createInitialState());
  
  // UI State (for React rendering)
  const [status, setStatus] = React.useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'crashed'>('menu');
  const [uiStats, setUiStats] = React.useState({ 
      lap: 0, 
      speed: 0, 
      carColor: '#ef4444', 
      totalLaps: 3, 
      density: 'medium' as TrafficDensity 
  });
  
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const requestRef = React.useRef<number>(0);
  const lastTimeRef = React.useRef<number>(0);

  // Input State
  const input = React.useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Handle Input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW': input.current.up = true; break;
        case 'ArrowDown':
        case 'KeyS': input.current.down = true; break;
        case 'ArrowLeft':
        case 'KeyA': input.current.left = true; break;
        case 'ArrowRight':
        case 'KeyD': input.current.right = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW': input.current.up = false; break;
        case 'ArrowDown':
        case 'KeyS': input.current.down = false; break;
        case 'ArrowLeft':
        case 'KeyA': input.current.left = false; break;
        case 'ArrowRight':
        case 'KeyD': input.current.right = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  function animate(time: number) {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = Math.min(1, (time - lastTimeRef.current) / 1000); // delta time in seconds
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const state = gameStateRef.current;

    // Update Logic
    if (state.status === 'playing') {
      const speedPercent = state.player.speed / state.player.maxSpeed;
      const dx = dt * 2 * speedPercent; // lateral speed multiplier

      updatePlayer(state.player, input.current, dt, dx);
      updateCars(state.cars, dt, state.trackLength);

      // Collision Check
      if (checkCollision(state.player, state.cars, state.segmentLength, state.trackLength)) {
          state.status = 'crashed';
          setStatus('crashed');
      }

      // Handle Laps
      if (state.player.z >= state.trackLength) {
        state.player.z -= state.trackLength;
        state.player.lap++;
        if (state.player.lap >= state.totalLaps) {
            // Finish race
            state.status = 'gameOver';
            setStatus('gameOver');
            onScoreUpdate?.(Math.floor(state.player.score)); // Placeholder score
        }
      } else if (state.player.z < 0) {
        state.player.z += state.trackLength;
      }
    }

    // Render Logic
    ctx.clearRect(0, 0, width, height);
    renderBackground(ctx, width, height);

    // Project and Draw Road
    const playerZ = state.player.z;
    const playerX = state.player.x;
    const findSegment = (z: number) => state.segments[Math.floor(z / SEGMENT_LENGTH) % state.segments.length];
    
    const baseSegment = findSegment(playerZ);
    const basePercent = (playerZ % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    const playerY = baseSegment.p1.y + (baseSegment.p2.y - baseSegment.p1.y) * basePercent;
    
    let maxY = height;
    let x = 0;
    let dx = -(baseSegment.curve * basePercent);

    // Prepare cars for rendering (group by segment index)
    const carsBySegment = new Map<number, TrafficCar[]>();
    for (const car of state.cars) {
        const segIndex = Math.floor(car.z / SEGMENT_LENGTH) % state.segments.length;
        if (!carsBySegment.has(segIndex)) carsBySegment.set(segIndex, []);
        carsBySegment.get(segIndex)?.push(car);
    }

    for (let n = 0; n < DRAW_DISTANCE; n++) {
      const segment = state.segments[(baseSegment.index + n) % state.segments.length];
      const looped = segment.index < baseSegment.index;
      const cameraX = playerX * ROAD_WIDTH - x;
      const cameraY = CAMERA_HEIGHT + playerY;
      const cameraZ = playerZ - (looped ? state.trackLength : 0);

      project(segment.p1, cameraX, cameraY, cameraZ, CAMERA_DEPTH, width, height, ROAD_WIDTH);
      project(segment.p2, cameraX, cameraY, cameraZ, CAMERA_DEPTH, width, height, ROAD_WIDTH);

      x += dx;
      dx += segment.curve;

      if (segment.p1.screen.y >= maxY || segment.p2.screen.y >= segment.p1.screen.y) continue;

      // Draw Road Segment
      polygon(
        ctx,
        segment.p1.screen.x - segment.p1.screen.w, segment.p1.screen.y,
        segment.p1.screen.x + segment.p1.screen.w, segment.p1.screen.y,
        segment.p2.screen.x + segment.p2.screen.w, segment.p2.screen.y,
        segment.p2.screen.x - segment.p2.screen.w, segment.p2.screen.y,
        segment.color.road
      );

      // Grass
      ctx.fillStyle = segment.color.grass;
      ctx.fillRect(0, segment.p2.screen.y, width, segment.p1.screen.y - segment.p2.screen.y);

      // Rumble
      const rumbleW1 = segment.p1.screen.w * 1.2;
      const rumbleW2 = segment.p2.screen.w * 1.2;
      polygon(
        ctx,
        segment.p1.screen.x - rumbleW1, segment.p1.screen.y,
        segment.p1.screen.x + rumbleW1, segment.p1.screen.y,
        segment.p2.screen.x + rumbleW2, segment.p2.screen.y,
        segment.p2.screen.x - rumbleW2, segment.p2.screen.y,
        segment.color.rumble
      );
      
      // Road Surface (over rumble)
      polygon(
        ctx,
        segment.p1.screen.x - segment.p1.screen.w, segment.p1.screen.y,
        segment.p1.screen.x + segment.p1.screen.w, segment.p1.screen.y,
        segment.p2.screen.x + segment.p2.screen.w, segment.p2.screen.y,
        segment.p2.screen.x - segment.p2.screen.w, segment.p2.screen.y,
        segment.color.road
      );

      // Lane Marker
      if (segment.color.lane) {
         const laneW1 = segment.p1.screen.w * 0.05;
         const laneW2 = segment.p2.screen.w * 0.05;
         polygon(
            ctx,
            segment.p1.screen.x - laneW1, segment.p1.screen.y,
            segment.p1.screen.x + laneW1, segment.p1.screen.y,
            segment.p2.screen.x + laneW2, segment.p2.screen.y,
            segment.p2.screen.x - laneW2, segment.p2.screen.y,
            segment.color.lane
         );
      }

      // Draw Cars on this segment
      const carsOnSegment = carsBySegment.get(segment.index);
      if (carsOnSegment) {
          for (const car of carsOnSegment) {
              // Calculate sprite scale relative to screen width
              const spriteScale = segment.p1.screen.scale * width / 2;
              const carX = segment.p1.screen.x + (car.lane * ROAD_WIDTH * spriteScale);
              const carY = segment.p1.screen.y;
              renderCar(ctx, carX, carY, spriteScale, car.color, false);
          }
      }

      maxY = segment.p1.screen.y;
    }

    // Draw Player
    renderCar(
        ctx, 
        width / 2, 
        height - 20, 
        (width / 640) * 0.3, // Adjusted scale for new renderCar (approx 150px width)
        state.player.carColor, 
        true
    );
    
    // Speed Effect (Wind lines)
    if (state.status === 'playing' && state.player.speed > 8000) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for(let i=0; i<5; i++) {
            const lx = Math.random() * width;
            const ly = Math.random() * height;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx - (lx - width/2) * 0.1, ly - (ly - height/2) * 0.1);
            ctx.stroke();
        }
    }

    requestRef.current = requestAnimationFrame(animate);
  }

  // Sync UI
  React.useEffect(() => {
      const interval = setInterval(() => {
          if (status === 'playing') {
             setUiStats({
                 lap: gameStateRef.current.player.lap,
                 speed: gameStateRef.current.player.speed,
                 carColor: gameStateRef.current.player.carColor,
                 totalLaps: gameStateRef.current.totalLaps,
                 density: gameStateRef.current.trafficDensity
             });
          }
      }, 100);
      return () => clearInterval(interval);
  }, [status]);


  React.useEffect(() => {
    if (status === 'playing' || status === 'menu') {
       requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const startGame = () => {
      // Init cars
      gameStateRef.current.cars = resetCars(uiStats.density, gameStateRef.current.trackLength);
      gameStateRef.current.status = 'playing';
      setStatus('playing');
  };

  const selectColor = (color: string) => {
      gameStateRef.current.player.carColor = color;
      setUiStats(prev => ({ ...prev, carColor: color }));
  };
  
  const setDensity = (val: number[]) => {
      const d = val[0] === 0 ? 'low' : val[0] === 1 ? 'medium' : 'high';
      gameStateRef.current.trafficDensity = d;
      setUiStats(prev => ({ ...prev, density: d }));
  };

  const CAR_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];

  return (
    <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto p-4 select-none">
      <div className="flex justify-between w-full items-end">
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Lap Time</span>
            <span className="text-2xl font-bold font-mono">00:00.00</span> 
            {/* Timer logic not yet in state, just placeholder for UI enhancement */}
        </div>
        
        <div className="flex flex-col items-center">
             <div className="text-4xl font-black italic tracking-tighter text-slate-800 dark:text-slate-100">
                {(uiStats.speed / 100).toFixed(0)} <span className="text-sm not-italic font-normal text-slate-500 dark:text-slate-400">km/h</span>
             </div>
        </div>

        <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Position</span>
            <span className="text-2xl font-bold">1 / 1</span>
        </div>
      </div>
      
      <div className="relative border-8 border-slate-900 rounded-2xl overflow-hidden shadow-2xl bg-sky-300 w-full aspect-[4/3] max-w-[640px]">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-full object-cover"
        />
        
        {/* HUD Overlay */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
            <Badge variant="secondary" className="font-mono text-lg bg-black/50 text-white hover:bg-black/60 backdrop-blur-md border-0">
                LAP {uiStats.lap + 1}/{uiStats.totalLaps}
            </Badge>
        </div>

        {status === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50">
             <Card className="w-[90%] max-w-md p-6 flex flex-col gap-6 bg-white/95 border-0 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">Turbo Drift</h2>
                    <p className="text-slate-500 font-medium">Select your vehicle & difficulty</p>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block text-center">Vehicle Paint</label>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {CAR_COLORS.map(color => (
                                <button
                                    key={color}
                                    className={`w-10 h-10 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${uiStats.carColor === color ? 'ring-4 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => selectColor(color)}
                                    title="Select Color"
                                >
                                    {uiStats.carColor === color && <div className="w-3 h-3 bg-white rounded-full shadow-sm" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                             <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Traffic Density</label>
                             <Badge variant={uiStats.density === 'high' ? 'destructive' : 'outline'} className="uppercase">
                                {uiStats.density}
                             </Badge>
                        </div>
                        <Slider 
                            defaultValue={[1]} 
                            max={2} 
                            step={1} 
                            className="w-full"
                            onValueChange={setDensity} 
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase px-1">
                            <span>Low</span>
                            <span>Medium</span>
                            <span>High</span>
                        </div>
                    </div>
                </div>

                <Button 
                    size="lg" 
                    onClick={startGame}
                    className="w-full h-14 text-xl font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Play className="mr-2 w-6 h-6 fill-current" /> Start Race
                </Button>
             </Card>
          </div>
        )}

        {(status === 'gameOver' || status === 'crashed') && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50">
                <Card className="w-[90%] max-w-md p-8 flex flex-col items-center gap-6 bg-white/95 border-0 shadow-2xl animate-in zoom-in duration-300">
                    <div className="p-4 rounded-full bg-slate-100 mb-2">
                        {status === 'crashed' ? (
                            <AlertTriangle className="w-12 h-12 text-red-600" />
                        ) : (
                            <Play className="w-12 h-12 text-green-600" />
                        )}
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                            {status === 'crashed' ? 'Wasted!' : 'Race Finished!'}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {status === 'crashed' 
                                ? 'You crashed into traffic. Watch the road!' 
                                : 'Great driving! Try a higher difficulty?'}
                        </p>
                    </div>

                    <Button 
                        size="lg" 
                        onClick={() => {
                            gameStateRef.current = createInitialState();
                            // Keep previous color preference?
                            gameStateRef.current.player.carColor = uiStats.carColor;
                            setStatus('menu');
                        }}
                        className="w-full text-lg font-bold"
                        variant={status === 'crashed' ? "destructive" : "default"}
                    >
                        Return to Menu
                    </Button>
                </Card>
            </div>
        )}
      </div>

       <div className="flex items-center gap-6 text-sm font-medium text-slate-400 bg-slate-50 px-6 py-3 rounded-full border border-slate-100 shadow-sm">
         <span className="flex items-center gap-2"><kbd className="bg-white px-2 py-1 rounded border shadow-sm text-slate-700">W</kbd> Accel</span>
         <span className="flex items-center gap-2"><kbd className="bg-white px-2 py-1 rounded border shadow-sm text-slate-700">S</kbd> Brake</span>
         <span className="flex items-center gap-2"><kbd className="bg-white px-2 py-1 rounded border shadow-sm text-slate-700">A</kbd> <kbd className="bg-white px-2 py-1 rounded border shadow-sm text-slate-700">D</kbd> Steer</span>
       </div>
    </div>
  );
}
