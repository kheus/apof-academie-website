import { Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import About from './pages/About'
import Programs from './pages/Programs'
import Admissions from './pages/Admissions'
import PreInscription from './pages/PreInscription'
import Contact from './pages/Contact'

import Login from './pages/auth/Login'
import AccessDenied from './pages/auth/AccessDenied'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminClasses from './pages/admin/AdminClasses'
import AdminGrades from './pages/admin/AdminGrades'
import AdminCourses from './pages/admin/AdminCourses'
import AdminCalendar from './pages/admin/AdminCalendar'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminAdmissions from './pages/admin/AdminAdmissions'
import AdminHR from './pages/admin/AdminHR'

import TeacherLayout from './pages/teacher/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherCourses from './pages/teacher/TeacherCourses'
import TeacherGrades from './pages/teacher/TeacherGrades'
import TeacherCalendar from './pages/teacher/TeacherCalendar'
import TeacherHR from './pages/teacher/TeacherHR'

import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentGrades from './pages/student/StudentGrades'
import StudentCourses from './pages/student/StudentCourses'
import StudentAnnouncements from './pages/student/StudentAnnouncements'
import StudentCalendar from './pages/student/StudentCalendar'

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/programmes" element={<Programs />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/pre-inscription" element={<PreInscription />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/connexion" element={<Login />} />
        <Route path="/acces-refuse" element={<AccessDenied />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="utilisateurs" element={<AdminUsers />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="notes" element={<AdminGrades />} />
          <Route path="cours" element={<AdminCourses />} />
          <Route path="calendrier" element={<AdminCalendar />} />
          <Route path="annonces" element={<AdminAnnouncements />} />
          <Route path="preinscriptions" element={<AdminAdmissions />} />
          <Route path="rh" element={<AdminHR />} />
        </Route>

        <Route
          path="/enseignant"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="cours" element={<TeacherCourses />} />
          <Route path="notes" element={<TeacherGrades />} />
          <Route path="calendrier" element={<TeacherCalendar />} />
          <Route path="rh" element={<TeacherHR />} />
        </Route>

        <Route
          path="/eleve"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="notes" element={<StudentGrades />} />
          <Route path="cours" element={<StudentCourses />} />
          <Route path="annonces" element={<StudentAnnouncements />} />
          <Route path="calendrier" element={<StudentCalendar />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
