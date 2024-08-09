import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import SideMenu from './SideMenu';
import '../components/studentHome.css';

const Student = () => {
  const [teachers, setTeachers] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [message, setMessage] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [studentInfo, setStudentInfo] = useState({ enrollmentNumber: '', userName: '' });
  const [notifications, setNotifications] = useState({});

  const database = getDatabase();
  const auth = getAuth();

  // Fetch the student's information based on their email
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userEmail = user.email;
      const studentsRef = ref(database, 'students');

      const unsubscribe = onValue(studentsRef, (snapshot) => {
        const studentsData = snapshot.val();
        if (studentsData) {
          const studentEntry = Object.entries(studentsData).find(([key, value]) => value.email === userEmail);
          if (studentEntry) {
            const [, studentData] = studentEntry;
            setStudentInfo({
              enrollmentNumber: studentData.enrollmentNumber,
              userName: studentData.userName || 'No name available',
            });
          } else {
            console.log('No student found for this email.');
          }
        }
      });

      return () => unsubscribe();
    }
  }, [auth, database]);

  // Fetch teachers list
  useEffect(() => {
    const teachersRef = ref(database, 'teachers');

    const unsubscribe = onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teachersList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setTeachers(teachersList);
      } else {
        setTeachers([]);
      }
    }, (error) => {
      console.error("Error fetching teachers:", error);
    });

    return () => unsubscribe();
  }, [database]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const { enrollmentNumber } = studentInfo;
      const notificationsRef = ref(database, `students/${enrollmentNumber}/notifications`);
  
      const unsubscribe = onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setNotifications(data);
        } else {
          setNotifications({});
        }
      });
  
      return () => unsubscribe();
    }
  }, [auth, database, studentInfo]);
  

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedTeacher || !message) {
      setErrorMessage('Please select a teacher and enter a message.');
      return;
    }

    try {
      const user = auth.currentUser;

      if (user) {
        const { enrollmentNumber, userName } = studentInfo;
        const timestamp = new Date().toISOString();

        const messagesRef = ref(database, `messages/${selectedTeacher}`);
        const newMessageRef = push(messagesRef);

        await set(newMessageRef, {
          studentName: userName,
          enrollmentNumber,
          message,
          timestamp,
        });

        setMessage('');
        setSuccessMessage('Message sent successfully!');
        setErrorMessage('');
      } else {
        setErrorMessage('User is not authenticated');
      }
    } catch (error) {
      setSuccessMessage('');
      setErrorMessage('Failed to send message: ' + error.message);
    }
  };

  const handleBookAppointment = async (event) => {
    event.preventDefault();
  
    if (!selectedTeacher || !appointmentDate || !appointmentTime) {
      setErrorMessage('Please select a teacher, date, and time.');
      return;
    }
  
    try {
      const user = auth.currentUser;
  
      if (user) {
        const { enrollmentNumber, userName } = studentInfo;
  
        // Generate a unique key for the appointment
        const appointmentID = new Date().toISOString();
  
        // Save appointment details in the student's appointments
        const appointmentsRef = ref(database, `appointments/${enrollmentNumber}`);
        const newAppointmentRef = push(appointmentsRef);
  
        await set(newAppointmentRef, {
          appointmentID,
          studentName: userName,
          enrollmentNumber,
          date: appointmentDate,
          time: appointmentTime,
          teacherId: selectedTeacher,
          timestamp: new Date().toISOString(),
        });
  
        // Save appointment details in the teacher's appointments
        const teacherAppointmentsRef = ref(database, `teacherAppointments/${selectedTeacher}`);
        const newTeacherAppointmentRef = push(teacherAppointmentsRef);
  
        await set(newTeacherAppointmentRef, {
          appointmentID,
          studentName: userName,
          enrollmentNumber,
          date: appointmentDate,
          time: appointmentTime,
          timestamp: new Date().toISOString(),
        });
  
        // Notify student with a unique ID
        const studentNotificationsRef = ref(database, `students/${enrollmentNumber}/notifications`);
        const newNotificationRef = push(studentNotificationsRef);
  
        await set(newNotificationRef, {
          message: 'Your appointment request has been sent successfully.',
          timestamp: new Date().toISOString(),
        });
  
        setAppointmentDate('');
        setAppointmentTime('');
        setSuccessMessage('Appointment request has been sent!');
        setErrorMessage('');
      } else {
        setErrorMessage('User is not authenticated');
      }
    } catch (error) {
      setSuccessMessage('');
      setErrorMessage('Failed to book appointment: ' + error.message);
    }
  };
  ;

  return (
    <>
      <div className='header-box'>
        <div className='header'>
          <SideMenu />
          <div className="header-content">
            <h1>Student Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <button onClick={() => setShowMessageModal(true)}>Send Message</button>
        <button onClick={() => setShowAppointmentModal(true)}>Book Appointment</button>
      </div>

      <div className="notification-box">
          <h2>Notifications</h2>
          {Object.keys(notifications).length > 0 ? (
            Object.entries(notifications).map(([key, notification]) => (
              <div key={key} className="notification">
                {notification.message} {/* Ensure only the string part is rendered */}
              </div>
            ))
          ) : (
            <p>No notifications available.</p>
          )}
      </div>

      {showMessageModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowMessageModal(false)}>&times;</span>
            <h2>Send Message</h2>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label htmlFor="teacher">Select Teacher:</label>
                <select
                  id="teacher"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  required
                >
                  <option className='select' value="">Select a teacher</option>
                  {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.userName ? teacher.userName : 'No name available'}
                      </option>
                    ))
                  ) : (
                    <option value="">No teachers available</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button className="btn" type="submit">Send Message</button>
            </form>
            {successMessage && <p className="message">{successMessage}</p>}
            {errorMessage && <p className="message error">{errorMessage}</p>}
          </div>
        </div>
      )}

      {showAppointmentModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAppointmentModal(false)}>&times;</span>
            <h2>Book Appointment</h2>
            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label htmlFor="teacher">Select Teacher:</label>
                <select
                  id="teacher"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  required
                >
                  <option className='select' value="">Select a teacher</option>
                  {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.userName ? teacher.userName : 'No name available'}
                      </option>
                    ))
                  ) : (
                    <option value="">No teachers available</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Time:</label>
                <input
                  type="time"
                  id="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className='btn'>Book Appointment</button>
            </form>
            {successMessage && <p className="message">{successMessage}</p>}
            {errorMessage && <p className="message error">{errorMessage}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default Student;
