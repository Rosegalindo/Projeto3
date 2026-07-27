// ===============================
// Carrinho da Loja
// ===============================

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// ===============================
// Atualiza o contador do carrinho
// ===============================

function atualizarBadge() {

    const badge = document.getElementById("contador-carrinho");

    if (!badge) return;

    let total = 0;

    carrinho.forEach(item => {

        total += item.quantidade;

    });

    badge.textContent = total;

}

// ================================
// Aumentar Quantidade
// ================================

function aumentarQuantidade(id){

    const produto = carrinho.find(item => item.id == id);

    if(!produto) return;

    produto.quantidade++;

    salvarCarrinho();

    carregarCarrinho();

}

// ================================
// Diminuir Quantidade
// ================================

function diminuirQuantidade(id){

    const produto = carrinho.find(item => item.id == id);

    if(!produto) return;

    if(produto.quantidade > 1){

        produto.quantidade--;

    }else{

        removerProduto(id);

        return;

    }

    salvarCarrinho();

    carregarCarrinho();

}

// ================================
// Remover Produto
// ================================

function removerProduto(id){

    carrinho = carrinho.filter(item => item.id != id);

    salvarCarrinho();

    carregarCarrinho();

}

// ================================
// Esvaziar Carrinho
// ================================

function esvaziarCarrinho(){

    if(!confirm("Deseja realmente esvaziar o carrinho?")){

        return;

    }

    carrinho = [];

    salvarCarrinho();

    carregarCarrinho();

}

// ===============================
// Salva no navegador
// ===============================

function salvarCarrinho() {

    localStorage.setItem(

        "carrinho",

        JSON.stringify(carrinho)

    );

    atualizarBadge();

}

// ===============================
// Adiciona produto
// ===============================

function adicionarCarrinho(id, quantidade = 1) {

    const produto = produtos.find(p => p.id == id);

    if (!produto) {

        console.error("Produto não encontrado:", id);

        return;

    }

    const existente = carrinho.find(item => item.id == id);

    if (existente) {

        existente.quantidade += quantidade;

    } else {

        carrinho.push({

            ...produto,

            quantidade

        });

    }

    salvarCarrinho();

}

//=================================
//CARREGAR CARRINHO
//=================================

function carregarCarrinho(){

    const lista = document.getElementById("lista-carrinho");

    if(!lista) return;

    lista.innerHTML = "";

    let total = 0;

    carrinho.forEach(produto=>{

        total += produto.preco * produto.quantidade;

lista.innerHTML += `

<div class="item-carrinho">

    <div class="foto-produto">

        <img src="${produto.imagem}" alt="${produto.nome}">

    </div>

    <div class="dados">

        <h3>${produto.nome}</h3>

        <p><strong>Família:</strong> ${produto.familia}</p>

        <p><strong>Volume:</strong> ${produto.volume}</p>

        <p class="preco">

            R$ ${produto.preco.toFixed(2)}

        </p>

        <div class="controle-quantidade">

            <button onclick="diminuirQuantidade(${produto.id})">

                −

            </button>

            <span>${produto.quantidade}</span>

            <button onclick="aumentarQuantidade(${produto.id})">

                +

            </button>

        </div>

        <p class="subtotal">

            Subtotal:

            <strong>

            R$ ${(produto.preco * produto.quantidade).toFixed(2)}

            </strong>

        </p>

    </div>

    <button class="btn-remover"
        onclick="removerProduto(${produto.id})">

    <i class='bx bx-trash'></i>

</button>

</div>

`;

    });

    document.getElementById("total-geral").textContent =

        "R$ " + total.toFixed(2);

}

// ================================
// Inicialização
// ================================

document.addEventListener("DOMContentLoaded",()=>{

    atualizarBadge();

    carregarCarrinho();

    const botoes = document.querySelectorAll(".btn.carrinho");

    botoes.forEach(botao=>{

        botao.addEventListener("click",()=>{

            const id = Number(botao.dataset.id);

            const areaCompra = botao.closest(".area-compra");

            const quantidade = Number(

                areaCompra.querySelector(".qtd").textContent

            );

            adicionarCarrinho(id, quantidade);

        });

    });

});