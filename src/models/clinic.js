// Clinic Schema


import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
    {
  name: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  phone: String,
  services: [String],
  coordinates: { lat: Number, lng: Number },
   schedule: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
  }
})
const Clinic = mongoose.model("Clinic", clinicSchema);
export default Clinic;