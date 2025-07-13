import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface PostureAlertProps {
  feedback: string;
  type: 'correct' | 'warning' | 'error' | 'info';
  isVisible: boolean;
}

const PostureAlert: React.FC<PostureAlertProps> = ({ 
  feedback, 
  type, 
  isVisible 
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'correct':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-100 border-green-300',
          textColor: 'text-green-700',
          iconColor: 'text-green-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-yellow-100 border-yellow-300',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-500'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: 'bg-red-100 border-red-300',
          textColor: 'text-red-700',
          iconColor: 'text-red-500'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bgColor: 'bg-blue-100 border-blue-300',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-500'
        };
    }
  };
  
  const config = getAlertConfig();
  
  return (
    <AnimatePresence>
      {isVisible && feedback && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: 1,
            transition: { 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }
          }}
          exit={{ 
            opacity: 0, 
            x: -100, 
            scale: 0.8,
            transition: { duration: 0.2 }
          }}
          className={`
            fixed top-24 left-4 z-50 p-4 rounded-lg border-2 shadow-lg 
            backdrop-blur-sm max-w-sm
            ${config.bgColor}
          `}
        >
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${config.iconColor}`}>
              {config.icon}
            </div>
            
            <div className="flex-1">
              <div className={`font-semibold text-sm ${config.textColor}`}>
                {type === 'correct' && 'Perfect Form!'}
                {type === 'warning' && 'Form Alert'}
                {type === 'error' && 'Form Error'}
                {type === 'info' && 'Tip'}
              </div>
              
              <div className={`text-sm mt-1 ${config.textColor}`}>
                {feedback}
              </div>
            </div>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <motion.div
            className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className={`h-full ${
                type === 'correct' ? 'bg-green-500' :
                type === 'warning' ? 'bg-yellow-500' :
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostureAlert;
