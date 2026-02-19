import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found">
            <div className="not-found__content">
                <span className="not-found__emoji">🪵</span>
                <h1 className="not-found__title">404</h1>
                <p className="not-found__text">
                    Oops! This page doesn't exist.
                </p>
                <Link to="/dashboard">
                    <Button variant="primary" size="lg">
                        Go Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
