'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';

interface GameClientProps {
  slug: string;
}

export default function GameClient({ slug }: GameClientProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);

  const handleScriptLoad = () => {
    setScriptsLoaded(prev => prev + 1);
  };

  useEffect(() => {
    if (slug) {
      const fetchHtmlContent = async () => {
        try {
          const res = await fetch(`/api/games/${slug}`);
          if (res.ok) {
            const html = await res.text();
            setHtmlContent(html);
          } else {
            setError('Game not found');
          }
        } catch (err) {
          setError('Error fetching game content');
        }
        setLoading(false);
      };

      fetchHtmlContent();
    }
  }, [slug]);

  const checkAndRunGame = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).TweenMax && (window as any).MorphSVGPlugin) {
      const svg = document.querySelector("svg");
      if (!svg) return;
      const cursor = svg.createSVGPoint();
      const arrows = document.querySelector(".arrows");
      let randomAngle = 0;

      const target = { x: 900, y: 249.5 };
      const lineSegment = { x1: 875, y1: 280, x2: 925, y2: 220 };
      const pivot = { x: 100, y: 250 };

      const aim = (e: MouseEvent) => {
        const point = getMouseSVG(e);
        point.x = Math.min(point.x, pivot.x - 7);
        point.y = Math.max(point.y, pivot.y + 7);
        const dx = point.x - pivot.x;
        const dy = point.y - pivot.y;
        const angle = Math.atan2(dy, dx) + randomAngle;
        const bowAngle = angle - Math.PI;
        const distance = Math.min(Math.sqrt((dx * dx) + (dy * dy)), 50);
        const scale = Math.min(Math.max(distance / 30, 1), 2);
        (window as any).TweenMax.to("#bow", 0.3, { scaleX: scale, rotation: bowAngle + "rad", transformOrigin: "right center" });
        (window as any).TweenMax.to(".arrow-angle", 0.3, { rotation: bowAngle + "rad", svgOrigin: "100 250" });
        (window as any).TweenMax.to(".arrow-angle use", 0.3, { x: -distance });
        (window as any).TweenMax.to("#bow polyline", 0.3, { attr: { points: `88,200 ${Math.min(pivot.x - ((1 / scale) * distance), 88)},250 88,300` } });
        const radius = distance * 9;
        const offset = { x: (Math.cos(bowAngle) * radius), y: (Math.sin(bowAngle) * radius) };
        const arcWidth = offset.x * 3;
        (window as any).TweenMax.to("#arc", 0.3, { attr: { d: `M100,250c${offset.x},${offset.y},${(arcWidth - offset.x)},${(offset.y + 50)},${arcWidth},50` }, autoAlpha: distance / 60 });
      };

      const loose = () => {
        window.removeEventListener("mousemove", aim as any);
        window.removeEventListener("mouseup", loose);
        (window as any).TweenMax.to("#bow", 0.4, { scaleX: 1, transformOrigin: "right center", ease: (window as any).Elastic.easeOut });
        (window as any).TweenMax.to("#bow polyline", 0.4, { attr: { points: "88,200 88,250 88,300" }, ease: (window as any).Elastic.easeOut });
        const newArrow = document.createElementNS("http://www.w3.org/2000/svg", "use");
        newArrow.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "#arrow");
        arrows?.appendChild(newArrow);
        const path = (window as any).MorphSVGPlugin.pathDataToBezier("#arc");
        (window as any).TweenMax.to([newArrow], 0.5, { force3D: true, bezier: { type: "cubic", values: path, autoRotate: ["x", "y", "rotation"] }, onUpdate: hitTest, onUpdateParams: ["{self}"], onComplete: onMiss, ease: (window as any).Linear.easeNone });
        (window as any).TweenMax.to("#arc", 0.3, { opacity: 0 });
        (window as any).TweenMax.set(".arrow-angle use", { opacity: 0 });
      };

      const hitTest = (tween: any) => {
        const arrow = tween.target[0];
        const transform = arrow._gsTransform;
        const radians = transform.rotation * Math.PI / 180;
        const arrowSegment = { x1: transform.x, y1: transform.y, x2: (Math.cos(radians) * 60) + transform.x, y2: (Math.sin(radians) * 60) + transform.y };
        const intersection = getIntersection(arrowSegment, lineSegment);
        if (intersection && intersection.segment1 && intersection.segment2) {
          tween.pause();
          const dx = intersection.x - target.x;
          const dy = intersection.y - target.y;
          const distance = Math.sqrt((dx * dx) + (dy * dy));
          let selector = ".hit";
          if (distance < 7) {
            selector = ".bullseye";
          }
          showMessage(selector);
        }
      };

      const onMiss = () => {
        showMessage(".miss");
      };

      const showMessage = (selector: string) => {
        (window as any).TweenMax.killTweensOf(selector);
        (window as any).TweenMax.killChildTweensOf(selector);
        (window as any).TweenMax.set(selector, { autoAlpha: 1 });
        (window as any).TweenMax.staggerFromTo(selector + " path", .5, { rotation: -5, scale: 0, transformOrigin: "center" }, { scale: 1, ease: (window as any).Back.easeOut }, .05);
        (window as any).TweenMax.staggerTo(selector + " path", .3, { delay: 2, rotation: 20, scale: 0, ease: (window as any).Back.easeIn }, .03);
      };

      const getMouseSVG = (e: MouseEvent) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
        return cursor.matrixTransform(svg.getScreenCTM()!.inverse());
      };

      const getIntersection = (segment1: any, segment2: any) => {
        const dx1 = segment1.x2 - segment1.x1;
        const dy1 = segment1.y2 - segment1.y1;
        const dx2 = segment2.x2 - segment2.x1;
        const dy2 = segment2.y2 - segment2.y1;
        const cx = segment1.x1 - segment2.x1;
        const cy = segment1.y1 - segment2.y1;
        const denominator = dy2 * dx1 - dx2 * dy1;
        if (denominator == 0) {
          return null;
        }
        const ua = (dx2 * cy - dy2 * cx) / denominator;
        const ub = (dx1 * cy - dy1 * cx) / denominator;
        return { x: segment1.x1 + ua * dx1, y: segment1.y1 + ua * dy1, segment1: ua >= 0 && ua <= 1, segment2: ub >= 0 && ub <= 1 };
      };

      const draw = (e: MouseEvent) => {
        randomAngle = (Math.random() * Math.PI * 0.03) - 0.015;
        (window as any).TweenMax.to(".arrow-angle use", 0.3, { opacity: 1 });
        window.addEventListener("mousemove", aim as any);
        window.addEventListener("mouseup", loose);
        aim(e);
      };

      aim({ clientX: 320, clientY: 300 } as MouseEvent);
      window.addEventListener("mousedown", draw as any);

      return () => {
        window.removeEventListener("mousedown", draw as any);
      };
    } else {
      setTimeout(checkAndRunGame, 100);
    }
  }, []);

  useEffect(() => {
    if (scriptsLoaded === 2 && htmlContent) {
      checkAndRunGame();
    }
  }, [scriptsLoaded, htmlContent, checkAndRunGame]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!htmlContent) {
    return <div>Game not found</div>;
  }

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.1/TweenMax.min.js" onReady={handleScriptLoad} />
      <Script src="//s3-us-west-2.amazonaws.com/s.cdpn.io/16327/MorphSVGPlugin.min.js" onReady={handleScriptLoad} />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}