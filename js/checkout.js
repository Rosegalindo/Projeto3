console.log("🔥🔥🔥🔥🔥");
// ======================================================
// SOLVER STORE
// CHECKOUT
// ======================================================

// ================================
// 01. PRODUTOS
// ================================

//Lista
const lista = document.getElementById("lista-checkout");

//Subtotal
const subtotal = document.getElementById("subtotal");

//Total
const total = document.getElementById("total");

//Frete
const frete = document.getElementById("frete");

let valorFrete = 0;

let valorSubtotal = 0;

// ====================================
// 02. INICIALIZAÇÃO DO CHECKOUT
// ====================================

const comprarAgora = localStorage.getItem("comprarAgora");

if (comprarAgora) {

    const produto = produtos.find(p => p.id == comprarAgora);

    if (produto) {
        mostrarProduto(produto, 1);
    }

    localStorage.removeItem("comprarAgora");

} else {

    carregarCarrinho();

}

// ====================================
// 03. EXIBIÇÃO DOS PRODUTOS
// ====================================

function mostrarProduto(produto, quantidade){

    valorSubtotal += produto.preco * quantidade;

    lista.innerHTML += `

    <div class="produto-checkout">

        <img src="${produto.imagem}" alt="${produto.nome}">

        <div>

            <h3>${produto.nome}</h3>

            <p>Quantidade: ${quantidade}</p>

            <strong>
                R$ ${(produto.preco * quantidade).toFixed(2)}
            </strong>

        </div>

    </div>

    `;

    atualizarTotais();

}

function carregarCarrinho(){

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    carrinho.forEach(produto => {

        mostrarProduto(produto, produto.quantidade);

    });

}

// ====================================
// 04. TOTAIS
// ====================================

function atualizarTotais(){

    subtotal.textContent = "R$ " + valorSubtotal.toFixed(2);

    frete.textContent = "R$ " + valorFrete.toFixed(2);

    total.textContent =
        "R$ " + (valorSubtotal + valorFrete).toFixed(2);

}

// ====================================
// 05. ENTREGA
// ====================================

const endereco = document.getElementById("endereco");

const radiosEntrega = document.querySelectorAll("input[name='entrega']");

function atualizarEntrega(){

    const radioSelecionado = document.querySelector(
        "input[name='entrega']:checked"
    );

    if(!radioSelecionado){
        return;
    }

    const tipoEntrega = radioSelecionado.value;

    if(tipoEntrega === "retirada"){

        endereco.style.display = "none";

        valorFrete = 0;

    }else{

        endereco.style.display = "block";

        const campoBairro = document.getElementById("bairro");

        if(campoBairro){

            valorFrete = calcularFrete(campoBairro.value);

        }

    }

    atualizarTotais();

}

// ====================================
// 06. VALIDAÇÃO
// ====================================

function validarFormulario(){

    const nome = document.getElementById("nome").value.trim();

    const telefone = document.getElementById("telefone").value.trim();

    if(nome === ""){

        alert("Informe seu nome.");

        return false;

    }

    if(telefone === ""){

        alert("Informe seu WhatsApp.");

        return false;

    }

    return true;

}
// ====================================
// 07. MENSAGEM WHATSAPP
// ====================================

// ------------------------------------
// CABEÇALHO
// ------------------------------------

function montarCabecalho(){

    const nome = document.getElementById("nome").value.trim();

    const telefone = document.getElementById("telefone").value.trim();

    return `
PERFUMARIA AMAKHA PARIS

═══════════════

Cliente:
⭐ TESTE
${nome}

WHATSAPP:
${telefone}

═══════════════

`;
}

// ------------------------------------
// ENTREGA
// ------------------------------------

function montarEntrega(){

    const tipoEntrega =
        document.querySelector("input[name='entrega']:checked").value;

    let entregaTexto = "";

    if(tipoEntrega === "retirada"){

        entregaTexto = "Retirar no Local";

    }else{

        entregaTexto = "Entrega em Domicílio";

    }

    const cep = document.getElementById("cep").value.trim();
    const estado = document.getElementById("estado").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const complemento = document.getElementById("complemento").value.trim();
    const referencia = document.getElementById("referencia").value.trim();

    let mensagem = `
🚚 *ENTREGA*

${entregaTexto}
`;

    if(tipoEntrega === "entrega"){

        mensagem += `

CEP: ${cep}

Estado: ${estado}

Cidade: ${cidade}

Bairro: ${bairro}

Rua: ${rua}

Número: ${numero}

Complemento: ${complemento}

Referência: ${referencia}

`;

    }

    return mensagem;

}


// ------------------------------------
// PAGAMENTO
// ------------------------------------

function montarPagamento(){

    const pagamento =
        document.querySelector("input[name='pagamento']:checked").value;

    let pagamentoTexto = "";

    if(pagamento === "pix"){

        pagamentoTexto = "PIX";

    }else{

        pagamentoTexto = "Cartão de Crédito";

    }

    return `

═══════════════

💳 *PAGAMENTO*

${pagamentoTexto}

`;

}

// ------------------------------------
// PRODUTOS
// ------------------------------------

function montarProdutos(){

    let mensagem = "";

    const idComprarAgora = localStorage.getItem("comprarAgora");

    if(idComprarAgora){

        const produto = produtos.find(p => p.id == idComprarAgora);

        if(produto){

            mensagem += `
🛒 *PRODUTOS*

• ${produto.nome}

Quantidade: 1

Valor: R$ ${produto.preco.toFixed(2)}

`;

        }

    }else{

        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        carrinho.forEach(produto => {

            mensagem += `
• ${produto.nome}

Quantidade: ${produto.quantidade}

Valor: R$ ${(produto.preco * produto.quantidade).toFixed(2)}

`;

        });

    }

    return mensagem;

}


// ------------------------------------
// RODAPÉ
// ------------------------------------

function montarRodape(){

    return `

═══════════════

Subtotal: ${subtotal.textContent}

Frete: ${frete.textContent}

💰 *TOTAL*

${total.textContent}

═══════════════

🌹 Obrigado pela preferência!

Equipe ${CONFIG.nomeLoja}

`;

}

//==========================
// 08. ENVIAR WHATSAPP
//==========================
function enviarWhatsApp(mensagem){

    console.log(mensagem);

    const texto = encodeURIComponent(mensagem);

    console.log(texto);

    const numeroLoja = CONFIG.whatsapp;

    const texto = encodeURIComponent(mensagem);

    console.log(texto);

    const url = `https://api.whatsapp.com/send?phone=${numeroLoja}&text=${texto}`;

    window.open(url, "_blank");

}

// ====================================
// 09. FINALIZAR PEDIDO
// ====================================

function finalizarPedido(){

    if(!validarFormulario()) return;

    let mensagem = "";

    mensagem += montarCabecalho();

    mensagem += montarEntrega();

    mensagem += montarPagamento();

    mensagem += montarProdutos();

    mensagem += montarRodape();

    enviarWhatsApp(mensagem);

}

// ====================================
// 10. INICIALIZAÇÃO DA TELA
// ====================================

document.addEventListener("DOMContentLoaded", () => {

    atualizarEntrega();

});

// ====================================
// 11. EVENTOS
// ====================================

// Botão Finalizar Pedido
const btnFinalizar = document.getElementById("btn-finalizar");

if(btnFinalizar){

    btnFinalizar.addEventListener("click", finalizarPedido);

}

// Alteração do tipo de entrega
radiosEntrega.forEach(radio => {

    radio.addEventListener("change", atualizarEntrega);

});