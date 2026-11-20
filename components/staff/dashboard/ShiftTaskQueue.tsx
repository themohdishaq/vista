// filepath: components/staff/dashboard/ShiftTaskQueue.tsx
'use client';

/**
 * @file components/staff/dashboard/ShiftTaskQueue.tsx
 * @description Shift tasks queue showing picking, putaways, cycle audits, and kit packing jobs.
 * Fulfills:
 * - 4. Prepare and record stock issues and distributions
 * - 3. Record received inventory / putaway
 * - 7. Perform physical stock counts
 * - 8. Prepare packing lists and kit records
 */

import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Filter,
  Truck,
  Boxes,
  ClipboardList,
  ClipboardCheck,
} from 'lucide-react';
import { StaffTaskItem } from '@/types/staff';

interface ShiftTaskQueueProps {
  tasks: StaffTaskItem[];
  operatorName?: string;
  onStartTask: (task: StaffTaskItem) => void;
  onCompleteTask: (taskId: string) => void;
}

export function ShiftTaskQueue({
  tasks,
  operatorName = 'Floor Specialist',
  onStartTask,
  onCompleteTask,
}: ShiftTaskQueueProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Picks' | 'Putaway' | 'Kits' | 'Counts'>('All');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (activeTab === 'Picks') return t.taskType === 'Pick & Issue';
      if (activeTab === 'Putaway') return t.taskType === 'Receive Putaway';
      if (activeTab === 'Kits') return t.taskType === 'Kit Pack';
      if (activeTab === 'Counts') return t.taskType === 'Cycle Count';
      return true;
    });
  }, [tasks, activeTab]);

  const getTaskIcon = (type: StaffTaskItem['taskType']) => {
    switch (type) {
      case 'Pick & Issue':
        return <ClipboardCheck className="w-4 h-4 text-emerald-600" />;
      case 'Receive Putaway':
        return <Truck className="w-4 h-4 text-sky-600" />;
      case 'Kit Pack':
        return <Boxes className="w-4 h-4 text-purple-600" />;
      case 'Cycle Count':
        return <ClipboardList className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="font-sans text-base font-bold text-[#0a2540]">
              Shift Task Queue & Assignments
            </h3>
            <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[11px] font-bold">
              {tasks.filter((t) => t.status !== 'Completed').length} Pending
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Work queue assigned to {operatorName} for morning shift (06:00 - 14:30).
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          {(['All', 'Picks', 'Putaway', 'Kits', 'Counts'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-[#0a2540] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No tasks in this category.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isUrgent = task.urgency === 'Urgent';
            const isInProgress = task.status === 'In Progress';
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isInProgress ? 'bg-emerald-50/20' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                    {getTaskIcon(task.taskType)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#008a90]">
                        {task.refNo}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {task.taskType}
                      </span>

                      {isUrgent && (
                        <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                          Urgent
                        </span>
                      )}

                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          In Progress
                        </span>
                      )}

                      {isCompleted && (
                        <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                          Done
                        </span>
                      )}
                    </div>

                    <h4 className="font-sans text-sm font-bold text-slate-900 mt-0.5">
                      {task.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>
                        Location: <strong className="text-slate-700">{task.location}</strong>
                      </span>
                      {task.destinationWard && (
                        <>
                          <span>•</span>
                          <span>
                            Ward: <strong className="text-slate-700">{task.destinationWard}</strong>
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        Target:{' '}
                        <strong className="text-slate-800">
                          {task.quantity} {task.unit}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 font-medium">
                        {task.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center justify-end gap-2 pl-12 sm:pl-0">
                  {!isCompleted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onStartTask(task)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isInProgress
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[#008a90] hover:bg-[#00747a] text-white'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isInProgress ? 'Workstation' : 'Start Task'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCompleteTask(task.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

