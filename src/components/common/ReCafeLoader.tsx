import React, { useEffect, useRef, useState } from "react";

interface Spark {
  type: "bean" | "leaf";
  subType: "leftBean" | "rightBean" | "leaf";
  targetX: number;
  targetY: number;
  angle: number;
  dist: number;
  size: number;
  randDist: number;
  randAngle: number;
  spin: number;
  delayOffset: number;
}

interface WindSpark {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
}

export const ReCafeLoader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  // Offscreen canvas segments to draw the sliced logo with pixel perfection
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const leafCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const particlesRef = useRef<Spark[]>([]);
  const windSparksRef = useRef<WindSpark[]>([]);

  // Draw a coffee bean particle
  const drawCoffeeBean = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    angle: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "#68361c";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.4, size, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Groove line
    ctx.strokeStyle = "#fffaf5";
    ctx.lineWidth = size * 0.25;
    ctx.beginPath();
    ctx.moveTo(-size * 1.0, 0);
    ctx.quadraticCurveTo(0, -size * 0.2, size * 1.0, 0);
    ctx.stroke();
    ctx.restore();
  };

  // Draw a leaf particle
  const drawLeaf = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    angle: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "#657b35";
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.5);
    ctx.quadraticCurveTo(size * 1.0, -size * 0.3, 0, size * 1.5);
    ctx.quadraticCurveTo(-size * 1.0, -size * 0.3, 0, -size * 1.5);
    ctx.fill();
    
    // Leaf vein
    ctx.strokeStyle = "#8ba24a";
    ctx.lineWidth = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.1);
    ctx.lineTo(0, size * 1.1);
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/favicon.svg";
    img.onload = () => {
      imageRef.current = img;

      const imgSize = 64; // Smaller size for a more compact and elegant design
      const half = imgSize / 2;

      // 1. Create main offscreen canvas to scan logo pixels
      const offscreen = document.createElement("canvas");
      offscreen.width = imgSize;
      offscreen.height = imgSize;
      const oCtx = offscreen.getContext("2d");

      // 2. Create the three segment canvases
      const leftCanvas = document.createElement("canvas");
      leftCanvas.width = imgSize;
      leftCanvas.height = imgSize;
      const leftCtx = leftCanvas.getContext("2d");

      const rightCanvas = document.createElement("canvas");
      rightCanvas.width = imgSize;
      rightCanvas.height = imgSize;
      const rightCtx = rightCanvas.getContext("2d");

      const leafCanvas = document.createElement("canvas");
      leafCanvas.width = imgSize;
      leafCanvas.height = imgSize;
      const leafCtx = leafCanvas.getContext("2d");

      let leftBeanPixels: { x: number; y: number }[] = [];
      let rightBeanPixels: { x: number; y: number }[] = [];
      let leafPixels: { x: number; y: number }[] = [];

      let scanSuccessful = false;

      if (oCtx && leftCtx && rightCtx && leafCtx) {
        try {
          oCtx.drawImage(img, 0, 0, imgSize, imgSize);
          const imgData = oCtx.getImageData(0, 0, imgSize, imgSize);
          const pixels = imgData.data;

          // Initialize transparent imageData for segment canvases
          const leftData = leftCtx.createImageData(imgSize, imgSize);
          const rightData = rightCtx.createImageData(imgSize, imgSize);
          const leafData = leafCtx.createImageData(imgSize, imgSize);

          for (let y = 0; y < imgSize; y++) {
            for (let x = 0; x < imgSize; x++) {
              const idx = (y * imgSize + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const a = pixels[idx + 3];

              // If pixel is semi-opaque, distribute it into segments
              if (a > 10) {
                const rx = x - half;
                const ry = y - half;

                // Leaf: green value is higher than red
                // Bean: brown/red color is dominant
                if (g > r + 5) {
                  leafPixels.push({ x: rx, y: ry });
                  
                  leafData.data[idx] = r;
                  leafData.data[idx + 1] = g;
                  leafData.data[idx + 2] = b;
                  leafData.data[idx + 3] = a;
                } else {
                  if (rx < 0) {
                    leftBeanPixels.push({ x: rx, y: ry });

                    leftData.data[idx] = r;
                    leftData.data[idx + 1] = g;
                    leftData.data[idx + 2] = b;
                    leftData.data[idx + 3] = a;
                  } else {
                    rightBeanPixels.push({ x: rx, y: ry });

                    rightData.data[idx] = r;
                    rightData.data[idx + 1] = g;
                    rightData.data[idx + 2] = b;
                    rightData.data[idx + 3] = a;
                  }
                }
              }
            }
          }

          leftCtx.putImageData(leftData, 0, 0);
          rightCtx.putImageData(rightData, 0, 0);
          leafCtx.putImageData(leafData, 0, 0);

          leftCanvasRef.current = leftCanvas;
          rightCanvasRef.current = rightCanvas;
          leafCanvasRef.current = leafCanvas;

          scanSuccessful = leftBeanPixels.length > 0 || rightBeanPixels.length > 0 || leafPixels.length > 0;
        } catch (e) {
          console.warn("Offscreen image data scan failed (CORS or canvas issue). Using shape fallback.", e);
        }
      }

      // If scan failed, generate fallback coordinates
      if (!scanSuccessful) {
        leftBeanPixels = [];
        rightBeanPixels = [];
        leafPixels = [];
        
        for (let j = 0; j < 500; j++) {
          const lAngle = Math.random() * Math.PI * 2;
          const lDist = Math.random() * 16;
          leftBeanPixels.push({
            x: -11 + Math.cos(lAngle) * lDist,
            y: -10 + Math.sin(lAngle) * lDist,
          });

          const rAngle = Math.random() * Math.PI * 2;
          const rDist = Math.random() * 15;
          rightBeanPixels.push({
            x: 11 + Math.cos(rAngle) * rDist,
            y: -10 + Math.sin(rAngle) * rDist,
          });

          const lfAngle = Math.random() * Math.PI * 2;
          const lfDist = Math.random() * 20;
          leafPixels.push({
            x: Math.cos(lfAngle) * lfDist,
            y: 13 + Math.sin(lfAngle) * lfDist,
          });
        }
      }

      // Generate particles
      const tempParticles: Spark[] = [];
      const totalParticles = 180;

      const getRandPixel = (arr: { x: number; y: number }[], fallbackX: number, fallbackY: number) => {
        if (arr.length === 0) return { x: fallbackX, y: fallbackY };
        return arr[Math.floor(Math.random() * arr.length)];
      };

      for (let i = 0; i < totalParticles; i++) {
        let type: "leftBean" | "rightBean" | "leaf" = "leftBean";
        let targetX = 0;
        let targetY = 0;

        if (i < 60) {
          type = "leftBean";
          const p = getRandPixel(leftBeanPixels, -11, -10);
          targetX = p.x;
          targetY = p.y;
        } else if (i < 120) {
          type = "rightBean";
          const p = getRandPixel(rightBeanPixels, 11, -10);
          targetX = p.x;
          targetY = p.y;
        } else {
          type = "leaf";
          const p = getRandPixel(leafPixels, 0, 13);
          targetX = p.x;
          targetY = p.y;
        }

        const angle = Math.atan2(targetY, targetX);
        const dist = Math.sqrt(targetX * targetX + targetY * targetY);

        tempParticles.push({
          type: type === "leaf" ? "leaf" : "bean",
          subType: type,
          targetX,
          targetY,
          angle,
          dist,
          size: 1.5 + Math.random() * 1.5, // Smaller delicate grains
          randDist: 50 + Math.random() * 65, // Reduced explosion radius
          randAngle: (Math.random() - 0.5) * 2.2,
          spin: (Math.random() - 0.5) * 6,
          delayOffset: Math.random() * 0.15,
        });
      }

      // Wind sparks for Stage 4 Swirl depth
      const tempWind: WindSpark[] = [];
      for (let i = 0; i < 30; i++) {
        tempWind.push({
          angle: Math.random() * Math.PI * 2,
          radius: 28 + Math.random() * 28, // Scaled down radius
          speed: 1.8 + Math.random() * 2.2,
          size: 0.6 + Math.random() * 1.2,
          alpha: 0.12 + Math.random() * 0.4,
        });
      }

      particlesRef.current = tempParticles;
      windSparksRef.current = tempWind;
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const img = imageRef.current;
    const particles = particlesRef.current;
    const windSparks = windSparksRef.current;

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const centerX = canvasW / 2;
    const centerY = canvasH / 2;

    const imgSize = 64; // Smaller rendering size
    const halfSize = imgSize / 2;

    const startTime = performance.now();
    const cycleDuration = 4000;

    // Slices drift offsets (scaled down for compact styling)
    const driftLeft = { dx: -6, dy: -4.5 };
    const driftRight = { dx: 6, dy: -4.5 };
    const driftLeaf = { dx: 0, dy: 7.5 };

    // Helper to draw segment using offscreen canvases or source-rect fallback
    const drawSegment = (
      segment: "left" | "right" | "leaf",
      canvasEl: HTMLCanvasElement | null,
      ox: number,
      oy: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      if (canvasEl) {
        ctx.drawImage(
          canvasEl,
          centerX - halfSize + ox,
          centerY - halfSize + oy,
          imgSize,
          imgSize
        );
      } else {
        // Fallback using direct source-rect slice of the original image
        if (segment === "left") {
          ctx.drawImage(
            img,
            0, 0, halfSize, imgSize,
            centerX - halfSize + ox, centerY - halfSize + oy, halfSize, imgSize
          );
        } else if (segment === "right") {
          ctx.drawImage(
            img,
            halfSize, 0, halfSize, imgSize,
            centerX + ox, centerY - halfSize + oy, halfSize, imgSize
          );
        } else {
          ctx.drawImage(
            img,
            0, halfSize, imgSize, halfSize,
            centerX - halfSize + ox, centerY + oy, imgSize, halfSize
          );
        }
      }
      ctx.restore();
    };

    const render = (time: number) => {
      const elapsed = time - startTime;
      // Clamp progress to 1.0 so the animation plays exactly once and holds the final intact logo state
      const progress = Math.min(1.0, elapsed / cycleDuration);

      ctx.clearRect(0, 0, canvasW, canvasH);

      // Background canvas fill
      ctx.fillStyle = "#fffaf5";
      ctx.fillRect(0, 0, canvasW, canvasH);

      // 1. PHASE 1: Intact Logo (progress: 0.0 -> 0.15)
      if (progress < 0.15) {
        drawSegment("left", leftCanvasRef.current, 0, 0, 1);
        drawSegment("right", rightCanvasRef.current, 0, 0, 1);
        drawSegment("leaf", leafCanvasRef.current, 0, 0, 1);
      }
      
      // 2. PHASE 2: Starts to Split slightly (progress: 0.15 -> 0.30)
      else if (progress >= 0.15 && progress < 0.30) {
        const t = (progress - 0.15) / 0.15;
        const ease = t * t * (3 - 2 * t);
        
        drawSegment("left", leftCanvasRef.current, driftLeft.dx * ease, driftLeft.dy * ease, 1);
        drawSegment("right", rightCanvasRef.current, driftRight.dx * ease, driftRight.dy * ease, 1);
        drawSegment("leaf", leafCanvasRef.current, driftLeaf.dx * ease, driftLeaf.dy * ease, 1);
      }
      
      // 3. PHASE 3: Shatter & Dissolve (progress: 0.30 -> 0.45)
      else if (progress >= 0.30 && progress < 0.45) {
        const t = (progress - 0.30) / 0.15;
        const alpha = 1 - t;
        
        const oxL = driftLeft.dx - 3 * t;
        const oyL = driftLeft.dy - 2 * t;
        const oxR = driftRight.dx + 3 * t;
        const oyR = driftRight.dy - 2 * t;
        const oxF = driftLeaf.dx;
        const oyF = driftLeaf.dy + 4 * t;

        drawSegment("left", leftCanvasRef.current, oxL, oyL, alpha);
        drawSegment("right", rightCanvasRef.current, oxR, oyR, alpha);
        drawSegment("leaf", leafCanvasRef.current, oxF, oyF, alpha);

        // Exploding particles
        particles.forEach((p) => {
          const pt = Math.max(0, (t - p.delayOffset) / (1 - p.delayOffset));
          if (pt <= 0) return;

          let pOx = 0, pOy = 0;
          if (p.subType === "leftBean") { pOx = driftLeft.dx - 3 * t; pOy = driftLeft.dy - 2 * t; }
          else if (p.subType === "rightBean") { pOx = driftRight.dx + 3 * t; pOy = driftRight.dy - 2 * t; }
          else { pOx = 0; pOy = driftLeaf.dy + 4 * t; }

          const currentDist = p.randDist * pt;
          const currentAngle = p.angle + p.randAngle * pt;
          const px = centerX + p.targetX + pOx + Math.cos(currentAngle) * currentDist;
          const py = centerY + p.targetY + pOy + Math.sin(currentAngle) * currentDist;
          const spinAngle = p.spin * pt * Math.PI;

          const drawSize = p.size * (1 - pt * 0.15);

          if (p.type === "bean") {
            drawCoffeeBean(ctx, px, py, drawSize, spinAngle);
          } else {
            drawLeaf(ctx, px, py, drawSize, spinAngle);
          }
        });
      }
      
      // 4. PHASE 4: Swirling vortex (progress: 0.45 -> 0.75)
      else if (progress >= 0.45 && progress < 0.75) {
        const t = (progress - 0.45) / 0.30;

        ctx.save();
        // Swirl ring 1 (leaf green)
        ctx.strokeStyle = "rgba(101, 123, 53, 0.08)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 42, t * Math.PI * 2, (t + 0.6) * Math.PI * 2);
        ctx.stroke();

        // Swirl ring 2 (bean brown)
        ctx.strokeStyle = "rgba(104, 54, 28, 0.06)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, -t * Math.PI * 2.4, (-t + 0.5) * Math.PI * 2.4);
        ctx.stroke();
        ctx.restore();

        // Draw wind sparks
        windSparks.forEach((sp) => {
          const currentAngle = sp.angle + t * sp.speed * Math.PI * 2;
          const px = centerX + Math.cos(currentAngle) * sp.radius;
          const py = centerY + Math.sin(currentAngle) * sp.radius;
          ctx.fillStyle = `rgba(240, 230, 220, ${sp.alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, sp.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Orbiting particles
        particles.forEach((p) => {
          const currentDist = (p.dist + p.randDist) * (1 - t * 0.45);
          const currentAngle = p.angle + p.randAngle + t * Math.PI * 3.0;
          const px = centerX + Math.cos(currentAngle) * currentDist;
          const py = centerY + Math.sin(currentAngle) * currentDist;
          const spinAngle = p.spin * (1 + t * 2) * Math.PI;

          if (p.type === "bean") {
            drawCoffeeBean(ctx, px, py, p.size, spinAngle);
          } else {
            drawLeaf(ctx, px, py, p.size, spinAngle);
          }
        });
      }
      
      // 5. PHASE 5: Gather back (progress: 0.75 -> 0.90)
      else if (progress >= 0.75 && progress < 0.90) {
        const t = (progress - 0.75) / 0.15;
        const ease = t * t * (3 - 2 * t);
        const alpha = ease;

        // Draw gathering particles
        particles.forEach((p) => {
          const rSwirl = (p.dist + p.randDist) * 0.55;
          const angleSwirl = p.angle + p.randAngle + Math.PI * 3.0;
          const pxSwirl = centerX + Math.cos(angleSwirl) * rSwirl;
          const pySwirl = centerY + Math.sin(angleSwirl) * rSwirl;

          let pOx = 0, pOy = 0;
          if (p.subType === "leftBean") { pOx = driftLeft.dx; pOy = driftLeft.dy; }
          else if (p.subType === "rightBean") { pOx = driftRight.dx; pOy = driftRight.dy; }
          else { pOx = 0; pOy = driftLeaf.dy; }

          const pxTarget = centerX + p.targetX + pOx;
          const pyTarget = centerY + p.targetY + pOy;

          const px = pxSwirl * (1 - ease) + pxTarget * ease;
          const py = pySwirl * (1 - ease) + pyTarget * ease;
          const spinAngle = p.spin * 3 * (1 - ease);

          const drawSize = p.size * (1 - ease * 0.25);

          if (p.type === "bean") {
            drawCoffeeBean(ctx, px, py, drawSize, spinAngle);
          } else {
            drawLeaf(ctx, px, py, drawSize, spinAngle);
          }
        });

        // Fade in solid slices
        drawSegment("left", leftCanvasRef.current, driftLeft.dx, driftLeft.dy, alpha);
        drawSegment("right", rightCanvasRef.current, driftRight.dx, driftRight.dy, alpha);
        drawSegment("leaf", leafCanvasRef.current, driftLeaf.dx, driftLeaf.dy, alpha);
      }
      
      // 6. PHASE 6: Recombining (progress: 0.90 -> 1.0)
      else {
        const t = Math.min(1.0, (progress - 0.90) / 0.10);
        const ease = t * t * (3 - 2 * t);

        const oxL = driftLeft.dx * (1 - ease);
        const oyL = driftLeft.dy * (1 - ease);
        const oxR = driftRight.dx * (1 - ease);
        const oyR = driftRight.dy * (1 - ease);
        const oxF = driftLeaf.dx * (1 - ease);
        const oyF = driftLeaf.dy * (1 - ease);

        drawSegment("left", leftCanvasRef.current, oxL, oyL, 1);
        drawSegment("right", rightCanvasRef.current, oxR, oyR, 1);
        drawSegment("leaf", leafCanvasRef.current, oxF, oyF, 1);

        // If animation cycle completes, stop requesting frames to optimize CPU
        if (progress >= 1.0) {
          return;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageLoaded]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#fffaf5] z-50">
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="w-[260px] h-[260px]"
        />
      </div>
    </div>
  );
};

export default ReCafeLoader;
