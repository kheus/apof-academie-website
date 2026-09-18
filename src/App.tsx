import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import PageTitle from './components/PageTitle'

import Home from './pages/Home'
import About from './pages/About'
import Programs from './pages/Programs'
import Admissions from './pages/Admissions'
import PreInscription from './pages/PreInscription'
import Contact from './pages/Contact'

import Login from './pages/auth/Login'
import AccessDenied from './pages/auth/AccessDenied'

// Admin, teacher and student areas are only ever needed after a successful
// login, so they're code-split out of the initial bundle every public
// visitor (parents browsing the site, nobody signed in) has to download.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminClasses = lazy(() => import('./pages/admin/AdminClasses'))
const AdminGrades = lazy(() => import('./pages/admin/AdminGrades'))
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'))
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminAdmissions = lazy(() => import('./pages/admin/AdminAdmissions'))
const AdminHR = lazy(() => import('./pages/admin/AdminHR'))
const AdminAccounting = lazy(() => import('./pages/admin/AdminAccounting'))

const TeacherLayout = lazy(() => import('./pages/teacher/TeacherLayout'))
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'))
const TeacherCourses = lazy(() => import('./pages/teacher/TeacherCourses'))
const TeacherGrades = lazy(() => import('./pages/teacher/TeacherGrades'))
const TeacherCalendar = lazy(() => import('./pages/teacher/TeacherCalendar'))
const TeacherHR = lazy(() => import('./pages/teacher/TeacherHR'))

const StudentLayout = lazy(() => import('./pages/student/StudentLayout'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentGrades = lazy(() => import('./pages/student/StudentGrades'))
const StudentCourses = lazy(() => import('./pages/student/StudentCourses'))
const StudentAnnouncements = lazy(() => import('./pages/student/StudentAnnouncements'))
const StudentCalendar = lazy(() => import('./pages/student/StudentCalendar'))
const StudentPayments = lazy(() => import('./pages/student/StudentPayments'))

function PortalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <p className="text-sm font-semibold text-navy-400">Chargement…</p>
    </div>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      <PageTitle />
      <Suspense fallback={<PortalLoading />}>
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
            <Route path="comptabilite" element={<AdminAccounting />} />
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
            <Route path="paiements" element={<StudentPayments />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App
