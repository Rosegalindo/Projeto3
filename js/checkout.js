// ================================
// PRODUTO OU CARRINHO
// ================================

const lista = document.getElementById("lista-checkout");

const subtotal = document.getElementById("subtotal");

const total = document.getElementById("total");

const frete = document.getElementById("frete");

let valorFrete = 0;

let valorSubtotal = 0;

// ====================================
// Verifica se veio do Comprar Agora
// ====================================

const comprarAgora = localStorage.getItem("comprarAgora");

if(comprarAgora){

    const produto = produtos.find(p => p.id == comprarAgora);

    mostrarProduto(produto,1);


// ====================================
// Limpa o LocalStorage após carregar
// ====================================
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

// ================================
// ENTREGA
// ================================

const endereco = document.getElementById("endereco");

const campoBairro = document.getElementById("bairro");

const radiosEntrega = document.querySelectorAll("input[name='entrega']");

radiosEntrega.forEach(radio => {

   radio.addEventListener("change", atualizarEntrega);

});

function atualizarEntrega(){

    const tipoEntrega = document.querySelector("input[name='entrega']:checked").value;

    if(tipoEntrega == "retirada"){

        endereco.style.display = "none";

        valorFrete = 0;

    }else{

        endereco.style.display = "block";

        const bairro = document.getElementById("bairro").value;

        valorFrete = calcularFrete(bairro);

    }

    atualizarTotais();

}

// ================================
// Inicializa a tela
// ================================

atualizarEntrega();

// ====================================
// BOTÃO FINALIZAR PEDIDO
// ====================================

const btnFinalizar = document.getElementById("btn-finalizar");

btnFinalizar.addEventListener("click", finalizarPedido);

// ====================================
// VALIDAR FORMULÁRIO
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
// FINALIZAR PEDIDO
// ====================================

function finalizarPedido(){

    if(!validarFormulario()){

    return;

    }

    const nome = document.getElementById("nome").value.trim();

    const telefone = document.getElementById("telefone").value.trim();



    if(telefone === ""){

        alert("Informe seu WhatsApp.");

        return;

    }

    let mensagem = "🛍️ *SOLVER STORE*%0A%0A";

    mensagem += "👤 *Cliente:* " + nome + "%0A";

    mensagem += "📱 *WhatsApp:* " + telefone + "%0A%0A";

    mensagem += "🛒 *Produtos*%0A";

    // ==========================
    // Comprar Agora
    // ==========================

    const idComprarAgora = localStorage.getItem("comprarAgora");

    if(idComprarAgora){

        const produto = produtos.find(p => p.id == idComprarAgora);

        if(produto){

            mensagem +=
                "• " +
                produto.nome +
                " (Qtd: 1)%0A";

        }

    }else{

        // ==========================
        // Carrinho
        // ==========================

        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        carrinho.forEach(produto => {

            mensagem +=
                "• " +
                produto.nome +
                " (Qtd: " +
                produto.quantidade +
                ")%0A";

        });

    }

    mensagem += "%0A";

    mensagem +=
        "💰 *Total:* " +
        document.getElementById("total").textContent;

    const numeroLoja = "5512999999999"; // Coloque aqui o número da Solver Store

const url = `https://wa.me/${numeroLoja}?text=${mensagem}`;

window.open(url, "_blank");

}
