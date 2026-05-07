import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();

let orderNumber = 1;

app.use(cors());
app.use(express.json());

/* 🧪 TEST SIMPLE */
app.get("/test", (req, res) => {
  res.json({
    ok: true,
    message: "backend funcionando"
  });
});

/* 💳 CHECKOUT REAL */
app.post("/checkout", async (req, res) => {
  const { nombre, direccion, cp, email } = req.body;

  try {

    /* 🛒 CREAR PAGO MERCADO PAGO */
    const mpResponse = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      {
        items: [
          {
            title: "Producto tienda",
            quantity: 1,
            unit_price: 69999
          }
        ],

        back_urls: {
          success: "https://tu-tienda.com/success"
        },

        auto_return: "approved"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    /* 📧 ENVIAR MAIL */
    await resend.emails.send({
      from: "onboarding@resend.dev",

      to: "benjamingmedinadiaz@gmail.com",

      subject: `🛒 Nueva compra #${orderNumber}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          background: #f4f4f4;
          padding: 30px;
        ">
          
          <div style="
            max-width: 600px;
            margin: auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          ">

            <div style="
              background: black;
              color: white;
              padding: 20px;
              text-align: center;
            ">
              <h1 style="margin:0;">
                🛒 Nueva compra #${orderNumber}
              </h1>
            </div>

            <div style="padding: 30px;">

              <p style="font-size:16px;">
                Se recibió un nuevo pedido en la tienda.
              </p>

              <hr style="margin:20px 0;" />

              <p><strong>👤 Cliente:</strong> ${nombre}</p>

              <p><strong>📧 Email:</strong> ${email}</p>

              <p><strong>📍 Dirección:</strong> ${direccion}</p>

              <p><strong>📮 Código Postal:</strong> ${cp}</p>

              <hr style="margin:20px 0;" />

              <p style="
                color: gray;
                font-size: 14px;
              ">
                Pedido generado automáticamente desde tu tienda online.
              </p>

            </div>
          </div>
        </div>
      `
    });

    /* 🚀 REDIRIGIR A MERCADO PAGO */
    res.json({
      init_point: mpResponse.data.init_point
    });

    /* 🔢 SUMAR NUMERO DE PEDIDO */
    orderNumber++;

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "error backend"
    });

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});