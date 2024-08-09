import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { database, get, push, ref, onValue, update } from '../firebase-config';
import SideMenu from '../components/SideMenu';
import '../components/teacher.css';

const Teacher = () => {
  const [messages, setMessages] = useState({});
  const [appointments, setAppointments] = useState({});
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [currentTeacherID, setCurrentTeacherID] = useState(null);
  const auth = getAuth();
  const [currentTeacherName, setCurrentTeacherName] = useState('');

  
  // Fetch the current user's email and use it to get the corresponding teacherID from the database
  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const userEmail = user.email;

      const teachersRef = ref(database, 'teachers');
      onValue(teachersRef, (snapshot) => {
        const teachersData = snapshot.val();
        if (teachersData) {
          const teacherEntry = Object.entries(teachersData).find(([key, value]) => value.email === userEmail);

          if (teacherEntry) {
            const [teacherID] = teacherEntry;
            setCurrentTeacherID(teacherID);
            console.log('Fetched Teacher ID:', teacherID);
          } else {
            console.log('No teacher found for this email.');
          }
        } else {
          console.log('No teachers data available.');
        }
      });
    } else {
      console.log('No user is currently authenticated.');
    }
  }, [auth]);

  // Fetch messages for the teacherID once it's available
  useEffect(() => {
    if (!currentTeacherID) return;

    console.log('Using Teacher ID:', currentTeacherID);

    const teacherMessagesRef = ref(database, `messages/${currentTeacherID}`);
    const unsubscribeMessages = onValue(teacherMessagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log('Fetched data:', data);
        setMessages(data || {}); // Ensure messages are set correctly
      } else {
        console.log('No messages found for this teacher ID.');
        setMessages({});
      }
    }, (error) => {
      console.error('Error fetching data:', error);
    });

    return () => unsubscribeMessages();
  }, [currentTeacherID]);

  // Fetch appointments for the teacherID once it's available
  useEffect(() => {
    if (!currentTeacherID) return;

    console.log('Using Teacher ID for Appointments:', currentTeacherID);

    const teacherAppointmentsRef = ref(database, `teacherAppointments/${currentTeacherID}`);
    const unsubscribeAppointments = onValue(teacherAppointmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log('Fetched appointments:', data);
        setAppointments(data || {}); // Ensure appointments are set correctly
      } else {
        console.log('No appointments found for this teacher ID.');
        setAppointments({});
      }
    }, (error) => {
      console.error('Error fetching appointments:', error);
    });

    return () => unsubscribeAppointments();
  }, [currentTeacherID]);

  const handleOpenMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
  };

  const handleOpenAppointmentModal = () => {
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
  };
 
  useEffect(() => {
    const fetchTeacherName = async () => {
      try {
        const teacherRef = ref(database, `teachers/${currentTeacherID}`);
        const teacherSnapshot = await get(teacherRef);
        const teacherData = teacherSnapshot.val();
        if (teacherData) {
          setCurrentTeacherName(teacherData.userName || 'No name available');
        }
      } catch (error) {
        console.error('Error fetching teacher name:', error);
      }
    };
  
    if (currentTeacherID) {
      fetchTeacherName();
    }
  }, [currentTeacherID]);

