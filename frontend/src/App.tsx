<<<<<<< HEAD
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
=======
//frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './page/Dashboard';
import Calendar from './page/Calendar';
import Simulation from './page/Simulation';
import Login from './page/Login';
import Sign from './page/Sign';
import Template from './page/Template';
import Sensor from './page/Sensor';
import Layout from './components/Layout';

export default function App(){

  return(
    <BrowserRouter>

    <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<h1>Start page</h1>}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/Sign" element={<Sign />}/>
      <Route path="/Dashboard" element={<Dashboard />}/>
      <Route path="/Calendar" element={<Calendar />}/>
      <Route path="/Simulation" element={<Simulation />}/>
      <Route path="/Template" element={<Template />}/>
      <Route path="/Sensor" element={<Sensor />}/>      

      </Route>
    </Routes>
    </BrowserRouter>
  )
};
>>>>>>> 93e8ee811598782d8cc024c98d68795663e55466
