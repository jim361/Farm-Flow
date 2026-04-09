import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { Edge, Node } from "@xyflow/react";
import type { SavedUserWorkflow } from "./workflowTypes";
import { AppHeader } from "./components/AppHeader";
import { DeploymentSafetyModal } from "./components/DeploymentSafetyModal";
import { DashboardPage } from "./pages/DashboardPage";
import { DeviceRegistrationPage } from "./pages/DeviceRegistrationPage";
import { LogicBuilderPage, type LogicBuilderHandle } from "./pages/LogicBuilderPage";
import { SchedulerPage } from "./pages/SchedulerPage";
import { TemplatePage } from "./pages/TemplatePage";

// 1. 백엔드 엔티티 구조와 일치하는 타입 정의
export type LibraryDevice = {
  id: string;
  name: string;
  deviceType: "SENSOR" | "ACTUATOR"; 
  subtype?: string;
};

const DEFAULT_BUILDER_TITLE = "비주얼 로직 빌더";

function AppBody() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [libraryDevices, setLibraryDevices] = useState<LibraryDevice[]>([]);
  const [userWorkflows, setUserWorkflows] = useState<SavedUserWorkflow[]>([]);
  const [builderTitle, setBuilderTitle] = useState(DEFAULT_BUILDER_TITLE);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [builderSnapshot, setBuilderSnapshot] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [builderSessionKey, setBuilderSessionKey] = useState(0);
  const builderRef = useRef<LogicBuilderHandle>(null);

  /**
   * [핵심] 백엔드 DB에서 장치 목록을 가져오는 함수
   * 컨트롤러의 @RequestMapping("/api/v1/devices") 주소와 일치시킴
   */
  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/devices");
      if (!response.ok) throw new Error("장치 데이터를 불러올 수 없습니다.");
      
      const data = await response.json();
      console.log("Fetched Devices from DB:", data); // 개발자 도구 확인용

      // DB의 필드명(deviceType 또는 device_type)을 프론트 규격에 맞게 변환
      const mapped: LibraryDevice[] = data.map((d: any) => ({
        id: d.id.toString(),
        name: d.name,
        deviceType: d.deviceType || d.device_type, // 둘 다 대응 가능하도록 작성
        subtype: d.sensorType || d.actuatorType || d.sensor_type,
      }));
      
      setLibraryDevices(mapped);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);

  // 페이지 최초 진입 시 장치 목록 로드
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // 로직 빌더 진입 시 상태 복원 로직
  const applyLocationForLogicBuilder = useCallback(() => {
    const st = location.state as { workflowId?: string; reset?: boolean } | undefined;
    if (st?.reset) {
      setActiveWorkflowId(null);
      setBuilderSnapshot(null);
      setBuilderTitle(DEFAULT_BUILDER_TITLE);
      setBuilderSessionKey((k) => k + 1);
      navigate("/logic-builder", { replace: true, state: {} });
      return;
    }
    if (st?.workflowId) {
      const wf = userWorkflows.find((w) => w.id === st.workflowId);
      if (wf) {
        setActiveWorkflowId(wf.id);
        setBuilderSnapshot({ nodes: wf.nodes, edges: wf.edges });
        setBuilderTitle(wf.name);
        setBuilderSessionKey((k) => k + 1);
        navigate("/logic-builder", { replace: true, state: {} });
      } else {
        navigate("/logic-builder", { replace: true, state: {} });
      }
    }
  }, [location.state, navigate, userWorkflows]);

  useEffect(() => {
    if (pathname !== "/logic-builder") return;
    applyLocationForLogicBuilder();
  }, [pathname, applyLocationForLogicBuilder]);

  // 워크플로우 저장 (현재는 로컬 상태 유지, 추후 백엔드 API 연동 필요)
  const handleConfirmSave = useCallback(
    (name: string) => {
      const g = builderRef.current?.getGraph();
      if (!g) return;
      const id = activeWorkflowId ?? `wf-${Date.now()}`;
      setUserWorkflows((prev) => {
        const rest = prev.filter((w) => w.id !== id);
        return [
          ...rest,
          {
            id,
            name,
            nodes: JSON.parse(JSON.stringify(g.nodes)) as Node[],
            edges: JSON.parse(JSON.stringify(g.edges)) as Edge[],
          },
        ];
      });
      setActiveWorkflowId(id);
      setBuilderTitle(name);
      setSafetyOpen(false);
      navigate("/templates");
    },
    [activeWorkflowId, navigate],
  );

  const handleDeleteWorkflow = useCallback((id: string) => {
    setUserWorkflows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return (
    <div className="ff-app">
      <AppHeader showSave={pathname === "/logic-builder"} onSave={() => setSafetyOpen(true)} />
      <Routes>
        <Route path="/" element={<Navigate to="/logic-builder" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/logic-builder"
          element={
            <LogicBuilderPage
              key={builderSessionKey}
              ref={builderRef}
              libraryDevices={libraryDevices}
              pageTitle={builderTitle}
              initialSnapshot={builderSnapshot}
            />
          }
        />
        <Route
          path="/devices"
          element={
            <DeviceRegistrationPage
              onRegisterDevice={async () => {
                // 장치 등록 성공 시 목록을 다시 불러와서 싱크를 맞춤
                await fetchDevices();
              }}
            />
          }
        />
        <Route path="/scheduler" element={<SchedulerPage />} />
        <Route
          path="/templates"
          element={
            <TemplatePage userWorkflows={userWorkflows} onDeleteWorkflow={handleDeleteWorkflow} />
          }
        />
        <Route path="*" element={<Navigate to="/logic-builder" replace />} />
      </Routes>
      <DeploymentSafetyModal
        open={safetyOpen}
        onClose={() => setSafetyOpen(false)}
        onConfirmDeploy={handleConfirmSave}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBody />
    </BrowserRouter>
  );
}