import {
  computeAdaptiveNameTagWidthPx,
  formatNameTagDisplayText,
  resolveNameTagCornerRadiusPx,
  resolveNameTagFontFamilyCss,
  type NameTagConfig,
} from '../../../ui-core/config/nameTagCalibrationMath';
import type { NameTagPillRenderCard2D } from '../../../ui-core/config/nameTagPillRenderer';

export interface KickoffCarSpawn {
  carIndex: number;
  slotCode: string;
  slotName: string;
  team: 0 | 1;
  x: number;
  y: number;
  z: number;
  yaw: number;
}

export interface KickoffSlotPair {
  name: string;
  team0: { x: number; y: number; z: number; yaw: number };
  team1: { x: number; y: number; z: number; yaw: number };
}

export const KICKOFF_SLOT_PAIRS: KickoffSlotPair[] = [
  {
    name: 'Diagonal Right',
    team0: { x: 2048, y: 17, z: -2560, yaw: 2.35619449 },
    team1: { x: -2048, y: 17, z: 2560, yaw: -0.78539816 },
  },
  {
    name: 'Diagonal Left',
    team0: { x: -2048, y: 17, z: -2560, yaw: 0.78539816 },
    team1: { x: 2048, y: 17, z: 2560, yaw: -2.35619449 },
  },
  {
    name: 'Back Right',
    team0: { x: 256, y: 17, z: -3840, yaw: 1.57079633 },
    team1: { x: -256, y: 17, z: 3840, yaw: -1.57079633 },
  },
  {
    name: 'Back Left',
    team0: { x: -256, y: 17, z: -3840, yaw: 1.57079633 },
    team1: { x: 256, y: 17, z: 3840, yaw: -1.57079633 },
  },
  {
    name: 'Far Back Center',
    team0: { x: 0, y: 17, z: -4608, yaw: 1.57079633 },
    team1: { x: 0, y: 17, z: 4608, yaw: -1.57079633 },
  },
];

export const CLASSIC_BALL_RADIUS = 95;

export function buildKickoffCars(slotIndices: [number, number, number]): KickoffCarSpawn[] {
  const cars: KickoffCarSpawn[] = [];
  for (let i = 0; i < 3; i++) {
    const pair = KICKOFF_SLOT_PAIRS[slotIndices[i]];
    cars.push({
      carIndex: i,
      slotCode: `B${i + 1}`,
      slotName: pair.name,
      team: 0,
      x: pair.team0.x,
      y: pair.team0.y,
      z: pair.team0.z,
      yaw: pair.team0.yaw,
    });
  }
  for (let i = 0; i < 3; i++) {
    const pair = KICKOFF_SLOT_PAIRS[slotIndices[i]];
    cars.push({
      carIndex: i + 3,
      slotCode: `O${i + 1}`,
      slotName: pair.name,
      team: 1,
      x: pair.team1.x,
      y: pair.team1.y,
      z: pair.team1.z,
      yaw: pair.team1.yaw,
    });
  }
  return cars;
}

