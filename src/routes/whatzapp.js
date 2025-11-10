import express from "express";
import {
  sendCodeWhatzapp,
  updatStatusOrder
} from "../controllers/WhatzappController.js";
import { verifyCode } from "../services/otpCodeService.js";





const router = express.Router();

router.post("/send-code", async (req, res) => {
  const { number } = req.body;
  try {
    const result = await sendCodeWhatzapp(number);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/send-code/deliveryd", async (req, res) => {
  const { number } = req.body;
  try {

    const result = await sendCodeWhatzapp(number);

    const statusDeliveridOrder = await updatStatusOrder(number);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


router.post("/verifyCode", async (req, res) => {
  try {
    const { number, code } = req.body;
    const otps = await verifyCode(number, code);
    return res
      .status(200)
      .json({
        ...otps,
        success: true,
        message: "Código verificado com sucesso.",
      });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
