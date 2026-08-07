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
let btnCartao;
let btnJaPaguei;

// ====================================
// 02. INICIALIZAÇÃO
// ====================================

document.addEventListener("DOMContentLoaded", iniciarPagamento);

function iniciarPagamento(){

    console.log("💳 Pagamento iniciado");

    // Campos
    campoTotal = document.getElementById("valor-total");
    campoChave = document.getElementById("pix-chave");
    campoFavorecido = document.getElementById("pix-favorecido");

    // Áreas
    areaPix = document.getElementById("pix-area");
    areaCartao = document.getElementById("cartao-area");

    // Radios
    radioPix = document.querySelector("input[value='pix']");
    radioCartao = document.querySelector("input[value='cartao']");

    // Botões
    btnCopiar = document.getElementById("btn-copiar");
    btnCartao = document.getElementById("btn-cartao");
    btnJaPaguei = document.getElementById("btn-ja-paguei");

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
    console.log(CONFIG.pagamento.pix.chave);

    console.log("===== FAVORECIDO =====");
    console.log(CONFIG.pagamento.pix.favorecido);

    console.log("===== TOTAL PEDIDO =====");
    console.log(localStorage.getItem("totalPedido"));

    // Total
    valorTotal =
    carregar(STORAGE.TOTAL_PEDIDO) || 0;

    console.log("campoTotal:", campoTotal);
    console.log("campoChave:", campoChave);
    console.log("campoFavorecido:", campoFavorecido);

    const qrCode =
        document.getElementById("qrcode");

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

    btnCartao.addEventListener(
        "click",
        abrirMercadoPago
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

    }else{

        areaPix.style.display = "none";

        areaCartao.style.display = "block";

    }

}

// ====================================
// 06. COPIAR CHAVE PIX
// ====================================

function copiarChave(){

    navigator.clipboard.writeText(
        CONFIG.pagamento.pix.chave
    );

    alert("Chave PIX copiada!");

}

// ====================================
// 07. MERCADO PAGO
// ====================================

function abrirMercadoPago(){

    window.open(

        CONFIG.pagamento.cartao.linkMercadoPago,

        "_blank"

    );

}

// ====================================
// 08. FINALIZAR
// ====================================

function finalizarPagamento(){

    let mensagem = "";

    mensagem += montarCabecalho();

    mensagem += montarEntrega();

    mensagem += montarPagamento();

    mensagem += montarProdutos();

    mensagem += montarRodape();

    enviarWhatsApp(mensagem);

}