const notifyStudent = async (studentID, message) => {
  try {
    const studentRef = ref(database, `students/${studentID}/notifications`);
    await push(studentRef, {
      message: message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const handleAcceptAppointment = async (appointmentID) => {
  try {
    const appointmentRef = ref(database, `teacherAppointments/${currentTeacherID}/${appointmentID}`);
    const appointmentSnapshot = await get(appointmentRef);
    const appointmentDetails = appointmentSnapshot.val();

    if (appointmentDetails) {
      const studentID = appointmentDetails.enrollmentNumber;
      const teacherName = currentTeacherName; // Ensure this is set appropriately
      const message = `Your appointment with ${teacherName} on ${appointmentDetails.date} at ${appointmentDetails.time} has been accepted.`;

      await update(appointmentRef, { status: 'Accepted' });
      await notifyStudent(studentID, message);

      // Update the appointments state to reflect changes
      setAppointments(prevAppointments => ({
        ...prevAppointments,
        [appointmentID]: { ...prevAppointments[appointmentID], status: 'Accepted' }
      }));
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
  }
};

const handleRejectAppointment = async (appointmentID) => {
  try {
    const appointmentRef = ref(database, `teacherAppointments/${currentTeacherID}/${appointmentID}`);
    const appointmentSnapshot = await get(appointmentRef);
    const appointmentDetails = appointmentSnapshot.val();

    if (appointmentDetails) {
      const studentID = appointmentDetails.enrollmentNumber;
      const teacherName = currentTeacherName; // Ensure this is set appropriately
      const message = `Your appointment with ${teacherName} on ${appointmentDetails.date} at ${appointmentDetails.time} has been rejected.`;

      await update(appointmentRef, { status: 'Rejected' });
      await notifyStudent(studentID, message);

      // Update the appointments state to reflect changes
      setAppointments(prevAppointments => ({
        ...prevAppointments,
        [appointmentID]: { ...prevAppointments[appointmentID], status: 'Rejected' }
      }));
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
  }
};

const handleRescheduleAppointment = async (appointmentID, newDate, newTime) => {
  try {
    const appointmentRef = ref(database, `teacherAppointments/${currentTeacherID}/${appointmentID}`);
    const appointmentSnapshot = await get(appointmentRef);
    const appointmentDetails = appointmentSnapshot.val();

    if (appointmentDetails) {
      const studentID = appointmentDetails.enrollmentNumber;
      const teacherName = currentTeacherName; // Ensure this is set appropriately
      const message = `Your appointment with ${teacherName} has been rescheduled to ${newDate} at ${newTime}.`;

      await update(appointmentRef, { date: newDate, time: newTime, status: 'Rescheduled' });
      await notifyStudent(studentID, message);

      // Update the appointments state to reflect changes
      setAppointments(prevAppointments => ({
        ...prevAppointments,
        [appointmentID]: { ...prevAppointments[appointmentID], date: newDate, time: newTime, status: 'Rescheduled' }
      }));
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
  }
};



  return (
    <div className="teacher-dashboard">
      <div className='header'>
        <SideMenu />
      </div>
      <div className='teacher-box'>
      <h2>Teacher Dashboard</h2>
      <div className="action-buttons">
        <div className='box' onClick={handleOpenMessageModal}>Inbox</div>
        <div className='box' onClick={handleOpenAppointmentModal}>Appointments</div>
      </div>
      </div>

      {isMessageModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseMessageModal}>X</button>
            <h3>Inbox</h3>
            {Object.keys(messages).length > 0 ? (
              <ul>
                {Object.entries(messages).map(([, messageDetails], index) => {
                  const messageDate = new Date(messageDetails.timestamp);
                  const formattedDate = !isNaN(messageDate) ? messageDate.toLocaleString() : 'Invalid Date';

                  return (
                    <li key={index}>
                      <strong>{messageDetails.studentName} ({messageDetails.enrollmentNumber}):</strong><br />
                      <span>{messageDetails.message}</span><br />
                      <small>{formattedDate}</small>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No messages available.</p>
            )}
          </div>
        </div>
      )}

      {isAppointmentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={handleCloseAppointmentModal}>X</button>
            <h3>Appointments</h3>
            {Object.keys(appointments).length > 0 ? (
              <ul>
                {Object.entries(appointments).map(([appointmentID, appointmentDetails], index) => {
                  const appointmentDate = new Date(appointmentDetails.timestamp);
                  const formattedDate = !isNaN(appointmentDate) ? appointmentDate.toLocaleString() : 'Invalid Date';

                  return (
                    <li key={index}>
                      <strong>Student: {appointmentDetails.studentName} ({appointmentDetails.enrollmentNumber})</strong><br />
                      <span>Date: {appointmentDetails.date}</span><br />
                      <span>Time: {appointmentDetails.time}</span><br />
                      <small>{formattedDate}</small><br />
                      {appointmentDetails.status === 'Accepted' && <span>Status: Accepted</span>}
                      {appointmentDetails.status === 'Rejected' && <span>Status: Rejected</span>}
                      {appointmentDetails.status === 'Rescheduled' && <span>Status: Rescheduled to {appointmentDetails.date} at {appointmentDetails.time}</span>}
                      {appointmentDetails.status !== 'Accepted' && appointmentDetails.status !== 'Rejected' && appointmentDetails.status !== 'Rescheduled' && (
                        <>
                          <button onClick={() => handleAcceptAppointment(appointmentID)}>Accept</button>
                          <button onClick={() => handleRejectAppointment(appointmentID)}>Reject</button>
                          <button onClick={() => handleRescheduleAppointment(appointmentID, 'New Date', 'New Time')}>Reschedule</button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No appointments available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;
