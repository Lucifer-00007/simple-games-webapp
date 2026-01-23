export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameOver' | 'crashed';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
  w: number;
  scale: number;
}

export interface RoadSegment {
  index: number;
  p1: Point3D & { screen: Point2D };
  p2: Point3D & { screen: Point2D };
  color: { road: string; grass: string; rumble: string; lane: string };
  curve: number;
  hill: number; // For hills/valleys
  sprites: Sprite[];
  clip: number;
}

export interface Sprite {
  source: string; // Emoji or asset path or just 'car'
  offset: number; // -1 to 1 (horizontal position)
  scale: number;
  color?: string; // For car rendering
}

export interface Player {
  x: number; // -1 to 1
  z: number; // Position along the track
  speed: number;
  maxSpeed: number;
  accel: number;
  breaking: number;
  decu: number;
  offRoadDecel: number;
  offRoadLimit: number;
  score: number;
  lap: number;
  lapTimes: number[];
  bestLap: number | null;
  carColor: string;
}

export type TrafficDensity = 'low' | 'medium' | 'high';

export interface GameState {
  status: GameStatus;
  player: Player;
  trackLength: number;
  segmentLength: number;
  rumbleLength: number;
  cameraHeight: number;
  cameraDepth: number;
  roadWidth: number;
  totalLaps: number;
  segments: RoadSegment[];
  cars: TrafficCar[];
  trafficDensity: TrafficDensity;
}

export interface TrafficCar {
  index: number; // unique id
  z: number;
  speed: number;
  lane: number; // -1 to 1 approx
  color: string;
}

export interface GameConfig {
  resolution: number;
  fov: number;
  drawDistance: number;
  dt: number; // Time step
}