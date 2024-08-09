import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Link , Navigate} from 'react-router-dom';
import './App.css';
import { AuthContext } from './AuthProvider.js';
import image from './assests/education.png';
import Login from './components/Login';
import Student from "./components/Student";
import Profile from "./components/Profile";
import Teacher from "./components/Teacher";
import Admin from "./components/Admin";
import TeacherLogin from "./components/TeacherLogin";
import AdminLogin from "./components/AdminLogin";

function Home() {
  return (
    <div className="main">
      <div className="main-icon">
        <img src={image} alt="Logo" />
      </div>
      <h1>Book Your Appointment!</h1>
      <div className="login-section">
        <Link to="/login">
          <button type="button">Login</button>
        </Link>
      </div>
    </div>
  );
}


function App() {
  const { currentUser } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={<Student/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/admin-login" element={<AdminLogin/>}/>
        <Route path="/teacher" element={currentUser ? <Teacher /> : <Navigate to="/teacher" />} />
        <Route path="/teacher-login" element={<TeacherLogin/>}/>
      </Routes>
    </Router>
  );
}

export default App;
