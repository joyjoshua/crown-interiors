import { Outlet } from 'react-router-dom';
import TopBar from '../ui/TopBar';
import BottomNav from '../ui/BottomNav';
import './AppLayout.css';

const AppLayout = () => {
    return (
        <div className="app-layout">
            <main className="app-layout__content">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default AppLayout;
