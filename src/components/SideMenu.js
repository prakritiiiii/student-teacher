import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import '../components/studentHome.css';
import image1 from '../assests/students.png';
import image2 from '../assests/teacher.png';
import image3 from '../assests/admin.png';

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path, shouldLogout = false) => async (e) => {
    e.preventDefault();
    if (shouldLogout) {
      try {
        await signOut(auth); 
        navigate('/login'); 
        alert('You have been logged out.');
      } catch (error) {
        console.error('Error signing out: ', error);
      }
    } else {
      navigate(path); 
    }
    closeMenu(); 
  };


  const renderMenuOptions = () => {
    if (location.pathname === '/admin') {
      return (
        <>
          <li className='logo'><img src={image3} alt='Admin' /></li>
          <li><span>Welcome, Admin</span></li>
          <li><a href="/admin-login" onClick={handleNavigation('/admin-login', true)}>Log Out</a></li>
        </>
      );
    }
    if (location.pathname === '/teacher') {
      return (
        <>
          <li className='logo'><img src={image2} alt='Teacher' /></li>
          <li><span>Welcome</span></li>
          <li><a href="/teacher-login" onClick={handleNavigation('/teacher-login', true)}>Log Out</a></li>
        </>
      );
    }
    if (location.pathname === '/student') {
      return (
        <>
          <li className='logo'><img src={image1} alt='Student' /></li>
          <li><span>Welcome</span></li>
          <li><a href="/login" onClick={handleNavigation('/login', true)}>Log Out</a></li>
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
          &#9776; {/* Hamburger icon */}
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

export default SideMenu;
