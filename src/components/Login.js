import React, { useState } from 'react';
import { auth, database, createUserWithEmailAndPassword, signInWithEmailAndPassword, ref, set, get} from '../firebase-config';
import { useNavigate } from 'react-router-dom';
import Panel from './Panel';

function Login() {
  const [email, setEmail] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        // Check if enrollment number is already used
        const studentRef = ref(database, 'students/' + enrollmentNumber);
        const snapshot = await get(studentRef);
        if (snapshot.exists()) {
          setMessage('This enrollment number is already in use.');
          return;
        }

        // Create user with email and password
        await createUserWithEmailAndPassword(auth, email, password);

        // Add user details to Realtime Database
        await set(studentRef, {
          email: email,
          enrollmentNumber: enrollmentNumber,
          password: password,
          userName: userName,
          createdAt: new Date().toISOString(),
        });

        setMessage('Signup successful!');
        setEmail('');
        setPassword('');
        setUserName('');
        setConfirmPassword('');
        setEnrollmentNumber('');
        setIsSignup(false); // Switch to login form
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
        const studentRef = ref(database, 'students/' + enrollmentNumber);
        const snapshot = await get(studentRef);
        if (!snapshot.exists()) {
          setMessage('Invalid Enrollment Number.');
          return;
        }

        const studentData = snapshot.val();
        if (studentData.password !== password) {
          setMessage('Incorrect password.');
          return;
        }

        await signInWithEmailAndPassword(auth, studentData.email, password);
        setMessage('Login successful!');

        // Redirect to student dashboard
        navigate('/student'); 

      } catch (error) {
        switch (error.code) {
          case 'auth/invalid-email':
            setMessage('Invalid email address format.');
            break;
          case 'auth/user-not-found':
            setMessage('No user found with this Enrollment Number.');
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
                placeholder="Enrollment Number"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
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
                placeholder="Enrollment Number"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
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
          <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
