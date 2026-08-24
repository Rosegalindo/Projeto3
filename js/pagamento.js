// ======================================================
// SOLVER STORE
// PAGAMENTO - CHECKOUT PRO MERCADO PAGO
// ======================================================

// ====================================
// VARIÁVEIS
// ====================================

let campoTotal;
let campoNumeroPedido;
let btnPagar;
let statusArea;
let statusMensagem;


// ====================================
// INICIALIZAÇÃO
// ====================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagamento
);


function iniciarPagamento() {

    console.log("💳 Pagamento iniciado");

    // ====================================
    // ELEMENTOS
    // ====================================

    campoTotal =
        document.getElementById("valor-total");

    campoNumeroPedido =
        document.getElementById("numero-pedido");

    btnPagar =
        document.getElementById("btn-pagar");

    statusArea =
        document.getElementById("status-area");

    statusMensagem =
        document.getElementById("status-mensagem");


    // ====================================
    // VERIFICAR BOTÃO
    // ====================================

    console.log(
        "🟢 Botão Pagar encontrado:",
        btnPagar
    );


    if (!btnPagar) {

        console.error(
            "❌ Botão #btn-pagar não encontrado."
        );

        return;

    }


    // ====================================
    // CARREGAR PEDIDO
    // ====================================

    carregarDados();


    // ====================================
    // EVENTO DO BOTÃO
    // ====================================

    btnPagar.addEventListener(
        "click",
        iniciarCheckout
    );


    console.log(
        "✅ Evento de clique configurado."
    );

}


// ====================================
// CARREGAR PEDIDO
// ====================================

function carregarDados() {

    const pedido =
        carregarPedido();


    console.log(
        "====== PEDIDO PARA PAGAMENTO ======"
    );

    console.log(
        pedido
    );


    // ====================================
    // PEDIDO NÃO ENCONTRADO
    // ====================================

    if (!pedido) {

        console.error(
            "❌ Pedido não encontrado."
        );

        mostrarStatus(
            "Não foi possível localizar seu pedido.",
            "erro"
        );

        if (btnPagar) {

            btnPagar.disabled = true;

        }

        return;

    }


    // ====================================
    // TOTAL
    // ====================================

    const total =
        Number(
            pedido.valores?.total
        ) || 0;


    // ====================================
    // NÚMERO
    // ====================================

    if (campoNumeroPedido) {

        campoNumeroPedido.textContent =
            pedido.numero || "-";

    }


    // ====================================
    // VALOR
    // ====================================

    if (campoTotal) {

        campoTotal.textContent =
            formatarMoeda(total);

    }


    console.log(
        "Número do pedido:",
        pedido.numero
    );

    console.log(
        "Total:",
        total
    );

}


// ====================================
// INICIAR CHECKOUT
// ====================================

