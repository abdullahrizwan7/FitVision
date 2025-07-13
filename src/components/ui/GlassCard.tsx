import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'dark' | 'colored';
  glowColor?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  variant = 'default',
  glowColor = 'rgb(147, 51, 234)'
}) => {
  const variants = {
    default: 'bg-white/10 border-white/20',
    dark: 'bg-black/20 border-white/10',
    colored: 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20'
  };

  return (
    <motion.div
      className={`
        backdrop-blur-xl rounded-2xl border
        ${variants[variant]}
        ${hover ? 'hover:bg-white/20 hover:border-white/30 hover:shadow-2xl' : ''}
        ${glow ? 'shadow-2xl' : 'shadow-lg'}
        transition-all duration-300
        ${className}
      `}
      style={glow ? {
        boxShadow: `0 0 40px ${glowColor}40, 0 10px 30px rgba(0,0,0,0.2)`
      } : undefined}
      whileHover={hover ? { y: -2 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
