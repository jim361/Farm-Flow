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

const WeatherSection = ({ data = weatherNow, isLoading = false, onRefresh }: WeatherSectionProps) => {
  return (
    <DashboardCard title="실시간 외부 환경" subtitle={`${data.greenhouseName} 기준`}>
      {/* 한글 주석: 날씨 데이터 수동 갱신 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            border: 'none',
            borderRadius: '10px',
            padding: '8px 12px',
            backgroundColor: '#2f6b43',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.8 : 1,
          }}
        >
          {isLoading ? '날씨 업데이트 중...' : '날씨 업데이트'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <strong style={{ fontSize: '28px', color: '#2f5124' }}>{data.weatherLabel}</strong>
        <span style={{ color: '#4f6246' }}>기온 {data.outsideTemp}°C</span>
        <span style={{ color: '#4f6246' }}>습도 {data.outsideHumidity}%</span>
        <span style={{ color: '#4f6246' }}>풍속 {data.windSpeed}m/s</span>
      </div>
      <p style={{ margin: '10px 0 0', color: '#6d7b66', fontSize: '12px' }}>
        마지막 갱신 {data.updatedAt}
      </p>
    </DashboardCard>
  );
};

export default WeatherSection;