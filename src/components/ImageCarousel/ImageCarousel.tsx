import React, { useEffect, useRef, useState } from "react";
import styles from "./ImageCarousel.module.css";

const IMAGES = [
  "/assets/optimized_Baltic_Herkut_2.jpg",
  "/assets/optimized_Baltic_Herkut_1.jpg",
];

const INTERVAL_MS = 8000;      
const FADE_MS = 400;          

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
};

export const ImageCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();


  useEffect(() => {
    const next = () => setIndex((i) => (i + 1) % IMAGES.length);
    const start = () => {
      stop();
      timerRef.current = window.setInterval(next, INTERVAL_MS);
    };
    const stop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (isVisible) start();
    return stop;
  }, [isVisible]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);


  useEffect(() => {
    const nextIdx = (index + 1) % IMAGES.length;
    const img = new Image();
    img.decoding = "async";
    img.src = IMAGES[nextIdx];
  }, [index]);

  const goTo = (i: number) => setIndex(i);

  return (
    <div
      ref={containerRef}
      className={styles.carouselContainer}
      aria-roledescription="carousel"
    >
    
      <img
        key={`img-${index}`}
        src={IMAGES[index]}
        alt={`Slide ${index + 1}`}
        className={`${styles.carouselImage} ${styles.fadeIn}`}
        style={{ transitionDuration: reduced ? "0ms" : `${FADE_MS}ms` }}
        decoding="async"
        loading="eager"
        draggable={false}
      />

      <div className={styles.dots}>
        {IMAGES.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
