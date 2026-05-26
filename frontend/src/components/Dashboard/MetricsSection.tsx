import { useEffect, useState, useCallback, useRef } from 'react';
import DashboardCard from './Dashboard';
import DashboardLayout from './DashboardLayout';
import { metricsNow, type MetricItem } from './mockDashboardDb';
import { evaluateSensorApi } from '../../api/api';
import { useWebSocket } from '../../hooks/useWebSocket';

interface SensorPayload {
  temperature: number;
  humidity: number;
  lux: number;
  co2: number;
}

interface MetricsSectionProps {
  data?: MetricItem[];
  isLoading?: boolean;
  onRefreshAll?: () => void;
}

const MetricsSection = ({ data: externalData, isLoading: externalLoading = false, onRefreshAll }: MetricsSectionProps) => {
  const [data, setData] = useState<MetricItem[]>(externalData || metricsNow);
  const [isLoading, setIsLoading] = useState(false);
  const [controlActions, setControlActions] = useState<string[]>([]);
  const prevDataRef = useRef<MetricItem[]>(externalData || metricsNow);

  // WebSocket으로 실시간 센서 데이터 수신 — 디자인 변경 없이 값만 업데이트
  useWebSocket<SensorPayload>('/topic/sensor', useCallback((payload) => {
    setData(prev => {
      const next = prev.map(m => {
        const prevVal = m.value;
        let newVal = prevVal;
        if (m.id === 'temp') newVal = payload.temperature;
        else if (m.id === 'humidity') newVal = payload.humidity;
        else if (m.id === 'light') newVal = payload.lux;
        else if (m.id === 'co2') newVal = payload.co2;
        const trend = Math.round((newVal - prevVal) * 10) / 10;
        const state: 'stable' | 'warning' =
          (m.id === 'temp' && newVal > 30) ||
          (m.id === 'co2' && newVal > 1000) ||
          (m.id === 'humidity' && newVal < 60)
            ? 'warning' : 'stable';
        return { ...m, value: newVal, trend, state };
      });
      prevDataRef.current = next;
      return next;
    });
  }, []));

  const fetchAndEvaluate = useCallback(async () => {
    setIsLoading(true);
    try {
      const cur = prevDataRef.current;
      const result = await evaluateSensorApi({
        temperature: cur.find(m => m.id === 'temp')?.value ?? 24,
        humidity: cur.find(m => m.id === 'humidity')?.value ?? 63,
        lux: cur.find(m => m.id === 'light')?.value ?? 500,
        co2: cur.find(m => m.id === 'co2')?.value ?? 800,
        latitude: 37.5,
        longitude: 127.0,
      });
      setControlActions(result.actions?.length > 0 ? result.actions : []);
    } catch {
      // 백엔드 미연결 시 무시
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (externalData) setData(externalData);
  }, [externalData]);

  const handleRefresh = () => {
    fetchAndEvaluate();
    onRefreshAll?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
        {controlActions.length > 0 && (
          <div style={{ fontSize: '12px', color: '#bd5f36', background: '#fff3ef', padding: '4px 10px', borderRadius: '6px', border: '1px solid #f9c8b4' }}>
            ⚡ 자동 제어 발동: {controlActions.join(', ')}
          </div>
        )}
        <button
          type="button"
          className="ff-btn-save"
          onClick={handleRefresh}
          disabled={isLoading || externalLoading}
          style={{
            minHeight: '40px',
            cursor: (isLoading || externalLoading) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || externalLoading) ? 0.85 : 1,
          }}
        >
          {(isLoading || externalLoading) ? '데이터 통합 갱신 중...' : '데이터 통합 갱신'}
        </button>
      </div>

      <DashboardLayout>
        {data.map((metric) => (
          <DashboardCard key={metric.id} title={metric.label} subtitle="실시간 센서값">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <strong style={{ fontSize: '30px', color: '#1f2431', lineHeight: 1 }}>{metric.value}</strong>
              <span style={{ color: '#6d7490', fontWeight: 600, fontSize: '13px' }}>{metric.unit}</span>
            </div>
            <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '999px', backgroundColor: '#d7f3db' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '999px', backgroundColor: '#b6eec0' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '999px', backgroundColor: '#8de5a1' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '999px', backgroundColor: '#5bd17d' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '999px', backgroundColor: '#2fb05f' }} />
            </div>
            <p
              style={{
                margin: '7px 0 0',
                fontSize: '13px',
                color: metric.state === 'warning' ? '#bd5f36' : '#3f7754',
              }}
            >
              직전 대비 {metric.trend > 0 ? `+${metric.trend}` : metric.trend}
            </p>
          </DashboardCard>
        ))}
      </DashboardLayout>
    </div>
  );
};

export default MetricsSection;
