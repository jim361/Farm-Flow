// frontend/src/components/Layout.tsx

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout(){
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  return(
      <div style = {{flex:1, display: 'flex', flexDirection: 'column'}}>
        <Topbar/>
        
      <div style = {{display: 'flex', flex: 1}}>
      {isDashboard && <Sidebar />}

        <main style={{padding:'20px', flex: 1, backgroundColor : "#fafafa"}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}