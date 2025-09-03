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

export default router;