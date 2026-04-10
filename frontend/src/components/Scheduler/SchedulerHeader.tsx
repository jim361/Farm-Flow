// src/components/Scheduler/SchedulerHeader.tsx

interface Props {
  onAddClick: () => void;
}

const SchedulerHeader = ({ onAddClick }: Props) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ margin: 0 }}>스케줄러 관리</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>온실 자동화 일정 및 하드웨어 가동 시간을 최적화합니다.</p>
      </div>
      <button 
        onClick={onAddClick} 
        style={{ 
          backgroundColor: '#003320', color: 'white', padding: '10px 20px', 
          borderRadius: '8px', border: 'none', cursor: 'pointer' 
        }}> + 새 일정 추가 </button>
    </div>
  );
};

export default SchedulerHeader;