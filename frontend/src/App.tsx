import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { DeploymentSafetyModal } from "./components/DeploymentSafetyModal";
import { DashboardPage } from "./pages/DashboardPage";
import { DeviceRegistrationPage } from "./pages/DeviceRegistrationPage";
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
