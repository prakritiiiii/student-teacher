import React, { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../firebase-config'; // Adjust the path to your firebase-config.js
import '../components/admin.css';
import SideMenu from "../components/SideMenu";

const Admin = () => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    // Fetch students from Firebase
    const fetchStudents = () => {
      const studentsRef = ref(database, 'students');
      onValue(studentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStudents(Object.entries(data).map(([id, details]) => ({
            id,
            name: details.userName,
            enrollmentID: details.enrollmentNumber,
            email: details.email
          })));
        }
      });
    };

    // Fetch teachers from Firebase
    const fetchTeachers = () => {
      const teachersRef = ref(database, 'teachers');
      onValue(teachersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setTeachers(Object.entries(data).map(([id, details]) => ({
            id,
            name: details.userName,
            email: details.email,
            teacherID: details.teacherID,
          })));
        }
      });
    };

    fetchStudents();
    fetchTeachers();
  }, []);

  const handleOpenStudentModal = () => {
    setIsStudentModalOpen(true);
  };

  const handleCloseStudentModal = () => {
    setIsStudentModalOpen(false);
  };

  const handleOpenTeacherModal = () => {
    setIsTeacherModalOpen(true);
  };

  const handleCloseTeacherModal = () => {
    setIsTeacherModalOpen(false);
  };

  const handleRemoveStudent = (studentId) => {
    const studentRef = ref(database, `students/${studentId}`);
    remove(studentRef)
      .then(() => {
        console.log('Student removed successfully.');
        // Optionally, re-fetch students to update the list
        setStudents((prevStudents) => prevStudents.filter(student => student.id !== studentId));
      })
      .catch((error) => {
        console.error('Error removing student:', error);
      });
  };

  const handleRemoveTeacher = (teacherID) => {
    const teacherRef = ref(database, `teachers/${teacherID}`);
    remove(teacherRef)
      .then(() => {
        console.log('Teacher removed successfully.');
        // Optionally, re-fetch teacher to update the list
        setTeachers((prevTeachers) => prevTeachers.filter(teacher => teacher.id !== teacherID));
      })
      .catch((error) => {
        console.error('Error removing student:', error);
      });
  };

  return (
    <div className="admin-dashboard">
      <SideMenu />
      <div className="admin-box">
      <h2>Admin Dashboard</h2>
      <div className="box-container">
        <div className="box" onClick={handleOpenStudentModal}>
          <p>Manage Students</p>
        </div>
        <div className="box" onClick={handleOpenTeacherModal}>
          <p>Manage Teachers</p>
        </div>
      </div>
      </div>

      {isStudentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={handleCloseStudentModal}>X</button>
            <h3>Student Management</h3>
            {students.length > 0 ? (
              <ul>
                {students.map((student) => (
                  <li key={student.id}>
                    <strong>{student.name}</strong>
                    <span>Remove Student<button className="remove-button" onClick={() => handleRemoveStudent(student.id)}>-</button></span>
                    <span>Enrollment ID: {student.enrollmentID}</span>
                    <span>Email: {student.email}</span><br/>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No students registered.</p>
            )}
          </div>
        </div>
      )}

      {isTeacherModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={handleCloseTeacherModal}>X</button>
            <h3>Teacher Management</h3>
            {teachers.length > 0 ? (
              <ul>
                {teachers.map((teacher) => (
                  <li key={teacher.id}>
                    <strong>{teacher.name}</strong>
                    <span>Remove Teacher <button className="remove-button" onClick={() => handleRemoveTeacher(teacher.id)}>-</button></span>
                    <span>Teacher ID:  {teacher.teacherID}</span>
                    <span>Email:  {teacher.email}</span><br/>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No teachers registered.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
