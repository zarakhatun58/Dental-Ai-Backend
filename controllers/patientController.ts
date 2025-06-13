import { Request, Response } from "express";
import { Patient } from "../models/Patient";

// Get all patients
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching patients", error: err });
  }
};

// Add a new patient
export const createPatient = async (req: Request, res: Response) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(500).json({ message: "Error adding patient", error: err });
  }
};
