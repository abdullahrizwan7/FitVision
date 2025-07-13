import React from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  glow?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon,
  glow = true
}) => {
  const variants = {
    primary: {
      bg: 'bg-gradient-to-r from-purple-500 to-blue-500',
      hover: 'hover:from-purple-600 hover:to-blue-600',
      shadow: glow ? 'shadow-lg shadow-purple-500/25' : '',
      text: 'text-white'
    },
    secondary: {
      bg: 'bg-gradient-to-r from-gray-600 to-gray-700',
      hover: 'hover:from-gray-700 hover:to-gray-800',
      shadow: glow ? 'shadow-lg shadow-gray-500/25' : '',
      text: 'text-white'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      hover: 'hover:from-green-600 hover:to-emerald-600',
      shadow: glow ? 'shadow-lg shadow-green-500/25' : '',
      text: 'text-white'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      hover: 'hover:from-yellow-600 hover:to-orange-600',
      shadow: glow ? 'shadow-lg shadow-yellow-500/25' : '',
      text: 'text-white'
    },
    danger: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-500',
      hover: 'hover:from-red-600 hover:to-pink-600',
      shadow: glow ? 'shadow-lg shadow-red-500/25' : '',
      text: 'text-white'
    }
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const currentVariant = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${currentVariant.bg} ${currentVariant.hover} ${currentVariant.shadow} ${currentVariant.text}
        ${sizes[size]}
        rounded-xl font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        relative overflow-hidden
        border border-white/20
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : icon ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};

export default NeonButton;
