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

// ===============================
// Inicialização
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    atualizarBadge();

});