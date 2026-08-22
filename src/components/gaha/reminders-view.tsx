'use client';

import React, { useState } from 'react';
import { Reminder, calculateEscalation } from '@/lib/gaha-reminders';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const initialReminders: Reminder[] = [];

export function RemindersView() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      dueDate: new Date(newDate).toISOString(),
      priority: 'medium',
      type: 'personal',
      status: 'pending'
    };

    setReminders([...reminders, reminder]);
    setNewTitle('');
    setNewDate('');
  };

  const toggleStatus = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: r.status === 'pending' ? 'completed' : 'pending' } : r
    ));
  };

  const getEscalationColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">GAHA Reminders</h2>
        <Badge variant="secondary">{reminders.filter(r => r.status === 'pending').length} Pending</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddReminder} className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
            <div className="flex-1 space-y-2 min-w-[200px]">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="What needs to be done?" 
              />
            </div>
            <div className="flex-1 space-y-2 min-w-[200px]">
              <label className="text-sm font-medium">Due Date</label>
              <Input 
                type="datetime-local" 
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)} 
              />
            </div>
            <Button type="submit">Add Reminder</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map(reminder => {
          const escalation = calculateEscalation(reminder.dueDate);
          const colorClass = getEscalationColor(escalation);
          const isCompleted = reminder.status === 'completed';

          return (
            <Card key={reminder.id} className={`border transition-all ${isCompleted ? 'opacity-60 grayscale' : colorClass}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="capitalize bg-white/50">{reminder.type}</Badge>
                  {escalation === 'urgent' && !isCompleted && (
                    <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                  )}
                </div>
                <CardTitle className={`text-lg mt-2 ${isCompleted ? 'line-through' : ''}`}>
                  {reminder.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 opacity-70" />
                  <span>{new Date(reminder.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span>{formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={isCompleted ? "outline" : "default"} 
                  className="w-full flex gap-2 items-center"
                  onClick={() => toggleStatus(reminder.id)}
                >
                  {isCompleted ? (
                    <>Undo <Clock className="w-4 h-4" /></>
                  ) : (
                    <>Complete <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
