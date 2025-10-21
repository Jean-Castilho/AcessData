import express from 'express';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Payment } from 'mercadopago';

dotenv.config();

const router = express.Router();
router.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

router.post('/gerar-pix', async (req, res) => {

  const {valor} = req.body;
  if (!valor) {
    return res.status(400).json({ error: 'O campo "valor" é obrigatório.' });
  }
  const data = { email: "jeancastilho646@gmail.com", nome:"jean", sobrenome:"castilho", cpf: 17984881758 }

  const valorInteiro = parseFloat(valor).toFixed(2) ;

  const payment_data = {
    transaction_amount: parseFloat(valorInteiro),
    description: 'Pagamento PIX',
    payment_method_id: 'pix',
    payer: {
      email: data.email,
      first_name: data.nome,
      last_name: data.sobrenome,
      identification: {
        type: 'CPF',
        number: data.cpf,
      },
    },
  };

  try {
    const payment = new Payment(client);
    const result = await payment.create({ body: payment_data });

    const { qr_code, qr_code_base64 } = result.point_of_interaction.transaction_data;

    return res.json({
      id: result.id,
      qr_code,
      qr_code_base64,
    });

  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }

});

router.get('/consultar-pix/:id', async (req, res) => {

  const { id } = req.params;
  try {
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id });
    return res.json({ status: paymentInfo.status });
  } catch (error) {
    console.error('Erro ao consultar PIX:', error);
    res.status(500).json({ error: 'Erro ao consultar PIX' });
  }

});

export default router;