import React, { useState, useEffect } from 'react';
import { User, Doctor, Appointment } from '../types';
import { LogOut, Calendar,  User as UserIcon } from 'lucide-react';
import { apiClient } from '../utils/api';
import VoiceInput from './VoiceInput';
import AppointmentForm from './AppointmentForm';
import { socket } from '../utils/socket';

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'appointments'>('book');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

useEffect(() => {
  fetchDoctors();
  fetchAppointments();

  socket.on('appointmentBooked', (newAppointment) => {
    if (newAppointment.patientId === user.id) {
      setAppointments((prev) => [...prev, newAppointment]);
    }
  });

 socket.on('scheduleUpdated', ({ doctorId, doctorName }) => {
  console.log(`Schedule updated for Dr. ${doctorName}`);
  fetchDoctors(); // Refresh doctor data including available slots
});
  return () => {
    socket.off('appointmentBooked');
    socket.off('scheduleUpdated');
  };
}, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleAppointmentBooked = () => {
    fetchAppointments();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome, {user.name}</h1>
                <p className="text-sm text-gray-600">Patient Dashboard</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('book')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'book'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Book Appointment</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>My Appointments</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'book' ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Book New Appointment</h2>
                  <p className="text-gray-600 mb-6">Use voice input to describe your symptoms or manually fill the form</p>
                </div>
                
                <VoiceInput />
                
                <div className="border-t pt-6">
                  <AppointmentForm 
                    onAppointmentBooked={handleAppointmentBooked}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">My Appointments</h2>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by booking your first appointment.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
                            <p className="text-sm text-gray-600">{appointment.doctorSpecialization}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.date} at {appointment.timeSlot}
                            </p>
                            <p className="text-sm text-gray-800 mt-2">
                              <span className="font-medium">Purpose:</span> {appointment.purpose}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;