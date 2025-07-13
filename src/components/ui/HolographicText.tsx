import React from 'react';
import { motion } from 'framer-motion';

interface HolographicTextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  gradient?: string;
  className?: string;
  animate?: boolean;
}

const HolographicText: React.FC<HolographicTextProps> = ({
  children,
  size = 'lg',
  gradient = 'from-purple-400 via-blue-400 to-cyan-400',
  className = '',
  animate = true
}) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  return (
    <motion.div
      className={`
        ${sizes[size]}
        font-bold
        bg-gradient-to-r ${gradient}
        bg-clip-text text-transparent
        relative
        ${className}
      `}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6 }}
    >
      {/* Glow effect */}
      <div 
        className={`
          absolute inset-0 
          ${sizes[size]}
          font-bold
          bg-gradient-to-r ${gradient}
          bg-clip-text text-transparent
          blur-sm opacity-50
        `}
      >
        {children}
      </div>
      
      {/* Main text */}
      <span className="relative z-10">{children}</span>
    </motion.div>
  );
};

export default HolographicText;
