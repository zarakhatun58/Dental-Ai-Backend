import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import patientRoutes from "./routes/patientRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@dental-ai.fsi3q7c.mongodb.net/`;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error", err);
  });



app.get("/", (req, res) => {
  res.send("API is running... on port 5000");
});

app.listen(PORT, () => {
console.log(`server running on ${PORT}`)
})

export default app;
