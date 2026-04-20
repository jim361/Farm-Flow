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
    <DashboardCard title="" subtitle={undefined}>
      {/* 한글 주석: 날씨 데이터 수동 갱신 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '999px', backgroundColor: '#37b36b' }} />
          <strong style={{ fontSize: '16px', color: '#1f2431' }}>{data.outsideTemp}°C</strong>
          <span style={{ color: '#6f768c', fontSize: '13px' }}>{data.greenhouseName}</span>
        </div>
        <button
          type="button"
          className="ff-btn-save"
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            minHeight: '40px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.8 : 1,
          }}
        >
          {isLoading ? '업데이트 중...' : '날씨 업데이트'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ color: '#4f596f', fontSize: '13px', fontWeight: 600 }}>{data.weatherLabel}</span>
        <span style={{ color: '#5a647a', fontSize: '13px' }}>습도 {data.outsideHumidity}%</span>
        <span style={{ color: '#5a647a', fontSize: '13px' }}>풍속 {data.windSpeed}m/s</span>
      </div>
      <p style={{ margin: '8px 0 0', color: '#8a90a2', fontSize: '12px' }}>
        마지막 갱신 {data.updatedAt}
      </p>
    </DashboardCard>
  );
};

export default WeatherSection;