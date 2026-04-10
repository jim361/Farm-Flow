// src/page/Scheduler.tsx

import SchedulerHeader from "../components/Scheduler/SchedulerHeader";
import SchedulerLayout from "../components/Scheduler/SchedulerLayout";
import CalendarSection from "../components/Dashboard/CalendarSection";
import TimelineSection from "../components/Scheduler/TimelineSection";
import TodayScheduleSection from "../components/Scheduler/TodayScheduleSection";
import { useNavigate } from "react-router-dom";

const Scheduler = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. 헤더 */}
      <SchedulerHeader onAddClick={() => navigate("/add-scheduler")} />

      {/* 2. 레이아웃 컴포넌트로 깔끔하게 배치 */}
      <SchedulerLayout 
        left={
          <>
            <CalendarSection />
            <TimelineSection />
          </>
        }
        right={<TodayScheduleSection />}
      />
    </div>
  );
};

export default Scheduler;