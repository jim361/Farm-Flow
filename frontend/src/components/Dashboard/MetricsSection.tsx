import DashboardCard from './Dashboard';
import DashboardLayout from './DashboardLayout';
import { metricsNow } from './mockDashboardDb';

type MetricItem = (typeof metricsNow)[number];

interface MetricsSectionProps {
  data?: MetricItem[];
  isLoading?: boolean;
  onRefreshAll?: () => void;
  lastUpdatedAt?: string;
  sourceLabel?: string;
  isLive?: boolean;
}

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: spinning ? 'ff-spin 0.8s linear infinite' : 'none' }}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const MetricsSection = ({
  data = metricsNow,
  isLoading = false,
  onRefreshAll,
  lastUpdatedAt,
  sourceLabel = 'Redis dashboard:metrics',
  isLive = true,
}: MetricsSectionProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* 상태 바 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          padding: '0 2px',
        }}
      >
        {/* 라이브 상태 뱃지 */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '6px 11px',
            borderRadius: '999px',
            background: isLive ? '#ecfdf5' : '#fff7ed',
            color: isLive ? '#047857' : '#b45309',
            border: `1px solid ${isLive ? '#bbf7d0' : '#fed7aa'}`,
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '999px',
              background: isLive ? '#22c55e' : '#f97316',
              boxShadow: isLive ? '0 0 0 4px rgba(34, 197, 94, 0.16)' : 'none',
              flexShrink: 0,
            }}
          />
          {isLive ? '센서 데이터 수신 중' : 'Mock 데이터 표시'}
        </span>

        <span style={{ color: '#475569', fontSize: '13px' }}>소스: {sourceLabel}</span>
        {lastUpdatedAt && (
          <span style={{ color: '#475569', fontSize: '13px' }}>마지막 수신 {lastUpdatedAt}</span>
        )}

        {/* 새로고침 아이콘 버튼 */}
        <button
          type="button"
          onClick={onRefreshAll}
          disabled={isLoading}
          title="데이터 새로고침"
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
