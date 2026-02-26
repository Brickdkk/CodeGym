/**
 * SuccessAnimation.tsx — Celebration animation when a user solves an exercise.
 *
 * Uses Framer Motion for a confetti-like particle burst + scale animation.
 * Pillar 6: Does NOT alter colors, fonts, or layout. Uses existing theme tokens.
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

// Generate random particles for the celebration effect
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300,
    scale: 0.5 + Math.random() * 1,
    rotation: Math.random() * 360,
    color: ['#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ef4444'][
      Math.floor(Math.random() * 5)
    ],
  }));
}

const particles = generateParticles(20);

export default function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            // Auto-dismiss after the full animation
            setTimeout(() => onComplete?.(), 1500);
          }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Particle burst */}
          <div className="relative">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: p.color,
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, p.scale, 0],
                  opacity: [1, 1, 0],
                  rotate: p.rotation,
                }}
                transition={{
                  duration: 1.2,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Center badge */}
            <motion.div
              className="relative flex flex-col items-center gap-3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(34, 197, 94, 0.4)',
                    '0 0 0 20px rgba(34, 197, 94, 0)',
                  ],
                }}
                transition={{
                  duration: 1,
                  repeat: 2,
                  ease: 'easeOut',
                }}
                className="rounded-full bg-green-500 p-4"
              >
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-green-500"
              >
                ¡Correcto!
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
