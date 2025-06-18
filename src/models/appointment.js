import mongoose from "mongoose";

// const appointmentSchema = new mongoose.Schema({
//   patient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Patient",
//     required: true,
//   },
//   doctor: {
//     type: String,
//     required: true,
//   },
//   appointmentDate: {
//     type: Date,
//     required: true,
//   },
//   reason: {
//     type: String,
//     default: "",
//   },
//   status: {
//     type: String,
//     enum: ["Scheduled", "Completed", "Cancelled"],
//     default: "Scheduled",
//   },
//   time: {
//   type: String,
//   required: true
// },
// }, { timestamps: true });


const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
