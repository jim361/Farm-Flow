import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const DashboardCard = ({ title, subtitle, children }: DashboardCardProps) => {
  return (
    <section
      style={{
        background: 'linear-gradient(170deg, #ffffff, #f2f8ec)',
        border: '1px solid #d8e7ca',
        borderRadius: '16px',
        boxShadow: '0 12px 24px rgba(47, 81, 36, 0.08)',
        padding: '18px',
      }}
    >
      <header style={{ marginBottom: '14px' }}>
        <h3 style={{ margin: 0, color: '#2f5124', fontSize: '18px', fontWeight: 700 }}>{title}</h3>
        {subtitle ? (
          <p style={{ margin: '4px 0 0', color: '#5f7058', fontSize: '13px' }}>{subtitle}</p>
        ) : null}
      </header>
      <div>{children}</div>
    </section>
  );
};

export default DashboardCard;