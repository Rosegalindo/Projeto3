// ====================================
// AMAKHA PARIS
// BACKEND - CHECKOUT PRO MERCADO PAGO
// ====================================

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();

const {
    MercadoPagoConfig,
    Preference,
    Payment
} = require("mercadopago");

// ====================================
// MERCADO PAGO
// ====================================

if (!process.env.MP_ACCESS_TOKEN) {

    console.error(
        "❌ ERRO: MP_ACCESS_TOKEN não foi encontrado no .env"
    );

    process.exit(1);

}

const mp = new MercadoPagoConfig({

    accessToken: process.env.MP_ACCESS_TOKEN

});

const payment = new Payment(mp);

const PORT = 3000;


// ====================================
// PEDIDOS
// ====================================

const arquivoPedidos =
    path.join(__dirname, "pedidos.json");

let pedidos = new Map();


// ====================================
// CARREGAR PEDIDOS
// ====================================

if (fs.existsSync(arquivoPedidos)) {

    try {

        const dados =
            fs.readFileSync(
                arquivoPedidos,
                "utf8"
            );

        const pedidosSalvos =
            JSON.parse(dados);

        pedidos =
            new Map(pedidosSalvos);

        console.log(
            `📂 ${pedidos.size} pedido(s) carregado(s).`
        );

    } catch (erro) {

        console.error(
            "❌ Erro ao carregar pedidos:",
            erro
        );

    }

}


// ====================================
// SALVAR PEDIDOS
// ====================================

function salvarPedidos() {

    try {

        const dados =
            Array.from(
                pedidos.entries()
            );

        fs.writeFileSync(

            arquivoPedidos,

            JSON.stringify(
                dados,
                null,
                2
            ),

            "utf8"

        );

        console.log("💾 Pedidos salvos.");

    } catch (erro) {

        console.error(
            "❌ Erro ao salvar pedidos:",
            erro
        );

    }

}


// ====================================
// MIDDLEWARES
// ====================================

app.use(cors());

app.use(
    express.json()
);


// ====================================
// ROTA PRINCIPAL
// ====================================

app.get("/", (req, res) => {

    res.json({

        sucesso: true,

        mensagem:
            "Backend Amakha Paris funcionando!"

    });

});


// ====================================
// TESTE MERCADO PAGO
// ====================================

app.get(
    "/teste-mercado-pago",
    (req, res) => {

        res.json({

            sucesso: true,

            mensagem:
                "Mercado Pago configurado!"

        });

    }
);


// ====================================
// CRIAR PREFERENCE
// ====================================

app.post(
    "/criar-preferencia",
    async (req, res) => {

        try {

            console.log("");
            console.log(
                "===================================="
            );
            console.log(
                "🛒 CRIANDO CHECKOUT PRO"
            );
            console.log(
                "===================================="
            );


            const {

                numero,
                produtos,
                valores

            } = req.body;


            console.log(
                "Pedido:",
                numero
            );

            console.log(
                "Produtos:",
                produtos
            );

            console.log(
                "Valores:",
                valores
            );


            // ====================================
            // VALIDAR PEDIDO
            // ====================================

            if (!numero) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Número do pedido não informado."

                });

            }


            if (
                !Array.isArray(produtos) ||
                produtos.length === 0
            ) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Nenhum produto informado."

                });

            }


            // ====================================
            // TRANSFORMAR PRODUTOS
            // ====================================

            const items =
                produtos.map(produto => ({

                    title:
                        produto.nome,

                    quantity:
                        Number(
                            produto.quantidade
                        ),

                    unit_price:
                        Number(
                            produto.preco
                        ),

                    currency_id:
                        "BRL"

                }));


            console.log("");
            console.log(
                "Itens enviados ao Mercado Pago:"
            );

            console.log(items);


            // ====================================
            // REGISTRAR PEDIDO
            // ====================================

            const pedido = {

                numero,

                produtos,

                valores,

                status:
                    "AGUARDANDO_PAGAMENTO",

                criadoEm:
                    new Date().toISOString()

            };


            pedidos.set(
                numero,
                pedido
            );

            salvarPedidos();


            // ====================================
            // CRIAR PREFERENCE
            // ====================================

            const preference =
                new Preference(mp);


            const resultado =
                await preference.create({

                    body: {

                        items,

                        external_reference:
                            numero,

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

                        auto_return:
                            "approved"

                    }

                });


            // ====================================
            // VERIFICAR CHECKOUT
            // ====================================

            console.log("");
            console.log(
                "===================================="
            );

            console.log(
                "✅ PREFERENCE CRIADA"
            );

            console.log(
                "===================================="
            );

            console.log(
                "ID:",
                resultado.id
            );

            console.log(
                "Checkout:",
                resultado.init_point
            );


            // ====================================
            // SALVAR PREFERENCE
            // ====================================

            pedido.preferenceId =
                resultado.id;

            pedido.checkout =
                resultado.init_point;


            pedidos.set(
                numero,
                pedido
            );

            salvarPedidos();


            // ====================================
            // RESPONDER FRONTEND
            // ====================================

            return res.json({

                sucesso: true,

                numero:

                    numero,

                id:

                    resultado.id,

                checkout:

                    resultado.init_point,

                sandbox_checkout:

                    resultado.sandbox_init_point || null,

                external_reference:

                    numero

            });


        } catch (erro) {

            console.error("");
            console.error(
                "❌ ERRO AO CRIAR CHECKOUT"
            );

            console.error(erro);


            return res.status(500).json({

                sucesso: false,

                erro:
                    erro.message ||
                    "Erro ao criar Checkout Pro."

            });

        }

    }
);


