import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface IntelCardShellProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function IntelCardShell({ children, className = "", onClick, hoverable = true }: IntelCardShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={`glass-panel p-4 transition-colors duration-150 ${hoverable ? "cursor-pointer hover:border-primary/20 hover:bg-card/80" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
