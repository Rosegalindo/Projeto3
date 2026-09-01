// ======================================================
// SOLVER STORE
// BACKEND - MERCADO PAGO CHECKOUT PRO
// ======================================================

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();


// ======================================================
// MERCADO PAGO
// ======================================================

const {
    MercadoPagoConfig,
    Preference,
    Payment
} = require("mercadopago");


// ======================================================
// CONFIGURAÇÕES
// ======================================================

const PORT =
    process.env.PORT || 3000;


// ======================================================
// URLs DO MERCADO PAGO
// ======================================================
//
// IMPORTANTE:
// Substitua somente o endereço do Cloudflare Tunnel.
//
// Exemplo:
//
// https://abc123.trycloudflare.com
//
// Não coloque essas URLs no .env.
// ======================================================

const MP_BASE_URL =
    "https://COLOQUE-AQUI-SEU-TUNEL.trycloudflare.com";


const MP_WEBHOOK_URL =
    MP_BASE_URL +
    "/webhook/mercado-pago";


const MP_SUCCESS_URL =
    MP_BASE_URL +
    "/pagamento-aprovado";


const MP_FAILURE_URL =
    MP_BASE_URL +
    "/pagamento-falhou";


const MP_PENDING_URL =
    MP_BASE_URL +
    "/pagamento-pendente";


// ======================================================
// VALIDAR ACCESS TOKEN
// ======================================================

if (!process.env.MP_ACCESS_TOKEN) {

    console.error("");
    console.error(
        "❌ ERRO: MP_ACCESS_TOKEN não foi encontrado no .env"
    );
    console.error("");

    process.exit(1);

}


// ======================================================
// CONFIGURAR MERCADO PAGO
// ======================================================

const mp =
    new MercadoPagoConfig({

        accessToken:
            process.env.MP_ACCESS_TOKEN

    });


const payment =
    new Payment(mp);


// ======================================================
// PEDIDOS
// ======================================================

const arquivoPedidos =
    path.join(
        __dirname,
        "pedidos.json"
    );


let pedidos =
    new Map();


// ======================================================
// CARREGAR PEDIDOS
// ======================================================

if (
    fs.existsSync(
        arquivoPedidos
    )
) {

    try {

        const dados =
            fs.readFileSync(
                arquivoPedidos,
                "utf8"
            );


        const pedidosSalvos =
            JSON.parse(
                dados
            );


        pedidos =
            new Map(
                pedidosSalvos
            );


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


// ======================================================
// SALVAR PEDIDOS
// ======================================================

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


        console.log(
            "💾 Pedidos salvos."
        );


    } catch (erro) {

        console.error(
            "❌ Erro ao salvar pedidos:",
            erro
        );

    }

}


// ======================================================
// MIDDLEWARES
// ======================================================

app.use(
    cors()
);


app.use(
    express.json()
);


// ======================================================
// ROTA PRINCIPAL
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            sucesso: true,

            mensagem:
                "Backend Solver Store funcionando!"

        });

    }
);


// ======================================================
// TESTE MERCADO PAGO
// ======================================================

app.get(
    "/teste-mercado-pago",
    (req, res) => {

        res.json({

            sucesso: true,

            mensagem:
                "Mercado Pago configurado!",

            urls: {

                webhook:
                    MP_WEBHOOK_URL,

                success:
                    MP_SUCCESS_URL,

                failure:
                    MP_FAILURE_URL,

                pending:
                    MP_PENDING_URL

            }

        });

    }
);


