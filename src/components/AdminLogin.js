import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Panel from './Panel';

const AdminLogin = () => {
  // Predefined admin credentials
  const adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  // State to manage form inputs and messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    if (username === adminCredentials.username && password === adminCredentials.password) {
      setErrorMessage('');
      navigate('/admin');
      // Navigate to the admin dashboard or perform the required action here
    } else {
      setErrorMessage('Invalid username or password');
    }
  };

  return (
    <div className="login-modal">
      <Panel/> 
      <div className="login">
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder='User Name'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
