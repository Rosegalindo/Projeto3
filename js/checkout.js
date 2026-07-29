// ================================
// PRODUTO OU CARRINHO
// ================================

const lista = document.getElementById("lista-checkout");

const subtotal = document.getElementById("subtotal");

const total = document.getElementById("total");

const frete = document.getElementById("frete");

let valorFrete = 0;

let valorSubtotal = 0;


// Verifica se veio do Comprar Agora

const comprarAgora = localStorage.getItem("comprarAgora");

if(comprarAgora){

    const produto = produtos.find(p => p.id == comprarAgora);

    mostrarProduto(produto,1);

    // Limpa o localStorage após carregar
    localStorage.removeItem("comprarAgora");

}else{

    carregarCarrinho();

}

function mostrarProduto(produto, quantidade){

    valorSubtotal += produto.preco * quantidade;

    lista.innerHTML += `

    <div class="produto-checkout">

        <img src="${produto.imagem}">

        <div>

            <h3>${produto.nome}</h3>

            <p>

                Quantidade: ${quantidade}

            </p>

            <strong>

                R$

                ${(produto.preco*quantidade).toFixed(2)}

            </strong>

        </div>

    </div>

    `;

    atualizarTotais();

}

function carregarCarrinho(){

    const carrinho =

    JSON.parse(localStorage.getItem("carrinho")) || [];

    carrinho.forEach(produto=>{

        mostrarProduto(produto,produto.quantidade);

    });

}

function atualizarTotais(){

    subtotal.textContent =

        "R$ " + valorSubtotal.toFixed(2);

    frete.textContent =

        "R$ " + valorFrete.toFixed(2);

    total.textContent =

        "R$ " +

        (valorSubtotal + valorFrete).toFixed(2);

}