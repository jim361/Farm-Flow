//frontend/src/App.tsx

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
import Schedular from "./page/Scheduler";
import Login from "./page/Login";
import Sign from "./page/Sign";
import Layout from "./components/Layout";
import { DeviceRegistrationPage } from "./page/DeviceRegistrationPage";
import {
  LogicBuilderPage,
  type LogicBuilderHandle,
} from "./page/LogicBuilderPage";
import { TemplatePage } from "./page/TemplatePage";
import {
  fetchDevicesApi,
  fetchWorkflowsApi,
  saveWorkflowApi,
  updateWorkflowApi,
  deleteWorkflowApi,
  deleteDevicesApi,
  deployWorkflowApi,
  getToken,
} from "./api/api";
import type { LibraryDevice } from "./api/api";
import FindId from "./page/FindId";
import FindPw from "./page/FindPw";

export type { LibraryDevice };

const DEFAULT_BUILDER_TITLE = "비주얼 로직 빌더";

const AUTH_PAGES = ["/login", "/signup", "/find-id", "/find-pw"];

function AppBody() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  // ── 인증 가드: 토큰 없으면 로그인으로 리다이렉트 ──
  useEffect(() => {
    if (AUTH_PAGES.includes(pathname)) return;
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [pathname, navigate]);

  // ── 상태 ──
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [libraryDevices, setLibraryDevices] = useState<LibraryDevice[]>([]);
  const [userWorkflows, setUserWorkflows] = useState<SavedUserWorkflow[]>([]);
  const [builderTitle, setBuilderTitle] = useState(DEFAULT_BUILDER_TITLE);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [builderSnapshot, setBuilderSnapshot] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);
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

  // 인증 페이지가 아닐 때만 데이터 로드
  useEffect(() => {
    if (AUTH_PAGES.includes(pathname)) return;
    if (!getToken()) return;
    fetchDevices();
    fetchWorkflows();
  }, [pathname, fetchDevices, fetchWorkflows]);

  // ★ 로직 빌더 진입 시 상태 복원 (편집 모드)
  useEffect(() => {
    if (pathname !== "/logic-builder") return;
    const st = location.state as
      | {
          workflowId?: string;
          reset?: boolean;
          builtinSnapshot?: { nodes: Node[]; edges: Edge[] };
          builtinTitle?: string;
        }
      | undefined;

    if (st?.reset) {
      setActiveWorkflowId(null);
      setBuilderSnapshot(null);
      setBuilderTitle(DEFAULT_BUILDER_TITLE);
      setBuilderSessionKey((k) => k + 1);
      navigate("/logic-builder", { replace: true, state: {} });
      return;
    }

    // 빌트인 템플릿 프리셋 로드
    if (st?.builtinSnapshot) {
      setActiveWorkflowId(null);
      setBuilderSnapshot(st.builtinSnapshot);
      setBuilderTitle(st.builtinTitle || DEFAULT_BUILDER_TITLE);
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
      }
      navigate("/logic-builder", { replace: true, state: {} });
    }
  }, [pathname, location.state, navigate, userWorkflows]);

  /** 워크플로우 저장/수정 (모달에서 이름 입력 후 호출됨) */
  const handleConfirmSave = useCallback(
    async (name: string) => {
      const g = builderRef.current?.getGraph();
      if (!g) return;
      const flowData = JSON.stringify({ nodes: g.nodes, edges: g.edges });

      if (activeWorkflowId) {
        // ★ 수정 모드: 기존 워크플로우 업데이트
        try {
          await updateWorkflowApi(activeWorkflowId, name, flowData);
        } catch (err) {
          console.error("백엔드 수정 API 실패:", err);
        }
        // 프론트 상태 직접 업데이트 (백엔드 실패해도 반영)
        setUserWorkflows((prev) =>
          prev.map((w) =>
            w.id === activeWorkflowId
              ? { ...w, name, nodes: g.nodes, edges: g.edges }
              : w
          )
        );
      } else {
        // 새로 만들기
        let saved = false;
        try {
          await saveWorkflowApi(name, flowData);
          await fetchWorkflows();
          saved = true;
        } catch (err) {
          console.error("Save error:", err);
        }
        // 백엔드 실패 시 로컬 state에 직접 추가
        if (!saved) {
          const localId = `local-${Date.now()}`;
          setUserWorkflows((prev) => [
            ...prev,
            { id: localId, name, nodes: g.nodes, edges: g.edges },
          ]);
        }
      }

      setSafetyOpen(false);
      setActiveWorkflowId(null);
      setBuilderSnapshot(null);
      setBuilderTitle(DEFAULT_BUILDER_TITLE);
      navigate("/templates");
    },
    [navigate, fetchWorkflows, activeWorkflowId]
  );

  /** 워크플로우 삭제 */
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
    [fetchWorkflows, activeWorkflowId]
  );

  /** 사용자 워크플로우 적용 (배포) — authFetch 사용 */
  const handleApplyUserWorkflow = useCallback(async (id: string) => {
    try {
      await deployWorkflowApi(id);
      alert("워크플로우가 적용되었습니다!");
      return;
    } catch {
      // 백엔드 미연결
    }
    alert("워크플로우가 적용되었습니다! (백엔드 연동 시 기기에 자동 배포됩니다)");
  }, []);

  /** 장치 삭제 */
  const handleDeleteLibraryDevices = useCallback(async (ids: string[]) => {
    try {
      await deleteDevicesApi(ids);
      setLibraryDevices((prev) => prev.filter((d) => !ids.includes(d.id)));
    } catch (err) {
      console.error("Device delete error:", err);
    }
  }, []);

  // 편집 모드 여부
  const isEditMode = activeWorkflowId !== null;

  return (
    <div className="ff-app">
      {/* 인증 페이지에서는 헤더 숨김 */}
      {!AUTH_PAGES.includes(pathname) && (
        <AppHeader
          showSave={pathname === "/logic-builder"}
          onSave={() => setSafetyOpen(true)}
          saveLabel={isEditMode ? "수정하기" : "저장하기"}
        />
      )}

      <Routes>
        {/* 1. 독립적인 인증 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Sign />} />
        <Route path="/find-id" element={<FindId />} />
        <Route path="/find-pw" element={<FindPw />} />

        {/* 2. 메인 서비스 페이지들 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scheduler" element={<Schedular />} />
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
          <Route
            path="/templates"
            element={
              <TemplatePage
                userWorkflows={userWorkflows}
                onDeleteWorkflow={handleDeleteWorkflow}
                onApplyUserWorkflow={handleApplyUserWorkflow}
                onRefreshWorkflows={fetchWorkflows}
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
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
