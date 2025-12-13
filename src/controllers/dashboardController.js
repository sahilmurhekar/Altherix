// ============ controllers/dashboardController.js ============

import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';

// ========== DOCTOR DASHBOARD STATISTICS ==========
export const getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.userId;

    // Total Appointments (all time)
    const totalAppointments = await Appointment.countDocuments({ doctorId });

    // Today's Appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      appointmentDate: today,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Total Patients (unique patients who have had appointments)
    const uniquePatients = await Appointment.distinct('patientId', { doctorId });
    const totalPatients = uniquePatients.length;

    // Pending Reports (medical records with pending blockchain status)
    const pendingReports = await MedicalRecord.countDocuments({
      doctorId,
      blockchainStatus: 'pending'
    });

    // Average Rating
    const doctor = await User.findById(doctorId).select('rating');
    const averageRating = doctor.rating || 0;

    // Monthly Income (sum of consultation fees for completed appointments this month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyIncomeResult = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          status: 'completed',
          createdAt: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$consultationFee' }
        }
      }
    ]);
    const monthlyIncome = monthlyIncomeResult.length > 0 ? monthlyIncomeResult[0].total : 0;

    res.json({
      totalAppointments,
      todayAppointments,
      totalPatients,
      pendingReports,
      averageRating,
      monthlyIncome
    });
  } catch (err) {
    console.error('Doctor dashboard stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== PATIENT DASHBOARD STATISTICS ==========
export const getPatientDashboardStats = async (req, res) => {
  try {
    const patientId = req.userId;

    // Upcoming Appointments
    const upcomingAppointments = await Appointment.countDocuments({
      patientId,
      appointmentDate: { $gte: new Date().toISOString().split('T')[0] },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Medical Records Count
    const medicalRecords = await MedicalRecord.countDocuments({ patientId });

    // Active Prescriptions (this would need a Prescription model - placeholder for now)
    // For now, we'll use a placeholder value
    const activePrescriptions = 0; // TODO: Implement when Prescription model is added

    // Last Consultation (most recent completed appointment)
    const lastConsultation = await Appointment.findOne({
      patientId,
      status: 'completed'
    })
    .sort({ appointmentDate: -1, appointmentTime: -1 })
    .select('appointmentDate')
    .lean();

    const lastConsultationDate = lastConsultation ? lastConsultation.appointmentDate : null;

    res.json({
      upcomingAppointments,
      medicalRecords,
      activePrescriptions,
      lastConsultation: lastConsultationDate
    });
  } catch (err) {
    console.error('Patient dashboard stats error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== DOCTOR'S TODAY'S SCHEDULE ==========
export const getDoctorTodaySchedule = async (req, res) => {
  try {
    const doctorId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: today,
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('patientId', 'name')
    .select('appointmentTime patientId reasonForVisit status')
    .sort({ appointmentTime: 1 })
    .lean();

    const schedule = appointments.map(apt => ({
      id: apt._id,
      patient: apt.patientId?.name || 'Unknown Patient',
      time: apt.appointmentTime,
      type: apt.reasonForVisit || 'Consultation',
      status: apt.status,
      reason: apt.reasonForVisit || 'Regular checkup'
    }));

    res.json({ schedule });
  } catch (err) {
    console.error('Doctor today schedule error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== PATIENT'S RECENT ACTIVITY ==========
export const getPatientRecentActivity = async (req, res) => {
  try {
    const patientId = req.userId;

    // Get recent appointments
    const recentAppointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialization')
      .select('appointmentDate status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent medical records
    const recentRecords = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name')
      .select('type description createdAt')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const activity = [];

    // Add appointment activities
    recentAppointments.forEach(apt => {
      activity.push({
        type: 'appointment',
        message: apt.status === 'completed'
          ? `Appointment completed with Dr. ${apt.doctorId?.name}`
          : `Appointment ${apt.status} with Dr. ${apt.doctorId?.name}`,
        date: apt.appointmentDate,
        timestamp: apt.createdAt
      });
    });

    // Add medical record activities
    recentRecords.forEach(record => {
      activity.push({
        type: record.type === 'test-analysis' ? 'report' : 'analysis',
        message: `${record.type === 'test-analysis' ? 'Medical report' : 'Doctor analysis'} uploaded`,
        date: record.createdAt.toISOString().split('T')[0],
        timestamp: record.createdAt
      });
    });

    // Sort by timestamp and take top 5
    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivity = activity.slice(0, 5);

    res.json({ recentActivity });
  } catch (err) {
    console.error('Patient recent activity error:', err);
    res.status(500).json({ message: err.message });
  }
};