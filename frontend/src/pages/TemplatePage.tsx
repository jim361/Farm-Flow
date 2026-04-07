import { useNavigate } from "react-router-dom";

const templates = [
  {
    icon: "A",
    iconBg: "#fee2e2",
    tag: "PREMIUM",
    tagColor: "#b91c1c",
    tagBg: "#fecaca",
    title: "딸기 최적 기후 제어",
    desc: "당도 극대화를 위한 주야간 온도, 습도 곡선과 광량 연동 로직입니다.",
  },
  {
    icon: "W",
    iconBg: "#dbeafe",
    tag: "VERIFIED",
    tagColor: "#1d4ed8",
    tagBg: "#bfdbfe",
    title: "토마토 수분 관리",
    desc: "토양 수분 센서 기반 실시간 관수와 배수 안전장치를 포함합니다.",
  },
  {
    icon: "G",
    iconBg: "#dcfce7",
    tag: "FAST GROWTH",
    tagColor: "#15803d",
    tagBg: "#bbf7d0",
    title: "상추 성장 촉진",
    desc: "LED 보광과 CO2 농도 제어로 수확 주기를 단축하는 알고리즘입니다.",
  },
  {
    icon: "S",
    iconBg: "#ede9fe",
    tag: "SEASONAL",
    tagColor: "#6d28d9",
    tagBg: "#ddd6fe",
    title: "겨울철 보온 최적화",
    desc: "난방 비용을 줄이면서도 결로와 냉해를 방지하는 단열, 난방 연동입니다.",
  },
  {
    icon: "V",
    iconBg: "#ffedd5",
    tag: "ESSENTIAL",
    tagColor: "#c2410c",
    tagBg: "#fed7aa",
    title: "지능형 환기 제어",
    desc: "풍속, 습도 실시간 데이터로 개폐기 각도와 송풍을 정밀 제어합니다.",
  },
];

export function TemplatePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">워크플로우 템플릿</h1>
        <p className="ff-sub">
          검증된 농업 알고리즘 템플릿을 선택해 기후, 수분, 양분 공급 로직을 빠르게 적용하고 수정할 수 있습니다.
        </p>
      </div>
      <main className="tpl-main">
        <div className="tpl-grid">
          <button type="button" className="tpl-card tpl-card--new" onClick={() => navigate("/logic-builder")}>
            <div className="tpl-card-new-icon">+</div>
            <h3>새 워크플로우 생성</h3>
            <p>나만의 커스텀 로직을 처음부터 설계합니다</p>
          </button>
          {templates.map((t) => (
            <article key={t.title} className="tpl-card">
              <div className="tpl-card-head">
                <div className="tpl-icon-box" style={{ background: t.iconBg }} aria-hidden>
                  {t.icon}
                </div>
                <span className="tpl-tag" style={{ color: t.tagColor, background: t.tagBg }}>
                  {t.tag}
                </span>
              </div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <div className="tpl-actions">
                <button type="button" className="tpl-btn-outline" onClick={() => navigate("/logic-builder")}>
                  편집
                </button>
                <button type="button" className="tpl-btn-primary" onClick={() => navigate("/logic-builder")}>
                  적용하기
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
