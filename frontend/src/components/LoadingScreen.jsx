import { motion } from 'framer-motion';

// Animated loading screen with brain/pulse animation
export default function LoadingScreen({ message = 'Processing...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Brain Icon */}
        <div className="relative">
          <div className="brain-loader" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
              <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1-.5 2-1.5 2.5C4.5 10 3 12 3 14c0 3 2.5 5.5 5.5 5.5.5 0 1-.1 1.5-.2.5 1.1 1.5 1.7 2 1.7s1.5-.6 2-1.7c.5.1 1 .2 1.5.2 3 0 5.5-2.5 5.5-5.5 0-2-1.5-4-3-5-.5-.5-1.5-1.5-1.5-2.5C16.5 4 14.5 2 12 2z" />
            </svg>
          </div>
        </div>

        {/* Pulse bars */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-primary-500 rounded-full"
              animate={{ height: [12, 28, 12] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Message */}
        <p className="text-gray-600 font-medium text-lg">{message}</p>
      </motion.div>
    </div>
  );
}
