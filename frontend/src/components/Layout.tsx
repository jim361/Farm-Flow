// frontend/src/components/Layout.tsx

import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AppHeader } from './AppHeader';
import { getStoredScheduleEvents, SCHEDULE_UPDATED_EVENT } from './Scheduler/SchedulerData';
import type { ScheduleEventItem } from './Scheduler/types';

interface ScheduleAlert {
  id: string;
  message: string;
  timeLabel: string;
}

const toMinute = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export default function Layout(){
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [events, setEvents] = useState<ScheduleEventItem[]>(() => getStoredScheduleEvents());
  const [alerts, setAlerts] = useState<ScheduleAlert[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  useEffect(() => {
    const syncEvents = () => setEvents(getStoredScheduleEvents());
    window.addEventListener(SCHEDULE_UPDATED_EVENT, syncEvents);
    return () => window.removeEventListener(SCHEDULE_UPDATED_EVENT, syncEvents);
  }, []);

  const upcomingAlerts = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    const nowMinute = now.getHours() * 60 + now.getMinutes();

    return events
      .filter((event) => event.date === todayString)
      .map((event) => {
        const startMinute = toMinute(event.startTime);
        const diff = startMinute - nowMinute;
        return { event, diff };
      })
      .filter(({ diff }) => diff >= 0 && diff <= 10)
      .sort((a, b) => a.diff - b.diff);
  }, [events]);

  useEffect(() => {
    const nextAlerts = upcomingAlerts
      .filter(({ event }) => !notifiedIds.includes(event.id))
      .map(({ event }) => ({
        id: `ALERT-${event.id}`,
        timeLabel: `${event.startTime} 시작`,
        message: `잠시 후 ${event.title}이 시작됩니다 (${event.startTime})`,
      }));

    if (nextAlerts.length > 0) {
      // 한글 주석: 이미 알림 처리한 일정은 중복 생성되지 않도록 id를 별도로 관리합니다.
      setAlerts((prev) => [...nextAlerts, ...prev].slice(0, 20));
      setNotifiedIds((prev) => [...prev, ...nextAlerts.map((alert) => alert.id.replace('ALERT-', ''))]);
    }
  }, [notifiedIds, upcomingAlerts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(getStoredScheduleEvents());
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);
  
  return(
      <div style = {{flex:1, display: 'flex', flexDirection: 'column'}}>
        <AppHeader/>
        
      <div style = {{display: 'flex', flex: 1}}>
      {isDashboard && <Sidebar alerts={alerts} />}

        <main style={{padding:'20px', flex: 1, backgroundColor : "#fafafa"}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}