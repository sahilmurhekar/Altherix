// /frontend/src/App.jsx - Updated Integration

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
import MedicalRecordsPage from './pages/patient/PatientMedicalRecordsPage';
import PrescriptionsPage from './pages/patient/PrescriptionsPage';
import ProfilePage from './pages/patient/ProfilePage';
import PatientSettingsPage from './pages/patient/SettingsPage';
import PatientMedicalRecordsPage from './pages/patient/PatientMedicalRecordsPage';

// Doctor Dashboard Pages
import DashboardDoctor from './pages/DashboardDoctor';
import DashboardDoctorHome from './pages/doctor/DashboardDoctorHome';
import DoctorAppointmentsPage from './pages/doctor/AppointmentsPage';
import DoctorPatientsPage from './pages/doctor/PatientsPage';
import DoctorMedicalRecordsPage from './pages/doctor/MedicalRecordsPage';
import DoctorPrescriptionsPage from './pages/doctor/PrescriptionsPage';
import DoctorAnalyticsPage from './pages/doctor/AnalyticsPage';
import DoctorProfilePage from './pages/doctor/ProfilePage';
import DoctorSettingsPage from './pages/doctor/SettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ManageSchedule from './pages/doctor/ManageSchedule';

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
              <ProtectedRoute requiredRole="patient">
                <DashboardPatient />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPatientHome />} />
            <Route path="find-doctors" element={<FindDoctorsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<PatientSettingsPage />} />
            <Route path="medical-records" element={<PatientMedicalRecordsPage />} />
            <Route path='manage' element={<ManageSchedule/>}/>
          </Route>

          {/* Doctor Dashboard Routes */}
          <Route
            path="/dashboard-doctor"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DashboardDoctor />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardDoctorHome />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="patients" element={<DoctorPatientsPage />} />
            <Route path="records" element={<DoctorMedicalRecordsPage />} />
            <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
            <Route path="analytics" element={<DoctorAnalyticsPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
            <Route path="settings" element={<DoctorSettingsPage />} />
            <Route path='manage' element={<ManageSchedule/>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

/**
 * FILE STRUCTURE
 *
 * /frontend/src/
 * ├── pages/
 * │   ├── DashboardPatient.jsx ✓ (existing)
 * │   ├── DashboardDoctor.jsx ✓ (NEW)
 * │   ├── patient/
 * │   │   ├── DashboardPatientHome.jsx ✓ (existing)
 * │   │   ├── FindDoctorsPage.jsx ✓ (existing)
 * │   │   ├── AppointmentsPage.jsx ✓ (existing)
 * │   │   ├── MedicalRecordsPage.jsx ✓ (existing)
 * │   │   ├── PrescriptionsPage.jsx ✓ (existing)
 * │   │   ├── ProfilePage.jsx ✓ (existing)
 * │   │   └── SettingsPage.jsx ✓ (existing)
 * │   └── doctor/
 * │       ├── DashboardDoctorHome.jsx ✓ (NEW)
 * │       ├── AppointmentsPage.jsx ✓ (NEW)
 * │       ├── PatientsPage.jsx ✓ (NEW)
 * │       ├── MedicalRecordsPage.jsx ✓ (NEW)
 * │       ├── PrescriptionsPage.jsx ✓ (NEW)
 * │       ├── AnalyticsPage.jsx ✓ (NEW)
 * │       ├── ProfilePage.jsx ✓ (NEW)
 * │       └── SettingsPage.jsx ✓ (NEW)
 * └── components/
 *     ├── SidebarPatient.jsx ✓ (existing)
 *     └── SidebarDoctor.jsx ✓ (NEW)
 *
 * INSTALLATION STEPS
 *
 * 1. Create the new directories:
 *    mkdir -p src/pages/doctor
 *
 * 2. Copy all the doctor-side files into their respective locations
 *
 * 3. Update App.jsx with the new routes (as shown above)
 *
 * 4. Update your imports in App.jsx to include all doctor pages
 *
 * 5. Ensure ProtectedRoute component checks for 'doctor' role
 *
 * DOCTOR DASHBOARD FEATURES
 *
 * ✓ Dashboard Home - Overview stats, today's schedule, quick actions
 * ✓ Appointments - Manage pending, confirmed, completed appointments
 * ✓ Patients - View and manage patient profiles
 * ✓ Medical Records - Upload and manage patient medical documents
 * ✓ Prescriptions - Create and manage patient prescriptions
 * ✓ Analytics - View clinic performance metrics and reports
 * ✓ Profile - Edit professional information
 * ✓ Settings - Manage preferences and security
 *
 * API ENDPOINTS NEEDED
 *
 * GET /api/doctor/appointments/my-appointments
 * POST /api/appointments/confirm
 * POST /api/appointments/reject
 * GET /api/doctor/patients
 * POST /api/records/upload
 * GET /api/doctor/records
 * POST /api/prescriptions/create
 * GET /api/doctor/prescriptions
 * GET /api/doctor/analytics
 * PUT /api/doctor/profile
 *
 * DATABASE COLLECTIONS USED
 *
 * - Appointments
 * - Doctors
 * - Patients
 * - Medical Reports
 * - Analysis Reports
 * - Prescriptions
 * - Blockchain Records
 * - Reviews
 */
