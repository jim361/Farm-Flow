//frontend/src/App.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import type { Edge, Node } from "@xyflow/react";
import type { SavedUserWorkflow } from "./workflowTypes";
import { AppHeader } from "./components/AppHeader";
import { DeploymentSafetyModal } from "./components/DeploymentSafetyModal";
import Dashboard from "./page/Dashboard";
import Schedular from './page/Scheduler';
import Login from './page/Login';
import Sign from './page/Sign';
import Layout from './components/Layout';
import { DeviceRegistrationPage } from "./page/DeviceRegistrationPage";
import { LogicBuilderPage, type LogicBuilderHandle } from "./page/LogicBuilderPage";
import { TemplatePage } from "./page/TemplatePage";
import { fetchDevicesApi, fetchWorkflowsApi, saveWorkflowApi, deleteWorkflowApi, deleteDevicesApi } from "./api/api";

// LibraryDevice 타입을 api/api.ts에서 re-export (기존 import 호환 유지)
export type { LibraryDevice } from "./api/api";

const DEFAULT_BUILDER_TITLE = "비주얼 로직 빌더";

//AppBody위치, 백엔드 연동 필수 
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

  /** 워크플로우 저장 (handleConfirmSave) */
  const handleConfirmSave = useCallback(async (name: string) => {
    const g = builderRef.current?.getGraph();
    if (!g) return;
    const flowData = JSON.stringify({ nodes: g.nodes, edges: g.edges });
    try {
      await saveWorkflowApi(name, flowData);
      await fetchWorkflows();
      setSafetyOpen(false);
      navigate("/templates");
    } catch (err) {
      console.error("Save error:", err);
    }
  }, [navigate, fetchWorkflows]);

    //워크플로우 삭제 (handleDeleteWorkflow)
  const handleDeleteWorkflow = useCallback(async (id: string) => {
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
  }, [fetchWorkflows, activeWorkflowId]);

  /** 장치 삭제 (handleDeleteLibraryDevices) */
  const handleDeleteLibraryDevices = useCallback(async (ids: string[]) => {
    try {
      await deleteDevicesApi(ids);
      setLibraryDevices((prev) => prev.filter((d) => !ids.includes(d.id)));
    } catch (err) {
      console.error("Device delete error:", err);
    }
  }, []);

    
return (
  <div className="ff-app">
    {/* 로그인, 회원가입 페이지가 아닐 때만 헤더를 표시합니다 */}
    {pathname !== "/login" && pathname !== "/signup" && (
      <AppHeader 
        showSave={pathname === "/logic-builder"} 
        onSave={() => setSafetyOpen(true)} 
      />
    )}

    <Routes>
      {/* 1. 독립적인 인증 페이지 (Layout 적용 안 함) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Sign />} />

      {/* 2. 메인 서비스 페이지들 (Layout 적용) */}
      <Route element={<Layout />}>
        {/* 접속 시 가장 먼저 로그인 페이지로 이동하도록 설정 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scheduler" element={<Schedular />} />
        <Route path="/logic-builder" element={
          <LogicBuilderPage 
            key={builderSessionKey}
            ref={builderRef} 
            libraryDevices={libraryDevices} 
            pageTitle={builderTitle} 
            initialSnapshot={builderSnapshot} 
            onDeleteLibraryDevices={handleDeleteLibraryDevices}
          />
        } />
        <Route path="/devices" element={
          <DeviceRegistrationPage onRegisterDevice={async () => { await fetchDevices(); }} />
        } />
        <Route path="/templates" element={
          <TemplatePage userWorkflows={userWorkflows} onDeleteWorkflow={handleDeleteWorkflow} />
        } />
      </Route>

      {/* 정의되지 않은 모든 경로는 로그인으로 보냅니다 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>

    <DeploymentSafetyModal open={safetyOpen} onClose={() => setSafetyOpen(false)} onConfirmDeploy={handleConfirmSave} />
  </div>
);
};

export default function App() {

  return (
    <BrowserRouter>
      <AppBody />
    </BrowserRouter>
  );
};
