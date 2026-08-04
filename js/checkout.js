// ======================================================
// SOLVER STORE
// CHECKOUT 2.0
// ======================================================

// ====================================
// 01. SELETORES
// ====================================

const UI = {

    lista: document.getElementById("lista-checkout"),

    subtotal: document.getElementById("subtotal"),

    frete: document.getElementById("frete"),

    total: document.getElementById("total"),

    endereco: document.getElementById("endereco"),

    nome: document.getElementById("nome"),

    telefone: document.getElementById("telefone"),

    btnFinalizar: document.getElementById("btn-finalizar"),

    radiosEntrega: document.querySelectorAll("input[name='entrega']")

};

// ====================================
// 02. VARIÁVEIS
// ====================================

let valorSubtotal = 0;

let valorFrete = 0;

// ====================================
// 03. INICIALIZAÇÃO
// ====================================

document.addEventListener("DOMContentLoaded", iniciarCheckout);

function iniciarCheckout(){

    carregarProdutos();

    atualizarEntrega();

}

// ====================================
// 04. PRODUTOS
// ====================================

function carregarProdutos(){

    valorSubtotal = 0;

    UI.lista.innerHTML = "";

    const comprarAgora = localStorage.getItem("comprarAgora");

    if(comprarAgora){

        const produto = produtos.find(p => p.id == comprarAgora);

        if(produto){

            mostrarProduto(produto,1);

        }

        localStorage.removeItem("comprarAgora");

        return;

    }

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    carrinho.forEach(produto => {

        mostrarProduto(produto, produto.quantidade);

    });

}

function mostrarProduto(produto, quantidade){

    valorSubtotal += produto.preco * quantidade;

    const html = `

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

    UI.lista.insertAdjacentHTML("beforeend", html);

    atualizarTotais();

}

// ====================================
// 05. TOTAIS
// ====================================

function atualizarTotais(){

    UI.subtotal.textContent =
        "R$ " + valorSubtotal.toFixed(2);

    UI.frete.textContent =
        "R$ " + valorFrete.toFixed(2);

    UI.total.textContent =
        "R$ " + (valorSubtotal + valorFrete).toFixed(2);

}

// ====================================
// 06. ENTREGA
// ====================================

function atualizarEntrega(){

    const radioSelecionado = document.querySelector(
        "input[name='entrega']:checked"
    );

    if(!radioSelecionado){
        return;
    }

    const tipoEntrega = radioSelecionado.value;

    if(tipoEntrega === "retirada"){

        UI.endereco.style.display = "none";

        valorFrete = 0;

    }else{

        UI.endereco.style.display = "block";

        const bairro = document.getElementById("bairro")?.value || "";

        valorFrete = calcularFrete(bairro);

    }

    atualizarTotais();

}

// ====================================
// 07. VALIDAÇÃO
// ====================================

function validarFormulario(){

    if(UI.nome.value.trim() === ""){

        alert("Informe seu nome.");

        UI.nome.focus();

        return false;

    }

    if(UI.telefone.value.trim() === ""){

        alert("Informe seu WhatsApp.");

        UI.telefone.focus();

        return false;

    }

    return true;

}

// ====================================
// 08. MENSAGEM WHATSAPP
// ====================================

// -----------------------------
// CABEÇALHO
// -----------------------------

function montarCabecalho(){

    return `
🛍️ *${CONFIG.nomeLoja}*

═══════════════════════

👤 *Cliente:*
${UI.nome.value}

📱 *WhatsApp:*
${UI.telefone.value}

`;

}

// -----------------------------
// ENTREGA
// -----------------------------

function montarEntrega(){

    const tipoEntrega =
        document.querySelector("input[name='entrega']:checked").value;

    let textoEntrega =
        tipoEntrega === "retirada"
        ? "Retirar no Local"
        : "Entrega em Domicílio";

    let mensagem = `

═══════════════════════

🚚 *ENTREGA*

${textoEntrega}

`;

    if(tipoEntrega === "entrega"){

        mensagem += `

CEP:
${document.getElementById("cep").value}

Estado:
${document.getElementById("estado").value}

Cidade:
${document.getElementById("cidade").value}

Bairro:
${document.getElementById("bairro").value}

Rua:
${document.getElementById("rua").value}

Número:
${document.getElementById("numero").value}

Complemento:
${document.getElementById("complemento").value}

Referência:
${document.getElementById("referencia").value}

`;

    }

    return mensagem;

}

// -----------------------------
// PAGAMENTO
// -----------------------------

function montarPagamento(){

    const pagamento =
        document.querySelector("input[name='pagamento']:checked").value;

    let textoPagamento =
        pagamento === "pix"
        ? "PIX"
        : "Cartão de Crédito";

    return `

═══════════════════════

💳 *PAGAMENTO*

${textoPagamento}

`;

}