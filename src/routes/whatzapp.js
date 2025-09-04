import express from 'express';
import { sendCodeWhatzapp, verifyCodeSend } from '../controllers/WhatzappController.js';

const router = express.Router();

router.post('/send-code', async (req, res) => {
    const { number } = req.body;
    try {
        const result = await sendCodeWhatzapp(number);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/verify-code', async (req, res) => {
    const { number, code } = req.body;
    try {
        const result = await verifyCodeSend(number, code);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/verifyNumber", async (req, res) => {
  try {
    const { number } = req.body;
    const response = await usersController.verifyNumber(number);
    res.status(200).json({ success: true, message: 'Código de verificação enviado com sucesso.', response });
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verifyCode", async (req, res) => {
  try {
    const { number, code } = req.body;
    const otps = await usersController.verifyCode(number, code);
    return res.status(200).json({ ...otps, success: true, message: 'Código verificado com sucesso.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default router;