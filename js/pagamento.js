// ======================================================
// SOLVER STORE
// PAGAMENTO
// ======================================================

// ====================================
// 01. VARIÁVEIS
// ====================================

let valorTotal;

let radioPix;
let radioCartao;

let areaPix;
let areaCartao;

let campoTotal;
let campoChave;
let campoFavorecido;

let btnCopiar;
let btnJaPaguei;

let cardPaymentBrickController;


// ====================================
// 02. INICIALIZAÇÃO
// ====================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagamento
);


function iniciarPagamento(){

    console.log("💳 Pagamento iniciado");

    // Campos
    campoTotal =
        document.getElementById("valor-total");

    campoChave =
        document.getElementById("pix-chave");

    campoFavorecido =
        document.getElementById("pix-favorecido");


    // Áreas
    areaPix =
        document.getElementById("pix-area");

    areaCartao =
        document.getElementById("cartao-area");


    // Radios
    radioPix =
        document.querySelector(
            "input[value='pix']"
        );

    radioCartao =
        document.querySelector(
            "input[value='cartao']"
        );


    // Botões
    btnCopiar =
        document.getElementById("btn-copiar");

    btnJaPaguei =
        document.getElementById("btn-ja-paguei");


    carregarDados();

    registrarEventos();

}


// ====================================
// 03. CARREGAR DADOS
// ====================================

function carregarDados(){

    console.log("===== CONFIG =====");
    console.log(CONFIG);

    console.log("===== PAGAMENTO =====");
    console.log(CONFIG.pagamento);

    console.log("===== PIX =====");
    console.log(CONFIG.pagamento.pix);

    console.log("===== CHAVE =====");
    console.log(
        CONFIG.pagamento.pix.chave
    );

    console.log("===== FAVORECIDO =====");
    console.log(
        CONFIG.pagamento.pix.favorecido
    );

    console.log("===== TOTAL PEDIDO =====");
    console.log(
        localStorage.getItem("totalPedido")
    );


    // Total
    valorTotal =
        carregar(STORAGE.TOTAL_PEDIDO) || 0;


    console.log(
        "valorTotal:",
        valorTotal
    );


    console.log(
        "campoTotal:",
        campoTotal
    );

    console.log(
        "campoChave:",
        campoChave
    );

    console.log(
        "campoFavorecido:",
        campoFavorecido
    );


    // Total na tela
    campoTotal.textContent =
        formatarMoeda(valorTotal);


    // PIX
    campoChave.textContent =
        CONFIG.pagamento.pix.chave;

    campoFavorecido.textContent =
        CONFIG.pagamento.pix.favorecido;

}


// ====================================
// 04. EVENTOS
// ====================================

function registrarEventos(){

    radioPix.addEventListener(
        "change",
        trocarPagamento
    );


    radioCartao.addEventListener(
        "change",
        trocarPagamento
    );


    btnCopiar.addEventListener(
        "click",
        copiarChave
    );


    btnJaPaguei.addEventListener(
        "click",
        finalizarPagamento
    );

}


// ====================================
// 05. TROCAR PAGAMENTO
// ====================================

function trocarPagamento(){

    if(radioPix.checked){

        areaPix.style.display = "block";

        areaCartao.style.display = "none";

        console.log("💠 Pagamento PIX");

    }else{

        areaPix.style.display = "none";

        areaCartao.style.display = "block";

        console.log("💳 Pagamento com cartão");

        iniciarCardPayment();

    }

}


// ====================================
// 06. CARD PAYMENT BRICK
// ====================================

async function iniciarCardPayment(){

    // Evita criar o Brick várias vezes
    if(cardPaymentBrickController){

        console.log(
            "Card Payment Brick já iniciado."
        );

        return;

    }


    console.log(
        "🚀 Iniciando Card Payment Brick..."
    );


    // Public Key de TESTE
    const publicKey =
        "TEST-c85d3f5b-5c70-40d6-9ae0-a62fb891e527";


    try{

        const mp =
            new MercadoPago(publicKey);


        const bricksBuilder =
            mp.bricks();


        const settings = {

            initialization: {

                amount: Number(valorTotal)

            },


            callbacks: {

                onReady: () => {

                    console.log(
                        "✅ Card Payment Brick carregado!"
                    );

                },

onSubmit: async (formData) => {

    console.log("💳 Enviando pagamento para o backend...");
    console.log("Dados recebidos pelo Brick:", formData);

    try {

        const resposta = await fetch(
            "http://localhost:3000/processar-pagamento",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    transaction_amount: Number(valorTotal),

                    token: formData.token,

                    description: "Pedido Solver Store",

                    installments: Number(
                        formData.installments
                    ),

                    payment_method_id:
                        formData.payment_method_id,

                    issuer_id:
                        formData.issuer_id,

                    payer: {

                        email:
                            formData.payer.email,

                        identification:
                            formData.payer.identification

                    }

                })
            }
        );

        const resultado =
            await resposta.json();

        console.log(
            "💰 Resultado do pagamento:",
            resultado
        );

        if (!resposta.ok || !resultado.sucesso) {

            throw new Error(
                resultado.erro ||
                "Não foi possível processar o pagamento."
            );

        }

        // ====================================
        // PAGAMENTO APROVADO
        // ====================================

        if (resultado.status === "approved") {

            console.log(
                "✅ PAGAMENTO APROVADO!"
            );

            const pedido = carregarPedido();

            if (pedido) {

                pedido.status =
                    STATUS_PEDIDO.PAGO;

                salvarPedido(pedido);

                console.log(
                    "📦 Pedido atualizado:",
                    pedido
                );

            }

            window.location.href =
                "confirmacao.html";

        } else {

            alert(
                "O pagamento não foi aprovado.\n\n" +
                "Status: " +
                resultado.status
            );

        }

    } catch (erro) {

        console.error(
            "❌ Erro ao processar pagamento:",
            erro
        );

        alert(
            "Não foi possível processar o pagamento.\n\n" +
            "Tente novamente."
        );

    }

},


                onError: (error) => {

                    console.error(
                        "❌ Erro no Card Payment Brick:",
                        error
                    );

                }

            }

        };


        cardPaymentBrickController =
            await bricksBuilder.create(

                "cardPayment",

                "cardPaymentBrick_container",

                settings

            );


    }catch(error){

        console.error(
            "❌ Erro ao iniciar Mercado Pago:",
            error
        );

    }

}


// ====================================
// 07. COPIAR CHAVE PIX
// ====================================

function copiarChave(){

    navigator.clipboard.writeText(
        CONFIG.pagamento.pix.chave
    );

    alert(
        "Chave PIX copiada!"
    );

}


// ======================================
// 08. FINALIZAR
// ======================================

function finalizarPagamento(){

    console.log(
        ">>> Pagamento confirmado <<<"
    );


    const pedido =
        carregarPedido();


    if(!pedido){

        console.error(
            "Pedido não encontrado."
        );

        alert(
            "Não foi possível localizar o pedido."
        );

        return;

    }


    // Atualiza o status do pedido
    pedido.status =
        STATUS_PEDIDO.PAGO;


    // Salva novamente o pedido
    salvarPedido(pedido);


    console.log(
        "====== PEDIDO ATUALIZADO ======"
    );

    console.log(pedido);


    // Vai para confirmação
    window.location.href =
        "confirmacao.html";

}