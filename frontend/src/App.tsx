<<<<<<< HEAD
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
=======
<<<<<<< HEAD
import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
import { AppHeader } from "./components/AppHeader";
import { DeploymentSafetyModal } from "./components/DeploymentSafetyModal";
import { DashboardPage } from "./pages/DashboardPage";
import { DeviceRegistrationPage } from "./pages/DeviceRegistrationPage";
<<<<<<< HEAD
import { LogicBuilderPage, type LogicBuilderHandle } from "./pages/LogicBuilderPage";
import { SchedulerPage } from "./pages/SchedulerPage";
import { TemplatePage } from "./pages/TemplatePage";
=======
import { LogicBuilderPage } from "./pages/LogicBuilderPage";
import { SchedulerPage } from "./pages/SchedulerPage";
import { TemplatePage } from "./pages/TemplatePage";

export default function App() {
  const { pathname } = useLocation();
  const [safetyOpen, setSafetyOpen] = useState(false);

  return (
    <div className="ff-app">
      <AppHeader
        showSave={pathname === "/logic-builder"}
        onSave={() => setSafetyOpen(true)}
      />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/logic-builder" element={<LogicBuilderPage />} />
        <Route path="/devices" element={<DeviceRegistrationPage />} />
        <Route path="/scheduler" element={<SchedulerPage />} />
        <Route path="/templates" element={<TemplatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DeploymentSafetyModal
        open={safetyOpen}
        onClose={() => setSafetyOpen(false)}
      />
    </div>
  );
}
=======
//frontend/src/App.tsx
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f

export type LibraryDevice = {
  id: string;
  name: string;
  group: "sensor" | "action";
  subtype: "temp" | "humidity" | "co2" | "boiler" | "vent" | "pump";
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
              onRegisterDevice={(device) =>
                setLibraryDevices((prev) => [device, ...prev.filter((d) => d.id !== device.id)])
              }
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
<<<<<<< HEAD
  );
}
=======
  )
};
>>>>>>> 93e8ee811598782d8cc024c98d68795663e55466
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
