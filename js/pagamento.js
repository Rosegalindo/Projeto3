// ======================================================
// PAGAMENTO.JS
// ======================================================

console.log("========================================");
console.log("💳 PAGAMENTO.JS INICIADO");
console.log("========================================");

document.addEventListener("DOMContentLoaded", () => {

    console.log("📄 Página de pagamento carregada.");

    // --------------------------------------------------
    // ELEMENTOS DA PÁGINA
    // --------------------------------------------------

    const botaoPagar = document.getElementById("btn-pagar");

    console.log("🔎 Procurando botão #btn-pagar...");

    if (!botaoPagar) {
        console.error("❌ BOTÃO #btn-pagar NÃO ENCONTRADO!");
        return;
    }

    console.log("🟢 BOTÃO #btn-pagar ENCONTRADO:", botaoPagar);


    // --------------------------------------------------
    // CARREGAR PEDIDO
    // --------------------------------------------------

    const pedido = JSON.parse(localStorage.getItem("pedido"));

    console.log("🔎 Procurando pedido no localStorage...");

    if (!pedido) {
        console.error("❌ Nenhum pedido encontrado no localStorage.");
        return;
    }

    console.log("🟢 PEDIDO ENCONTRADO:", pedido);


    // --------------------------------------------------
    // MOSTRAR PEDIDO NA TELA
    // --------------------------------------------------

    const numeroPedido = document.getElementById("numero-pedido");
    const valorTotal = document.getElementById("valor-total");

    const total =
        Number(pedido?.valores?.total) ||
        Number(pedido?.total) ||
        0;

    if (numeroPedido) {
        numeroPedido.textContent = pedido.numero || "-";
    }

    if (valorTotal) {
        valorTotal.textContent = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    console.log("📦 Número:", pedido.numero);
    console.log("💰 Total:", total);


    // --------------------------------------------------
    // CLIQUE NO BOTÃO PAGAR
    // --------------------------------------------------

    botaoPagar.addEventListener("click", async function (event) {

        event.preventDefault();

        console.log("");
        console.log("========================================");
        console.log("🟢 CLIQUE NO BOTÃO PAGAR DETECTADO!");
        console.log("========================================");

        // Evita clique duplo
        botaoPagar.disabled = true;

        const textoOriginal = botaoPagar.innerHTML;

        botaoPagar.innerHTML = "⏳ Gerando pagamento...";


        try {

            // --------------------------------------------------
            // API
            // --------------------------------------------------

            const apiUrl =
                window.API_URL ||
                "http://localhost:3000";

            const url = apiUrl + "/criar-preferencia";


            console.log("🚀 ENVIANDO PEDIDO PARA O BACKEND...");
            console.log("🌐 URL:", url);


            // --------------------------------------------------
            // DADOS
            // --------------------------------------------------

            const dados = {
                numero: pedido.numero,

                produtos: pedido.produtos || [],

                valores: pedido.valores || {
                    subtotal: total,
                    frete: 0,
                    total: total
                }
            };


            console.log("📦 DADOS ENVIADOS:");
            console.log(dados);


            // --------------------------------------------------
            // FETCH
            // --------------------------------------------------

            const resposta = await fetch(url, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dados)

            });


            console.log("📡 STATUS HTTP:", resposta.status);


            // --------------------------------------------------
            // RESPOSTA DO BACKEND
            // --------------------------------------------------

            const texto = await resposta.text();

            console.log("📥 RESPOSTA BRUTA DO BACKEND:");
            console.log(texto);


            if (!resposta.ok) {

                throw new Error(
                    "Backend retornou HTTP " +
                    resposta.status +
                    ": " +
                    texto
                );

            }


            // --------------------------------------------------
            // CONVERTER JSON
            // --------------------------------------------------

            let resultado;

            try {

                resultado = JSON.parse(texto);

            } catch (erro) {

                console.error(
                    "❌ Backend não retornou JSON válido."
                );

                throw new Error(
                    "Resposta do backend não é JSON válido."
                );

            }


            console.log("========================================");
            console.log("📥 RESPOSTA DO BACKEND:");
            console.log(resultado);
            console.log("========================================");


            // --------------------------------------------------
            // LOCALIZAR URL DO MERCADO PAGO
            // --------------------------------------------------

            const checkoutUrl =
                resultado.checkout ||
                resultado.checkoutUrl ||
                resultado.init_point ||
                resultado.initPoint ||
                resultado.url;


            console.log("🔎 CHECKOUT URL:", checkoutUrl);


            if (!checkoutUrl) {

                console.error(
                    "❌ O backend respondeu, mas não enviou URL do Mercado Pago."
                );

                throw new Error(
                    "URL do checkout não encontrada na resposta do backend."
                );

            }


            // --------------------------------------------------
            // REDIRECIONAR
            // --------------------------------------------------

            console.log("");
            console.log("========================================");
            console.log("🚀 REDIRECIONANDO PARA MERCADO PAGO...");
            console.log("🔗", checkoutUrl);
            console.log("========================================");


            window.location.href = checkoutUrl;


        } catch (erro) {

            console.error("");
            console.error("========================================");
            console.error("❌ ERRO NO PAGAMENTO");
            console.error("========================================");
            console.error(erro);


            botaoPagar.disabled = false;
            botaoPagar.innerHTML = textoOriginal;


            alert(
                "Não foi possível iniciar o pagamento.\n\n" +
                erro.message
            );

        }

    });


    console.log("🟢 EVENTO DE CLIQUE CONFIGURADO COM SUCESSO!");

});