// ==========================================================
// PAGAMENTO.JS
// SOLVER STORE
// MERCADO PAGO - CHECKOUT PRO
// ==========================================================

console.log("💳 Pagamento iniciado");


// ==========================================================
// CONFIGURAÇÕES
// ==========================================================

// Backend local
const API_URL = "http://localhost:3000";


// ==========================================================
// ELEMENTOS DA PÁGINA
// ==========================================================

const btnPagar = document.getElementById("btn-pagar");

const valorTotal = document.getElementById("valor-total");

const numeroPedido = document.getElementById("numero-pedido");

const statusArea = document.getElementById("status-area");

const statusMensagem =
    document.getElementById("status-mensagem");

const textoBtnPagar =
    document.getElementById("texto-btn-pagar");


// ==========================================================
// VERIFICAR BOTÃO
// ==========================================================

if (btnPagar) {

    console.log(
        "🟢 Botão Pagar encontrado:",
        btnPagar
    );

} else {

    console.error(
        "🔴 ERRO: botão #btn-pagar não encontrado."
    );

}


// ==========================================================
// FUNÇÃO FORMATAR VALOR
// ==========================================================

function formatarMoeda(valor) {

    const numero = Number(valor);

    if (Number.isNaN(numero)) {

        return "R$ 0,00";

    }

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ==========================================================
// RECUPERAR PEDIDO DO LOCALSTORAGE
// ==========================================================

function carregarPedido() {

    console.log(
        "📦 Procurando pedido no localStorage..."
    );


    const pedidoSalvo =
        localStorage.getItem("pedido");


    if (!pedidoSalvo) {

        console.error(
            "❌ Nenhum pedido encontrado no localStorage."
        );

        mostrarStatus(
            "Não foi possível encontrar o pedido.",
            "erro"
        );

        return null;

    }


    try {

        const pedido =
            JSON.parse(pedidoSalvo);


        console.log(
            "📦 Pedido encontrado no localStorage: pedido"
        );


        console.log(
            "===================================="
        );

        console.log(
            "🛒 PEDIDO PARA PAGAMENTO"
        );

        console.log(
            "===================================="
        );


        console.log(
            pedido
        );


        return pedido;


    } catch (erro) {

        console.error(
            "❌ Erro ao ler o pedido:",
            erro
        );


        mostrarStatus(
            "O pedido armazenado está inválido.",
            "erro"
        );


        return null;

    }

}


// ==========================================================
// OBTER NÚMERO DO PEDIDO
// ==========================================================

function obterNumeroPedido(pedido) {

    return (

        pedido.numero ||

        pedido.numeroPedido ||

        pedido.id ||

        ""

    );

}


// ==========================================================
// OBTER PRODUTOS
// ==========================================================

function obterProdutos(pedido) {

    if (
        Array.isArray(pedido.produtos) &&
        pedido.produtos.length > 0
    ) {

        return pedido.produtos;

    }


    if (
        Array.isArray(pedido.itens) &&
        pedido.itens.length > 0
    ) {

        return pedido.itens;

    }


    if (
        Array.isArray(pedido.items) &&
        pedido.items.length > 0
    ) {

        return pedido.items;

    }


    return [];

}


// ==========================================================
// CALCULAR TOTAL DOS PRODUTOS
// ==========================================================

function calcularTotalProdutos(produtos) {

    let total = 0;


    produtos.forEach(produto => {

        const quantidade =
            Number(
                produto.quantidade ||
                produto.qtd ||
                1
            );


        const preco =
            Number(
                produto.preco ||
                produto.valor ||
                produto.unit_price ||
                0
            );


        total +=
            quantidade * preco;

    });


    return total;

}


// ==========================================================
// OBTER TOTAL DO PEDIDO
// ==========================================================

function obterTotal(pedido, produtos) {

    // ------------------------------------------------------
    // PRIMEIRA OPÇÃO:
    // pedido.valores.total
    // ------------------------------------------------------

    if (
        pedido.valores &&
        pedido.valores.total !== undefined
    ) {

        return Number(
            pedido.valores.total
        );

    }


    // ------------------------------------------------------
    // SEGUNDA OPÇÃO:
    // pedido.total
    // ------------------------------------------------------

    if (
        pedido.total !== undefined
    ) {

        return Number(
            pedido.total
        );

    }


    // ------------------------------------------------------
    // TERCEIRA OPÇÃO:
    // calcular pelos produtos
    // ------------------------------------------------------

    return calcularTotalProdutos(
        produtos
    );

}


// ==========================================================
// MOSTRAR DADOS DO PEDIDO
// ==========================================================

function mostrarPedido(pedido) {

    const numero =
        obterNumeroPedido(pedido);


    const produtos =
        obterProdutos(pedido);


    const total =
        obterTotal(
            pedido,
            produtos
        );


    console.log(
        "Número do pedido:",
        numero
    );


    console.log(
        "Total:",
        total
    );


    // ------------------------------------------------------
    // NÚMERO DO PEDIDO
    // ------------------------------------------------------

    if (numeroPedido) {

        numeroPedido.textContent =
            numero || "-";

    }


    // ------------------------------------------------------
    // TOTAL
    // ------------------------------------------------------

    if (valorTotal) {

        valorTotal.textContent =
            formatarMoeda(total);

    }


    return {

        numero,

        produtos,

        total

    };

}


// ==========================================================
// MOSTRAR STATUS
// ==========================================================

function mostrarStatus(
    mensagem,
    tipo = "info"
) {

    console.log(
        "ℹ️ Status:",
        mensagem
    );


    if (
        !statusArea ||
        !statusMensagem
    ) {

        return;

    }


    statusArea.style.display =
        "block";


    statusMensagem.textContent =
        mensagem;


    statusMensagem.className =
        tipo;

}


// ==========================================================
// ALTERAR ESTADO DO BOTÃO
// ==========================================================

function alterarEstadoBotao(
    carregando
) {

    if (!btnPagar) {

        return;

    }


    btnPagar.disabled =
        carregando;


    if (carregando) {

        btnPagar.innerHTML =
            "<i class='bx bx-loader-alt bx-spin'></i>" +
            "<span>Iniciando pagamento...</span>";

    } else {

        btnPagar.innerHTML =
            "<i class='bx bx-lock-alt'></i>" +
            "<span id='texto-btn-pagar'>" +
            "Pagar com Mercado Pago" +
            "</span>";

    }

}


// ==========================================================
// CRIAR CHECKOUT PRO
// ==========================================================

async function iniciarCheckout() {

    console.log(
        "===================================="
    );

    console.log(
        "🚀 INICIANDO CHECKOUT PRO"
    );

    console.log(
        "===================================="
    );


    // ------------------------------------------------------
    // RECUPERAR PEDIDO
    // ------------------------------------------------------

    const pedido =
        carregarPedido();


    if (!pedido) {

        return;

    }


    // ------------------------------------------------------
    // PREPARAR DADOS
    // ------------------------------------------------------

    const numero =
        obterNumeroPedido(pedido);


    const produtos =
        obterProdutos(pedido);


    const total =
        obterTotal(
            pedido,
            produtos
        );


    console.log(
        "Número:",
        numero
    );


    console.log(
        "Produtos:",
        produtos
    );


    console.log(
        "Total:",
        total
    );


    // ------------------------------------------------------
    // VALIDAR NÚMERO
    // ------------------------------------------------------

    if (!numero) {

        console.error(
            "❌ Número do pedido não encontrado."
        );


        mostrarStatus(
            "Número do pedido não encontrado.",
            "erro"
        );


        return;

    }


    // ------------------------------------------------------
    // VALIDAR PRODUTOS
    // ------------------------------------------------------

    if (
        !Array.isArray(produtos) ||
        produtos.length === 0
    ) {

        console.error(
            "❌ Nenhum produto encontrado."
        );


        mostrarStatus(
            "Nenhum produto encontrado no pedido.",
            "erro"
        );


        return;

    }


    // ------------------------------------------------------
    // VALIDAR TOTAL
    // ------------------------------------------------------

    if (
        !total ||
        total <= 0
    ) {

        console.error(
            "❌ Valor total inválido:",
            total
        );


        mostrarStatus(
            "O valor do pedido é inválido.",
            "erro"
        );


        return;

    }


    // ------------------------------------------------------
    // DESABILITAR BOTÃO
    // ------------------------------------------------------

    alterarEstadoBotao(true);


    try {

        console.log(
            "📡 Enviando pedido para:",
            API_URL + "/criar-preferencia"
        );


        // ==================================================
        // CHAMADA PARA O BACKEND
        // ==================================================

        const resposta =
            await fetch(
                API_URL + "/criar-preferencia",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        numero: numero,

                        produtos: produtos,

                        valores:
                            pedido.valores || {

                                subtotal: total,

                                frete: 0,

                                total: total

                            }

                    })

                }
            );


        console.log(
            "📡 Status HTTP:",
            resposta.status
        );


        // ==================================================
        // VERIFICAR RESPOSTA HTTP
        // ==================================================

        if (!resposta.ok) {

            const textoErro =
                await resposta.text();


            console.error(
                "❌ Erro retornado pelo backend:",
                textoErro
            );


            throw new Error(
                "Erro HTTP " +
                resposta.status
            );

        }


        // ==================================================
        // CONVERTER RESPOSTA
        // ==================================================

        const resultado =
            await resposta.json();


        console.log(
            "✅ Resposta do backend:",
            resultado
        );


        // ==================================================
        // VERIFICAR CHECKOUT
        // ==================================================

        const checkoutUrl =
            resultado.checkout ||
            resultado.checkoutUrl ||
            resultado.init_point ||
            resultado.initPoint;


        if (!checkoutUrl) {

            console.error(
                "❌ O backend não retornou a URL do Checkout Pro."
            );


            console.error(
                "Resposta recebida:",
                resultado
            );


            throw new Error(
                "URL do Checkout Pro não recebida."
            );

        }


        // ==================================================
        // MOSTRAR URL NO CONSOLE
        // ==================================================

        console.log(
            "===================================="
        );

        console.log(
            "✅ CHECKOUT PRO RECEBIDO"
        );

        console.log(
            "===================================="
        );


        console.log(
            checkoutUrl
        );


        // ==================================================
        // REDIRECIONAR PARA MERCADO PAGO
        // ==================================================

        console.log(
            "🚀 REDIRECIONANDO PARA MERCADO PAGO..."
        );


        window.location.assign(
            checkoutUrl
        );


    } catch (erro) {

        console.error(
            "❌ ERRO AO INICIAR CHECKOUT:",
            erro
        );


        mostrarStatus(
            "Não foi possível iniciar o pagamento. Tente novamente.",
            "erro"
        );


        alterarEstadoBotao(false);

    }

}


// ==========================================================
// EVENTO DO BOTÃO
// ==========================================================

if (btnPagar) {

    btnPagar.addEventListener(
        "click",
        function () {

            console.log(
                "🟢 CLIQUE NO BOTÃO PAGAR DETECTADO!"
            );


            iniciarCheckout();

        }
    );


    console.log(
        "✅ Evento de clique configurado."
    );

}


// ==========================================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "📄 Página de pagamento carregada."
        );


        const pedido =
            carregarPedido();


        if (!pedido) {

            return;

        }


        mostrarPedido(
            pedido
        );

    }
);