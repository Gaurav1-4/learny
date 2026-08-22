'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, ShieldAlert, Plane, BookOpen, Clock, Activity } from 'lucide-react';
import { generateHeatmapData, getSubjectBalance } from '@/lib/gaha-analytics';

export function AnalyticsView() {
  const [warRoomActive, setWarRoomActive] = useState(false);
  const [holidayModeActive, setHolidayModeActive] = useState(false);
  
  const heatmapData = generateHeatmapData(60); // Last 60 days
  const subjectBalance = getSubjectBalance();
  
  // Color mapping for heatmap intensity
  const getIntensityColor = (intensity: number) => {
    switch(intensity) {
      case 0: return 'bg-slate-100 dark:bg-slate-800';
      case 1: return 'bg-blue-200 dark:bg-blue-900/40';
      case 2: return 'bg-blue-300 dark:bg-blue-800/60';
      case 3: return 'bg-blue-400 dark:bg-blue-700/80';
      case 4: return 'bg-blue-500 dark:bg-blue-600';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Days</div>
            <p className="text-xs text-muted-foreground">Ready to start?</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 Days</div>
            <p className="text-xs text-muted-foreground">Personal best</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94 hrs</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 / 5</div>
            <p className="text-xs text-muted-foreground">Focus on DPP next</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Study Hours Heatmap</CardTitle>
            <CardDescription>Your activity over the last 60 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {heatmapData.map((day, i) => (
                <div 
                  key={i} 
                  title={`${day.date}: ${day.intensity} hrs`}
                  className={`w-4 h-4 rounded-sm ${getIntensityColor(day.intensity)}`} 
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${getIntensityColor(i)}`} />
                ))}
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Subject Balance</CardTitle>
            <CardDescription>Progress towards target hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectBalance.map((sub) => {
              const percentage = Math.min(100, Math.round((sub.totalHours / sub.targetHours) * 100));
              return (
                <div key={sub.subject} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{sub.subject}</span>
                    <span className="text-muted-foreground">{sub.totalHours} / {sub.targetHours}h</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`border-2 transition-colors ${warRoomActive ? 'border-red-500 shadow-sm shadow-red-500/20' : 'border-transparent'}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className={`h-5 w-5 ${warRoomActive ? 'text-red-500' : 'text-muted-foreground'}`} />
              <CardTitle>Exam War-Room</CardTitle>
              {warRoomActive && <Badge variant="destructive" className="ml-auto">Active</Badge>}
            </div>
            <CardDescription>Activate high-intensity focus mode for exams. Blocks non-essential study topics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              When active, your schedule will prioritize revision algorithms and past papers.
            </p>
            <Button 
              variant={warRoomActive ? "destructive" : "outline"} 
              className="w-full"
              onClick={() => {
                setWarRoomActive(!warRoomActive);
                if (!warRoomActive) setHolidayModeActive(false);
              }}
            >
              {warRoomActive ? 'Deactivate War-Room' : 'Activate War-Room'}
            </Button>
          </CardContent>
        </Card>

        <Card className={`border-2 transition-colors ${holidayModeActive ? 'border-green-500 shadow-sm shadow-green-500/20' : 'border-transparent'}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plane className={`h-5 w-5 ${holidayModeActive ? 'text-green-500' : 'text-muted-foreground'}`} />
              <CardTitle>Holiday Mode</CardTitle>
              {holidayModeActive && <Badge className="bg-green-500 hover:bg-green-600 ml-auto">Active</Badge>}
            </div>
            <CardDescription>Pause streaks and reschedule upcoming tasks automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your study streak will be frozen. Tasks will be distributed after your return date.
            </p>
            <Button 
              variant={holidayModeActive ? "default" : "outline"} 
              className={`w-full ${holidayModeActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
              onClick={() => {
                setHolidayModeActive(!holidayModeActive);
                if (!holidayModeActive) setWarRoomActive(false);
              }}
            >
              {holidayModeActive ? 'End Holiday' : 'Start Holiday'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
