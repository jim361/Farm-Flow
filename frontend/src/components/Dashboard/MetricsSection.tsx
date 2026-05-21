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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 한글 주석: 센서 데이터 통합 갱신 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="ff-btn-save"
          onClick={onRefreshAll}
          disabled={isLoading}
          style={{
            minHeight: '40px',
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