import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <div className="auth-layout__inner">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
