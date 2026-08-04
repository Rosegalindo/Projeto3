// ======================================================
// SOLVER STORE
// CHECKOUT 2.0
// ======================================================

// ====================================
// 01. VARIÁVEIS
// ====================================

let valorSubtotal = 0;
let valorFrete = 0;

// Elementos da página
let lista;
let subtotal;
let frete;
let total;
let endereco;
let radiosEntrega;

// ====================================
// 02. INICIALIZAÇÃO
// ====================================

document.addEventListener("DOMContentLoaded", iniciarCheckout);

function iniciarCheckout(){

    console.log("✅ Checkout iniciado");

    // Busca os elementos do HTML
    lista = document.querySelector("#lista-checkout");
    console.log("Lista encontrada:", lista);
    console.log(document.body.innerHTML);
    subtotal = document.getElementById("subtotal");
    frete = document.getElementById("frete");
    total = document.getElementById("total");
    endereco = document.getElementById("endereco");
    radiosEntrega = document.querySelectorAll("input[name='entrega']");

    // Confere se encontrou a lista
    if(!lista){

        console.error("❌ Não encontrou #lista-checkout");

        return;

    }

    carregarProdutos();

}
// ====================================
// 03. PRODUTOS
// ====================================

function carregarProdutos(){

    valorSubtotal = 0;

    lista.innerHTML = "";

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

    lista.insertAdjacentHTML("beforeend",`

        <div class="produto-checkout">

            <img src="${produto.imagem}" alt="${produto.nome}">

            <div>

                <h3>${produto.nome}</h3>

                <p>Quantidade: ${quantidade}</p>

                <strong>

                    R$ ${(
                        produto.preco * quantidade
                    ).toFixed(2)}

                </strong>

            </div>

        </div>

    `);

    atualizarTotais();

}

// ====================================
// 04. TOTAIS
// ====================================

function atualizarTotais(){

    subtotal.textContent =
        "R$ " + valorSubtotal.toFixed(2);

    frete.textContent =
        "R$ " + valorFrete.toFixed(2);

    total.textContent =
        "R$ " +
        (valorSubtotal + valorFrete).toFixed(2);

}

// ====================================
// 05. ENTREGA
// ====================================

function atualizarEntrega(){

    const radioSelecionado = document.querySelector(
        "input[name='entrega']:checked"
    );

    if(!radioSelecionado) return;

    const tipoEntrega = radioSelecionado.value;

    if(tipoEntrega === "retirada"){

        endereco.style.display = "none";

        valorFrete = 0;

    }else{

        endereco.style.display = "block";

        const bairro = document.getElementById("bairro").value;

        valorFrete = calcularFrete(bairro);

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
// 07. MENSAGEM
// ====================================

function montarCabecalho(){

    const nome = document.getElementById("nome").value;

    const telefone = document.getElementById("telefone").value;

    return `🛍️ *${CONFIG.nomeLoja}*

══════════════════════

👤 Cliente
${nome}

📱 WhatsApp
${telefone}

`;

}

function montarEntrega(){

    const tipoEntrega =
        document.querySelector("input[name='entrega']:checked").value;

    let mensagem = `

══════════════════════

🚚 ENTREGA

`;

    if(tipoEntrega === "retirada"){

        mensagem += "Retirar no Local";

    }else{

        mensagem += "Entrega em Domicílio\n\n";

        mensagem +=
`CEP: ${document.getElementById("cep").value}
Estado: ${document.getElementById("estado").value}
Cidade: ${document.getElementById("cidade").value}
Bairro: ${document.getElementById("bairro").value}
Rua: ${document.getElementById("rua").value}
Número: ${document.getElementById("numero").value}
Complemento: ${document.getElementById("complemento").value}
Referência: ${document.getElementById("referencia").value}`;

    }

    return mensagem;

}

function montarPagamento(){

    const pagamento =
        document.querySelector("input[name='pagamento']:checked").value;

    return `

══════════════════════

💳 PAGAMENTO

${pagamento === "pix" ? "PIX" : "Cartão de Crédito"}

`;

}