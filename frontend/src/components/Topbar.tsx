// frontend/src/components/Topbar.tsx

import NavButton from './NavButton';

export default function Topbar() {
  return (
    <header style={{ display: 'flex', borderBottom: '1px solid #ddd', padding: '10px' }}>
      <nav>
        <NavButton label="Flow Farm" path="/" />
        <NavButton label="로그인" path="/login" />
        <NavButton label="회원가입" path="/sign" />
        <NavButton label="대시보드" path="/dashboard" />
        <NavButton label="캘린더" path="/Schedular" />
        <NavButton label="시뮬레이션" path="/simulation" />
        <NavButton label="템플릿" path="/Template" />
        <NavButton label="센서" path="/Sensor" />
      </nav>
    </header>
  );
}