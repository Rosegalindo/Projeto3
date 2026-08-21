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
// PEDIDOS EM MEMÓRIA
// ====================================

const pedidos = new Map();

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
// CRIAR PREFERENCE - CHECKOUT PRO
// ====================================

app.post("/criar-preferencia", async (req, res) => {

    try {

        console.log("");
        console.log("====================================");
        console.log("🛒 CRIANDO PREFERENCE CHECKOUT PRO");
        console.log("====================================");

        const {
            numero,
            produtos,
            valores
        } = req.body;

        console.log("Pedido:", numero);
        console.log("Produtos:", produtos);
        console.log("Valores:", valores);

        // ====================================
        // VALIDAR PEDIDO
        // ====================================

        if (!numero) {

            return res.status(400).json({

                sucesso: false,

                erro: "Número do pedido não informado."

            });

        }

        if (
            !Array.isArray(produtos) ||
            produtos.length === 0
        ) {

            return res.status(400).json({

                sucesso: false,

                erro: "Nenhum produto informado."

            });

        }

        // ====================================
        // REGISTRAR PEDIDO NO BACKEND
        // ====================================

            const pedido = {

                numero,

                produtos,

                valores,

                status: "AGUARDANDO_PAGAMENTO",

                criadoEm: new Date().toISOString()

            };

            pedidos.set(
                numero,
                pedido
            );

            console.log("");
            console.log("====================================");
            console.log("📦 PEDIDO REGISTRADO NO BACKEND");
            console.log("====================================");

            console.log("Número:", numero);
            console.log("Status:", pedido.status);

        // ====================================
        // TRANSFORMAR PRODUTOS
        // ====================================

        const items = produtos.map(produto => ({

            title: produto.nome,

            quantity: Number(produto.quantidade),

            unit_price: Number(produto.preco),

            currency_id: "BRL"

        }));

        // ====================================
        // CRIAR PREFERENCE
        // ====================================

        const preference = new Preference(mp);

        const resultado = await preference.create({

            body: {

                items,

                external_reference: numero,

                notification_url:
                    process.env.MP_WEBHOOK_URL,

           back_urls: {

            success:
                process.env.MP_SUCCESS_URL,

            failure:
                process.env.MP_FAILURE_URL,

            pending:
                process.env.MP_PENDING_URL

        },

        auto_return: "approved"

    }

});

        console.log("");
        console.log("====== PREFERENCE CRIADA ======");
        console.log("ID:", resultado.id);
        console.log("Checkout:", resultado.init_point);
        console.log(
            "External Reference:",
            numero
        );

        // ====================================
        // SALVAR ID DA PREFERENCE NO PEDIDO
        // ====================================

        pedido.preferenceId =
            resultado.id;

        pedidos.set(
            numero,
            pedido
        );

        console.log(
            "Preference ID salvo:",
            pedido.preferenceId
        );

        // ====================================
        // RESPONDER FRONTEND
        // ====================================

        res.json({

            sucesso: true,

            id: resultado.id,

            checkout: resultado.init_point,

            external_reference: numero

        });

    } catch (erro) {

        console.error(
            "❌ Erro ao criar Preference:",
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
// CONSULTAR STATUS DO PEDIDO
// ====================================

app.get("/pedido/:numero/status", (req, res) => {

    const numero =
        req.params.numero;

    console.log("");
    console.log("====================================");
    console.log("📦 CONSULTANDO STATUS DO PEDIDO");
    console.log("====================================");

    console.log(
        "Pedido:",
        numero
    );

    const pedido =
        pedidos.get(numero);

    // ====================================
    // PEDIDO NÃO ENCONTRADO
    // ====================================

    if (!pedido) {

        console.log(
            "⚠️ Pedido não encontrado."
        );

        return res.status(404).json({

            sucesso: false,

            erro: "Pedido não encontrado."

        });

    }

    // ====================================
    // RETORNAR STATUS
    // ====================================

    console.log(
        "Status:",
        pedido.status
    );

    console.log(
        "Pagamento:",
        pedido.pagamentoId || null
    );

    res.json({

        sucesso: true,

        numero: pedido.numero,

        status: pedido.status,

        pagamentoId:
            pedido.pagamentoId || null,

        statusPagamento:
            pedido.statusPagamento || null,

        statusDetalhe:
            pedido.statusDetalhe || null

    });

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

    // ====================================
    // RESPONDER IMEDIATAMENTE
    // ====================================

    res.sendStatus(200);

    try {

        // ====================================
        // IDENTIFICAR TIPO DE NOTIFICAÇÃO
        // ====================================

        const tipoEvento =
            req.body?.type ||
            req.query?.type ||
            req.body?.topic ||
            req.query?.topic;

        const action =
            req.body?.action;

        console.log("Tipo de evento:", tipoEvento);
        console.log("Action:", action);

        // ====================================
        // PEGAR ID DO PAGAMENTO
        // ====================================

        const paymentId =
            req.body?.data?.id ||
            req.query?.["data.id"] ||
            (
                tipoEvento === "payment"
                    ? req.body?.resource
                    : null
            );

        console.log("💰 ID do pagamento:", paymentId);

        // ====================================
        // IGNORAR EVENTOS QUE NÃO SÃO PAGAMENTO
        // ====================================

        if (
            tipoEvento !== "payment" &&
            action !== "payment.created" &&
            action !== "payment.updated"
        ) {

            console.log(
                "ℹ️ Evento ignorado. Não é uma notificação de pagamento."
            );

            return;
        }

        // ====================================
        // SE NÃO TEM ID, ENCERRAR
        // ====================================

        if (!paymentId) {

            console.log(
                "⚠️ Notificação de pagamento sem ID."
            );

            return;
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

        console.log(
            "External Reference:",
            pagamento.external_reference
        );

        // ====================================
        // LOCALIZAR PEDIDO
        // ====================================

        const numeroPedido =
            pagamento.external_reference;

        const pedido =
            pedidos.get(numeroPedido);

        console.log(
            "📦 Pedido localizado:",
            numeroPedido
        );

        // ====================================
        // VERIFICAR SE O PEDIDO EXISTE
        // ====================================

        if (!pedido) {

            console.log(
                "⚠️ Pedido não encontrado no backend."
            );

            return;
        }

        // ====================================
        // PAGAMENTO APROVADO
        // ====================================

        if (pagamento.status === "approved") {

            console.log("");
            console.log("====================================");
            console.log("✅ PAGAMENTO APROVADO PELO MERCADO PAGO");
            console.log("====================================");

            pedido.status = "PAGO";

            pedido.pagamentoId =
                pagamento.id;

            pedido.statusPagamento =
                pagamento.status;

            pedido.statusDetalhe =
                pagamento.status_detail;

            pedido.valorPago =
                pagamento.transaction_amount;

            pedido.dataPagamento =
                new Date().toISOString();

            pedidos.set(
                numeroPedido,
                pedido
            );

            console.log("");
            console.log("====================================");
            console.log("🎉 PEDIDO ATUALIZADO PARA PAGO");
            console.log("====================================");

            console.log(
                "Pedido:",
                numeroPedido
            );

            console.log(
                "Status:",
                pedido.status
            );

            console.log(
                "Pagamento:",
                pedido.pagamentoId
            );

        }

        // ====================================
        // PAGAMENTO REJEITADO
        // ====================================

        else if (pagamento.status === "rejected") {

            pedido.status =
                "PAGAMENTO_REJEITADO";

            pedido.pagamentoId =
                pagamento.id;

            pedido.statusPagamento =
                pagamento.status;

            pedidos.set(
                numeroPedido,
                pedido
            );

            console.log(
                "❌ Pagamento rejeitado."
            );

        }

        // ====================================
        // PAGAMENTO PENDENTE
        // ====================================

        else if (pagamento.status === "pending") {

            pedido.status =
                "PAGAMENTO_PENDENTE";

            pedido.pagamentoId =
                pagamento.id;

            pedido.statusPagamento =
                pagamento.status;

            pedidos.set(
                numeroPedido,
                pedido
            );

            console.log(
                "⏳ Pagamento pendente."
            );

        }

        // ====================================
        // OUTROS STATUS
        // ====================================

        else {

            console.log(
                "ℹ️ Status recebido:",
                pagamento.status
            );

        }

    } catch (erro) {

        console.error(
            "❌ Erro ao processar Webhook:",
            erro
        );

    }

});

// ====================================
// RETORNOS DO CHECKOUT PRO
// ====================================

// PAGAMENTO APROVADO
app.get("/pagamento-aprovado", (req, res) => {

    console.log("");
    console.log("====================================");
    console.log("✅ RETORNO: PAGAMENTO APROVADO");
    console.log("====================================");

    console.log("Payment ID:", req.query.payment_id);
    console.log("Status:", req.query.status);
    console.log(
        "External Reference:",
        req.query.external_reference
    );

    res.send(`
        <h1>Pagamento aprovado!</h1>
        <p>Seu pagamento foi aprovado pelo Mercado Pago.</p>
        <p>Pedido: ${req.query.external_reference || "-"}</p>
        <p>Pagamento: ${req.query.payment_id || "-"}</p>
    `);

});


// PAGAMENTO FALHOU
app.get("/pagamento-falhou", (req, res) => {

    console.log("");
    console.log("====================================");
    console.log("❌ RETORNO: PAGAMENTO FALHOU");
    console.log("====================================");

    console.log("Payment ID:", req.query.payment_id);
    console.log("Status:", req.query.status);

    res.send(`
        <h1>Pagamento não aprovado</h1>
        <p>Não foi possível concluir o pagamento.</p>
        <p>Você pode tentar novamente.</p>
    `);

});


// PAGAMENTO PENDENTE
app.get("/pagamento-pendente", (req, res) => {

    console.log("");
    console.log("====================================");
    console.log("⏳ RETORNO: PAGAMENTO PENDENTE");
    console.log("====================================");

    console.log("Payment ID:", req.query.payment_id);
    console.log("Status:", req.query.status);

    res.send(`
        <h1>Pagamento pendente</h1>
        <p>Seu pagamento ainda está sendo processado.</p>
        <p>Aguarde a confirmação do Mercado Pago.</p>
    `);

});

// ====================================
// INICIAR SERVIDOR
// ====================================

app.listen(PORT, () => {

    console.log(
        `🚀 Backend iniciado em http://localhost:${PORT}`
    );

});