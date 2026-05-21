import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { SavedUserWorkflow } from "../workflowTypes";
 
/* ── 지능형 환기 제어 프리셋 노드/엣지 ── */
const edgeStyle = {
  stroke: "#22c55e",
  strokeWidth: 2,
  strokeDasharray: "6 4",
};
 
const ventilationNodes = [
  { id: "n1", type: "sensor", position: { x: 60, y: 140 }, data: { name: "기본 센서", label: "기본 센서" } },
  { id: "n2", type: "condition", position: { x: 360, y: 120 }, data: { label: "조건 설정" } },
  { id: "n3", type: "action", position: { x: 660, y: 140 }, data: { name: "기본 제어기", label: "기본 제어기", headerLabel: "제어기" } },
];
 
const ventilationEdges = [
  { id: "e1", source: "n1", target: "n2", animated: true, style: edgeStyle },
  { id: "e2", source: "n2", target: "n3", animated: true, style: edgeStyle },
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
 
          {/* 지능형 환기 제어 (튜토리얼 템플릿) */}
          <article className="tpl-card">
            <div className="tpl-card-head">
              <div className="tpl-icon-box" style={{ background: "#ffedd5" }} aria-hidden>
                V
              </div>
              <span className="tpl-tag" style={{ color: "#c2410c", background: "#fed7aa" }}>
                ESSENTIAL
              </span>
            </div>
            <h3>지능형 환기 제어</h3>
            <p>외부 풍속 및 온습도 데이터를 실시간 분석하여 창 개폐를 정밀 조절합니다. 급격한 내부 환경 변화를 억제합니다.</p>
            <div className="tpl-actions">
              <button
                type="button"
                className="tpl-btn-outline"
                onClick={() =>
                  navigate("/logic-builder", {
                    state: {
                      builtinSnapshot: {
                        nodes: ventilationNodes,
                        edges: ventilationEdges,
                      },
                      builtinTitle: "지능형 환기 제어",
                    },
                  })
                }
              >
                편집
              </button>
              <button type="button" className="tpl-btn-primary">
                적용
              </button>
            </div>
          </article>
 
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