import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { apiClient } from '../utils/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setDoctor } from '../redux/appointmentSlice';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  availableSlots: TimeSlot[];
  id?: string; // Added to support dropdown mapping
}

const AppointmentForm: React.FC<{ onAppointmentBooked: () => void }> = ({ onAppointmentBooked }) => {
  const dispatch: AppDispatch = useDispatch();
  const doctorFromState = useSelector((state: RootState) => state.appointment.doctor);
  const dateFromState = useSelector((state: RootState) => state.appointment.date);
  const [docId, setDocId] = useState("")

  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    timeSlot: '',
    purpose: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiClient.get('/doctors');
        const data = res.data.map((doc: any) => ({
          ...doc,
          id: doc._id // for dropdown compatibility
        }));
        setDoctors(data);
      } catch (err: any) {
        console.error('Failed to load doctors:', err);
        setError('Unable to fetch doctors. Please try again.');
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (dateFromState) {
      const formattedDate = dateFromState.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  }, [dateFromState]);

  const handleDoctorChange = (doctor: Doctor) => {
  const selectedDoctor = doctors.find(d => d.name.toLowerCase() === doctor.name.toLowerCase());
  if (selectedDoctor) {
    dispatch(setDoctor(selectedDoctor.name)); 
    setFormData(prev => ({
      ...prev,
      doctorId: selectedDoctor._id, 
      timeSlot: ''
    }));
  }
  setDocId(doctor._id);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log(docId);

    const selectedDoctor = doctors.find(
      (doc) => doc.name.toLowerCase() === doctorFromState.toLowerCase()
    );
    const doctorId = selectedDoctor?._id;

    // Prepare formData for submission
    const payload = {
      ...formData,
      doctorId: doctorId, // fallback to empty if not found
    };

    console.log("Submitting appointment form data:", payload);

    try {
      await apiClient.post('/appointments', payload);
      setFormData({ doctorId: '', date: '', timeSlot: '', purpose: '' });
      dispatch(setDoctor(''));
      onAppointmentBooked();
      alert('Appointment booked successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getAvailableTimeSlots = (): TimeSlot[] => {
    const selectedDoctor = doctors.find(d => d.name.toLowerCase() === doctorFromState.toLowerCase());
    if(dateFromState){
      formData.date = dateFromState?.toISOString().split('T')[0];
    }
    const selectedDate = new Date(formData.date);
    const day = selectedDate.getDay();
    return selectedDoctor?.availableSlots.filter(slot => slot.dayOfWeek === day) || [];
  };

  const formatTimeSlot = (slot: TimeSlot) => `${slot.startTime} - ${slot.endTime}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <User className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900">Book Appointment</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Doctor Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Doctor
          </label>
          <button
            type="button"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-left bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onClick={() => setShowDoctorDropdown(prev => !prev)}
          >
            {doctorFromState ? `Dr. ${doctorFromState}` : formData.doctorId ? `Dr. ${formData.doctorId}` : 'Choose a doctor'}
          </button>
          {showDoctorDropdown && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {doctors.map((doctor) => (
                <li
                  key={doctor.id}
                  onClick={() => {
                    handleDoctorChange(doctor);
                    setShowDoctorDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                >
                  Dr. {doctor.name} - {doctor.specialization}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Appointment Date
          </label>
          <input
            type="date"
            value={dateFromState ? dateFromState.toISOString().split('T')[0] : formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value, timeSlot: '' }))}
            min={getMinDate()}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Time Slot Selection */}
        {doctorFromState && dateFromState && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Available Time Slots
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getAvailableTimeSlots().map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, timeSlot: formatTimeSlot(slot) }))}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    formData.timeSlot === formatTimeSlot(slot)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {formatTimeSlot(slot)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Purpose/Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Visit / Symptoms
          </label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            rows={4}
            required
            placeholder="Describe your symptoms or reason for the appointment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Book Appointment'
          )}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;