// ======================================================
// CRIAR PREFERENCE - CHECKOUT PRO
// ======================================================

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


            // ==================================================
            // RECEBER DADOS
            // ==================================================

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


            // ==================================================
            // VALIDAR PEDIDO
            // ==================================================

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


            // ==================================================
            // VALIDAR VALORES
            // ==================================================

            const total =
                Number(
                    valores?.total
                );


            if (
                !Number.isFinite(total) ||
                total <= 0
            ) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Valor total do pedido inválido."

                });

            }


            // ==================================================
            // TRANSFORMAR PRODUTOS
            // ==================================================

            const items =
                produtos.map(
                    produto => {

                        const quantidade =
                            Number(
                                produto.quantidade
                            );


                        const preco =
                            Number(
                                produto.preco
                            );


                        if (
                            !produto.nome ||
                            !Number.isFinite(quantidade) ||
                            quantidade <= 0 ||
                            !Number.isFinite(preco) ||
                            preco <= 0
                        ) {

                            throw new Error(
                                "Produto inválido no pedido."
                            );

                        }


                        return {

                            title:
                                String(
                                    produto.nome
                                ),

                            quantity:
                                quantidade,

                            unit_price:
                                preco,

                            currency_id:
                                "BRL"

                        };

                    }
                );


            console.log("");
            console.log(
                "🛒 ITENS ENVIADOS AO MERCADO PAGO:"
            );


            console.log(
                items
            );


            // ==================================================
            // LOCALIZAR OU CRIAR PEDIDO
            // ==================================================

            let pedido =
                pedidos.get(
                    numero
                );


            if (!pedido) {

                pedido = {

                    numero:

                        numero,

                    produtos:

                        produtos,

                    valores:

                        valores,

                    status:

                        "AGUARDANDO_PAGAMENTO",

                    criadoEm:

                        new Date().toISOString()

                };

            } else {

                // ----------------------------------------------
                // Preserva o pedido já criado pelo checkout.js
                // ----------------------------------------------

                pedido.produtos =
                    produtos;

                pedido.valores =
                    valores;


                if (
                    !pedido.status ||
                    pedido.status ===
                    "AGUARDANDO_PAGAMENTO"
                ) {

                    pedido.status =
                        "AGUARDANDO_PAGAMENTO";

                }

            }


            pedidos.set(
                numero,
                pedido
            );


            salvarPedidos();


            console.log("");
            console.log(
                "📦 PEDIDO REGISTRADO"
            );

            console.log(
                "Número:",
                numero
            );

            console.log(
                "Status:",
                pedido.status
            );


            // ==================================================
            // CRIAR PREFERENCE
            // ==================================================

            const preference =
                new Preference(mp);


            const resultado =
                await preference.create({

                    body: {

                        // --------------------------------------
                        // PRODUTOS
                        // --------------------------------------

                        items:


                            items,


                        // --------------------------------------
                        // REFERÊNCIA DO PEDIDO
                        // --------------------------------------

                        external_reference:

                            String(
                                numero
                            ),


                        // --------------------------------------
                        // WEBHOOK
                        // --------------------------------------

                        notification_url:

                            MP_WEBHOOK_URL,


                        // --------------------------------------
                        // RETORNOS
                        // --------------------------------------

                        back_urls: {

                            success:

                                MP_SUCCESS_URL,

                            failure:

                                MP_FAILURE_URL,

                            pending:

                                MP_PENDING_URL

                        },


                        // --------------------------------------
                        // RETORNO AUTOMÁTICO
                        // --------------------------------------

                        auto_return:

                            "approved"

                    },

                    requestOptions: {

                        idempotencyKey:

                            crypto.randomUUID()

                    }

                });


            // ==================================================
            // VERIFICAR PREFERENCE
            // ==================================================

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


            console.log(
                "External Reference:",
                numero
            );


            // ==================================================
            // SALVAR DADOS DO CHECKOUT
            // ==================================================

            pedido.preferenceId =
                resultado.id;


            pedido.checkout =
                resultado.init_point;


            pedido.checkoutCriadoEm =
                new Date().toISOString();


            pedidos.set(
                numero,
                pedido
            );


            salvarPedidos();


            // ==================================================
            // RESPONDER FRONTEND
            // ==================================================

            return res.json({

                sucesso: true,

                numero:

                    numero,

                id:

                    resultado.id,

                checkout:

                    resultado.init_point,

                sandbox_checkout:

                    resultado.sandbox_init_point ||
                    null,

                external_reference:

                    numero

            });


        } catch (erro) {

            console.error("");
            console.error(
                "===================================="
            );

            console.error(
                "❌ ERRO AO CRIAR CHECKOUT"
            );

            console.error(
                "===================================="
            );


            console.error(
                erro
            );


            return res.status(500).json({

                sucesso: false,

                erro:
                    erro?.message ||
                    "Erro ao criar Checkout Pro."

            });

        }

    }
);


