import { AnimatePresence, motion, type MotionProps } from 'motion/react';
import { useEffect, useState } from 'react';

interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
  initial?: MotionProps['initial'];
  animate?: MotionProps['animate'];
  exit?: MotionProps['exit'];
}

/**
 * Small, accessible adaptation of Fancy Components' Text Rotate primitive.
 * The copy remains present in the DOM as an aria-live label while the visual
 * word changes with Motion's reduced-motion support.
 */
export function TextRotate({
  texts,
  rotationInterval = 2600,
  className,
  initial = { y: '100%', opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: '-100%', opacity: 0 },
}: TextRotateProps) {
  const [index, setIndex] = useState(0);
  const safeTexts = texts.length > 0 ? texts : ['学习'];

  useEffect(() => {
    if (safeTexts.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeTexts.length);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [rotationInterval, safeTexts.length]);

  return (
    <span className="fancy-text-rotate" aria-live="polite" aria-atomic="true">
      <span className="sr-only">{safeTexts[index]}</span>
      <span aria-hidden="true" className={className}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${safeTexts[index]}-${index}`}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {safeTexts[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