// ====================================
// ⭐ NOVA ROTA
// REDIRECIONAR PARA CHECKOUT PRO
// ====================================

app.get(
    "/checkout/:numero",
    (req, res) => {

        const numero =
            req.params.numero;


        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "🚀 REDIRECIONANDO PARA CHECKOUT"
        );

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
                "❌ Pedido não encontrado."
            );

            return res.status(404).send(`
                
                <h1>Pedido não encontrado</h1>

                <p>
                    Não encontramos o pedido
                    <strong>${numero}</strong>.
                </p>

            `);

        }


        // ====================================
        // CHECKOUT NÃO ENCONTRADO
        // ====================================

        if (!pedido.checkout) {

            console.log(
                "❌ Checkout não encontrado."
            );

            return res.status(400).send(`
                
                <h1>Checkout indisponível</h1>

                <p>
                    O Checkout Pro ainda não foi criado
                    para este pedido.
                </p>

            `);

        }


        console.log(
            "Checkout:",
            pedido.checkout
        );

        console.log(
            "➡ Redirecionando..."
        );


        // ====================================
        // REDIRECIONAMENTO
        // ====================================

        return res.redirect(
            pedido.checkout
        );

    }
);


// ====================================
// CONSULTAR STATUS DO PEDIDO
// ====================================

app.get(
    "/pedido/:numero/status",
    (req, res) => {

        const numero =
            req.params.numero;


        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "📦 CONSULTANDO STATUS DO PEDIDO"
        );

        console.log(
            "Pedido:",
            numero
        );


        const pedido =
            pedidos.get(numero);


        if (!pedido) {

            console.log(
                "⚠️ Pedido não encontrado."
            );

            return res.status(404).json({

                sucesso: false,

                erro:
                    "Pedido não encontrado."

            });

        }


        return res.json({

            sucesso: true,

            numero:
                pedido.numero,

            status:
                pedido.status,

            pagamentoId:
                pedido.pagamentoId || null,

            statusPagamento:
                pedido.statusPagamento || null,

            statusDetalhe:
                pedido.statusDetalhe || null,

            valorPago:
                pedido.valorPago || null,

            dataPagamento:
                pedido.dataPagamento || null

        });

    }
);


// ====================================
// PROCESSAR PAGAMENTO COM CARTÃO
// ====================================

app.post(
    "/processar-pagamento",
    async (req, res) => {

        try {

            const {

                transaction_amount,
                token,
                description,
                installments,
                payment_method_id,
                issuer_id,
                payer

            } = req.body;


            const resultado =
                await payment.create({

                    body: {

                        transaction_amount:
                            Number(
                                transaction_amount
                            ),

                        token,

                        description,

                        installments:
                            Number(
                                installments
                            ),

                        payment_method_id,

                        issuer_id,

                        payer: {

                            email:
                                payer.email,

                            identification:
                                payer.identification

                        }

                    },

                    requestOptions: {

                        idempotencyKey:
                            crypto.randomUUID()

                    }

                });


            console.log(
                "💳 Pagamento:",
                resultado
            );


            return res.json({

                sucesso: true,

                id:
                    resultado.id,

                status:
                    resultado.status,

                status_detail:
                    resultado.status_detail

            });


        } catch (erro) {

            console.error(
                "❌ Erro no pagamento:",
                erro
            );


            return res.status(500).json({

                sucesso: false,

                erro:
                    erro.message

            });

        }

    }
);


// ====================================
// WEBHOOK MERCADO PAGO
// ====================================

