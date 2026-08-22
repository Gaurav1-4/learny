import { NextResponse } from 'next/server';
import { getClassBlocksForDate } from '@/lib/gaha-time-blocks';
import { getAcademicDateInfo } from '@/lib/academic-calendar-engine';
import { addDays, format, startOfWeek } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const isWeek = searchParams.get('week') === 'true';

  try {
    const targetDate = new Date(dateStr);

    if (isWeek) {
      const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
      const weekData = Array.from({ length: 7 }).map((_, i) => {
        const currentDate = addDays(weekStart, i);
        const academicInfo = getAcademicDateInfo(currentDate);
        return {
          date: format(currentDate, 'yyyy-MM-dd'),
          classBlocks: getClassBlocksForDate(currentDate),
          academicInfo
        };
      });
      return NextResponse.json({ week: weekData });
    } else {
      const academicInfo = getAcademicDateInfo(targetDate);
      return NextResponse.json({
        date: format(targetDate, 'yyyy-MM-dd'),
        classBlocks: getClassBlocksForDate(targetDate),
        academicInfo
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid date or processing error' }, { status: 400 });
  }
}
