'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  X,
  RefreshCw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Users,
  Dumbbell,
  Tv,
  UtensilsCrossed,
  BookOpen,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SwipeableTabs, SwipeableTabItem } from '@/components/ui/swipeable-tabs';
import {
  TimeBlock,
  BlockType,
  DayName,
  DaySchedule,
  ConflictInfo,
  QUICK_ADD_PRESETS,
  timeToMinutes,
  minutesToTime,
  getBlockDuration,
  buildDaySchedule,
  loadPersonalBlocks,
  savePersonalBlocks,
  addPersonalBlock,
  removePersonalBlock,
  detectConflicts,
  getClassBlocksForDate,
} from '@/lib/gaha-time-blocks';
import { getAcademicDateInfo, TIMETABLE_ADJUSTMENTS_2026, getUpcomingMilestones, AcademicMilestone } from '@/lib/academic-calendar-engine';
import { format, addDays, subDays } from 'date-fns';

// ── Timeline Constants ──
const TIMELINE_START = 7; // 7 AM
const TIMELINE_END = 23; // 11 PM
const HOUR_HEIGHT = 60; // px per hour
const TOTAL_HOURS = TIMELINE_END - TIMELINE_START;

function getBlockTopAndHeight(block: TimeBlock) {
  const startMinutes = timeToMinutes(block.startTime);
  const endMinutes = timeToMinutes(block.endTime);
  const top = ((startMinutes / 60) - TIMELINE_START) * HOUR_HEIGHT;
  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;
  return { top: Math.max(0, top), height: Math.max(HOUR_HEIGHT / 4, height) };
}

