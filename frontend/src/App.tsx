import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { DeploymentSafetyModal } from "./components/DeploymentSafetyModal";
import { DashboardPage } from "./pages/DashboardPage";
import { DeviceRegistrationPage } from "./pages/DeviceRegistrationPage";
import { LogicBuilderPage } from "./pages/LogicBuilderPage";
import { SchedulerPage } from "./pages/SchedulerPage";
import { TemplatePage } from "./pages/TemplatePage";

export default function App() {
  const [safetyOpen, setSafetyOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="ff-app">
        <AppHeader showSave onSave={() => setSafetyOpen(true)} />
        <Routes>
          <Route path="/" element={<Navigate to="/logic-builder" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/logic-builder" element={<LogicBuilderPage />} />
          <Route path="/devices" element={<DeviceRegistrationPage />} />
          <Route path="/scheduler" element={<SchedulerPage />} />
          <Route path="/templates" element={<TemplatePage />} />
          <Route path="*" element={<Navigate to="/logic-builder" replace />} />
        </Routes>
        <DeploymentSafetyModal
          open={safetyOpen}
          onClose={() => setSafetyOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
