import DashboardCard from './Dashboard';
import DashboardLayout from './DashboardLayout';
import { metricsNow } from './mockDashboardDb';

type MetricItem = (typeof metricsNow)[number];

interface MetricsSectionProps {
  data?: MetricItem[];
  isLoading?: boolean;
  onRefreshAll?: () => void;
}

const MetricsSection = ({ data = metricsNow, isLoading = false, onRefreshAll }: MetricsSectionProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* 한글 주석: 센서 데이터 통합 갱신 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onRefreshAll}
          disabled={isLoading}
          style={{
            border: 'none',
            borderRadius: '10px',
            padding: '10px 14px',
            backgroundColor: '#1f6d40',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.85 : 1,
          }}
        >
          {isLoading ? '데이터 통합 갱신 중...' : '데이터 통합 갱신'}
        </button>
      </div>

      <DashboardLayout>
        {data.map((metric) => (
          <DashboardCard key={metric.id} title={metric.label} subtitle="실시간 센서값">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <strong style={{ fontSize: '30px', color: '#284a1f', lineHeight: 1 }}>{metric.value}</strong>
              <span style={{ color: '#5f7058' }}>{metric.unit}</span>
            </div>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: '13px',
                color: metric.state === 'warning' ? '#9a4b21' : '#45653a',
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