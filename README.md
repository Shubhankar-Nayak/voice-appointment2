# Voice Appointment System

A full-stack TypeScript application that allows patients to book medical appointments using voice input, with separate dashboards for patients and doctors.

## Features

### Patient Features
- **Voice Input**: Use Web Speech API to describe symptoms and health concerns
- **Smart Matching**: Automatically suggests appropriate doctors based on voice input
- **Appointment Booking**: View available slots and book appointments
- **Appointment History**: Track all booked appointments and their status

### Doctor Features
- **Schedule Management**: Set available time slots for appointments
- **Appointment Overview**: View all patient appointments with details
- **Dashboard Analytics**: See appointment statistics and today's schedule

### Authentication
- JWT-based authentication system
- Separate registration for patients and doctors
- Role-based access control

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Web Speech API for voice recognition
- Axios for API communication
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled
- In-memory data storage

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with:
   ```
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   PORT=3001
   NODE_ENV=development
   ```

### Running the Application

1. Start both frontend and backend:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3001
   - Frontend development server on http://localhost:5173

2. Open your browser and navigate to http://localhost:5173

### Usage

#### First Time Setup

1. **Register as a Doctor**:
   - Select "Doctor" during registration
   - Fill in specialization (e.g., General Medicine, Cardiology)
   - Complete profile setup

2. **Set Doctor's Schedule**:
   - Login as doctor
   - Go to "Schedule" tab
   - Add available time slots for different days
   - Save the schedule

3. **Register as a Patient**:
   - Select "Patient" during registration
   - Complete profile setup

4. **Book Appointment as Patient**:
   - Use voice input to describe symptoms
   - Or manually fill the appointment form
   - Select doctor and available time slot
   - Submit appointment request

## Voice Recognition

The system uses the Web Speech API for voice recognition. Supported browsers:
- Chrome (recommended)
- Edge
- Safari (limited support)

### Voice Commands
- Describe symptoms naturally: "I have a headache and fever"
- Mention specific concerns: "chest pain", "stomach ache", "skin rash"
- The system will suggest appropriate doctors based on keywords

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id/slots` - Update doctor's available slots

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Get user's appointments

## Project Structure

```
├── server/
│   ├── index.ts              # Server entry point
│   ├── middleware/
│   │   └── auth.ts           # Authentication middleware
│   ├── models/
│   │   └── index.ts          # Data models and storage
│   └── routes/
│       ├── auth.ts           # Authentication routes
│       ├── doctors.ts        # Doctor management routes
│       └── appointments.ts   # Appointment routes
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx     # Login/Registration page
│   │   ├── PatientDashboard.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── VoiceInput.tsx    # Voice recognition component
│   │   └── AppointmentForm.tsx
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── utils/
│   │   └── api.ts            # API client configuration
│   └── App.tsx               # Main application component
```

## License

This project is licensed under the MIT License.