// ======================================================
// REDIRECIONAR PARA CHECKOUT PRO
// ======================================================

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
            "===================================="
        );


        console.log(
            "Pedido:",
            numero
        );


        const pedido =
            pedidos.get(
                numero
            );


        // ==================================================
        // PEDIDO NÃO ENCONTRADO
        // ==================================================

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


        // ==================================================
        // CHECKOUT NÃO ENCONTRADO
        // ==================================================

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


        return res.redirect(
            pedido.checkout
        );

    }
);


// ======================================================
// CONSULTAR STATUS DO PEDIDO
// ======================================================

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
            "===================================="
        );


        console.log(
            "Pedido:",
            numero
        );


        const pedido =
            pedidos.get(
                numero
            );


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

                pedido.pagamentoId ||
                null,

            statusPagamento:

                pedido.statusPagamento ||
                null,

            statusDetalhe:

                pedido.statusDetalhe ||
                null,

            valorPago:

                pedido.valorPago ||
                null,

            dataPagamento:

                pedido.dataPagamento ||
                null

        });

    }
);


// ======================================================
// PROCESSAR PAGAMENTO COM CARTÃO
// ======================================================
//
// Mantido para compatibilidade com partes antigas
// do projeto.
//
// O Checkout Pro continua sendo o fluxo principal.
// ======================================================

