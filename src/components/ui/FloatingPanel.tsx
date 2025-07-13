import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

interface FloatingPanelProps {
  children: React.ReactNode;
  isVisible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  className?: string;
  onClose?: () => void;
  title?: string;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({
  children,
  isVisible,
  position = 'center',
  className = '',
  onClose,
  title
}) => {
  const positions = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2',
    right: 'right-4 top-1/2 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  const animations = {
    top: { y: -100, opacity: 0 },
    bottom: { y: 100, opacity: 0 },
    left: { x: -100, opacity: 0 },
    right: { x: 100, opacity: 0 },
    center: { scale: 0.8, opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          {position === 'center' && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
          )}
          
          {/* Panel */}
          <motion.div
            className={`fixed ${positions[position]} z-50 ${className}`}
            initial={animations[position]}
            animate={{ 
              y: 0, 
              x: 0, 
              scale: 1, 
              opacity: 1 
            }}
            exit={animations[position]}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
          >
            <GlassCard className="p-6" glow>
              {title && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
              {children}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FloatingPanel;
