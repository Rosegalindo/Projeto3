// ====================================
// AMAKHA PARIS
// BACKEND
// ====================================

const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

const {
    MercadoPagoConfig,
    Preference
} = require("mercadopago");

const mp = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

const PORT = 3000;

// ====================================
// MIDDLEWARES
// ====================================

app.use(cors());

app.use(express.json());

// ====================================
// ROTA DE TESTE
// ====================================

app.get("/", (req, res) => {

    res.json({
        sucesso: true,
        mensagem: "Backend Amakha Paris funcionando!"
    });

});

// ====================================
// TESTE MERCADO PAGO
// ====================================

app.get("/teste-mercado-pago", (req, res) => {

    res.json({
        sucesso: true,
        mensagem: "Mercado Pago configurado no backend!"
    });

});

// ====================================
// TESTE CHECKOUT PRO
// ====================================

app.get("/criar-pagamento-teste", async (req, res) => {

    try {

        const preference = new Preference(mp);

        const resultado = await preference.create({

            body: {

                items: [

                    {
                        title: "Produto Teste Amakha Paris",
                        quantity: 1,
                        unit_price: 10
                    }

                ]

            }

        });

        console.log("Preference criada:");
        console.log(resultado);

        res.json({

            sucesso: true,

            id: resultado.id,

            checkout: resultado.init_point

        });

    } catch (erro) {

        console.error(
            "Erro ao criar pagamento:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro: erro.message

        });

    }

});

// ====================================
// INICIAR SERVIDOR
// ====================================

app.listen(PORT, () => {

    console.log(
        `🚀 Backend iniciado em http://localhost:${PORT}`
    );

});