app.post(
    "/processar-pagamento",
    async (req, res) => {

        try {

            console.log("");
            console.log(
                "💳 PROCESSANDO PAGAMENTO"
            );


            const {

                transaction_amount,
                token,
                description,
                installments,
                payment_method_id,
                issuer_id,
                payer

            } = req.body;


            if (
                !transaction_amount ||
                !token ||
                !payment_method_id ||
                !payer
            ) {

                return res.status(400).json({

                    sucesso: false,

                    erro:
                        "Dados de pagamento incompletos."

                });

            }


            const resultado =
                await payment.create({

                    body: {

                        transaction_amount:

                            Number(
                                transaction_amount
                            ),

                        token:

                            token,

                        description:

                            description,

                        installments:

                            Number(
                                installments
                            ),

                        payment_method_id:

                            payment_method_id,

                        issuer_id:

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
                    erro?.message ||
                    "Erro ao processar pagamento."

            });

        }

    }
);


// ======================================================
// WEBHOOK MERCADO PAGO
// ======================================================

app.post(
    "/webhook/mercado-pago",
    async (req, res) => {

        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "🔔 WEBHOOK MERCADO PAGO"
        );

        console.log(
            "===================================="
        );


        console.log(
            "Body recebido:"
        );


        console.log(
            req.body
        );


        // ==================================================
        // RESPONDER IMEDIATAMENTE
        // ==================================================

        res.sendStatus(200);


        try {

            // ==================================================
            // IDENTIFICAR EVENTO
            // ==================================================

            const tipoEvento =
                req.body?.type ||
                req.query?.type ||
                req.body?.topic ||
                req.query?.topic;


            const action =
                req.body?.action;


            console.log(
                "Tipo:",
                tipoEvento
            );


            console.log(
                "Action:",
                action
            );


            // ==================================================
            // PEGAR PAYMENT ID
            // ==================================================

            const paymentId =
                req.body?.data?.id ||
                req.query?.["data.id"] ||
                (
                    tipoEvento === "payment"
                        ? req.body?.resource
                        : null
                );


            console.log(
                "Payment ID:",
                paymentId
            );


            // ==================================================
            // IGNORAR EVENTOS QUE NÃO SÃO PAGAMENTO
            // ==================================================

            if (

                tipoEvento !== "payment" &&

                action !==
                "payment.created" &&

                action !==
                "payment.updated"

            ) {

                console.log(
                    "ℹ️ Evento ignorado."
                );


                return;

            }


            // ==================================================
            // VALIDAR PAYMENT ID
            // ==================================================

            if (!paymentId) {

                console.log(
                    "⚠️ Payment ID não informado."
                );


                return;

            }


            // ==================================================
            // CONSULTAR PAGAMENTO NO MERCADO PAGO
            // ==================================================

            const pagamento =
                await payment.get({

                    id:
                        paymentId

                });


            console.log("");
            console.log(
                "===================================="
            );

            console.log(
                "💳 PAGAMENTO CONSULTADO"
            );

            console.log(
                "===================================="
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
                "Valor:",
                pagamento.transaction_amount
            );


            console.log(
                "External Reference:",
                pagamento.external_reference
            );


            // ==================================================
            // LOCALIZAR PEDIDO
            // ==================================================

            const numeroPedido =
                pagamento.external_reference;


            if (!numeroPedido) {

                console.log(
                    "⚠️ External Reference não encontrada."
                );


                return;

            }


            const pedido =
                pedidos.get(
                    numeroPedido
                );


            // ==================================================
            // VERIFICAR PEDIDO
            // ==================================================

            if (!pedido) {

                console.log(
                    "⚠️ Pedido não encontrado no backend."
                );


                return;

            }


            // ==================================================
            // PAGAMENTO APROVADO
            // ==================================================

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


                // ----------------------------------------------
                // Forma de pagamento
                // ----------------------------------------------

                pedido.formaPagamento =
                    pagamento.payment_method_id ||
                    null;


                // ----------------------------------------------
                // Atualizar pedido
                // ----------------------------------------------

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
                    "===================================="
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
                    "Pagamento:",
                    pedido.pagamentoId
                );


                console.log(
                    "Valor pago:",
                    pedido.valorPago
                );


                console.log(
                    "===================================="
                );


            }


            // ==================================================
            // PAGAMENTO REJEITADO
            // ==================================================

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


            // ==================================================
            // PAGAMENTO PENDENTE
            // ==================================================

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


            // ==================================================
            // OUTROS STATUS
            // ==================================================

            else {

                console.log(
                    "ℹ️ Status recebido:",
                    pagamento.status
                );

            }


        } catch (erro) {

            console.error("");
            console.error(
                "❌ ERRO AO PROCESSAR WEBHOOK"
            );


            console.error(
                erro
            );

        }

    }
);


// ======================================================
// RETORNO PAGAMENTO APROVADO
// ======================================================
//
// NÃO REDIRECIONA MAIS PARA confirmacao.html.
//
// O pagamento já foi confirmado pelo webhook.
// ======================================================

