// frontend/src/components/Layout.tsx

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layour(){
  return(
      <div style = {{flex:1, display: 'flex', flexDirection: 'column'}}>
        <Topbar/>
        
      <div style = {{display: 'flex', minHeight: '100vh'}}>
      <Sidebar />



        <main style={{padding:'20px', flex: 1, backgroundColor : "#fafafa"}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}