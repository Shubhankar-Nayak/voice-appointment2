import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 8000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Helper: run Gemini prompt
 */
async function extractWithGemini(transcription: string) {
  const prompt = `
You are a helpful assistant that extracts appointment information.

Input: "${transcription}"

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
    console.error("Gemini output parsing error:", text);
    throw new Error("Invalid JSON output from Gemini");
  }
}

/**
 * POST /extract-form-data
 */
app.post('/extract-form-data', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    // STEP 1: Transcribe audio using external Python service or Whisper API (you can replace this)
    // Simulating with fake transcript for now
    const fakeTranscript = "Book an appointment for Jane Doe with Dr. Patel on 22nd June at 10:30 AM for a general checkup.";

    // STEP 2: Use Gemini to extract fields
    const extractedData = await extractWithGemini(fakeTranscript);

    res.json(extractedData);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to extract data' });
  } finally {
    // Clean up uploaded file
    if (file?.path) fs.unlinkSync(file.path);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});