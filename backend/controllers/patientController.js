// /backend/controllers/patientController.js (NEW)
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// Get doctor's patient statistics
export const getDoctorPatientStats = async (req, res) => {
  try {
    const doctorId = req.userId;

    // Get all unique patients for this doctor
    const appointments = await Appointment.find({
      doctorId: doctorId,
      status: { $in: ['pending', 'confirmed', 'completed'] }
    }).select('patientId');

    const patientIds = [...new Set(appointments.map(a => a.patientId.toString()))];

    const totalPatients = patientIds.length;
    const totalAppointments = appointments.length;

    res.json({
      totalPatients,
      totalAppointments,
      averageAppointmentsPerPatient: totalPatients > 0
        ? (totalAppointments / totalPatients).toFixed(2)
        : 0
    });
  } catch (err) {
    console.error('Get patient stats error:', err);
    res.status(500).json({ message: err.message });
  }
};
