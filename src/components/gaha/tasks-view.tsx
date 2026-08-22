'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Sun, Plus } from 'lucide-react';
import { GahaTask, TaskPriority, createTask } from '@/lib/gaha-tasks';

export function TasksView() {
  const [tasks, setTasks] = useState<GahaTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('can-wait');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = createTask(newTaskTitle, 'personal', selectedPriority);
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setSelectedPriority('can-wait');
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'todo' ? 'done' : 'todo' };
      }
      return t;
    }));
  };

  const urgentCount = tasks.filter(t => t.priority === 'urgent' && t.status === 'todo').length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;

  return (
    <div className="space-y-6">
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Sun className="h-5 w-5" />
            Morning Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-900">
            Good morning! You have <strong>{todoCount}</strong> tasks on your plate today. 
            {urgentCount > 0 ? ` ${urgentCount} are urgent.` : ' Nothing is urgently pending.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Task Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="What needs to be done?" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
          <div className="flex gap-2">
            {(['urgent', 'important', 'can-wait'] as TaskPriority[]).map(p => (
              <Badge 
                key={p}
                variant={selectedPriority === p ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedPriority(p)}
              >
                {p.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Today's Tasks</h3>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tasks yet. Add one above!</p>
        ) : (
          tasks.map(task => (
            <Card key={task.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleTask(task.id)} className="text-muted-foreground hover:text-foreground">
                  {task.status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="flex flex-col">
                  <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                    {task.title}
                  </span>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {task.priority.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
