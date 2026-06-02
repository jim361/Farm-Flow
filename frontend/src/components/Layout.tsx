// frontend/src/components/Layout.tsx

import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getStoredScheduleEvents, SCHEDULE_UPDATED_EVENT } from './Scheduler/SchedulerData';
import type { ScheduleEventItem } from './Scheduler/types';
import {
  acknowledgeDashboardAlertApi,
  fetchDashboardAlertsApi,
  getActiveGreenhouseUid,
  type DashboardAlert,
} from '../api/api';

interface ScheduleAlert {
  id: string;
  title?: string;
  message: string;
  timeLabel: string;
  source?: string;
  command?: string;
}

const toMinute = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const isDateInEventRange = (date: string, event: ScheduleEventItem) => {
  const endDate = event.endDate || event.date;
  return event.date <= date && date <= endDate;
};

export default function Layout(){
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [events, setEvents] = useState<ScheduleEventItem[]>(() => getStoredScheduleEvents());
  const [scheduleAlerts, setScheduleAlerts] = useState<ScheduleAlert[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<ScheduleAlert[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);
  const [seenSystemAlertIds, setSeenSystemAlertIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const alerts = useMemo(() => [...systemAlerts, ...scheduleAlerts].slice(0, 30), [systemAlerts, scheduleAlerts]);

  const dismissAlert = async (alert: ScheduleAlert) => {
    if (alert.id.startsWith('ALERT-')) {
      setScheduleAlerts((prev) => prev.filter((item) => item.id !== alert.id));
      return;
    }

    setSystemAlerts((prev) => prev.filter((item) => item.id !== alert.id));
    try {
      await acknowledgeDashboardAlertApi(alert.id, getActiveGreenhouseUid());
    } catch (err) {
      console.error('Dashboard alert acknowledge error:', err);
    }
  };

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
      .filter((event) => isDateInEventRange(todayString, event))
      .map((event) => {
        const startMinute = toMinute(event.startTime);
        const diff = startMinute - nowMinute;
        return { event, diff, todayString };
      })
      .filter(({ diff }) => diff >= 0 && diff <= 10)
      .sort((a, b) => a.diff - b.diff);
  }, [events]);

  useEffect(() => {
    const nextAlerts = upcomingAlerts
      .filter(({ event, todayString }) => !notifiedIds.includes(`${event.id}-${todayString}`))
      .map(({ event, todayString }) => ({
        id: `ALERT-${event.id}-${todayString}`,
        timeLabel: `${event.startTime} 시작`,
        message: `잠시 후 ${event.title}이 시작됩니다 (${event.startTime})`,
      }));

    if (nextAlerts.length > 0) {
      // 한글 주석: 이미 알림 처리한 일정은 중복 생성되지 않도록 id를 별도로 관리합니다.
      setScheduleAlerts((prev) => [...nextAlerts, ...prev].slice(0, 20));
      setNotifiedIds((prev) => [...prev, ...nextAlerts.map((alert) => alert.id.replace('ALERT-', ''))]);
      setSidebarOpen(true);
    }
  }, [notifiedIds, upcomingAlerts]);

  useEffect(() => {
    if (!isDashboard) return;

    let cancelled = false;
    const toAlert = (alert: DashboardAlert): ScheduleAlert => {
      const time = alert.time ? new Date(alert.time) : null;
      const timeLabel = time && !Number.isNaN(time.getTime())
        ? time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '방금';

      return {
        id: alert.id,
        title: alert.title,
        timeLabel,
        message: alert.message,
        source: alert.source === 'rule-engine' ? '룰 엔진' : '로직 빌더',
        command: alert.command,
      };
    };

    const loadSystemAlerts = async () => {
      try {
        const greenhouseUid = getActiveGreenhouseUid();
        if (!greenhouseUid) return;
        const data = await fetchDashboardAlertsApi(greenhouseUid);
        if (cancelled) return;
        const nextAlerts = data.map(toAlert);
        setSystemAlerts(nextAlerts);

        const freshIds = nextAlerts.map((alert) => alert.id).filter((id) => !seenSystemAlertIds.includes(id));
        if (freshIds.length > 0) {
          setSeenSystemAlertIds((prev) => [...freshIds, ...prev].slice(0, 80));
          setSidebarOpen(true);
        }
      } catch (err) {
        console.error('Dashboard alerts fetch error:', err);
      }
    };

    loadSystemAlerts();
    const interval = setInterval(loadSystemAlerts, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isDashboard, seenSystemAlertIds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(getStoredScheduleEvents());
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);
  
  return(
      // <div style = {{flex:1, display: 'flex', flexDirection: 'column'}}>
      //   <AppHeader/>
        
      <div style = {{display: 'flex', flex: 1, position: 'relative'}}>
      {isDashboard && sidebarOpen && <Sidebar alerts={alerts} onClose={() => setSidebarOpen(false)} onDismiss={dismissAlert} />}
      {isDashboard && !sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'sticky',
            top: '14px',
            alignSelf: 'flex-start',
            margin: '14px 0 0 14px',
            zIndex: 5,
            minWidth: '44px',
            height: '44px',
            border: '1px solid #d9e2da',
            borderRadius: '12px',
            background: alerts.length > 0 ? '#dcfce7' : '#ffffff',
            color: '#166534',
            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.08)',
            cursor: 'pointer',
            fontWeight: 800,
          }}
          aria-label="알림센터 열기"
          title="알림센터 열기"
        >
          {alerts.length > 0 ? alerts.length : '알림'}
        </button>
      )}

        <main style={{padding:'20px', flex: 1, backgroundColor : "#fafafa"}}>
          <Outlet />
        </main>
      </div>
    // </div>
  );
}
