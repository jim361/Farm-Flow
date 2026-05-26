import { useState } from 'react';
import { runSimulationApi, runPresetSimulationApi, runAllSimulationsApi, type SimulationResult } from '../api/api';

const PRESETS = [
  { key: 'HEAT_WAVE', label: '🌡️ 폭염 (42°C)' },
  { key: 'COLD_WAVE', label: '❄️ 한파 (-10°C)' },
  { key: 'HIGH_CO2', label: '🌿 고CO2 (1500ppm)' },
  { key: 'DRY', label: '💧 건조 (습도 35%)' },
  { key: 'NIGHT', label: '🌙 야간 (조도 0)' },
];

const ACTION_LABELS: Record<string, string> = {
  FAN_ON: '🌀 환기 팬 가동',
  FAN_OFF: '🌀 환기 팬 정지',
  SPRINKLER_ON: '💧 스프링클러 작동',
  SPRINKLER_OFF: '💧 스프링클러 정지',
  LED_ON: '☀️ LED 보광등 점등',
  LED_OFF: '☀️ LED 보광등 소등',
  VENTILATOR_ON: '🌬️ 강제 환기 가동',
  VENTILATOR_OFF: '🌬️ 강제 환기 정지',
};

export default function SimulationPage() {
  const [temperature, setTemperature] = useState(24);
  const [humidity, setHumidity] = useState(63);
  const [lux, setLux] = useState(500);
  const [co2, setCo2] = useState(800);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleCustomRun = async () => {
    setLoading(true);
    setActivePreset(null);
    try {
      const result = await runSimulationApi({ temperature, humidity, lux, co2, latitude: 37.5, longitude: 127.0, scenario: 'CUSTOM' });
      setResults([result]);
    } catch {
      alert('시뮬레이션 실행 실패. 백엔드 서버를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = async (key: string) => {
    setLoading(true);
    setActivePreset(key);
    try {
      const result = await runPresetSimulationApi(key);
      setResults([result]);
    } catch {
      alert('시뮬레이션 실행 실패.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAll = async () => {
    setLoading(true);
    setActivePreset('ALL');
    try {
      const allResults = await runAllSimulationsApi();
      setResults(allResults);
    } catch {
      alert('전체 시뮬레이션 실패.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ff-full-container">
      <div className="ff-page-head">
        <h1 className="ff-title">로직 검증 시뮬레이션</h1>
        <p className="ff-sub">가상 센서값으로 Rule Engine 동작을 사전 검증합니다.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '0 20px 20px' }}>

        {/* 좌측: 입력 */}
        <div style={{ flex: 1, minWidth: '280px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#1f2431' }}>직접 입력</h2>

          {[
            { label: '🌡️ 온도 (°C)', value: temperature, setter: setTemperature, min: -20, max: 60 },
            { label: '💧 습도 (%)', value: humidity, setter: setHumidity, min: 0, max: 100 },
            { label: '☀️ 조도 (Lux)', value: lux, setter: setLux, min: 0, max: 5000 },
            { label: '🌿 CO2 (ppm)', value: co2, setter: setCo2, min: 0, max: 3000 },
          ].map(({ label, value, setter, min, max }) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#444' }}>{label}</span>
                <strong style={{ color: '#1f2431' }}>{value}</strong>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={e => setter(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2fb05f' }}
              />
            </div>
          ))}

          <button
            onClick={handleCustomRun}
            disabled={loading}
            className="ff-btn-save"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading && !activePreset ? '실행 중...' : '▶ 시뮬레이션 실행'}
          </button>

          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#1f2431' }}>프리셋 시나리오</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PRESETS.map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  disabled={loading}
                  style={{
                    padding: '10px 14px',
                    background: activePreset === p.key ? '#e8f9ee' : '#f8fafc',
                    border: `1px solid ${activePreset === p.key ? '#2fb05f' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    textAlign: 'left',
                    color: '#1f2431',
                  }}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={handleRunAll}
                disabled={loading}
                style={{
                  padding: '10px 14px',
                  background: activePreset === 'ALL' ? '#e8f9ee' : '#f0fdf4',
                  border: `1px solid ${activePreset === 'ALL' ? '#2fb05f' : '#bbf7d0'}`,
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#166534',
                }}
              >
                🔄 전체 시나리오 실행
              </button>
            </div>
          </div>
        </div>

        {/* 우측: 결과 */}
        <div style={{ flex: 2, minWidth: '320px' }}>
          {results.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              시뮬레이션을 실행하면 결과가 여기에 표시됩니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map((r, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${r.safe ? '#bbf7d0' : '#fecaca'}`, borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <strong style={{ fontSize: '14px', color: '#1f2431' }}>{r.scenario}</strong>
                    <span style={{
                      fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
                      background: r.safe ? '#dcfce7' : '#fee2e2',
                      color: r.safe ? '#166534' : '#991b1b'
                    }}>
                      {r.safe ? '✅ 안전' : '⚠️ 충돌'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span>🌡️ {r.temperature}°C</span>
                    <span>💧 {r.humidity}%</span>
                    <span>☀️ {r.lux} Lux</span>
                    <span>🌿 {r.co2} ppm</span>
                  </div>

                  {r.triggeredActions.length > 0 ? (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>발동된 제어 명령</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {r.triggeredActions.map((a, j) => (
                          <span key={j} style={{ fontSize: '12px', padding: '3px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '99px', color: '#166534' }}>
                            {ACTION_LABELS[a] || a}
                          </span>
                        ))}
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        {r.reasons.map((reason, j) => (
                          <p key={j} style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0' }}>• {reason}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>제어 명령 없음 (정상 범위)</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
