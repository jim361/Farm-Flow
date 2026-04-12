//frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './page/Dashboard';
import Schedular from './page/Schedular';
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
      <Route path="/dashboard" element={<Dashboard />}/>
      <Route path="/Dashboard" element={<Dashboard />}/>
      <Route path="/Schedular" element={<Schedular />}/>
      <Route path="/Simulation" element={<Simulation />}/>
      <Route path="/Template" element={<Template />}/>
      <Route path="/Sensor" element={<Sensor />}/>      

      </Route>
    </Routes>
    </BrowserRouter>
  )
};