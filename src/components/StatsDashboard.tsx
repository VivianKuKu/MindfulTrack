import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { DayLog, Mood } from '../types';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, subMonths } from 'date-fns';
import { cn } from '../utils';
import { Calendar, TrendingUp, Zap, Heart, Activity, Info, ChevronRight } from 'lucide-react';

interface StatsDashboardProps {
  logs: Record<string, DayLog>;
}

const moodValues: Record<Mood, number> = {
  'great': 5,
  'good': 4,
  'neutral': 3,
  'bad': 2,
  'terrible': 1
};

const moodLabels: Record<number, string> = {
  5: 'Great',
  4: 'Good',
  3: 'Neutral',
  2: 'Bad',
  1: 'Terrible'
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ logs }) => {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRefMood = useRef<HTMLDivElement>(null);
  const scrollRefHabit = useRef<HTMLDivElement>(null);

  // Use a stable reference for "today" to ensure alignment
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getChartData = () => {
    const days = view === 'week' ? 7 : 30;
    return Array.from({ length: days }).map((_, i) => {
      // Calculate date from today backwards
      const date = subDays(today, (days - 1) - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = logs[dateStr];
      
      return {
        name: view === 'week' ? format(date, 'EEE') : format(date, 'MMM d'),
        shortName: view === 'week' ? format(date, 'EEEEE') : format(date, 'd'),
        fullDate: dateStr,
        mood: log?.mood ? moodValues[log.mood] : null,
        habits: log?.habits?.length || 0,
      };
    });
  };

  const chartData = getChartData();

  // Auto-scroll to end on mount or view change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRefMood.current) {
        scrollRefMood.current.scrollTo({ left: scrollRefMood.current.scrollWidth, behavior: 'smooth' });
      }
      if (scrollRefHabit.current) {
        scrollRefHabit.current.scrollTo({ left: scrollRefHabit.current.scrollWidth, behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [view]);

  const calculateStats = () => {
    const last30DaysDates = Array.from({ length: 30 }).map((_, i) => format(subDays(today, i), 'yyyy-MM-dd'));
    const last30DaysLogs = last30DaysDates.map(d => logs[d]).filter(Boolean);

    const avgMoodValue = last30DaysLogs.reduce((acc, log) => acc + (log.mood ? moodValues[log.mood] : 0), 0) / (last30DaysLogs.length || 1);
    const habitCompletionRate = (last30DaysLogs.reduce((acc, log) => acc + (log.habits?.length || 0), 0) / (last30DaysLogs.length * 4 || 1)) * 100;
    
    // Volatility calculation
    const moodVolatility = last30DaysLogs.reduce((acc, log, i, arr) => {
      if (i === 0 || !log.mood || !arr[i-1]?.mood) return acc;
      return acc + Math.abs(moodValues[log.mood] - moodValues[arr[i-1].mood]);
    }, 0) / (last30DaysLogs.length || 1);

    // Best Day of Week
    const dayStats: Record<string, { sum: number, count: number }> = {};
    last30DaysLogs.forEach(log => {
      if (log.mood) {
        const day = format(parseISO(log.date), 'EEEE');
        if (!dayStats[day]) dayStats[day] = { sum: 0, count: 0 };
        dayStats[day].sum += moodValues[log.mood];
        dayStats[day].count += 1;
      }
    });
    
    let bestDay = 'N/A';
    let maxAvg = 0;
    Object.entries(dayStats).forEach(([day, stat]) => {
      const avg = stat.sum / stat.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        bestDay = day;
      }
    });

    // Streak
    let streak = 0;
    for (const dateStr of last30DaysDates) {
      if (logs[dateStr]?.habits?.length > 0) streak++;
      else break;
    }

    // Total Reflections
    const totalReflections = last30DaysLogs.filter(l => l.note?.trim()).length;

    return {
      avgMood: moodLabels[Math.round(avgMoodValue)] || 'Neutral',
      avgMoodValue: avgMoodValue.toFixed(1),
      completion: Math.round(habitCompletionRate),
      stability: moodVolatility < 0.8 ? 'Steady' : moodVolatility < 1.5 ? 'Balanced' : 'Dynamic',
      bestDay,
      streak,
      totalReflections
    };
  };

  const stats = calculateStats();

  const SummaryCard = ({ title, value, unit, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-5 rounded-3xl border border-warm-cream shadow-sm flex flex-col justify-between h-36 transition-all duration-500 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-xl bg-opacity-10", color.replace('text-', 'bg-'))}>
          <Icon size={18} className={color} />
        </div>
        <ChevronRight size={16} className="text-warm-ink/20" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-warm-ink/40 uppercase tracking-widest mb-1">{title}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-serif text-warm-ink">{value}</span>
          {unit && <span className="text-xs font-medium text-warm-ink/40">{unit}</span>}
        </div>
        {trend && <div className="text-[10px] font-medium text-warm-sage mt-1">↑ {trend}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* View Toggle - Health App Style */}
      <div className="flex p-1 bg-warm-cream/50 rounded-2xl w-full">
        <button 
          onClick={() => setView('week')}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            view === 'week' ? "bg-white text-warm-ink shadow-sm" : "text-warm-ink/40"
          )}
        >
          Week
        </button>
        <button 
          onClick={() => setView('month')}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            view === 'month' ? "bg-white text-warm-ink shadow-sm" : "text-warm-ink/40"
          )}
        >
          Month
        </button>
      </div>

      {/* Highlights Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-serif text-warm-ink">Highlights</h3>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-warm-accent"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard 
            title="Avg Mood" 
            value={stats.avgMood} 
            icon={Heart} 
            color="text-warm-rose" 
            trend="Stable"
          />
          <SummaryCard 
            title="Habit Score" 
            value={stats.completion} 
            unit="%" 
            icon={Zap} 
            color="text-warm-accent" 
            trend="5% vs last week"
          />
          
          <AnimatePresence>
            {isExpanded && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <SummaryCard 
                    title="Best Day" 
                    value={stats.bestDay} 
                    icon={Calendar} 
                    color="text-warm-sage" 
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <SummaryCard 
                    title="Streak" 
                    value={stats.streak} 
                    unit="Days"
                    icon={TrendingUp} 
                    color="text-warm-accent" 
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="col-span-2"
                >
                  <div className="bg-white p-5 rounded-3xl border border-warm-cream shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-warm-cream text-warm-accent">
                      <Info size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-warm-ink/40 uppercase tracking-widest">Total Reflections</div>
                      <div className="text-xl font-bold font-serif text-warm-ink">{stats.totalReflections} notes written</div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Mood Flow - Scrollable */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-serif text-warm-ink">Mood Flow</h3>
          <Info size={16} className="text-warm-ink/20" />
        </div>
        <div className="bg-white rounded-[2.5rem] border border-warm-cream shadow-sm overflow-hidden">
          <div className="p-6 pb-2">
            <div className="text-3xl font-bold font-serif text-warm-ink">{stats.avgMoodValue}</div>
            <div className="text-[10px] font-bold text-warm-ink/40 uppercase tracking-widest">Average Score</div>
          </div>
          <div 
            ref={scrollRefMood}
            className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          >
            <div style={{ width: view === 'month' ? '800px' : '100%' }} className="h-64 p-6 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c38d9e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#c38d9e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f2ed" />
                  <XAxis 
                    dataKey="shortName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#4a3f35', opacity: 0.4, fontWeight: 600 }} 
                    interval={view === 'month' ? 2 : 0}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#4a3f35', opacity: 0.2 }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-warm-ink text-warm-bg px-3 py-2 rounded-xl text-[10px] font-bold shadow-xl">
                            {payload[0].payload.name}: {moodLabels[payload[0].value as number]}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#c38d9e" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorMood)" 
                    connectNulls
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Habit Rhythm - Scrollable */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-serif text-warm-ink">Habit Rhythm</h3>
          <Activity size={16} className="text-warm-ink/20" />
        </div>
        <div className="bg-white rounded-[2.5rem] border border-warm-cream shadow-sm overflow-hidden">
          <div className="p-6 pb-2">
            <div className="text-3xl font-bold font-serif text-warm-ink">{stats.completion}%</div>
            <div className="text-[10px] font-bold text-warm-ink/40 uppercase tracking-widest">Completion Rate</div>
          </div>
          <div 
            ref={scrollRefHabit}
            className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          >
            <div style={{ width: view === 'month' ? '800px' : '100%' }} className="h-64 p-6 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f2ed" />
                  <XAxis 
                    dataKey="shortName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#4a3f35', opacity: 0.4, fontWeight: 600 }} 
                    interval={view === 'month' ? 2 : 0}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#4a3f35', opacity: 0.2 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#fdfcf8', radius: 12 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-warm-ink text-warm-bg px-3 py-2 rounded-xl text-[10px] font-bold shadow-xl">
                            {payload[0].payload.name}: {payload[0].value} habits
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="habits" radius={[8, 8, 8, 8]} barSize={view === 'month' ? 12 : 24}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.habits > 0 ? '#e8a87c' : '#f5f2ed'} 
                        fillOpacity={entry.habits > 0 ? 1 : 0.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Cycle Analysis Card */}
      <section>
        <div className="bg-gradient-to-br from-warm-rose/20 to-warm-accent/20 p-8 rounded-[2.5rem] border border-white shadow-inner">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <TrendingUp size={20} className="text-warm-ink" />
            </div>
            <h4 className="text-lg font-bold font-serif text-warm-ink">Cycle Analysis</h4>
          </div>
          <p className="text-sm text-warm-ink/70 leading-relaxed mb-6">
            Your emotional landscape has been <span className="font-bold text-warm-ink">{stats.stability.toLowerCase()}</span> lately. 
            You've maintained a consistent habit rhythm, which often correlates with higher mood stability.
          </p>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
              <div className="text-[10px] font-bold text-warm-ink/40 uppercase tracking-widest mb-1">Stability</div>
              <div className="font-bold text-warm-ink">{stats.stability}</div>
            </div>
            <div className="flex-1 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
              <div className="text-[10px] font-bold text-warm-ink/40 uppercase tracking-widest mb-1">Streak</div>
              <div className="font-bold text-warm-ink">4 Days</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
