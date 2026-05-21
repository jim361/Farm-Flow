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
        backgroundColor: '#ffffff',
        border: '1px solid #e7e9f1',
        borderRadius: '14px',
        boxShadow: '0 6px 16px rgba(26, 35, 56, 0.04)',
        padding: '18px 20px',
      }}
    >
      <header style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#1f2431', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h3>
        {subtitle ? (
          <p style={{ margin: '4px 0 0', color: '#7d8496', fontSize: '13px' }}>{subtitle}</p>
        ) : null}
      </header>
      <div>{children}</div>
    </section>
  );
};

export default DashboardCard;