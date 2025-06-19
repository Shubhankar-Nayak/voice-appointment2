import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state type
interface AppointmentState {
  doctor: string;
  date: Date | undefined;
  time: string;
}

// Define the initial state
const initialState: AppointmentState = {
  doctor: '',
  date: undefined,
  time: '',
};

// Create the slice
const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setDoctor: (state, action: PayloadAction<string>) => {
      state.doctor = action.payload;
    },
    setDate: (state, action: PayloadAction<Date | undefined>) => {
      state.date = action.payload;
    },
    setTime: (state, action: PayloadAction<string>) => {
      state.time = action.payload;
    },
    resetAppointment: () => initialState, // Optional: for resetting appointment data
  },
});

// Export actions
export const { setDoctor, setDate, setTime, resetAppointment } = appointmentSlice.actions;

// Export the reducer
export default appointmentSlice.reducer;
