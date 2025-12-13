# Altherix

A comprehensive telemedicine platform that connects patients with doctors through secure video calls, appointment scheduling, and blockchain-secured medical records.

## Features

- **User Authentication**: Secure login and registration for patients and doctors
- **Video Calls**: Real-time video consultations using WebRTC
- **Appointment Management**: Schedule and manage appointments
- **Medical Records**: Secure storage and access to patient medical records
- **Blockchain Integration**: Immutable transaction logging using Ethereum blockchain
- **Dashboard**: Separate dashboards for doctors and patients
- **Notifications**: Real-time notifications for appointments and updates
- **Responsive Design**: Mobile-friendly interface built with React and Tailwind CSS

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io (Real-time communication)
- JWT (Authentication)
- Bcrypt (Password hashing)
- Cloudinary (Image uploads)
- Ethers.js (Blockchain integration)

### Frontend
- React 19
- Vite
- Tailwind CSS
- DaisyUI
- Socket.io Client
- Simple Peer (WebRTC)
- Axios (HTTP client)
- React Router DOM

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd src
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the src directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ETHEREUM_PRIVATE_KEY=your_ethereum_private_key
   ETHEREUM_RPC_URL=your_ethereum_rpc_url
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173` (frontend) and backend at `http://localhost:5000` (or configured port).

## Usage

1. Register as a patient or doctor
2. Login to access your dashboard
3. Patients can search for doctors, book appointments, and join video calls
4. Doctors can manage their schedule, view patient records, and conduct consultations
5. All medical data is securely stored and blockchain-verified

## API Endpoints

The backend provides RESTful APIs for:
- Authentication (`/api/auth`)
- Appointments (`/api/appointments`)
- Medical Records (`/api/medical-records`)
- Dashboard (`/api/dashboard`)
- Notifications (`/api/notifications`)
- Patient management (`/api/patient`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.