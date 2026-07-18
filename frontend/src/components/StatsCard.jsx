import { motion } from 'framer-motion';

// Premium statistics card with glassmorphism, gradient icon, and animated entrance
export default function StatsCard({ icon, label, value, color = 'blue', subtitle, delay = 0 }) {
  const config = {
    blue:   { gradient: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50',   shadow: 'shadow-blue-200',   text: 'text-blue-700' },
    green:  { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', shadow: 'shadow-emerald-200', text: 'text-emerald-700' },
    purple: { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', shadow: 'shadow-violet-200', text: 'text-violet-700' },
    orange: { gradient: 'from-amber-500 to-orange-600',  bg: 'bg-amber-50',  shadow: 'shadow-amber-200',  text: 'text-amber-700' },
    red:    { gradient: 'from-rose-500 to-red-600',      bg: 'bg-rose-50',   shadow: 'shadow-rose-200',   text: 'text-rose-700' },
    cyan:   { gradient: 'from-cyan-500 to-teal-600',     bg: 'bg-cyan-50',   shadow: 'shadow-cyan-200',   text: 'text-cyan-700' },
  };

  const c = config[color] || config.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="stat-card group"
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-lg shadow-lg ${c.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {icon}
        </div>
        {subtitle && (
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${c.bg} ${c.text} tracking-wide uppercase`}>
            {subtitle}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-extrabold text-gray-800 tracking-tight">{value}</h3>
      <p className="text-sm text-gray-500 mt-1.5 font-medium">{label}</p>
    </motion.div>
  );
}
