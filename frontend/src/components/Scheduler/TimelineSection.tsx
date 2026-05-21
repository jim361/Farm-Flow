// 역할: 통합 타임라인 프레임 렌더링을 담당하는 래퍼 컴포넌트입니다.

import SchedulerTimeline from './SchedulerTimeline';
import type { ScheduleEventItem } from './types';

interface TimelineSectionProps {
  todayDate: string;
  events: ScheduleEventItem[];
  completedEventIds: string[];
  onToggleComplete: (eventId: string) => void;
  onEventClick: (eventId: string) => void;
}

const TimelineSection = ({ todayDate, events, completedEventIds, onToggleComplete, onEventClick }: TimelineSectionProps) => {
  return (
    <SchedulerTimeline
      todayDate={todayDate}
      events={events}
      completedEventIds={completedEventIds}
      onToggleComplete={onToggleComplete}
      onEventClick={onEventClick}
    />
  );
};

export default TimelineSection;