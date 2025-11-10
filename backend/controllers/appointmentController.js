// ============ controllers/appointmentController.js ============
import Appointment from '../models/Appointment.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import User from '../models/User.js';

// ========== GENERATE AVAILABLE SLOTS ==========
const generateAvailableSlots = (availability, bookedSlots, targetDate) => {
  try {
    const date = new Date(targetDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

    // Find doctor's schedule for this day
    const daySchedule = availability.schedule.find(s => s.dayOfWeek === dayOfWeek && s.isActive);

    if (!daySchedule) return []; // Doctor doesn't work on this day

    // Check if date is a holiday
    if (availability.holidays.includes(targetDate)) return [];

    const slots = [];
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
    const duration = availability.slotDuration;

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0, 0);

    // Generate all possible slots
    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().slice(0, 5); // "HH:MM" format

      // Check if slot is already booked
      const isBooked = bookedSlots.includes(timeStr);

      // Check if slot is in skip list
      const isSkipped = availability.skipSlots?.some(skip =>
        skip.date === targetDate && skip.time === timeStr
      );

      if (!isBooked && !isSkipped) {
        slots.push(timeStr);
      }

      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }

    return slots;
  } catch (err) {
    console.error('Error generating slots:', err);
    return [];
  }
};

// ========== GET AVAILABLE SLOTS FOR A DOCTOR ==========
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date required' });
    }

    // Get doctor's availability
    const availability = await DoctorAvailability.findOne({ doctorId });
    if (!availability) {
      return res.status(404).json({ message: 'Doctor availability not set up' });
    }

    // Get booked appointments for this date
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: date,
      status: { $in: ['pending', 'confirmed'] }
    }).select('appointmentTime');

    const bookedSlots = bookedAppointments.map(apt => apt.appointmentTime);

    // Generate available slots
    const availableSlots = generateAvailableSlots(availability, bookedSlots, date);

    res.json({
      date,
      availableSlots,
      totalSlots: availableSlots.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== GET AVAILABLE DATES FOR NEXT 30 DAYS ==========
export const getAvailableDatesForMonth = async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId required' });
    }

    const availability = await DoctorAvailability.findOne({ doctorId });
    if (!availability) {
      return res.status(404).json({ message: 'Doctor availability not set up' });
    }

    const availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate dates for next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dateStr = date.toISOString().split('T')[0]; // "YYYY-MM-DD"

      // Get booked slots for this date
      const bookedAppointments = await Appointment.find({
        doctorId,
        appointmentDate: dateStr,
        status: { $in: ['pending', 'confirmed'] }
      }).countDocuments();

      const dayOfWeek = date.getDay();
      const daySchedule = availability.schedule.find(s => s.dayOfWeek === dayOfWeek && s.isActive);
      const isHoliday = availability.holidays.includes(dateStr);

      if (daySchedule && !isHoliday) {
        availableDates.push({
          date: dateStr,
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
          hasSlots: bookedAppointments < (availability.maxPatientsPerDay || 100) // Arbitrary high number if unlimited
        });
      }
    }

    res.json({ availableDates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== BOOK APPOINTMENT ==========
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reasonForVisit, consultationMode } = req.body;
    const patientId = req.userId; // From JWT

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    // Check if slot already booked (prevent race condition)
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    // Verify doctor's availability
    const availability = await DoctorAvailability.findOne({ doctorId });
    if (!availability) {
      return res.status(400).json({ message: 'Doctor availability not configured' });
    }

    const date = new Date(appointmentDate);
    const dayOfWeek = date.getDay();
    const daySchedule = availability.schedule.find(s => s.dayOfWeek === dayOfWeek && s.isActive);

    if (!daySchedule) {
      return res.status(400).json({ message: 'Doctor not available on this day' });
    }

    if (availability.holidays.includes(appointmentDate)) {
      return res.status(400).json({ message: 'Doctor on holiday this date' });
    }

    // Validate time is within working hours
    const [slotHour, slotMin] = appointmentTime.split(':').map(Number);
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

    const slotInMinutes = slotHour * 60 + slotMin;
    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;

    if (slotInMinutes < startInMinutes || slotInMinutes >= endInMinutes) {
      return res.status(400).json({ message: 'Time slot outside working hours' });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      reasonForVisit: reasonForVisit || '',
      consultationMode: consultationMode || 'in-person',
      consultationFee: doctor.consultationFee,
      status: 'pending'
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        doctor: doctor.name,
        fee: appointment.consultationFee,
        status: appointment.status
      }
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== UPDATE DOCTOR AVAILABILITY ==========
export const updateDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.userId; // From JWT
    const { schedule, slotDuration, holidays, breakTime, skipSlots, isBookingOpen, maxPatientsPerDay } = req.body;

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Valid schedule array required' });
    }

    // Verify doctor exists and is a doctor user type
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(400).json({ message: 'Only doctors can set availability' });
    }

    let availability = await DoctorAvailability.findOne({ doctorId });

    if (!availability) {
      availability = new DoctorAvailability({
        doctorId,
        schedule,
        slotDuration: slotDuration || 30,
        holidays: holidays || [],
        breakTime: breakTime || [],
        skipSlots: skipSlots || [],
        isBookingOpen: isBookingOpen !== undefined ? isBookingOpen : true,
        maxPatientsPerDay: maxPatientsPerDay || null
      });
    } else {
      availability.schedule = schedule;
      availability.slotDuration = slotDuration || availability.slotDuration;
      availability.holidays = holidays || availability.holidays;
      availability.breakTime = breakTime || availability.breakTime;
      availability.skipSlots = skipSlots || availability.skipSlots;
      availability.isBookingOpen = isBookingOpen !== undefined ? isBookingOpen : availability.isBookingOpen;
      availability.maxPatientsPerDay = maxPatientsPerDay !== undefined ? maxPatientsPerDay : availability.maxPatientsPerDay;
      availability.updatedAt = new Date();
    }

    await availability.save();

    res.json({
      message: 'Availability updated successfully',
      availability
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== GET DOCTOR'S OWN AVAILABILITY ==========
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.userId; // From JWT

    const availability = await DoctorAvailability.findOne({ doctorId });

    if (!availability) {
      return res.status(404).json({ message: 'No availability set yet' });
    }

    res.json({ availability });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== GET PATIENT'S APPOINTMENTS ==========
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.userId;
    const { status } = req.query;

    const query = { patientId };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization phone clinicAddress clinicLocation consultationFee')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== GET DOCTOR'S APPOINTMENTS ==========
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { status, date } = req.query;

    const query = { doctorId };
    if (status) query.status = status;
    if (date) query.appointmentDate = date;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name phone email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== CANCEL APPOINTMENT ==========
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId; // From JWT
    const { cancellationReason } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify user is either the patient or doctor
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if appointment can be cancelled
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past appointments' });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancelledBy = appointment.patientId.toString() === userId ? 'patient' : 'doctor';
    appointment.cancellationReason = cancellationReason || '';
    appointment.updatedAt = new Date();

    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== MARK APPOINTMENT AS COMPLETE ==========
export const markAppointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId; // From JWT

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId required' });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // ✅ UPDATED: Allow both patient AND doctor to mark as complete
    const isPatient = appointment.patientId.toString() === userId;
    const isDoctor = appointment.doctorId.toString() === userId;

    if (!isDoctor) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if already cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot mark cancelled appointments as complete' });
    }

    // Check if already completed
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Appointment already completed' });
    }

    // Update appointment status
    appointment.status = 'completed';
    appointment.updatedAt = new Date();

    await appointment.save();

    res.json({
      message: 'Appointment marked as completed',
      appointment
    });
  } catch (err) {
    console.error('Mark complete error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== SUBMIT RATING ==========
export const submitRating = async (req, res) => {
  try {
    const { doctorId, rating, review } = req.body;
    const patientId = req.userId; // From JWT

    if (!doctorId || !rating) {
      return res.status(400).json({ message: 'doctorId and rating required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Get doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    // Find the most recent appointment between this patient and doctor
    const appointment = await Appointment.findOne({
      patientId,
      doctorId,
      status: { $in: ['completed', 'pending', 'confirmed'] }
    }).sort({ appointmentDate: -1, appointmentTime: -1 });

    if (!appointment) {
      return res.status(404).json({ message: 'No appointment found' });
    }

    // Check if already rated
    if (appointment.isRated) {
      return res.status(400).json({ message: 'You have already rated this appointment' });
    }

    // Calculate new average rating
    const currentReviews = doctor.reviews || 0;
    const currentRating = doctor.rating || 0;

    const newTotalRating = currentRating * currentReviews + rating;
    const newReviewCount = currentReviews + 1;
    const newAverageRating = newTotalRating / newReviewCount;

    // Update doctor rating
    doctor.rating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal
    doctor.reviews = newReviewCount;
    await doctor.save();

    // Mark appointment as rated
    appointment.isRated = true;
    appointment.patientRating = rating;
    appointment.patientReview = review || null;
    appointment.updatedAt = new Date();
    await appointment.save();

    res.json({
      message: 'Rating submitted successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        rating: doctor.rating,
        reviews: doctor.reviews
      },
      appointment: {
        id: appointment._id,
        isRated: appointment.isRated
      }
    });
  } catch (err) {
    console.error('Rating error:', err);
    res.status(500).json({ message: err.message });
  }
};
// ========== CONFIRM APPOINTMENT (DOCTOR ONLY) ==========
export const confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const doctorId = req.userId; // From JWT

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId required' });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify user is the doctor
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if appointment can be confirmed
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot confirm cancelled appointments' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Appointment already completed' });
    }

    // Update appointment status
    appointment.status = 'confirmed';
    appointment.updatedAt = new Date();

    await appointment.save();

    res.json({
      message: 'Appointment confirmed successfully',
      appointment
    });
  } catch (err) {
    console.error('Confirm error:', err);
    res.status(500).json({ message: err.message });
  }
};
