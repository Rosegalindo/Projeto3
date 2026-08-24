// ======================================================
// SOLVER STORE
// PAGAMENTO - CHECKOUT PRO MERCADO PAGO
// ======================================================

// ====================================
// 01. VARIÁVEIS
// ====================================

let campoTotal;
let campoNumeroPedido;

let btnPagar;

let statusArea;
let statusMensagem;


// ====================================
// 02. INICIALIZAÇÃO
// ====================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarPagamento
);


function iniciarPagamento(){

    console.log("💳 Pagamento iniciado");

// ====================================
// CAMPOS
// ====================================

    campoTotal =
        document.getElementById("valor-total");

    campoNumeroPedido =
        document.getElementById("numero-pedido");


// ====================================
// BOTÃO
// ====================================

btnPagar =
    document.getElementById("btn-pagar");

console.log(
    "🟢 Botão Pagar encontrado:",
    btnPagar
);


// ====================================
// STATUS
// ====================================

statusArea =
    document.getElementById("status-area");

statusMensagem =
    document.getElementById("status-mensagem");


// ====================================
// VERIFICAR CAMPOS
// ====================================

if (
    !campoTotal ||
    !campoNumeroPedido ||
    !btnPagar
){

    console.error(
        "❌ Elementos do pagamento não encontrados."
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

}

// ====================================
// 03. CARREGAR PEDIDO
// ====================================

function carregarDados(){

    const pedido =
        carregarPedido();


    console.log(
        "====== PEDIDO PARA PAGAMENTO ======"
    );

    console.log(
        pedido
    );


    // ====================================
    // VERIFICAR PEDIDO
    // ====================================

    if(!pedido){

        console.error(
            "❌ Pedido não encontrado."
        );

        mostrarStatus(
            "Não foi possível localizar seu pedido.",
            "erro"
        );

        btnPagar.disabled = true;

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
    // NÚMERO DO PEDIDO
    // ====================================

    campoNumeroPedido.textContent =
        pedido.numero || "-";


    // ====================================
    // VALOR NA TELA
    // ====================================

    campoTotal.textContent =
        formatarMoeda(total);


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
// 04. INICIAR CHECKOUT
// ====================================

async function iniciarCheckout(){

    console.log(
        "🚀 Iniciando Checkout Pro..."
    );


    // ====================================
    // CARREGAR PEDIDO
    // ====================================

    const pedido =
        carregarPedido();


    if(!pedido){

        mostrarStatus(
            "Não foi possível localizar o pedido.",
            "erro"
        );

        return;

    }


    // ====================================
    // VERIFICAR PRODUTOS
    // ====================================

    if(
        !Array.isArray(pedido.produtos) ||
        pedido.produtos.length === 0
    ){

        console.error(
            "❌ Pedido sem produtos.",
            pedido
        );

        mostrarStatus(
            "O pedido não possui produtos.",
            "erro"
        );

        return;

    }


    // ====================================
    // VERIFICAR VALOR
    // ====================================

    const total =
        Number(
            pedido.valores?.total
        ) || 0;


    if(total <= 0){

        console.error(
            "❌ Valor do pedido inválido:",
            total
        );

        mostrarStatus(
            "O valor do pedido é inválido.",
            "erro"
        );

        return;

    }


    // ====================================
    // EVITAR DUPLO CLIQUE
    // ====================================

    btnPagar.disabled = true;

    btnPagar.innerHTML =
        "<i class='bx bx-loader-alt bx-spin'></i> " +
        "Preparando pagamento...";


    try{

        console.log(
            "📦 Enviando pedido para o backend..."
        );


        // ====================================
        // CRIAR PREFERENCE
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


        // ====================================
        // LER RESPOSTA
        // ====================================

        const resultado =
            await resposta.json();


        console.log(
            "💰 Resposta do backend:"
        );

        console.log(
            resultado
        );


        // ====================================
        // VERIFICAR ERRO
        // ====================================

        if(
            !resposta.ok ||
            !resultado.sucesso
        ){

            throw new Error(
                resultado.erro ||
                "Não foi possível criar o pagamento."
            );

        }


        // ====================================
        // SALVAR ID DA PREFERENCE
        // ====================================

        if(resultado.id){

        pedido.pagamento =
            pedido.pagamento || {};

        pedido.pagamento.preferenceId =
            resultado.id;

        console.log(
            "💾 Preference ID salvo no pedido:",
            resultado.id
        );

        }

        console.log(
            "✅ Preference criada!"
        );

        console.log(
            "ID:",
            resultado.id
        );

        console.log(
            "Checkout:",
            resultado.checkout
        );


        // ====================================
        // REDIRECIONAR
        // ====================================

        if(!resultado.checkout){

            throw new Error(
                "O Mercado Pago não retornou o link do Checkout."
            );

        }


        console.log(
            "➡️ Redirecionando para o Mercado Pago..."
        );


        window.location.href =
            resultado.checkout;


    }catch(erro){

        console.error(
            "❌ Erro ao iniciar Checkout Pro:",
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

        btnPagar.disabled = false;

        btnPagar.innerHTML =
            "<i class='bx bx-lock-alt'></i> " +
            "Pagar com Mercado Pago";

    }

}


// ====================================
// 05. MOSTRAR STATUS
// ====================================

function mostrarStatus(
    mensagem,
    tipo = "info"
){

    if(!statusArea || !statusMensagem){

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
// 06. CONSULTAR STATUS DO PEDIDO
// ====================================

async function consultarStatusPedido(numeroPedido){

    console.log("");
    console.log("====================================");
    console.log("🔎 CONSULTANDO STATUS DO PEDIDO");
    console.log("====================================");

    console.log(
        "Pedido:",
        numeroPedido
    );

    try{

        const resposta =
            await fetch(
                `http://localhost:3000/pedido/${encodeURIComponent(numeroPedido)}/status`
            );


        const resultado =
            await resposta.json();


        console.log(
            "📦 Status recebido do backend:"
        );

        console.log(
            resultado
        );


        if(!resposta.ok){

            console.error(
                "❌ Não foi possível consultar o pedido."
            );

            return null;

        }


        return resultado;

    }catch(erro){

        console.error(
            "❌ Erro ao consultar status:",
            erro
        );

        return null;

    }

}