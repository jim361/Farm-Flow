import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { SavedUserWorkflow } from "../workflowTypes";

const builtInTemplates = [
  {
    id: "builtin-a",
    icon: "A",
    iconBg: "#fee2e2",
    tag: "PREMIUM",
    tagColor: "#b91c1c",
    tagBg: "#fecaca",
    title: "딸기 최적 기후 제어",
    desc: "당도를 극대화하기 위한 냉온 관리 로직입니다. 주간 광합성 효율과 야간 호흡 억제를 자동으로 조절합니다.",
  },
  {
    id: "builtin-w",
    icon: "W",
    iconBg: "#dbeafe",
    tag: "VERIFIED",
    tagColor: "#1d4ed8",
    tagBg: "#bfdbfe",
    title: "토마토 수분 관리",
    desc: "토양 수분 센서와 연동하여 정밀 관수를 실시합니다. 뿌리 발육을 촉진하고 과실 터짐 현상을 방지합니다.",
  },
  {
    id: "builtin-g",
    icon: "G",
    iconBg: "#dcfce7",
    tag: "FAST GROWTH",
    tagColor: "#15803d",
    tagBg: "#bbf7d0",
    title: "상추 성장 촉진",
    desc: "LED 광량 제어와 CO2 시비를 통해 수확 주기를 20% 단축시키는 집약적 성장 촉진 알고리즘입니다.",
  },
  {
    id: "builtin-s",
    icon: "S",
    iconBg: "#ede9fe",
    tag: "SEASONAL",
    tagColor: "#6d28d9",
    tagBg: "#ddd6fe",
    title: "겨울철 보온 최적화",
    desc: "난방 에너지 비용을 최소화하면서 야간 저온 피해를 방지하는 효율 중심의 보온 제어 로직입니다.",
  },
  {
    id: "builtin-v",
    icon: "V",
    iconBg: "#ffedd5",
    tag: "ESSENTIAL",
    tagColor: "#c2410c",
    tagBg: "#fed7aa",
    title: "지능형 환기 제어",
    desc: "외부 풍속 및 온습도 데이터를 실시간 분석하여 창 개폐를 정밀 조절합니다. 급격한 내부 환경 변화를 억제합니다.",
  },
];

type TemplatePageProps = {
  userWorkflows: SavedUserWorkflow[];
  onDeleteWorkflow: (id: string) => void;
};

export function TemplatePage({ userWorkflows, onDeleteWorkflow }: TemplatePageProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">워크플로우 템플릿</h1>
        <p className="ff-sub">
          검증된 농업 알고리즘으로 스마트 팜을 즉시 가동하세요. 작물별 최적화된 기후, 수분, 영양 공급 워크플로우를 자유롭게 선택하고 수정할 수 있습니다.
        </p>
      </div>
      <main className="tpl-main">
        <div className="tpl-grid">
          <button
            type="button"
            className="tpl-card tpl-card--new"
            onClick={() => navigate("/logic-builder", { state: { reset: true } })}
          >
            <div className="tpl-card-new-icon">+</div>
            <h3>새 워크플로우 생성</h3>
            <p>나만의 커스텀 로직을 처음부터 설계합니다.</p>
          </button>
          {builtInTemplates.map((t) => (
            <article key={t.id} className="tpl-card">
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
                <button
                  type="button"
                  className="tpl-btn-outline"
                  onClick={() => navigate("/logic-builder", { state: { reset: true } })}
                >
                  편집
                </button>
                <button type="button" className="tpl-btn-primary">
                  적용
                </button>
              </div>
            </article>
          ))}
          {userWorkflows.map((w) => (
            <article key={w.id} className="tpl-card tpl-card--user">
              <div className="tpl-card-head">
                <div className="tpl-icon-box tpl-icon-box--user" aria-hidden>
                  U
                </div>
                <span className="tpl-tag tpl-tag--user">MY</span>
              </div>
              <h3>{w.name}</h3>
              <div className="tpl-actions tpl-actions--with-delete">
                <button
                  type="button"
                  className="tpl-btn-outline"
                  onClick={() => navigate("/logic-builder", { state: { workflowId: w.id } })}
                >
                  편집
                </button>
                <button type="button" className="tpl-btn-primary">
                  적용
                </button>
                <button
                  type="button"
                  className="tpl-btn-delete"
                  aria-label="템플릿 삭제"
                  onClick={() => onDeleteWorkflow(w.id)}
                >
                  <Trash2 size={18} strokeWidth={2} />
                  템플릿 삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
