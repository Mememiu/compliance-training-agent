import { createElement, useEffect, useRef, useState, type CSSProperties, type Ref } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

type SplitTextVars = Record<string, unknown>;
type SplitTextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

export interface SplitTextProps {
  tag?: SplitTextTag;
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words,chars';
  from?: SplitTextVars;
  to?: SplitTextVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

/**
 * React Bits SplitText, copied for the JS + CSS stack and kept local so the
 * animation source can evolve with this product.
 */
export default function SplitText({
  text,
  className = '',
  style,
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const splitInstanceRef = useRef<GSAPSplitText | null>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (typeof document === 'undefined' || document.fonts.status === 'loaded') {
      setFontsLoaded(true);
      return undefined;
    }

    let active = true;
    document.fonts.ready.then(() => {
      if (active) setFontsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useGSAP(
    () => {
      const element = ref.current;
      const reducedMotion = typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!element || !text || !fontsLoaded || reducedMotion || animationCompletedRef.current) {
        return undefined;
      }

      splitInstanceRef.current?.revert();
      splitInstanceRef.current = null;

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch?.[2] || 'px';
      const sign = marginValue === 0
        ? ''
        : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] = [];
      const splitInstance = new GSAPSplitText(element, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (instance) => {
          if (splitType.includes('chars') && instance.chars.length) targets = instance.chars;
          if (!targets.length && splitType.includes('words') && instance.words.length) targets = instance.words;
          if (!targets.length && splitType.includes('lines') && instance.lines.length) targets = instance.lines;
          if (!targets.length) targets = instance.chars || instance.words || instance.lines;

          return gsap.fromTo(
            targets,
            { ...from } as gsap.TweenVars,
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: element,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: 'transform, opacity',
              force3D: true,
            } as gsap.TweenVars,
          );
        },
      });

      splitInstanceRef.current = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === element) trigger.kill();
        });
        splitInstance.revert();
        splitInstanceRef.current = null;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
      ],
      scope: ref,
    },
  );

  const Tag = tag;
  const baseStyle: CSSProperties = {
    textAlign,
    overflow: 'hidden',
    display: 'inline-block',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    willChange: 'transform, opacity',
    ...style,
  };

  return createElement(
    Tag,
    {
      ref: ref as Ref<HTMLElement>,
      style: baseStyle,
      className: `split-parent ${className}`.trim(),
    },
    text,
  );
}
