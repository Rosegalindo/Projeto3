// ============================================================
// PAGAMENTO.JS
// Fluxo simples de pagamento com Mercado Pago
// ============================================================

console.log("========================================");
console.log("💳 PAGAMENTO INICIADO");
console.log("========================================");


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const API_URL = "http://localhost:3000";


// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

const botaoPagar = document.getElementById("btn-pagar");
const textoBotao = document.getElementById("texto-btn-pagar");


// ============================================================
// VERIFICAR BOTÃO
// ============================================================

if (!botaoPagar) {

    console.error("❌ Botão #btn-pagar não encontrado!");

} else {

    console.log("🟢 Botão #btn-pagar encontrado:", botaoPagar);

}


// ============================================================
// CARREGAR PEDIDO
// ============================================================

function carregarPedido() {

    console.log("🔎 Procurando pedido no localStorage...");

    const pedidoSalvo = localStorage.getItem("pedido");

    if (!pedidoSalvo) {

        console.error("❌ Nenhum pedido encontrado no localStorage.");

        return null;
    }

    try {

        const pedido = JSON.parse(pedidoSalvo);

        console.log("✅ Pedido encontrado:", pedido);

        return pedido;

    } catch (erro) {

        console.error("❌ Erro ao ler pedido:", erro);

        return null;
    }
}


// ============================================================
// MOSTRAR PEDIDO NA TELA
// ============================================================

function mostrarPedido(pedido) {

    if (!pedido) {
        return;
    }

    console.log("📦 Mostrando pedido na tela...");

    console.log("Número:", pedido.numero);
    console.log("Total:", pedido.valores?.total);


    // --------------------------------------------------------
    // NÚMERO DO PEDIDO
    // --------------------------------------------------------

    const numeroPedido = document.getElementById("numero-pedido");

    if (numeroPedido && pedido.numero) {

        numeroPedido.textContent = pedido.numero;

    }


    // --------------------------------------------------------
    // TOTAL
    // --------------------------------------------------------

    const totalPedido = document.getElementById("total-pedido");

    const total =
        pedido.valores?.total ??
        pedido.total ??
        0;

    if (totalPedido) {

        totalPedido.textContent =
            Number(total).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

    }
}


// ============================================================
// ALTERAR ESTADO DO BOTÃO
// ============================================================

function alterarEstadoBotao(carregando) {

    if (!botaoPagar) {
        return;
    }

    botaoPagar.disabled = carregando;

    if (carregando) {

        if (textoBotao) {
            textoBotao.textContent = "Iniciando pagamento...";
        }

    } else {

        if (textoBotao) {
            textoBotao.textContent = "Pagar com Mercado Pago";
        }

    }
}


// ============================================================
// CRIAR CHECKOUT
// ============================================================

async function iniciarPagamento() {

    console.log("");
    console.log("========================================");
    console.log("🚀 INICIANDO PAGAMENTO");
    console.log("========================================");


    // --------------------------------------------------------
    // CARREGAR PEDIDO
    // --------------------------------------------------------

    const pedido = carregarPedido();

    if (!pedido) {

        alert("Não foi possível encontrar o pedido.");

        return;
    }


    // --------------------------------------------------------
    // DADOS DO PEDIDO
    // --------------------------------------------------------

    const numero = pedido.numero;

    const produtos = pedido.produtos || [];

    const total =
        Number(
            pedido.valores?.total ??
            pedido.total ??
            0
        );


    console.log("📋 DADOS DO PEDIDO");
    console.log("Número:", numero);
    console.log("Produtos:", produtos);
    console.log("Total:", total);


    // --------------------------------------------------------
    // VALIDAR TOTAL
    // --------------------------------------------------------

    if (!total || total <= 0) {

        console.error("❌ Total inválido:", total);

        alert("O valor do pedido é inválido.");

        return;
    }


    // --------------------------------------------------------
    // DESABILITAR BOTÃO
    // --------------------------------------------------------

    alterarEstadoBotao(true);


    try {

        // ----------------------------------------------------
        // ENVIAR PARA BACKEND
        // ----------------------------------------------------

        const url = API_URL + "/criar-preferencia";

        console.log("");
        console.log("📤 ENVIANDO PEDIDO PARA O BACKEND");
        console.log("URL:", url);


        const dados = {

            numero: numero,

            produtos: produtos,

            valores: {

                subtotal:
                    pedido.valores?.subtotal ??
                    total,

                frete:
                    pedido.valores?.frete ??
                    0,

                total: total

            }

        };


        console.log("📦 Dados enviados:");
        console.log(dados);


        // ----------------------------------------------------
        // FETCH
        // ----------------------------------------------------

        const resposta = await fetch(
            url,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dados)

            }
        );


        // ----------------------------------------------------
        // STATUS HTTP
        // ----------------------------------------------------

        console.log("");
        console.log("📡 STATUS HTTP:", resposta.status);


        // ----------------------------------------------------
        // VERIFICAR ERRO HTTP
        // ----------------------------------------------------

        if (!resposta.ok) {

            const textoErro = await resposta.text();

            console.error(
                "❌ BACKEND RETORNOU ERRO:"
            );

            console.error(textoErro);

            throw new Error(
                "Erro HTTP " +
                resposta.status +
                ": " +
                textoErro
            );
        }


        // ----------------------------------------------------
        // CONVERTER RESPOSTA
        // ----------------------------------------------------

        const resultado = await resposta.json();


        console.log("");
        console.log("========================================");
        console.log("📦 RESPOSTA DO BACKEND");
        console.log("========================================");

        console.log(resultado);


        // ----------------------------------------------------
        // PEGAR URL DO CHECKOUT
        // ----------------------------------------------------

        const checkoutUrl =
            resultado.checkout ||
            resultado.checkoutUrl ||
            resultado.init_point ||
            resultado.initPoint;


        console.log("");
        console.log("🔗 URL DO CHECKOUT:");
        console.log(checkoutUrl);


        // ----------------------------------------------------
        // VALIDAR URL
        // ----------------------------------------------------

        if (!checkoutUrl) {

            console.error(
                "❌ Backend não enviou URL de checkout."
            );

            throw new Error(
                "URL do checkout não recebida."
            );
        }


        // ----------------------------------------------------
        // REDIRECIONAR
        // ----------------------------------------------------

        console.log("");
        console.log("========================================");
        console.log("🚀 REDIRECIONANDO PARA MERCADO PAGO");
        console.log("========================================");

        console.log(checkoutUrl);


        window.location.href = checkoutUrl;


    } catch (erro) {

        console.error("");
        console.error("========================================");
        console.error("❌ ERRO NO PAGAMENTO");
        console.error("========================================");

        console.error(erro);

        alert(
            "Não foi possível iniciar o pagamento.\n\n" +
            erro.message
        );


        alterarEstadoBotao(false);
    }
}


// ============================================================
// EVENTO DO BOTÃO
// ============================================================

if (botaoPagar) {

    botaoPagar.addEventListener(
        "click",
        function (evento) {

            // IMPORTANTE:
            // Impede o formulário de recarregar a página.
            evento.preventDefault();

            console.log("");
            console.log("🟢 CLIQUE NO BOTÃO PAGAR DETECTADO!");

            iniciarPagamento();

        }
    );

    console.log("✅ Evento de clique configurado.");

}


// ============================================================
// CARREGAR PÁGINA
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("📄 Página de pagamento carregada.");

        const pedido = carregarPedido();

        if (!pedido) {
            return;
        }

        mostrarPedido(pedido);

    }
);