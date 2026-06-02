import DashboardCard from "./Dashboard";
import { weatherNow } from './mockDashboardDb';

interface WeatherData {
  greenhouseName: string;
  weatherLabel: string;
  outsideTemp: number;
  outsideHumidity: number;
  windSpeed: number;
  updatedAt: string;
}

interface WeatherSectionProps {
  data?: WeatherData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: spinning ? 'ff-spin 0.8s linear infinite' : 'none' }}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const WeatherSection = ({ data = weatherNow, isLoading = false, onRefresh }: WeatherSectionProps) => {
  return (
    <DashboardCard title="" subtitle={undefined}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* 온도 + 상태 점 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '999px', backgroundColor: '#37b36b', flexShrink: 0 }} />
          <strong style={{ fontSize: '16px', color: '#1f2431' }}>{data.outsideTemp}°C</strong>
        </div>

        {/* 구분선 */}
        <span style={{ width: '1px', height: '14px', background: '#e2e8f0' }} />

        {/* 날씨 정보 */}
        <span style={{ color: '#4f596f', fontSize: '13px', fontWeight: 600 }}>{data.weatherLabel}</span>
        <span style={{ color: '#5a647a', fontSize: '13px' }}>습도 {data.outsideHumidity}%</span>
        <span style={{ color: '#5a647a', fontSize: '13px' }}>풍속 {data.windSpeed}m/s</span>
        <span style={{ color: '#6f768c', fontSize: '13px' }}>{data.greenhouseName}</span>

        {/* 구분선 */}
        <span style={{ width: '1px', height: '14px', background: '#e2e8f0' }} />

        <span style={{ color: '#8a90a2', fontSize: '12px' }}>갱신 {data.updatedAt}</span>

        {/* 새로고침 아이콘 버튼 */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="날씨 새로고침 (Mock 데이터)"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#64748b',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          <RefreshIcon spinning={isLoading} />
        </button>
      </div>
    </DashboardCard>
  );
};

export default WeatherSection;
