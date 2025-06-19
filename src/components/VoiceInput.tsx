import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {  useDispatch } from 'react-redux';
import {  AppDispatch } from '../redux/store';
import { setDoctor, setDate, setTime } from '../redux/appointmentSlice';

interface VoiceInputProps {}

const VoiceInput: React.FC<VoiceInputProps> = () => {
  const dispatch: AppDispatch = useDispatch();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null); // Added state to store extracted data

  const recognition = useRef<SpeechRecognition | null>(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  async function extractWithGemini(transcription: string) {
    const prompt = `
      You are a helpful assistant that extracts appointment information.
      
      Input: "${transcription}"

      if the user inputs the name of the doctor then do not include 'Dr.' in the doctor_name for example doctor johnson should be taken as johnson only and not Dr. johnson
      
      Extract and return JSON in the following format:
      {
        "patient_name": "",
        "doctor_name": "",
        "date": "",
        "time": "",
        "purpose": ""
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Extract only valid JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (err) {
      console.error('Gemini output parsing error:', text);
      throw new Error('Invalid JSON output from Gemini');
    }
  }

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();

    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = 'en-US';

    recognition.current.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.current.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.current.onend = () => {
      setIsListening(false);
    };

    return true;
  };

  const startListening = () => {
    if (initializeSpeechRecognition()) {
      setTranscript('');
      recognition.current?.start();
    }
  };

  const stopListening = () => {
    recognition.current?.stop();
    setIsListening(false);

    if (transcript) {
      extractDataFromTranscript(transcript);
    }
  };

  const extractDataFromTranscript = async (text: string) => {
    try {
      // Extract data using Gemini API
      const extracted = await extractWithGemini(text);

      // If the extracted data is valid, update the states
      if (extracted) {
        const { doctor_name, date, time, purpose } = extracted;

        // Update the extracted data for display
        setExtractedData(extracted);

        // Dispatch actions to update Redux store
        if (doctor_name) {
          dispatch(setDoctor(doctor_name));
        }

        if (date) {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            parsedDate.setDate(parsedDate.getDate() + 1);
            dispatch(setDate(parsedDate)); // Set date in Redux
          }
        }

        if (time) {
          dispatch(setTime(time)); // Set time in Redux
        }
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      setError('There was an issue extracting the data. Please try again.');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
      <div className="text-center">
        <Volume2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Voice Input</h3>
        <p className="text-sm text-gray-600 mb-6">
          Describe your symptoms or health concerns by speaking. We'll help match you with the right doctor.
        </p>

        <div className="flex justify-center space-x-4 mb-6">
          {!isListening ? (
            <button
              onClick={startListening}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <Mic className="h-5 w-5" />
              <span>Start Speaking</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors animate-pulse"
            >
              <MicOff className="h-5 w-5" />
              <span>Stop Listening</span>
            </button>
          )}

          {transcript && (
            <button
              onClick={clearTranscript}
              className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isListening && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">🎤 Listening... Speak clearly about your symptoms</p>
          </div>
        )}

        {transcript && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
            <h4 className="font-medium text-gray-900 mb-2">What you said:</h4>
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}

        {extractedData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-left">
            <h4 className="font-medium text-gray-900 mb-3">Extracted Information:</h4>
            <div className="space-y-2 text-sm">
              {extractedData.doctor_name && (
                <div>
                  <span className="font-medium text-gray-700">Recommended Doctor:</span>
                  <p className="text-gray-600 mt-1">{extractedData.doctor_name}</p>
                </div>
              )}
              {extractedData.date && (
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-600 mt-1">{new Date(extractedData.date).toLocaleDateString()}</p>
                </div>
              )}
              {extractedData.time && (
                <div>
                  <span className="font-medium text-gray-700">Time:</span>
                  <p className="text-gray-600 mt-1">{extractedData.time}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
