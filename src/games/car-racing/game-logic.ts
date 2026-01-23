import { GameState, Player, RoadSegment, Point3D, Point2D, TrafficCar, TrafficDensity } from './types';

// Constants
export const SEGMENT_LENGTH = 200;
export const RUMBLE_LENGTH = 3;
export const ROAD_WIDTH = 2000;
export const CAMERA_HEIGHT = 1000;
export const CAMERA_DEPTH = 0.84; // FOV related
export const DRAW_DISTANCE = 300;
export const FIELD_OF_VIEW = 100;
export const FOG_DENSITY = 5;

export const COLORS = {
  SKY: '#72D7EE',
  TREE: '#005108',
  FOG: '#005108',
  LIGHT: { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC' },
  DARK: { road: '#696969', grass: '#009A00', rumble: '#BBBBBB', lane: '#696969' },
  START: { road: '#FFFFFF', grass: '#FFFFFF', rumble: '#FFFFFF', lane: '#FFFFFF' },
  FINISH: { road: '#000000', grass: '#000000', rumble: '#000000', lane: '#000000' },
};

export const TRAFFIC_SETTINGS = {
  low: { count: 10, speedMin: 3000, speedMax: 6000 },
  medium: { count: 30, speedMin: 4000, speedMax: 8000 },
  high: { count: 60, speedMin: 5000, speedMax: 9000 },
};

export function createInitialState(): GameState {
  const segments = createRoad();
  return {
    status: 'menu',
    player: {
      x: 0,
      z: 0,
      speed: 0,
      maxSpeed: 12000, // scaled unit
      accel: 100, // scaled unit
      breaking: -250,
      decu: -50,
      offRoadDecel: -200,
      offRoadLimit: 2000,
      score: 0,
      lap: 0,
      lapTimes: [],
      bestLap: null,
      carColor: '#ef4444', // Red default
    },
    trackLength: segments.length * SEGMENT_LENGTH,
    segmentLength: SEGMENT_LENGTH,
    rumbleLength: RUMBLE_LENGTH,
    cameraHeight: CAMERA_HEIGHT,
    cameraDepth: CAMERA_DEPTH,
    roadWidth: ROAD_WIDTH,
    totalLaps: 3,
    segments: segments,
    cars: [],
    trafficDensity: 'medium',
  };
}

function createRoad(): RoadSegment[] {
  const segments: RoadSegment[] = [];
  const numSegments = 1000; // Increased track length

  for (let i = 0; i < numSegments; i++) {
    const p1: Point3D & { screen: Point2D } = { x: 0, y: 0, z: i * SEGMENT_LENGTH, screen: { x: 0, y: 0, w: 0, scale: 0 } };
    const p2: Point3D & { screen: Point2D } = { x: 0, y: 0, z: (i + 1) * SEGMENT_LENGTH, screen: { x: 0, y: 0, w: 0, scale: 0 } };

    // Simple alternating colors
    const baseColor = Math.floor(i / RUMBLE_LENGTH) % 2 ? COLORS.DARK : COLORS.LIGHT;
    const color = { ...baseColor };
    
    // Add curves (simplified for now)
    let curve = 0;
    let hill = 0;

    // Example track design
    if (i > 50 && i < 150) curve = 2;
    if (i > 200 && i < 300) curve = -2;
    if (i > 300 && i < 400) hill = 40; // Hill
    if (i > 400 && i < 500) hill = -40; // Downhill
    if (i > 600 && i < 800) curve = 3;
    if (i > 800 && i < 900) curve = -2;

    // Start/Finish lines
    if (i < RUMBLE_LENGTH) color.road = COLORS.START.road; // Start line (simplified logic)
    
    segments.push({
      index: i,
      p1,
      p2,
      color,
      curve,
      hill,
      sprites: [],
      clip: 0,
    });
  }
  return segments;
}

export function resetCars(density: TrafficDensity, trackLength: number): TrafficCar[] {
  const settings = TRAFFIC_SETTINGS[density];
  const cars: TrafficCar[] = [];
  
  for (let i = 0; i < settings.count; i++) {
    const z = Math.random() * trackLength;
    // Safe zone: Don't spawn near start (0-3000) or end (wrap-around risk)
    if (z < 3000 || z > trackLength - 3000) continue; 
    
    const lane = Math.random() > 0.5 ? 0.5 : -0.5; // Two lanes approx
    // Negative speed for oncoming traffic
    const speed = -(settings.speedMin + Math.random() * (settings.speedMax - settings.speedMin));
    const color = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ffffff'][Math.floor(Math.random() * 5)];
    
    cars.push({
      index: i,
      z,
      speed,
      lane,
      color
    });
  }
  return cars;
}

export function updateCars(cars: TrafficCar[], dt: number, trackLength: number) {
  for (const car of cars) {
    car.z += car.speed * dt;
    if (car.z >= trackLength) {
      car.z -= trackLength;
    } else if (car.z < 0) {
      car.z += trackLength;
    }
  }
}

export function checkCollision(player: Player, cars: TrafficCar[], segmentLength: number, trackLength: number): boolean {
  const playerZ = player.z;
  const collisionW = 0.35; // Combined half-widths threshold (Player is ~0.3 wide, Car is ~0.3 wide -> 0.15+0.15 = 0.3. + margin)

  for (const car of cars) {
    // Check Z overlap (wrap-around aware)
    let carZ = car.z;
    if (Math.abs(playerZ - carZ) > trackLength / 2) {
       if (playerZ > carZ) carZ += trackLength;
       else carZ -= trackLength;
    }

    if (Math.abs(playerZ - carZ) < 300) { // < 300 units distance (approx car length)
       // Check X overlap
       // Lane is -0.5 or 0.5. Player is -1 to 1.
       if (Math.abs(player.x - car.lane) < collisionW) {
         return true;
       }
    }
  }
  return false;
}

// Projection: World -> Screen
export function project(
  p: Point3D & { screen: Point2D },
  cameraX: number,
  cameraY: number,
  cameraZ: number,
  cameraDepth: number,
  width: number,
  height: number,
  roadWidth: number
) {
  p.screen.scale = cameraDepth / (p.z - cameraZ);
  p.screen.x = Math.round((width / 2) + (p.screen.scale * (p.x - cameraX) * width / 2));
  p.screen.y = Math.round((height / 2) - (p.screen.scale * (p.y - cameraY) * height / 2));
  p.screen.w = Math.round(p.screen.scale * roadWidth * width / 2);
}

export function updatePlayer(player: Player, input: { up: boolean; down: boolean; left: boolean; right: boolean }, dt: number, dx: number) {
  // Acceleration
  if (input.up) player.speed += player.accel;
  else if (input.down) player.speed += player.breaking;
  else player.speed += player.decu;

  // Horizontal movement
  if (input.left) player.x -= dx;
  if (input.right) player.x += dx;

  // Off-road physics
  if ((player.x < -1 || player.x > 1) && player.speed > player.offRoadLimit) {
    player.speed += player.offRoadDecel;
  }

  // Cap speed
  player.x = Math.max(-2, Math.min(2, player.x));
  player.speed = Math.max(0, Math.min(player.maxSpeed, player.speed));

  // Move forward
  player.z += player.speed * dt;
}