"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatient = exports.getAllPatients = void 0;
const Patient_1 = require("../models/Patient");
// Get all patients
const getAllPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patients = yield Patient_1.Patient.find();
        res.json(patients);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching patients", error: err });
    }
});
exports.getAllPatients = getAllPatients;
// Add a new patient
const createPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPatient = new Patient_1.Patient(req.body);
        const savedPatient = yield newPatient.save();
        res.status(201).json(savedPatient);
    }
    catch (err) {
        res.status(500).json({ message: "Error adding patient", error: err });
    }
});
exports.createPatient = createPatient;