app.get(
    "/pagamento-aprovado",
    (req, res) => {

        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "🎉 RETORNO: PAGAMENTO APROVADO"
        );

        console.log(
            "===================================="
        );


        console.log(
            "Query:",
            req.query
        );


        const numero =
            req.query.external_reference ||
            req.query.externalReference ||
            req.query.pedido ||
            "";


        const paymentId =
            req.query.payment_id ||
            req.query.collection_id ||
            "";


        console.log(
            "Pedido:",
            numero
        );


        console.log(
            "Payment ID:",
            paymentId
        );


        // ==================================================
        // NÃO USAR confirmacao.html
        // ==================================================

        return res.send(`

            <!DOCTYPE html>

            <html lang="pt-BR">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>
                    Pagamento aprovado | Solver Store
                </title>

                <style>

                    body {

                        font-family:
                            Arial,
                            sans-serif;

                        background:
                            #f5f7fb;

                        display:
                            flex;

                        justify-content:
                            center;

                        align-items:
                            center;

                        min-height:
                            100vh;

                        margin:
                            0;

                    }

                    .box {

                        background:
                            #ffffff;

                        padding:
                            40px;

                        border-radius:
                            16px;

                        text-align:
                            center;

                        box-shadow:
                            0 10px 30px
                            rgba(0,0,0,.08);

                        max-width:
                            500px;

                        width:
                            calc(100% - 40px);

                    }

                    h1 {

                        color:
                            #0f5c43;

                    }

                    p {

                        color:
                            #555;

                        line-height:
                            1.6;

                    }

                </style>

            </head>

            <body>

                <div class="box">

                    <h1>
                        ✅ Pagamento aprovado!
                    </h1>

                    <p>
                        Obrigado pela sua compra.
                    </p>

                    <p>
                        Seu pagamento foi recebido
                        pelo Mercado Pago.
                    </p>

                    ${
                        numero
                            ? `
                                <p>
                                    Pedido:
                                    <strong>
                                        ${numero}
                                    </strong>
                                </p>
                            `
                            : ""
                    }

                    <p>
                        Seu pedido está sendo
                        processado pela loja.
                    </p>

                </div>

            </body>

            </html>

        `);

    }
);


// ======================================================
// RETORNO PAGAMENTO FALHOU
// ======================================================

app.get(
    "/pagamento-falhou",
    (req, res) => {

        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "❌ RETORNO: PAGAMENTO FALHOU"
        );

        console.log(
            "===================================="
        );


        console.log(
            "Query:",
            req.query
        );


        return res.send(`

            <!DOCTYPE html>

            <html lang="pt-BR">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>
                    Pagamento não aprovado
                </title>

            </head>

            <body>

                <div
                    style="
                        max-width:600px;
                        margin:80px auto;
                        padding:30px;
                        text-align:center;
                        font-family:Arial,sans-serif;
                    "
                >

                    <h1>
                        ❌ Pagamento não aprovado
                    </h1>

                    <p>
                        Não foi possível concluir
                        o pagamento.
                    </p>

                    <p>
                        Você pode tentar novamente.
                    </p>

                </div>

            </body>

            </html>

        `);

    }
);


// ======================================================
// RETORNO PAGAMENTO PENDENTE
// ======================================================

app.get(
    "/pagamento-pendente",
    (req, res) => {

        console.log("");
        console.log(
            "===================================="
        );

        console.log(
            "⏳ RETORNO: PAGAMENTO PENDENTE"
        );

        console.log(
            "===================================="
        );


        console.log(
            "Query:",
            req.query
        );


        return res.send(`

            <!DOCTYPE html>

            <html lang="pt-BR">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                >

                <title>
                    Pagamento pendente
                </title>

            </head>

            <body>

                <div
                    style="
                        max-width:600px;
                        margin:80px auto;
                        padding:30px;
                        text-align:center;
                        font-family:Arial,sans-serif;
                    "
                >

                    <h1>
                        ⏳ Pagamento pendente
                    </h1>

                    <p>
                        Seu pagamento ainda está
                        sendo processado.
                    </p>

                    <p>
                        Aguarde a confirmação
                        do Mercado Pago.
                    </p>

                </div>

            </body>

            </html>

        `);

    }
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            "🚀 SOLVER STORE - BACKEND"
        );

        console.log(
            "========================================"
        );

        console.log(
            `🌐 Local: http://localhost:${PORT}`
        );

        console.log(
            "💳 Mercado Pago: CONFIGURADO"
        );

        console.log(
            "🔔 Webhook:",
            MP_WEBHOOK_URL
        );

        console.log(
            "✅ Success:",
            MP_SUCCESS_URL
        );

        console.log(
            "❌ Failure:",
            MP_FAILURE_URL
        );

        console.log(
            "⏳ Pending:",
            MP_PENDING_URL
        );

        console.log(
            "========================================"
        );

        console.log("");

    }
);