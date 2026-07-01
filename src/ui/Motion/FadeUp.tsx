import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.32, 0.72, 0, 1] // Apple-esque spring / fluid cubic-bezier
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