app.post(
    "/webhook/mercado-pago",
    async (req, res) => {

        console.log("");
        console.log(
            "🔔 WEBHOOK MERCADO PAGO"
        );

        console.log(
            req.body
        );


        // Responder imediatamente
        res.sendStatus(200);


        try {

            const tipoEvento =
                req.body?.type ||
                req.query?.type ||
                req.body?.topic ||
                req.query?.topic;


            const action =
                req.body?.action;


            const paymentId =
                req.body?.data?.id ||
                req.query?.["data.id"] ||
                (
                    tipoEvento === "payment"
                        ? req.body?.resource
                        : null
                );


            console.log(
                "Tipo:",
                tipoEvento
            );

            console.log(
                "Payment ID:",
                paymentId
            );


            if (
                tipoEvento !== "payment" &&
                action !== "payment.created" &&
                action !== "payment.updated"
            ) {

                console.log(
                    "ℹ️ Evento ignorado."
                );

                return;

            }


            if (!paymentId) {

                console.log(
                    "⚠️ Payment ID não informado."
                );

                return;

            }


            // ====================================
            // CONSULTAR PAGAMENTO
            // ====================================

            const pagamento =
                await payment.get({

                    id:
                        paymentId

                });


            console.log("");
            console.log(
                "====== PAGAMENTO ======"
            );

            console.log(
                "ID:",
                pagamento.id
            );

            console.log(
                "Status:",
                pagamento.status
            );

            console.log(
                "Detalhe:",
                pagamento.status_detail
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
                pedidos.get(
                    numeroPedido
                );


            if (!pedido) {

                console.log(
                    "⚠️ Pedido não encontrado."
                );

                return;

            }


            // ====================================
            // APROVADO
            // ====================================

            if (
                pagamento.status ===
                "approved"
            ) {

                pedido.status =
                    "PAGO";

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


                salvarPedidos();


                console.log("");
                console.log(
                    "===================================="
                );

                console.log(
                    "🎉 PAGAMENTO APROVADO"
                );

                console.log(
                    "Pedido:",
                    numeroPedido
                );

                console.log(
                    "Status:",
                    pedido.status
                );

                console.log(
                    "===================================="
                );

            }


            // ====================================
            // REJEITADO
            // ====================================

            else if (
                pagamento.status ===
                "rejected"
            ) {

                pedido.status =
                    "PAGAMENTO_REJEITADO";

                pedido.pagamentoId =
                    pagamento.id;

                pedido.statusPagamento =
                    pagamento.status;

                pedido.statusDetalhe =
                    pagamento.status_detail;


                pedidos.set(
                    numeroPedido,
                    pedido
                );


                salvarPedidos();


                console.log(
                    "❌ Pagamento rejeitado."
                );

            }


            // ====================================
            // PENDENTE
            // ====================================

            else if (
                pagamento.status ===
                "pending"
            ) {

                pedido.status =
                    "PAGAMENTO_PENDENTE";

                pedido.pagamentoId =
                    pagamento.id;

                pedido.statusPagamento =
                    pagamento.status;

                pedido.statusDetalhe =
                    pagamento.status_detail;


                pedidos.set(
                    numeroPedido,
                    pedido
                );


                salvarPedidos();


                console.log(
                    "⏳ Pagamento pendente."
                );

            }

        } catch (erro) {

            console.error(
                "❌ Erro no Webhook:",
                erro
            );

        }

    }
);


// ==========================================================
// RETORNO PAGAMENTO APROVADO
// ==========================================================

app.get(
    "/pagamento-aprovado",
    (req, res) => {

        console.log("");
        console.log("====================================");
        console.log("🎉 RETORNO DO MERCADO PAGO");
        console.log("====================================");

        console.log(
            "Query recebida:",
            req.query
        );


        // --------------------------------------------------
        // PEGAR DADOS ENVIADOS PELO MERCADO PAGO
        // --------------------------------------------------

        const pagamento =
            req.query.payment_id ||
            req.query.collection_id ||
            "";

        const status =
            req.query.status ||
            req.query.collection_status ||
            "";

        const externalReference =
            req.query.external_reference ||
            "";


        console.log(
            "Payment ID:",
            pagamento
        );

        console.log(
            "Status:",
            status
        );

        console.log(
            "External Reference:",
            externalReference
        );


        // --------------------------------------------------
        // MONTAR URL DA CONFIRMAÇÃO
        // --------------------------------------------------

        const urlConfirmacao =

            "http://localhost:5500/pages/confirmacao.html" +

            "?pedido=" +
            encodeURIComponent(
                externalReference
            ) +

            "&payment_id=" +
            encodeURIComponent(
                pagamento
            ) +

            "&status=" +
            encodeURIComponent(
                status
            );


        console.log("");
        console.log("➡ REDIRECIONAMENTO");
        console.log(
            "URL:",
            urlConfirmacao
        );


        // --------------------------------------------------
        // REDIRECIONAR
        // --------------------------------------------------

        return res.redirect(
            urlConfirmacao
        );

    }
);