async function iniciarCheckout() {

    console.log("");
    console.log(
        "===================================="
    );

    console.log(
        "🚀 INICIANDO CHECKOUT PRO"
    );

    console.log(
        "===================================="
    );


    // ====================================
    // PEDIDO
    // ====================================

    const pedido =
        carregarPedido();


    console.log(
        "📦 Pedido carregado:",
        pedido
    );


    if (!pedido) {

        mostrarStatus(
            "Não foi possível localizar o pedido.",
            "erro"
        );

        return;

    }


    // ====================================
    // PRODUTOS
    // ====================================

    if (
        !Array.isArray(pedido.produtos) ||
        pedido.produtos.length === 0
    ) {

        console.error(
            "❌ Pedido sem produtos:",
            pedido
        );

        mostrarStatus(
            "O pedido não possui produtos.",
            "erro"
        );

        return;

    }


    // ====================================
    // TOTAL
    // ====================================

    const total =
        Number(
            pedido.valores?.total
        ) || 0;


    if (total <= 0) {

        console.error(
            "❌ Valor inválido:",
            total
        );

        mostrarStatus(
            "O valor do pedido é inválido.",
            "erro"
        );

        return;

    }


    // ====================================
    // BLOQUEAR BOTÃO
    // ====================================

    if (btnPagar) {

        btnPagar.disabled = true;

        btnPagar.innerHTML =
            "<i class='bx bx-loader-alt bx-spin'></i> " +
            "Preparando pagamento...";

    }


    try {

        console.log(
            "📡 Enviando pedido para o backend..."
        );


        // ====================================
        // CHAMAR BACKEND
        // ====================================

        const resposta =
            await fetch(
                "http://localhost:3000/criar-preferencia",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        numero:
                            pedido.numero,

                        produtos:
                            pedido.produtos,

                        valores:
                            pedido.valores

                    })

                }
            );


        console.log(
            "📡 Status HTTP:",
            resposta.status
        );


        // ====================================
        // LER RESPOSTA
        // ====================================

        const resultado =
            await resposta.json();


        console.log(
            "💰 RESPOSTA DO BACKEND:"
        );

        console.log(
            resultado
        );


        // ====================================
        // VERIFICAR RESPOSTA
        // ====================================

        if (
            !resposta.ok ||
            !resultado.sucesso
        ) {

            throw new Error(
                resultado.erro ||
                "Não foi possível criar o pagamento."
            );

        }


        // ====================================
        // VERIFICAR CHECKOUT
        // ====================================

        if (
            !resultado.checkout
        ) {

            throw new Error(
                "O Mercado Pago não retornou o link do Checkout Pro."
            );

        }


        console.log(
            "===================================="
        );

        console.log(
            "✅ CHECKOUT PRO CRIADO"
        );

        console.log(
            "Preference ID:",
            resultado.id
        );

        console.log(
            "Checkout:",
            resultado.checkout
        );

        console.log(
            "===================================="
        );


        // ====================================
        // SALVAR DADOS DO PAGAMENTO
        // ====================================

        pedido.pagamento =
            pedido.pagamento || {};


        pedido.pagamento.preferenceId =
            resultado.id;


        pedido.pagamento.checkout =
            resultado.checkout;


        // ====================================
        // SALVAR PEDIDO LOCALMENTE
        // ====================================

        if (
            typeof salvarPedido === "function"
        ) {

            salvarPedido(pedido);

        }


        // ====================================
        // REDIRECIONAR
        // ====================================

        console.log(
            "➡️ REDIRECIONANDO PARA MERCADO PAGO..."
        );


        // Pequeno atraso apenas para
        // garantir que o navegador processe
        // os logs antes da navegação.

        setTimeout(
            function () {

                window.location.assign(
                    resultado.checkout
                );

            },
            200
        );


    } catch (erro) {

        console.error(
            "❌ ERRO AO INICIAR CHECKOUT PRO:"
        );

        console.error(
            erro
        );


        mostrarStatus(
            "Não foi possível iniciar o pagamento. " +
            "Tente novamente.",
            "erro"
        );


        // ====================================
        // RESTAURAR BOTÃO
        // ====================================

        if (btnPagar) {

            btnPagar.disabled = false;

            btnPagar.innerHTML =
                "<i class='bx bx-lock-alt'></i> " +
                "Pagar com Mercado Pago";

        }

    }

}


// ====================================
// MOSTRAR STATUS
// ====================================

function mostrarStatus(
    mensagem,
    tipo = "info"
) {

    if (
        !statusArea ||
        !statusMensagem
    ) {

        alert(mensagem);

        return;

    }


    statusArea.style.display =
        "block";


    statusMensagem.textContent =
        mensagem;


    statusMensagem.className =
        tipo;


    console.log(
        "Status:",
        mensagem
    );

}


// ====================================
// CONSULTAR STATUS
// ====================================

async function consultarStatusPedido(
    numeroPedido
) {

    console.log(
        "🔎 Consultando status:",
        numeroPedido
    );


    try {

        const resposta =
            await fetch(
                "http://localhost:3000/pedido/" +
                encodeURIComponent(numeroPedido) +
                "/status"
            );


        const resultado =
            await resposta.json();


        console.log(
            "📦 Status recebido:",
            resultado
        );


        return resultado;


    } catch (erro) {

        console.error(
            "❌ Erro ao consultar status:",
            erro
        );

        return null;

    }

}