import React, { useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/panel.css';

const Panel = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };
    const closeMenu = () => {
      setIsOpen(false);
    }
    
    const navigate = useNavigate();
    const location = useLocation();
  
    const handleNavigation = (path) => async (e) => {
      e.preventDefault(); // Prevent the default anchor behavior

        navigate(path); 
      closeMenu(); 
    };
  
    const renderMenuOptions = () => {
        // Check the current path to render different options
        if (location.pathname === '/admin-login') {
            return (
                <>
                    <li><a href="/login" onClick={handleNavigation('/login')}>Student Login</a></li>
                    <li><a href="/teacher-login" onClick={handleNavigation('/teacher-login')}>Teacher Login</a></li>
                </>
            );
        }
        if (location.pathname === '/teacher-login') {
            return (
                <>
                    <li><a href="/admin-login" onClick={handleNavigation('/admin-login')}>Admin Login</a></li>
                    <li><a href="/login" onClick={handleNavigation('/login')}>Student Login</a></li>
                </>
            );
        } else if (location.pathname === '/login') {
            return (
                <>
                    <li><a href="/admin-login" onClick={handleNavigation('/admin-login')}>Admin Login</a></li>
                    <li><a href="/teacher-login" onClick={handleNavigation('/teacher-login')}>Teacher Login</a></li>
                </>
            );
        }
        // Default options if the location doesn't match any specific condition
        return (
            <>
                <li><a href="/admin-login" onClick={handleNavigation('/admin-login')}>Admin Login</a></li>
                <li><a href="/teacher-login" onClick={handleNavigation('/teacher-login')}>Teacher Login</a></li>
                <li><a href="/student-login" onClick={handleNavigation('/student-login')}>Student Login</a></li>
            </>
        );
    };

    return (
      <>
        {!isOpen && ( 
          <button className="menu-btn" onClick={toggleMenu}>
            &#9776;
          </button>
        )}
        <div className={`side-menu ${isOpen ? 'open' : ''}`}>
          <button className="close-button" onClick={closeMenu}>✕</button>
          <ul>
            {renderMenuOptions()}
          </ul>
        </div>
      </>
    );
};

export default Panel
