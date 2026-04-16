//frontend/src/App.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import type { Edge, Node } from "@xyflow/react";
import type { SavedUserWorkflow } from "./workflowTypes";
import { AppHeader } from "./components/AppHeader";
import { DeploymentSafetyModal } from "./components/DeploymentSafetyModal";
import Dashboard from "./page/Dashboard";

import Schedular from './page/Schedular'; //추가
import Login from './page/Login';
import Sign from './page/Sign';
import Layout from './components/Layout';//

  import { DeviceRegistrationPage } from "./page/DeviceRegistrationPage";
import { LogicBuilderPage, type LogicBuilderHandle } from "./page/LogicBuilderPage";
import { TemplatePage } from "./page/TemplatePage";
import { fetchDevicesApi, fetchWorkflowsApi, saveWorkflowApi, deleteWorkflowApi, deleteDevicesApi } from "./api/api";
 
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

    //수정
    
return (

<div className="ff-app">

<AppHeader showSave={pathname === "/logic-builder"} onSave={() => setSafetyOpen(true)} />


<Routes>

{/* 레이아웃으로 감싸고 싶은 페이지들을 여기에 둡니다 */}

<Route element={<Layout />}>

<Route path="/" element={<Navigate to="/logic-builder" replace />} />


{/* 수빈님의 추가 페이지들 */}

<Route path="/login" element={<Login />}/>

<Route path="/Sign" element={<Sign />}/>

<Route path="/Schedular" element={<Schedular />}/>


{/* 팀원의 기존 페이지들 */}

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

</Route>


{/* 어떤 경로에도 해당하지 않을 때 리다이렉트 */}

<Route path="*" element={<Navigate to="/logic-builder" replace />} />

</Routes>
  

<DeploymentSafetyModal

open={safetyOpen}

onClose={() => setSafetyOpen(false)}

onConfirmDeploy={handleConfirmSave}

/>

</div>

);

export default function App() {

  return (
    <BrowserRouter>
      <AppBody />
    </BrowserRouter>
  );
}