function getBlockIcon(type: BlockType) {
  switch (type) {
    case 'class': return <BookOpen className="h-3 w-3" />;
    case 'study': return <Pencil className="h-3 w-3" />;
    case 'social': return <Users className="h-3 w-3" />;
    case 'personal': return <Sparkles className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
}

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

// ── Main Component ──
export default function GahaManagerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [personalBlocks, setPersonalBlocks] = useState<TimeBlock[]>([]);
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [milestones, setMilestones] = useState<AcademicMilestone[]>([]);

  // Add Block Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addBlockLabel, setAddBlockLabel] = useState('');
  const [addBlockType, setAddBlockType] = useState<BlockType>('personal');
  const [addBlockStartTime, setAddBlockStartTime] = useState('15:00');
  const [addBlockEndTime, setAddBlockEndTime] = useState('18:00');
  const [addBlockColor, setAddBlockColor] = useState('border-orange-500/40 text-orange-300');
  const [addBlockBgColor, setAddBlockBgColor] = useState('bg-orange-500/10');

  // Conflict State
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // ── Load & Rebuild Schedule ──
  const rebuildSchedule = useCallback((date: Date, blocks: TimeBlock[]) => {
    const schedule = buildDaySchedule(date, blocks);
    setDaySchedule(schedule);
  }, []);

  useEffect(() => {
    const blocks = loadPersonalBlocks();
    setPersonalBlocks(blocks);
    rebuildSchedule(currentDate, blocks);
    setMilestones(getUpcomingMilestones(6));
  }, [currentDate, rebuildSchedule]);

  // ── Day Navigation ──
  const goToDay = (offset: number) => {
    setCurrentDate((prev) => (offset > 0 ? addDays(prev, offset) : subDays(prev, Math.abs(offset))));
  };

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const academicInfo = getAcademicDateInfo(currentDate);

  // ── Add Block Logic ──
  const handlePresetClick = (preset: typeof QUICK_ADD_PRESETS[0]) => {
    setAddBlockLabel(preset.label);
    setAddBlockType(preset.type);
    setAddBlockColor(preset.color);
    setAddBlockBgColor(preset.bgColor);
    const durationMinutes = preset.defaultDuration;
    // Default to 3 PM start
    setAddBlockStartTime('15:00');
    setAddBlockEndTime(minutesToTime(timeToMinutes('15:00') + durationMinutes));
    setShowAddModal(true);
  };

  const handleAddBlock = () => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayName = format(currentDate, 'EEEE') as DayName;
    const newBlock: TimeBlock = {
      id: `personal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      label: addBlockLabel || 'Personal Time',
      type: addBlockType,
      day: dayName,
      date: dateStr,
      startTime: addBlockStartTime,
      endTime: addBlockEndTime,
      color: addBlockColor,
      bgColor: addBlockBgColor,
      isFixed: false,
    };

    // Detect conflicts with class blocks + existing personal blocks
    const classBlocks = getClassBlocksForDate(currentDate);
    const allExisting = [...classBlocks, ...personalBlocks];
    const conflict = detectConflicts(newBlock, allExisting);

    if (conflict) {
      setConflictInfo(conflict);
      setShowConflictModal(true);
      setShowAddModal(false);
    } else {
      // No conflict — add directly
      const updatedBlocks = [...personalBlocks, newBlock];
      setPersonalBlocks(updatedBlocks);
      savePersonalBlocks(updatedBlocks);
      rebuildSchedule(currentDate, updatedBlocks);
      setShowAddModal(false);
      resetAddForm();
    }
  };

  const handleAcceptAlternative = (altBlock: TimeBlock) => {
    const updatedBlocks = [...personalBlocks, altBlock];
    setPersonalBlocks(updatedBlocks);
    savePersonalBlocks(updatedBlocks);
    rebuildSchedule(currentDate, updatedBlocks);
    setShowConflictModal(false);
    setConflictInfo(null);
    resetAddForm();
  };

  const handleForceAdd = () => {
    if (!conflictInfo) return;
    // Force add the block despite conflicts
    const updatedBlocks = [...personalBlocks, conflictInfo.newBlock];
    setPersonalBlocks(updatedBlocks);
    savePersonalBlocks(updatedBlocks);
    rebuildSchedule(currentDate, updatedBlocks);
    setShowConflictModal(false);
    setConflictInfo(null);
    resetAddForm();
  };

  const handleRemoveBlock = (blockId: string) => {
    const updatedBlocks = personalBlocks.filter((b) => b.id !== blockId);
    setPersonalBlocks(updatedBlocks);
    savePersonalBlocks(updatedBlocks);
    rebuildSchedule(currentDate, updatedBlocks);
  };

  const resetAddForm = () => {
    setAddBlockLabel('');
    setAddBlockType('personal');
    setAddBlockStartTime('15:00');
    setAddBlockEndTime('18:00');
    setAddBlockColor('border-orange-500/40 text-orange-300');
    setAddBlockBgColor('bg-orange-500/10');
  };

  // ── Current Time Indicator ──
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = ((currentMinutes / 60) - TIMELINE_START) * HOUR_HEIGHT;
  const showCurrentTime = isToday && currentMinutes >= TIMELINE_START * 60 && currentMinutes <= TIMELINE_END * 60;

  // ── Tab: Today's Plan ──
  const todaysPlanTab = (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => goToDay(-1)} className="rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="text-sm font-bold text-white">
              {format(currentDate, 'EEEE, MMMM d')}
              {isToday && <span className="ml-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded-full">TODAY</span>}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {academicInfo.phaseTitle}
              {academicInfo.isTTA && (
                <span className="ml-1.5 text-amber-400 font-semibold">⚡ TTA → {academicInfo.ttaTargetDay} Schedule</span>
              )}
              {academicInfo.isHoliday && (
                <span className="ml-1.5 text-green-400 font-semibold">🌴 {academicInfo.holidayName}</span>
              )}
            </div>
          </div>
          <button onClick={() => goToDay(1)} className="rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 hover:text-white transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isToday && (
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())} className="h-7 text-[11px] rounded-lg border-zinc-800 bg-zinc-900 text-zinc-300">
              Today
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)} className="h-7 gap-1 text-[11px] rounded-lg border-indigo-800/50 bg-indigo-950/30 text-indigo-300 hover:bg-indigo-950/50">
            <Plus className="h-3 w-3" /> Add Block
          </Button>
        </div>
      </div>

      {/* Day Summary Stats */}
      {daySchedule && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{Math.round(daySchedule.totalClassMinutes / 60 * 10) / 10}h</div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Classes</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">{Math.round(daySchedule.totalStudyMinutes / 60 * 10) / 10}h</div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Study</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
            <div className="text-lg font-bold text-orange-400">{Math.round(daySchedule.totalPersonalMinutes / 60 * 10) / 10}h</div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Personal</div>
          </div>
        </div>
      )}

      {/* Interactive Timeline */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {/* Hour Grid Lines */}
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
            <div key={i} className="absolute left-0 right-0 flex items-start" style={{ top: i * HOUR_HEIGHT }}>
              <div className="w-14 shrink-0 text-right pr-2 text-[10px] font-mono text-zinc-600 -mt-1.5">
                {`${(TIMELINE_START + i) % 12 || 12} ${TIMELINE_START + i >= 12 ? 'PM' : 'AM'}`}
              </div>
              <div className="flex-1 border-t border-zinc-800/50" />
            </div>
          ))}

          {/* Current Time Indicator */}
          {showCurrentTime && (
            <div className="absolute left-14 right-0 z-30 flex items-center" style={{ top: currentTimeTop }}>
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1.5 shadow-lg shadow-red-500/40" />
              <div className="flex-1 border-t-2 border-red-500/60 border-dashed" />
            </div>
          )}

          {/* Time Blocks */}
          {daySchedule?.blocks.map((block) => {
            const { top, height } = getBlockTopAndHeight(block);
            const isPersonalOrStudy = !block.isFixed;
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`absolute left-16 right-3 z-10 rounded-xl border ${block.color} ${block.bgColor} px-3 py-1.5 cursor-default overflow-hidden group`}
                style={{ top, height: Math.max(28, height) }}
              >
                <div className="flex items-start justify-between h-full">
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    <span className="mt-0.5 shrink-0">{getBlockIcon(block.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold truncate">{block.label}</div>
                      {height >= 36 && (
                        <div className="text-[10px] opacity-70 truncate">
                          {formatTimeLabel(block.startTime)} – {formatTimeLabel(block.endTime)}
                          {block.room && ` • ${block.room}`}
                        </div>
                      )}
                    </div>
                  </div>
                  {isPersonalOrStudy && (
                    <button
                      onClick={() => handleRemoveBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1 p-0.5 rounded hover:bg-white/10"
                      title="Remove block"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Tab: Smart Scheduler ──
  const smartSchedulerTab = (
    <div className="space-y-4">
      {/* Quick Add Presets */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5 text-indigo-400" />
          <span>Quick Add — One Tap to Block Time</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {QUICK_ADD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`rounded-xl border ${preset.color} ${preset.bgColor} p-3.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <div className="text-xs font-semibold">{preset.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{preset.defaultDuration} min default</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Block Builder */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Pencil className="h-3.5 w-3.5 text-indigo-400" />
          <span>Custom Block Builder</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-zinc-500 font-medium block mb-1">What are you doing?</label>
            <Input
              value={addBlockLabel}
              onChange={(e) => setAddBlockLabel(e.target.value)}
              placeholder="e.g., Going out with friends, Shopping..."
              className="h-9 bg-zinc-950 border-zinc-800 text-xs text-white rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-500 font-medium block mb-1">Start Time</label>
              <Input
                type="time"
                value={addBlockStartTime}
                onChange={(e) => setAddBlockStartTime(e.target.value)}
                className="h-9 bg-zinc-950 border-zinc-800 text-xs text-white rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 font-medium block mb-1">End Time</label>
              <Input
                type="time"
                value={addBlockEndTime}
                onChange={(e) => setAddBlockEndTime(e.target.value)}
                className="h-9 bg-zinc-950 border-zinc-800 text-xs text-white rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-500 font-medium block mb-1">Block Type</label>
            <div className="flex gap-2">
              {(['personal', 'social', 'study'] as BlockType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setAddBlockType(t);
                    if (t === 'social') { setAddBlockColor('border-orange-500/40 text-orange-300'); setAddBlockBgColor('bg-orange-500/10'); }
                    else if (t === 'study') { setAddBlockColor('border-blue-500/40 text-blue-300'); setAddBlockBgColor('bg-blue-500/10'); }
                    else { setAddBlockColor('border-pink-500/40 text-pink-300'); setAddBlockBgColor('bg-pink-500/10'); }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                    addBlockType === t ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t === 'personal' ? '🎯 Personal' : t === 'social' ? '🤝 Social' : '📚 Study'}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAddBlock} disabled={!addBlockLabel.trim()} className="w-full h-9 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add to {format(currentDate, 'EEEE')} Schedule
          </Button>
        </div>
      </div>

      {/* Active Personal Blocks for This Day */}
      {personalBlocks.filter((b) => b.date === format(currentDate, 'yyyy-MM-dd')).length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Your Blocks for {format(currentDate, 'EEEE, MMM d')}
          </h3>
          <div className="space-y-2">
            {personalBlocks
              .filter((b) => b.date === format(currentDate, 'yyyy-MM-dd'))
              .map((block) => (
                <div key={block.id} className={`rounded-xl border ${block.color} ${block.bgColor} p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {getBlockIcon(block.type)}
                    <div>
                      <div className="text-xs font-semibold">{block.label}</div>
                      <div className="text-[10px] opacity-60">
                        {formatTimeLabel(block.startTime)} – {formatTimeLabel(block.endTime)} ({getBlockDuration(block)} min)
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveBlock(block.id)} className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Tab: Calendar & Milestones ──
  const calendarTab = (
    <div className="space-y-4">
      {/* Calendar Status Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Current Phase</div>
          <div className="text-sm font-bold text-white">{academicInfo.phaseTitle}</div>
          <div className="text-[11px] text-zinc-400">{academicInfo.weekLabel}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Midsem Countdown</div>
          <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
            <Flame className="h-4 w-4" />
            <span>{academicInfo.daysToMidsem} Days</span>
          </div>
          <div className="text-[11px] text-zinc-400">Mid-Semester Exams (20–28 Sept)</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Endsem Countdown</div>
          <div className="text-sm font-bold text-indigo-400">{academicInfo.daysToEndsem} Days</div>
          <div className="text-[11px] text-zinc-400">Final Exams (29 Nov – 8 Dec)</div>
        </div>
      </div>

      {/* TTA Matrix */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Timetable Adjustments (TTA Matrix)</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            8 Adjustments
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(TIMETABLE_ADJUSTMENTS_2026).map(([dateStr, tta], idx) => {
            const isPast = dateStr < format(new Date(), 'yyyy-MM-dd');
            return (
              <div
                key={idx}
                className={`rounded-xl border border-zinc-800 p-3 flex items-center justify-between text-xs ${isPast ? 'bg-zinc-950/40 opacity-50' : 'bg-zinc-950/70'}`}
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-zinc-300 font-semibold">{dateStr}</span>
                  <p className="text-[11px] text-zinc-400">{tta.reason}</p>
                </div>
                <span className="rounded-md bg-indigo-950/50 border border-indigo-800/40 px-2 py-1 text-[11px] font-mono text-indigo-300 shrink-0 ml-2">
                  {tta.targetDay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span>Upcoming Milestones & Deadlines</span>
        </h3>
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{m.title}</span>
                  {m.important && (
                    <span className="rounded bg-rose-950/50 text-rose-400 border border-rose-800/40 text-[9px] px-1.5 py-0.5 font-mono">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">{m.description}</p>
              </div>
              <span className="font-mono text-zinc-400 shrink-0 ml-3">{m.dateStr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Build Tab Config ──
  const managerTabs: SwipeableTabItem[] = [
    {
      id: 'today',
      label: "Today's Plan",
      icon: <Clock className="h-3.5 w-3.5 text-emerald-400" />,
      content: todaysPlanTab,
    },
    {
      id: 'scheduler',
      label: 'Smart Scheduler',
      icon: <Plus className="h-3.5 w-3.5 text-indigo-400" />,
      content: smartSchedulerTab,
    },
    {
      id: 'calendar',
      label: 'Calendar & TTA',
      icon: <Calendar className="h-3.5 w-3.5 text-amber-400" />,
      content: calendarTab,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              GAHA 2.0 • Life Manager
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Schedule Command Center
          </h1>
        </div>
      </div>

      {/* Swipeable Tabs */}
      <SwipeableTabs tabs={managerTabs} defaultTabId="today" />

      {/* ── Add Block Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Add Time Block</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-[11px] text-zinc-400">
                For {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-zinc-500 font-medium block mb-1">Activity</label>
                  <Input
                    value={addBlockLabel}
                    onChange={(e) => setAddBlockLabel(e.target.value)}
                    placeholder="What are you doing?"
                    className="h-9 bg-zinc-950 border-zinc-800 text-xs text-white rounded-lg"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-500 font-medium block mb-1">Start</label>
                    <Input
                      type="time"
                      value={addBlockStartTime}
                      onChange={(e) => setAddBlockStartTime(e.target.value)}
                      className="h-9 bg-zinc-950 border-zinc-800 text-xs text-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 font-medium block mb-1">End</label>
                    <Input
                      type="time"
                      value={addBlockEndTime}
                      onChange={(e) => setAddBlockEndTime(e.target.value)}
                      className="h-9 bg-zinc-950 border-zinc-800 text-xs text-white rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 h-9 text-xs rounded-lg border-zinc-800 text-zinc-300">
                  Cancel
                </Button>
                <Button onClick={handleAddBlock} disabled={!addBlockLabel.trim()} className="flex-1 h-9 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add Block
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Conflict Resolution Modal ── */}
      <AnimatePresence>
        {showConflictModal && conflictInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => { setShowConflictModal(false); setConflictInfo(null); }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-amber-800/50 bg-zinc-900 p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-sm font-bold">Schedule Conflict Detected</h3>
              </div>

              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-white">&ldquo;{conflictInfo.newBlock.label}&rdquo;</span> ({formatTimeLabel(conflictInfo.newBlock.startTime)} – {formatTimeLabel(conflictInfo.newBlock.endTime)}) overlaps with:
              </div>

              <div className="space-y-2">
                {conflictInfo.conflictingBlocks.map((cb) => (
                  <div key={cb.id} className={`rounded-xl border ${cb.color} ${cb.bgColor} p-3 text-xs`}>
                    <div className="flex items-center gap-1.5">
                      {getBlockIcon(cb.type)}
                      <span className="font-semibold">{cb.label}</span>
                    </div>
                    <div className="text-[10px] opacity-70 mt-0.5">
                      {formatTimeLabel(cb.startTime)} – {formatTimeLabel(cb.endTime)}
                      {cb.room && ` • ${cb.room}`}
                      {cb.isFixed && ' • ⚠️ Fixed (class)'}
                    </div>
                  </div>
                ))}
              </div>

              {conflictInfo.suggestedAlternatives.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> GAHA suggests:
                  </div>
                  {conflictInfo.suggestedAlternatives.map((alt, i) => (
                    <button
                      key={alt.id}
                      onClick={() => handleAcceptAlternative(alt)}
                      className="w-full rounded-xl border border-indigo-800/40 bg-indigo-950/30 p-3 text-xs text-left hover:bg-indigo-950/50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-indigo-300">Option {i + 1}: </span>
                        <span className="text-zinc-200">{formatTimeLabel(alt.startTime)} – {formatTimeLabel(alt.endTime)}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <Button variant="outline" onClick={() => { setShowConflictModal(false); setConflictInfo(null); }} className="flex-1 h-9 text-xs rounded-lg border-zinc-800 text-zinc-300">
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleForceAdd} className="flex-1 h-9 text-xs rounded-lg border-amber-800/50 text-amber-300 hover:bg-amber-950/30">
                  Add Anyway
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
