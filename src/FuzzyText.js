// src/FuzzyText.js
import React, { useEffect, useRef } from 'react';

const FuzzyText = ({
  children,
  fontSize = 'clamp(2rem, 8vw, 8rem)',
  fontWeight = 900,
  fontFamily = 'inherit',
  color = '#fff',
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const computedFontFamily =
        fontFamily === 'inherit'
          ? window.getComputedStyle(canvas).fontFamily
          : fontFamily;

      const fontSizeStr =
        typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      let numericFontSize;

      // Calculate numeric font size for canvas
      if (typeof fontSize === 'number') {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement('div');
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.style.fontSize = fontSizeStr;
        temp.style.fontFamily = computedFontFamily;
        temp.style.fontWeight = fontWeight;
        document.body.appendChild(temp);
        const computedStyle = window.getComputedStyle(temp);
        numericFontSize = parseFloat(computedStyle.fontSize);
        document.body.removeChild(temp);
      }

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${numericFontSize}px ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;

      const metrics = offCtx.measureText(children);
      const actualAscent = metrics.actualBoundingBoxAscent;
      const actualDescent = metrics.actualBoundingBoxDescent;
      const textBoundingWidth = Math.ceil(metrics.width);
      const tightHeight = Math.ceil(actualAscent + actualDescent);

      const extraWidthBuffer = 10;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      offCtx.font = `${fontWeight} ${numericFontSize}px ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;
      offCtx.fillText(children, extraWidthBuffer / 2, actualAscent);

      const fuzzRange = 30; // How far pixels can scatter
      canvas.width = offscreenWidth + 2 * fuzzRange;
      canvas.height = tightHeight + 2 * fuzzRange;

      let isHovering = false;

      // Define interactive area
      const interactiveLeft = fuzzRange;
      const interactiveTop = fuzzRange;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      const run = () => {
        if (isCancelled) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const intensity = isHovering ? hoverIntensity : baseIntensity;

        for (let j = 0; j < tightHeight; j++) {
          const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
          // Draw a 1px high slice from offscreen to main canvas with random x-offset
          ctx.drawImage(
            offscreen,
            0,
            j,
            offscreenWidth,
            1,
            dx + fuzzRange,
            j + fuzzRange,
            offscreenWidth,
            1
          );
        }

        animationFrameId = window.requestAnimationFrame(run);
      };

      run();

      const handleMouseMove = (e) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (
          x >= interactiveLeft &&
          x <= interactiveRight &&
          y >= interactiveTop &&
          y <= interactiveBottom
        ) {
          isHovering = true;
        } else {
          isHovering = false;
        }
      };

      const handleMouseLeave = () => {
        isHovering = false;
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);

      canvas.cleanupFuzzyText = () => {
        window.cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
    };

    init();

    return () => {
      isCancelled = true;
      if (canvas && canvas.cleanupFuzzyText) {
        canvas.cleanupFuzzyText();
      }
    };
  }, [
    children,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    enableHover,
    baseIntensity,
    hoverIntensity,
  ]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;

return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'block',    /* Removes extra spacing below canvas */
        margin: '0 auto',    /* Centers the canvas horizontally if flex fails */
        maxWidth: '100%'     /* Prevents it from overflowing on small screens */
      }} 
    />
  );
};

export default FuzzyText;