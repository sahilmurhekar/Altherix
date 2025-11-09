// /frontend/src/App.jsx

import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterSelection from './pages/RegisterSelection';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Patient Dashboard Pages
import DashboardPatient from './pages/DashboardPatient';
import DashboardPatientHome from './pages/patient/DashboardPatientHome';
import FindDoctorsPage from './pages/patient/FindDoctorsPage';
import AppointmentsPage from './pages/patient/AppointmentsPage';
import MedicalRecordsPage from './pages/patient/MedicalRecordsPage';
import PrescriptionsPage from './pages/patient/PrescriptionsPage';
import ProfilePage from './pages/patient/ProfilePage';
import SettingsPage from './pages/patient/SettingsPage';

// Doctor Dashboard Pages
import DashboardDoctor from './pages/DashboardDoctor';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterSelection />} />
          <Route path="/register-patient" element={<RegisterPatient />} />
          <Route path="/register-doctor" element={<RegisterDoctor />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Patient Dashboard Routes */}
          <Route
            path="/dashboard-patient"
            element={
              <ProtectedRoute>
                <DashboardPatient />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPatientHome />} />
            <Route path="find-doctors" element={<FindDoctorsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="medical-records" element={<MedicalRecordsPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Doctor Dashboard Routes */}
          <Route
            path="/dashboard-doctor"
            element={
              <ProtectedRoute>
                <DashboardDoctor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
