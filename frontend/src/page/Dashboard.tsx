// src/page/Dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherSection from '../components/Dashboard/WeatherSection';
import MetricsSection from '../components/Dashboard/MetricsSection';
import CalendarTodoFrame from '../components/Dashboard/CalendarTodoFrame';
import WorkflowSection from '../components/Dashboard/WorkflowSection';
import EventModal from '../components/Scheduler/EventModal';
import { useSchedulerLogic } from '../components/Scheduler/useSchedulerLogic';
import { metricsNow, weatherNow } from '../components/Dashboard/mockDashboardDb';
import { fetchDashboardMetricsApi, getActiveGreenhouseUid, getMeApi, setActiveGreenhouseUid } from '../api/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomizeMetrics = () =>
  metricsNow.map((item) => ({
    ...item,
    value: Number((item.value + (Math.random() * 2 - 1) * 3).toFixed(item.id === 'co2' || item.id === 'light' ? 0 : 1)),
    trend: Number((Math.random() * 10 - 5).toFixed(1)),
  }));

const randomizeWeather = () => ({
  ...weatherNow,
  outsideTemp: Number((weatherNow.outsideTemp + (Math.random() * 2 - 1) * 2).toFixed(1)),
  outsideHumidity: Math.max(30, Math.min(90, Math.round(weatherNow.outsideHumidity + (Math.random() * 10 - 5)))),
  windSpeed: Number((weatherNow.windSpeed + (Math.random() * 1.4 - 0.7)).toFixed(1)),
  updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
});

const Dashboard = () => {
  const navigate = useNavigate();
  const { todayDate, todayEvents, completedEventIds, events, toggleComplete, updateEvent, deleteEvent } = useSchedulerLogic();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState(weatherNow);
  const [metricData, setMetricData] = useState(metricsNow);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [lastMetricUpdatedAt, setLastMetricUpdatedAt] = useState<string>('');
  const [metricsLive, setMetricsLive] = useState(true);
  const [greenhouseUid, setGreenhouseUid] = useState(getActiveGreenhouseUid());

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) {
      return null;
    }
    return events.find((event) => event.id === selectedEventId) ?? null;
  }, [events, selectedEventId]);

  // 한글 주석: 날씨만 단독으로 재조회하는 Mock 갱신 함수입니다.
  const refreshWeather = async () => {
    setWeatherLoading(true);
    await delay(700);
    setWeatherData(randomizeWeather());
    setWeatherLoading(false);
  };

  const refreshAllMetrics = async (targetGreenhouseUid = greenhouseUid) => {
    setMetricsLoading(true);
    try {
      setMetricData(await fetchDashboardMetricsApi(targetGreenhouseUid.trim()));
      setMetricsLive(true);
      setLastMetricUpdatedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      setMetricData(randomizeMetrics());
      setMetricsLive(false);
      setLastMetricUpdatedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    getMeApi()
      .then((user) => {
        if (user.greenhouseUid) {
          setGreenhouseUid(user.greenhouseUid);
          setActiveGreenhouseUid(user.greenhouseUid);
        }
      })
      .catch(() => {
        // The route guard will handle expired sessions.
      });
  }, []);

  useEffect(() => {
    const normalizedGreenhouseUid = greenhouseUid.trim();
    setActiveGreenhouseUid(normalizedGreenhouseUid);
    refreshAllMetrics(normalizedGreenhouseUid);
    const timer = window.setInterval(() => refreshAllMetrics(normalizedGreenhouseUid), 3000);
    return () => window.clearInterval(timer);
  }, [greenhouseUid]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '100%',
        padding: '4px',
        fontFamily: 'Pretendard, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <WeatherSection data={weatherData} isLoading={weatherLoading} onRefresh={refreshWeather} />

      <header
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e7e9f1',
          borderRadius: '14px',
          padding: '14px 16px 12px',
          color: '#1e2430',
          boxShadow: '0 6px 16px rgba(24, 33, 53, 0.04)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>실시간 모니터링</h1>
        <p style={{ margin: '6px 0 0', maxWidth: '560px', fontSize: '0.92rem', lineHeight: 1.5, color: '#64748b' }}>
          센서 상태, 캘린더, 워크플로우 상태를 한 화면에서 확인합니다.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <label htmlFor="greenhouseUid" style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            내 온실 UID
          </label>
          <input
            id="greenhouseUid"
            value={greenhouseUid}
            placeholder="계정 온실 UID"
            onChange={(event) => setGreenhouseUid(event.target.value)}
            style={{
              width: '150px',
              height: '32px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0 10px',
              fontSize: '13px',
              color: '#0f172a',
            }}
          />
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(greenhouseUid.trim())}
            disabled={!greenhouseUid.trim()}
            style={{
              height: '32px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0 10px',
              background: '#f8fafc',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              cursor: greenhouseUid.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            복사
          </button>
        </div>
      </header>

      {/* <h2 style={{ margin: '4px 0 0', color: '#2f5124' }}>환경 지표</h2> */}
      <MetricsSection
        data={metricData}
        isLoading={metricsLoading}
        onRefreshAll={refreshAllMetrics}
        lastUpdatedAt={lastMetricUpdatedAt}
        isLive={metricsLive}
        sourceLabel={greenhouseUid.trim() ? `Redis dashboard:metrics:${greenhouseUid.trim()}` : '온실 UID 미설정'}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        <CalendarTodoFrame
          todayDate={todayDate}
          todayEvents={todayEvents}
          completedEventIds={completedEventIds}
          onToggleComplete={toggleComplete}
          onOpenEditModal={setSelectedEventId}
          onCalendarClick={() => navigate('/Scheduler')}
        />
        <WorkflowSection />
      </div>

      <EventModal
        open={Boolean(selectedEventId)}
        selectedEvent={selectedEvent}
        onClose={() => setSelectedEventId(null)}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />
    </div>
  );
};

export default Dashboard;
