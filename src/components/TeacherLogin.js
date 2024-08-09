import React, { useState } from 'react';
import Panel from '../components/Panel';
import { auth, database, ref, set, get } from '../firebase-config'; // Ensure correct imports
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [teacherID, setTeacherID] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!teacherID.startsWith('T')) {
      setMessage('Teacher ID must start with "T".');
      return;
    }

    if (isSignup) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setMessage('Please enter a valid email address.');
        return;
      }

      const isValidPassword = /^\d{4}-\d{2}-\d{2}$/.test(password);
      if (!isValidPassword) {
        setMessage('Password must be in YYYY-MM-DD format.');
        return;
      }

      if (password !== confirmPassword) {
        setMessage('Passwords do not match.');
        return;
      }

      try {
        const teacherRef = ref(database, 'teachers/' + teacherID);
        const snapshot = await get(teacherRef);
        if (snapshot.exists()) {
          setMessage('This ID is already in use.');
          return;
        }

        await createUserWithEmailAndPassword(auth, email, password);

        await set(teacherRef, {
          email: email,
          teacherID: teacherID,
          userName: userName,
          password:password,
          createdAt: new Date().toISOString(),
        });

        setMessage('Signup successful!');
        setEmail('');
        setPassword('');
        setUserName('');
        setConfirmPassword('');
        setTeacherID('');
        setIsSignup(false);
      } catch (error) {
        switch (error.code) {
          case 'auth/invalid-email':
            setMessage('Invalid email address format.');
            break;
          case 'auth/email-already-in-use':
            setMessage('This email is already in use.');
            break;
          case 'auth/weak-password':
            setMessage('Password should be at least 6 characters.');
            break;
          default:
            setMessage('Failed to sign up: ' + error.message);
        }
      }
    } else {
      try {
        const teacherRef = ref(database, 'teachers/' + teacherID);
        const snapshot = await get(teacherRef);
        if (!snapshot.exists()) {
          setMessage('Invalid Teacher ID.');
          return;
        }

        const teacherData = snapshot.val();
        if (teacherData.password !== password) {
          setMessage('Incorrect password.');
          return;
        }

        await signInWithEmailAndPassword(auth, teacherData.email, password);
        setMessage('Login successful!');
        navigate('/teacher');
      } catch (error) {
        switch (error.code) {
          case 'auth/invalid-email':
            setMessage('Invalid email address format.');
            break;
          case 'auth/user-not-found':
            setMessage('No user found with this Teacher ID.');
            break;
          case 'auth/wrong-password':
            setMessage('Incorrect password.');
            break;
          default:
            setMessage('Failed to log in: ' + error.message);
        }
      }
    }
  };

  return (
    <div className="login-modal">
      <Panel />
      <div className="login">
        <div className="form-title">
          <h2
            className={!isSignup ? 'active' : 'inactive'}
            onClick={() => setIsSignup(false)}
          >
            Log In
          </h2>
          <h2
            className={isSignup ? 'active' : 'inactive'}
            onClick={() => setIsSignup(true)}
          >
            Register
          </h2>
        </div>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          {isSignup ? (
            <>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Teacher ID"
                value={teacherID}
                onChange={(e) => setTeacherID(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (YYYY-MM-DD)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Teacher ID"
                value={teacherID}
                onChange={(e) => setTeacherID(e.target.value)}
                required
              />
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (YYYY-MM-DD)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </>
          )}
          <button type="submit">{isSignup ? 'Register' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}

export default TeacherLogin;
