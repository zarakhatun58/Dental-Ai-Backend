import express from "express";
import {
  createPayment,
  getAllPayments,
  updatePayment,
  deletePayment,
  createCheckoutSession,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", createPayment);
router.get("/", getAllPayments);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);
router.post('/create-checkout-session', createCheckoutSession);

export default router;
