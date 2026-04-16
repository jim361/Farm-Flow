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
import {
  fetchDevicesApi,
  fetchWorkflowsApi,
  saveWorkflowApi,
  deleteWorkflowApi,
  deleteDevicesApi,
} from "./api/api";
 
// LibraryDevice 타입을 api/api.ts에서 re-export (기존 import 호환 유지)
export type { LibraryDevice } from "./api/api";
 
const DEFAULT_BUILDER_TITLE = "비주얼 로직 빌더";
 
function AppBody() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
 
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [libraryDevices, setLibraryDevices] = useState<import("./api/api").LibraryDevice[]>([]);
  const [userWorkflows, setUserWorkflows] = useState<SavedUserWorkflow[]>([]);
  const [builderTitle, setBuilderTitle] = useState(DEFAULT_BUILDER_TITLE);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [builderSnapshot, setBuilderSnapshot] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [builderSessionKey, setBuilderSessionKey] = useState(0);
  const builderRef = useRef<LogicBuilderHandle>(null);
 
  /** 장치 목록 로드 */
  const fetchDevices = useCallback(async () => {
    try {
      const devices = await fetchDevicesApi();
      setLibraryDevices(devices);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);
 
  /** 워크플로우 목록 로드 */
  const fetchWorkflows = useCallback(async () => {
    try {
      const workflows = await fetchWorkflowsApi();
      setUserWorkflows(workflows);
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
 
  // 워크플로우 저장
  const handleConfirmSave = useCallback(
    async (name: string) => {
      const g = builderRef.current?.getGraph();
      if (!g) return;
      const flowData = JSON.stringify({ nodes: g.nodes, edges: g.edges });
 
      try {
        await saveWorkflowApi(name, flowData);
        await fetchWorkflows();
      } catch (err) {
        console.error("Save error:", err);
      }
 
      setSafetyOpen(false);
      navigate("/templates");
    },
    [navigate, fetchWorkflows],
  );
 
  // 워크플로우 삭제
  const handleDeleteWorkflow = useCallback(
    async (id: string) => {
      try {
        await deleteWorkflowApi(id);
        await fetchWorkflows();
 
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
 
  // 라이브러리 장치 삭제
  const handleDeleteLibraryDevices = useCallback(
    async (ids: string[]) => {
      try {
        await deleteDevicesApi(ids);
        setLibraryDevices((prev) => prev.filter((d) => !ids.includes(d.id)));
      } catch (err) {
        console.error("Device delete error:", err);
        alert("장치 삭제 중 오류가 발생했습니다.");
      }
    },
    [],
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
              onDeleteLibraryDevices={handleDeleteLibraryDevices}
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