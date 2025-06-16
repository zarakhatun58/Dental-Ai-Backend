import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialty: String,
  email: String,
  phone: String,
    image: {
    type: String, // This will store the URL or file path of the image
    default: "",  // Optional default
  },
  availableDays: [String], // e.g., ['Monday', 'Wednesday']
  availableSlots: [String], // e.g., ['09:00', '10:00']
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