export function buildSinglePillCard2D(
  carIndex: number,
  rawName: string,
  team: 0 | 1,
  boostAmount: number,
  centerX: number,
  centerY: number,
  screenUnitScale: number,
  viewZDepthUu: number,
  cameraDistanceSq: number,
  config: NameTagConfig,
  boostBorderVisible = config.boostBorderEnabled,
): NameTagPillRenderCard2D {
  const displayText = formatNameTagDisplayText(rawName, config.maxChars);
  const baseWidth = computeAdaptiveNameTagWidthPx(displayText, config);
  const baseHeight = config.pillHeight;
  const renderScale = (config.cardRenderScale || 100) / 100;
  const unit = Math.max(0.18, screenUnitScale * renderScale);

  const width = Math.max(24, baseWidth * unit);
  const height = Math.max(14, baseHeight * unit);
  const radius = resolveNameTagCornerRadiusPx(width, height, config.cornerRadius * unit);
  const borderW = Math.max(0, config.borderWidth * unit);
  const left = centerX - width * 0.5;
  const top = centerY - height * 0.5;

  const halfStroke = borderW * 0.5;
  const outerLeft = left - halfStroke;
  const outerTop = top - halfStroke;
  const outerWidth = width + borderW;
  const outerHeight = height + borderW;
  const outerRight = outerLeft + outerWidth;
  const outerBottom = outerTop + outerHeight;
  const outerRadius = radius + halfStroke;

  const isBlue = team === 0;
  const bgColor = isBlue ? config.blueBgColor : config.orangeBgColor;
  const borderColor = isBlue ? config.blueBorderColor : config.orangeBorderColor;
  const textColor = isBlue ? config.blueTextColor : config.orangeTextColor;
  const boostBorderColor =
    config.boostBorderColorMode === 'shared'
      ? config.sharedBoostBorderColor
      : isBlue
        ? config.blueBoostBorderColor
        : config.orangeBoostBorderColor;

  return {
    carIndex,
    cameraDistanceSq,
    viewZDepthUu,
    displayText,
    centerX,
    centerY,
    left,
    top,
    width,
    height,
    radius,
    borderW,
    screenUnitScale: unit,
    outerLeft,
    outerTop,
    outerRight,
    outerBottom,
    outerWidth,
    outerHeight,
    outerRadius,
    fontPx: Math.max(8, config.fontSize * unit),
    fontWeight: config.fontWeight,
    fontFamilyCss: resolveNameTagFontFamilyCss(config.fontFamily),
    opacity: config.opacity,
    bgOpacity: config.bgOpacity,
    bgColor,
    borderColor,
    textColor,
    boostBorderVisible,
    boostFraction: Math.max(0, Math.min(1, boostAmount / 100)),
    boostBorderColor,
  };
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface CameraBasis {
  pos: Vec3;
  target: Vec3;
  forward: Vec3;
  right: Vec3;
  up: Vec3;
  fovDeg: number;
}

function sub3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function len3(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

function norm3(v: Vec3): Vec3 {
  const l = len3(v) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function buildCameraBasis(pos: Vec3, target: Vec3, fovDeg: number): CameraBasis {
  const forward = norm3(sub3(target, pos));
  const worldUp: Vec3 = { x: 0, y: 1, z: 0 };
  const right = norm3(cross3(forward, worldUp));
  const up = norm3(cross3(right, forward));
  return { pos, target, forward, right, up, fovDeg };
}

export function resolveNamePlateCameraBasis(
  povCar: KickoffCarSpawn | null,
  ballWorld: Vec3,
  cameraFovDeg: number,
): CameraBasis {
  if (povCar) {
    const toBall = norm3({ x: -povCar.x, y: 0, z: -povCar.z });
    const camPos: Vec3 = {
      x: povCar.x - toBall.x * 290,
      y: povCar.y + 112,
      z: povCar.z - toBall.z * 290,
    };
    const camTarget: Vec3 = {
      x: ballWorld.x,
      y: ballWorld.y - 12,
      z: ballWorld.z,
    };
    return buildCameraBasis(camPos, camTarget, cameraFovDeg);
  }
  return buildCameraBasis(
    { x: -1950, y: 720, z: -2600 },
    { x: 0, y: 80, z: 0 },
    cameraFovDeg,
  );
}

export function projectWorldPoint(
  world: Vec3,
  cam: CameraBasis,
  width: number,
  height: number,
): {
  x: number;
  y: number;
  viewZ: number;
  euclidean: number;
  offAxisDeg: number;
  visible: boolean;
} {
  const rel = sub3(world, cam.pos);
  const viewZ = dot3(rel, cam.forward);
  const euclidean = len3(rel);
  if (viewZ <= 10) {
    return { x: 0, y: 0, viewZ, euclidean, offAxisDeg: 90, visible: false };
  }
  const camX = dot3(rel, cam.right);
  const camY = dot3(rel, cam.up);
  const halfTan = Math.tan(((cam.fovDeg * Math.PI) / 180) * 0.5);
  const aspect = width / Math.max(1, height);
  const ndcX = camX / (viewZ * halfTan * aspect);
  const ndcY = camY / (viewZ * halfTan);
  const x = (ndcX * 0.5 + 0.5) * width;
  const y = (-ndcY * 0.5 + 0.5) * height;
  const cosAng = Math.max(-1, Math.min(1, viewZ / Math.max(1e-4, euclidean)));
  const offAxisDeg = (Math.acos(cosAng) * 180) / Math.PI;
  return {
    x,
    y,
    viewZ,
    euclidean,
    offAxisDeg,
    visible: Math.abs(ndcX) <= 1.35 && Math.abs(ndcY) <= 1.35,
  };
}

export function renderNamePlate3DScenePass(
  sceneCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camBasis: CameraBasis,
  cars: KickoffCarSpawn[],
  povCar: KickoffCarSpawn | null,
  ballWorld: Vec3,
  config: NameTagConfig,
): {
  ballProj: ReturnType<typeof projectWorldPoint>;
  ballRadiusPx: number;
  halfTan: number;
  focalPx: number;
} {
  sceneCtx.save();
  const drawWorldSegment = (a: Vec3, b: Vec3, stroke: string, lineWidth = 1.25) => {
    const pa = projectWorldPoint(a, camBasis, width, height);
    const pb = projectWorldPoint(b, camBasis, width, height);
    if (!pa.visible || !pb.visible) return;
    sceneCtx.strokeStyle = stroke;
    sceneCtx.lineWidth = lineWidth;
    sceneCtx.beginPath();
    sceneCtx.moveTo(pa.x, pa.y);
    sceneCtx.lineTo(pb.x, pb.y);
    sceneCtx.stroke();
  };

  drawWorldSegment({ x: -4096, y: 2, z: 0 }, { x: 4096, y: 2, z: 0 }, 'rgba(255,255,255,0.22)', 1.6);
  drawWorldSegment({ x: 0, y: 2, z: -5120 }, { x: 0, y: 2, z: 5120 }, 'rgba(255,255,255,0.10)', 1);

  sceneCtx.beginPath();
  let startedCircle = false;
  for (let seg = 0; seg <= 48; seg++) {
    const ang = (seg / 48) * Math.PI * 2;
    const pt = projectWorldPoint(
      { x: Math.cos(ang) * 1024, y: 2, z: Math.sin(ang) * 1024 },
      camBasis,
      width,
      height,
    );
    if (pt.visible) {
      if (!startedCircle) {
        sceneCtx.moveTo(pt.x, pt.y);
        startedCircle = true;
      } else {
        sceneCtx.lineTo(pt.x, pt.y);
      }
    }
  }
  if (startedCircle) {
    sceneCtx.strokeStyle = 'rgba(255,255,255,0.22)';
    sceneCtx.lineWidth = 1.5;
    sceneCtx.stroke();
  }
  sceneCtx.restore();

  const ballProj = projectWorldPoint(ballWorld, camBasis, width, height);
  const halfTan = Math.tan(((camBasis.fovDeg * Math.PI) / 180) * 0.5);
  const focalPx = (height * 0.5) / Math.max(1e-4, halfTan);
  const ballRadiusPx = ballProj.viewZ > 10 ? (CLASSIC_BALL_RADIUS / ballProj.viewZ) * focalPx : 0;

  interface SceneDrawable {
    depth: number;
    draw: () => void;
  }
  const drawables: SceneDrawable[] = [];

  for (const car of cars) {
    const carCenter = projectWorldPoint({ x: car.x, y: car.y + 18, z: car.z }, camBasis, width, height);
    if (!carCenter.visible) continue;
    const isCurrentPov = povCar?.carIndex === car.carIndex;
    drawables.push({
      depth: carCenter.viewZ,
      draw: () => {
        const carHalfW = Math.max(8, (72 / carCenter.viewZ) * focalPx);
        const carHalfH = Math.max(5, (34 / carCenter.viewZ) * focalPx);

        sceneCtx.save();
        sceneCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        sceneCtx.beginPath();
        sceneCtx.ellipse(
          carCenter.x,
          carCenter.y + carHalfH * 0.85,
          carHalfW * 1.15,
          carHalfH * 0.55,
          0,
          0,
          Math.PI * 2,
        );
        sceneCtx.fill();

        const bodyGrad = sceneCtx.createLinearGradient(
          carCenter.x,
          carCenter.y - carHalfH,
          carCenter.x,
          carCenter.y + carHalfH,
        );
        if (car.team === 0) {
          bodyGrad.addColorStop(0, '#60a5fa');
          bodyGrad.addColorStop(1, '#1d4ed8');
        } else {
          bodyGrad.addColorStop(0, '#fb923c');
          bodyGrad.addColorStop(1, '#c2410c');
        }
        sceneCtx.fillStyle = bodyGrad;
        sceneCtx.strokeStyle = isCurrentPov ? '#5eead4' : 'rgba(255,255,255,0.65)';
        sceneCtx.lineWidth = isCurrentPov ? 2 : 1.1;
        sceneCtx.beginPath();
        sceneCtx.roundRect(
          carCenter.x - carHalfW,
          carCenter.y - carHalfH,
          carHalfW * 2,
          carHalfH * 1.65,
          Math.max(3, carHalfH * 0.45),
        );
        sceneCtx.fill();
        sceneCtx.stroke();

        sceneCtx.fillStyle = 'rgba(10, 14, 24, 0.72)';
        sceneCtx.beginPath();
        sceneCtx.roundRect(
          carCenter.x - carHalfW * 0.55,
          carCenter.y - carHalfH * 0.65,
          carHalfW * 1.1,
          carHalfH * 0.75,
          Math.max(2, carHalfH * 0.25),
        );
        sceneCtx.fill();
        sceneCtx.restore();
      },
    });
  }

  if (ballProj.visible && ballRadiusPx > 1.5) {
    const groundBallProj = projectWorldPoint({ x: 0, y: 2, z: 0 }, camBasis, width, height);
    drawables.push({
      depth: ballProj.viewZ,
      draw: () => {
        sceneCtx.save();
        if (groundBallProj.visible) {
          sceneCtx.fillStyle = 'rgba(0, 0, 0, 0.42)';
          sceneCtx.beginPath();
          sceneCtx.ellipse(
            groundBallProj.x,
            groundBallProj.y,
            ballRadiusPx * 0.95,
            ballRadiusPx * 0.36,
            0,
            0,
            Math.PI * 2,
          );
          sceneCtx.fill();
        }

        sceneCtx.globalAlpha = Math.max(0.08, Math.min(1, config.ballOcclusionOpacity));
        const ballGrad = sceneCtx.createRadialGradient(
          ballProj.x - ballRadiusPx * 0.32,
          ballProj.y - ballRadiusPx * 0.32,
          ballRadiusPx * 0.12,
          ballProj.x,
          ballProj.y,
          ballRadiusPx,
        );
        ballGrad.addColorStop(0, '#f8fafc');
        ballGrad.addColorStop(0.55, '#cbd5e1');
        ballGrad.addColorStop(0.88, '#475569');
        ballGrad.addColorStop(1, '#1e293b');

        sceneCtx.fillStyle = ballGrad;
        sceneCtx.beginPath();
        sceneCtx.arc(ballProj.x, ballProj.y, ballRadiusPx, 0, Math.PI * 2);
        sceneCtx.fill();

        sceneCtx.strokeStyle = 'rgba(15, 23, 42, 0.58)';
        sceneCtx.lineWidth = Math.max(1, ballRadiusPx * 0.055);
        sceneCtx.beginPath();
        sceneCtx.arc(ballProj.x, ballProj.y, ballRadiusPx * 0.42, 0, Math.PI * 2);
        sceneCtx.stroke();

        for (let seam = 0; seam < 5; seam++) {
          const ang = (seam / 5) * Math.PI * 2 - Math.PI / 2;
          sceneCtx.beginPath();
          sceneCtx.moveTo(
            ballProj.x + Math.cos(ang) * ballRadiusPx * 0.42,
            ballProj.y + Math.sin(ang) * ballRadiusPx * 0.42,
          );
          sceneCtx.lineTo(
            ballProj.x + Math.cos(ang) * ballRadiusPx * 0.96,
            ballProj.y + Math.sin(ang) * ballRadiusPx * 0.96,
          );
          sceneCtx.stroke();
        }

        sceneCtx.strokeStyle = config.ballOcclusionEnabled
          ? 'rgba(94, 234, 212, 0.72)'
          : 'rgba(255, 255, 255, 0.38)';
        sceneCtx.lineWidth = 1.4;
        sceneCtx.beginPath();
        sceneCtx.arc(ballProj.x, ballProj.y, ballRadiusPx, 0, Math.PI * 2);
        sceneCtx.stroke();
        sceneCtx.restore();
      },
    });
  }

  drawables.sort((a, b) => b.depth - a.depth);
  for (const item of drawables) {
    item.draw();
  }

  return { ballProj, ballRadiusPx, halfTan, focalPx };
}
