import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  mobileThreshold?: number;
}

// Détecte si on est sur mobile
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -60px 0px",
    once = true,
    mobileThreshold = 0.05, // Threshold plus bas sur mobile pour déclencher plus tôt
  } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Détecter mobile au montage
    setIsMobile(isMobileDevice());

    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Utiliser un threshold différent sur mobile
    const finalThreshold = isMobile ? mobileThreshold : threshold;
    // Root margin plus généreux sur mobile
    const finalRootMargin = isMobile ? "0px 0px -30px 0px" : rootMargin;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: finalThreshold, rootMargin: finalRootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, isMobile, mobileThreshold]);

  return { ref, isVisible, isMobile };
}

export function useStaggeredReveal(count: number, options: ScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px 0px -40px 0px", once = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger each item
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 120);
          }
          if (once) observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count, threshold, rootMargin, once]);

  return { containerRef, visibleItems };
}


export function useStaggeredReveal(count: number, options: ScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -40px 0px",
    once = true,
    mobileThreshold = 0.05,
  } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const finalThreshold = isMobile ? mobileThreshold : threshold;
    const finalRootMargin = isMobile ? "0px 0px -20px 0px" : rootMargin;
    // Délai réduit sur mobile pour une animation plus rapide
    const staggerDelay = isMobile ? 80 : 120;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger each item
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * staggerDelay);
          }
          if (once) observer.unobserve(el);
        }
      },
      { threshold: finalThreshold, rootMargin: finalRootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count, threshold, rootMargin, once, isMobile, mobileThreshold]);

  return { containerRef, visibleItems, isMobile };
}

// Hook pour détecter si on utilise un appareil tactile (mobile/tablette)
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        isMobileDevice()
      );
    };

    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  return isTouch;
}
