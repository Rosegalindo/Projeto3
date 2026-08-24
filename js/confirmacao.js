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

async function carregarResumo(){

    console.log("");
    console.log("====================================");
    console.log("📦 CARREGANDO CONFIRMAÇÃO DO PEDIDO");
    console.log("====================================");


    // ====================================
    // PEGAR NÚMERO DO PEDIDO DA URL
    // ====================================

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const numeroPedido =
        parametros.get("pedido");

    const paymentId =
        parametros.get("payment_id");


    console.log(
        "Pedido recebido pela URL:",
        numeroPedido
    );

    console.log(
        "Payment ID recebido pela URL:",
        paymentId
    );


    // ====================================
    // VERIFICAR PEDIDO
    // ====================================

    if(!numeroPedido){

        console.error(
            "❌ Número do pedido não encontrado na URL."
        );

        alert(
            "Não foi possível identificar o pedido."
        );

        return;

    }


    // ====================================
    // CONSULTAR BACKEND
    // ====================================

    try{

        console.log(
            "🔎 Consultando status do pedido no backend..."
        );


        const resposta =
            await fetch(
                `http://localhost:3000/pedido/${encodeURIComponent(numeroPedido)}/status`
            );


        const resultado =
            await resposta.json();


        console.log(
            "📦 Resposta do backend:"
        );

        console.log(
            resultado
        );


        // ====================================
        // VERIFICAR RESPOSTA
        // ====================================

        if(!resposta.ok || !resultado.sucesso){

            console.error(
                "❌ Não foi possível consultar o pedido."
            );

            alert(
                "Não foi possível confirmar o pedido."
            );

            return;

        }


        // ====================================
        // VERIFICAR STATUS
        // ====================================

        console.log(
            "Status do pedido:",
            resultado.status
        );


        if(resultado.status !== "PAGO"){

            console.warn(
                "⚠️ Pedido ainda não está como PAGO."
            );

            alert(
                "O pagamento ainda não foi confirmado."
            );

            return;

        }


        // ====================================
        // CARREGAR PEDIDO LOCAL
        // ====================================

        const pedido =
            carregar(STORAGE.PEDIDO);


        if(!pedido){

            console.error(
                "❌ Pedido não encontrado no armazenamento local."
            );

            alert(
                "Não foi possível carregar os dados do pedido."
            );

            return;

        }


        // ====================================
        // GARANTIR QUE É O MESMO PEDIDO
        // ====================================

        if(
            pedido.numero &&
            pedido.numero !== numeroPedido
        ){

            console.error(
                "❌ O pedido local não corresponde ao pedido confirmado."
            );

            alert(
                "O pedido confirmado não corresponde ao pedido atual."
            );

            return;

        }


        // ====================================
        // MOSTRAR TOTAL
        // ====================================

        campoTotal.textContent =
            formatarMoeda(
                pedido.valores?.total || 0
            );


        // ====================================
        // MOSTRAR FORMA DE PAGAMENTO
        // ====================================

        campoPagamento.textContent =
            pedido.pagamento?.metodo
                ? pedido.pagamento.metodo.toUpperCase()
                : "MERCADO PAGO";


        // ====================================
        // CONFIRMAÇÃO
        // ====================================

        console.log("");
        console.log("====================================");
        console.log("✅ PEDIDO CONFIRMADO");
        console.log("====================================");

        console.log(
            "Pedido:",
            numeroPedido
        );

        console.log(
            "Status:",
            resultado.status
        );

        console.log(
            "Pagamento:",
            resultado.pagamentoId
        );

        console.log(
            "Total:",
            pedido.valores?.total
        );

    }catch(erro){

        console.error(
            "❌ Erro ao consultar confirmação:",
            erro
        );

        alert(
            "Não foi possível confirmar o pedido."
        );

    }

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

    console.log("ENTREGA:");
    console.log(pedido.entrega);

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