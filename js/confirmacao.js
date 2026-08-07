// =====================================================
// SOLVER STORE
// CONFIRMAÇÃO
// =====================================================



// =====================================================
// ELEMENTOS
// =====================================================

const campoTotal =
    document.getElementById("valor-total");

const campoPagamento =
    document.getElementById("forma-pagamento");

const btnWhatsApp =
    document.getElementById("btn-whatsapp");



// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarConfirmacao
);



function iniciarConfirmacao(){

    console.log("✔ Confirmação iniciada");

    carregarResumo();

    registrarEventos();

}



// =====================================================
// CARREGAR RESUMO
// =====================================================

function carregarResumo(){

    const pedido =
        carregar(STORAGE.PEDIDO);

    if(!pedido){

        alert("Pedido não encontrado.");

        window.location.href="checkout.html";

        return;

    }

    campoTotal.textContent =
        formatarMoeda(
            pedido.valores.total
        );

    campoPagamento.textContent =
        pedido.pagamento.metodo.toUpperCase();

}



// =====================================================
// EVENTOS
// =====================================================

function registrarEventos(){

    btnWhatsApp.addEventListener(

        "click",

        enviarPedido

    );

}



// =====================================================
// ENVIAR PEDIDO
// =====================================================

function enviarPedido(){

    const pedido =
        carregar(STORAGE.PEDIDO);

    if(!pedido){

        alert("Pedido não encontrado.");

        return;

    }

    const mensagem =
        montarMensagem(pedido);

    enviarWhatsApp(mensagem);

    limparPedido();

}



// =====================================================
// LIMPAR DADOS
// =====================================================

function limparPedido(){

    remover(STORAGE.PEDIDO);

    remover(STORAGE.CARRINHO);

    localStorage.removeItem("comprarAgora");

    setTimeout(()=>{

        window.location.href="../index.html";

    },1000);

}