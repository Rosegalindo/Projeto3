// ======================================
// SOLVER STORE
// CONFIRMAÇÃO
// ======================================

let btnEnviar;

let valorTotal;

let formaPagamento;

// ======================================
// INICIAR
// ======================================

document.addEventListener(

    "DOMContentLoaded",

    iniciarConfirmacao

);

function iniciarConfirmacao(){

    console.log("Confirmação iniciada");

    btnEnviar =
        document.getElementById("btn-enviar");

    valorTotal =
        document.getElementById("valor-total");

    formaPagamento =
        document.getElementById("forma-pagamento");

    carregarResumo();

    registrarEventos();

}

// ======================================
// CARREGAR
// ======================================

function carregarResumo(){

    const pedido =
        carregar(STORAGE.PEDIDO);

console.log("PEDIDO:", pedido);

console.log("VALORES:", pedido.valores.total);

console.log("PAGAMENTO:", pedido.pagamento.metodo);

    if(!pedido){

        return;

    }

    valorTotal.textContent =
    formatarMoeda(
        pedido.valores.total
    );

formaPagamento.textContent =
    pedido.pagamento.metodo.toUpperCase();

}

// ======================================
// EVENTOS
// ======================================

function registrarEventos(){

    btnEnviar.addEventListener(

        "click",

        enviarPedido

    );

}

// ======================================
// ENVIAR
// ======================================

function enviarPedido(){

    alert(

        "Na próxima etapa enviaremos o pedido para o WhatsApp."

    );

}