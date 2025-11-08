// ============ controllers/authController.js ============

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, bloodType, allergies, latitude, longitude, address } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User exists' });

    user = new User({
      name, email, password, phone, userType: 'patient',
      dateOfBirth, bloodType, allergies,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address
      }
    });

    // Remove clinicLocation for patients (not needed)
    user.clinicLocation = undefined;

    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name, email, userType: 'patient' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, licenseNumber, experience, clinicAddress, consultationFee, latitude, longitude, address, clinicLatitude, clinicLongitude } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User exists' });

    user = new User({
      name, email, password, phone, userType: 'doctor',
      specialization, licenseNumber, experience, clinicAddress, consultationFee,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address
      },
      clinicLocation: {
        type: 'Point',
        coordinates: [clinicLongitude, clinicLatitude],
        address: clinicAddress
      }
    });

    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name, email, userType: 'doctor' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email, userType: user.userType }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verify = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getNearbyDoctors = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters (default 10km)

    const doctors = await User.find({
      userType: 'doctor',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    }).select('-password');

    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATED: Using LocationIQ instead of Nominatim
export const getAddressFromCoords = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    console.log('Address request:', { latitude, longitude });

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;

    if (!LOCATIONIQ_API_KEY) {
      console.error('LocationIQ API key not configured');
      return res.json({ address: 'Your Location' });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout to 8 seconds

    try {
      // LocationIQ Reverse Geocoding API
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Healthcare-App/1.0',
            'Accept': 'application/json'
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('LocationIQ response not ok:', response.status, await response.text());
        return res.json({ address: 'Your Location' });
      }

      const data = await response.json();
      console.log('LocationIQ data:', data);

      // Extract address from LocationIQ response
      const address = data.address?.city
        || data.address?.town
        || data.address?.village
        || data.address?.county
        || data.address?.state
        || 'Your Location';

      res.json({ address });

    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.log('LocationIQ fetch error:', fetchErr.message);

      // Return generic address on timeout or error
      res.json({ address: 'Your Location' });
    }

  } catch (err) {
    console.error('Address lookup error:', err.message);
    res.json({ address: 'Your Location' });
  }
};

export const getPlaceDetails = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    console.log('Place details request:', { lat, lon });

    res.json({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
  } catch (err) {
    console.error('Place Details Error:', err);
    res.status(500).json({ message: err.message });
  }
};
