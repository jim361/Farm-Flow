// src/page/Dashboard.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherSection from '../components/Dashboard/WeatherSection';
import MetricsSection from '../components/Dashboard/MetricsSection';
import CalendarTodoFrame from '../components/Dashboard/CalendarTodoFrame';
import WorkflowSection from '../components/Dashboard/WorkflowSection';
import EventModal from '../components/Scheduler/EventModal';
import { useSchedulerLogic } from '../components/Scheduler/useSchedulerLogic';
import { metricsNow, weatherNow } from '../components/Dashboard/mockDashboardDb';

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

  // 한글 주석: 온도/습도/CO2/조도를 한 번에 갱신하는 Mock 함수입니다.
  const refreshAllMetrics = async () => {
    setMetricsLoading(true);
    await delay(900);
    setMetricData(randomizeMetrics());
    setMetricsLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '100%',
        padding: '4px',
      }}
    >
      <WeatherSection data={weatherData} isLoading={weatherLoading} onRefresh={refreshWeather} />

      <header
        style={{
          background: 'radial-gradient(circle at top left, #e8f6d8, #d4e7c3 55%, #cde0be)',
          border: '1px solid #c9dfb7',
          borderRadius: '18px',
          padding: '18px',
          color: '#2a4a22',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>실시간 모니터링 대시보드</h1>
        <p style={{ margin: '6px 0 0', color: '#46633e' }}>
          센서 상태, 캘린더, 워크플로우 상태를 한 화면에서 확인합니다.
        </p>
      </header>

      {/* <h2 style={{ margin: '4px 0 0', color: '#2f5124' }}>환경 지표</h2> */}
      <MetricsSection data={metricData} isLoading={metricsLoading} onRefreshAll={refreshAllMetrics} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
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