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
import Dashboard from "./page/Dashboard";
import Calendar from "./page/Calendar";
import { DeviceRegistrationPage } from "./page/DeviceRegistrationPage";
import { LogicBuilderPage, type LogicBuilderHandle } from "./page/LogicBuilderPage";
import { TemplatePage } from "./page/TemplatePage";

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
   */
  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/devices");
      if (!response.ok) throw new Error("장치 데이터를 불러올 수 없습니다.");

      const data = await response.json();
      console.log("Fetched Devices from DB:", data);

      const mapped: LibraryDevice[] = data.map((d: any) => ({
        id: d.id.toString(),
        name: d.name,
        deviceType: d.deviceType || d.device_type,
        subtype: d.sensorType || d.actuatorType || d.sensor_type,
      }));

      setLibraryDevices(mapped);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);

  /**
   * 백엔드에서 워크플로우 목록을 가져오는 함수
   */
  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/workflows");
      if (!res.ok) throw new Error("워크플로우 로드 실패");
      const data = await res.json();
      const mapped: SavedUserWorkflow[] = data.map((w: any) => ({
        id: w.id.toString(),
        name: w.name,
        nodes: w.flowData ? JSON.parse(w.flowData).nodes || [] : [],
        edges: w.flowData ? JSON.parse(w.flowData).edges || [] : [],
      }));
      setUserWorkflows(mapped);
    } catch (err) {
      console.error("Workflow fetch error:", err);
    }
  }, []);

  // 페이지 최초 진입 시 장치 + 워크플로우 목록 로드
  useEffect(() => {
    fetchDevices();
    fetchWorkflows();
  }, [fetchDevices, fetchWorkflows]);

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

  // 로직 빌더를 떠날 때 현재 그래프 상태를 snapshot에 저장
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current === "/logic-builder" && pathname !== "/logic-builder") {
      const g = builderRef.current?.getGraph();
      if (g) {
        setBuilderSnapshot({ nodes: g.nodes, edges: g.edges });
      }
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/logic-builder") return;
    applyLocationForLogicBuilder();
  }, [pathname, applyLocationForLogicBuilder]);

  // 워크플로우 저장 → 백엔드 API 호출
  const handleConfirmSave = useCallback(
    async (name: string) => {
      const g = builderRef.current?.getGraph();
      if (!g) return;
      const flowData = JSON.stringify({ nodes: g.nodes, edges: g.edges });

      try {
        const res = await fetch("http://localhost:8080/api/v1/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, flowData }),
        });
        if (!res.ok) throw new Error("저장 실패");
        await fetchWorkflows();
      } catch (err) {
        console.error("Save error:", err);
      }

      setSafetyOpen(false);
      navigate("/templates");
    },
    [navigate, fetchWorkflows],
  );

  // 워크플로우 삭제 → 백엔드 DELETE API 호출
  const handleDeleteWorkflow = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/workflows/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("삭제 실패");
        await fetchWorkflows();

        // 현재 빌더에서 열린 워크플로우가 삭제된 경우 초기화
        if (activeWorkflowId === id) {
          setActiveWorkflowId(null);
          setBuilderSnapshot(null);
          setBuilderTitle(DEFAULT_BUILDER_TITLE);
          setBuilderSessionKey((k) => k + 1);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    },
    [fetchWorkflows, activeWorkflowId],
  );

  return (
    <div className="ff-app">
      <AppHeader showSave={pathname === "/logic-builder"} onSave={() => setSafetyOpen(true)} />
      <Routes>
        <Route path="/" element={<Navigate to="/logic-builder" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
                await fetchDevices();
              }}
            />
          }
        />
        <Route path="/scheduler" element={<Calendar />} />
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
