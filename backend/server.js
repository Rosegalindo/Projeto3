// ====================================
// AMAKHA PARIS
// BACKEND
// ====================================

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

require("dotenv").config();

const app = express();

const {
    MercadoPagoConfig,
    Preference,
    Payment
} = require("mercadopago");

const mp = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

const payment = new Payment(mp);

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
// PROCESSAR PAGAMENTO COM CARTÃO
// ====================================

app.post("/processar-pagamento", async (req, res) => {

    try {

        console.log("💳 Recebendo pagamento...");

        const {
            transaction_amount,
            token,
            description,
            installments,
            payment_method_id,
            issuer_id,
            payer
        } = req.body;

        console.log("Valor:", transaction_amount);
        console.log("Parcelas:", installments);
        console.log("Método:", payment_method_id);

        const resultado = await payment.create({

            body: {

                transaction_amount: Number(transaction_amount),

                token,

                description,

                installments: Number(installments),

                payment_method_id,

                issuer_id,

                payer: {

                    email: payer.email,

                    identification: payer.identification

                }

            },

            requestOptions: {

                idempotencyKey:
                    crypto.randomUUID()

            }

        });

        console.log("====== PAGAMENTO MERCADO PAGO ======");
        console.log(resultado);

        res.json({

            sucesso: true,

            id: resultado.id,

            status: resultado.status,

            status_detail: resultado.status_detail

        });

    } catch (erro) {

        console.error(
            "❌ Erro ao processar pagamento:",
            erro
        );

        res.status(500).json({

            sucesso: false,

            erro: erro.message

        });

    }

});

// ====================================
// WEBHOOK MERCADO PAGO
// ====================================

app.post("/webhook/mercado-pago", async (req, res) => {

    console.log("");
    console.log("====================================");
    console.log("🔔 WEBHOOK MERCADO PAGO RECEBIDO");
    console.log("====================================");

    console.log("Body recebido:");
    console.log(req.body);

    try {

        // ID do pagamento enviado pelo Mercado Pago
        const paymentId =
            req.body?.data?.id ||
            req.query["data.id"];

        console.log("💰 ID do pagamento:", paymentId);

        // Se não veio ID, não temos o que consultar
        if (!paymentId) {

            console.log(
                "⚠️ Webhook recebido sem ID de pagamento."
            );

            return res.sendStatus(200);
        }

        // ====================================
        // CONSULTAR PAGAMENTO NO MERCADO PAGO
        // ====================================

        const pagamento =
            await payment.get({
                id: paymentId
            });

        console.log("");
        console.log("====== PAGAMENTO CONSULTADO ======");
        console.log("ID:", pagamento.id);
        console.log("Status:", pagamento.status);
        console.log(
            "Status detalhe:",
            pagamento.status_detail
        );
        console.log(
            "Valor:",
            pagamento.transaction_amount
        );

        // ====================================
        // VERIFICAR STATUS
        // ====================================

        if (pagamento.status === "approved") {

            console.log("");
            console.log("====================================");
            console.log("✅ PAGAMENTO APROVADO PELO MERCADO PAGO");
            console.log("====================================");

            // Aqui será feita a atualização
            // definitiva do pedido para PAGO.

        }

        if (pagamento.status === "rejected") {

            console.log(
                "❌ Pagamento rejeitado."
            );

        }

        if (pagamento.status === "pending") {

            console.log(
                "⏳ Pagamento pendente."
            );

        }

        // Mercado Pago precisa receber 200
        res.sendStatus(200);

    } catch (erro) {

        console.error(
            "❌ Erro ao processar Webhook:",
            erro
        );

        res.sendStatus(500);
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