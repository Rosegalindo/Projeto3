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

    // Tipo de entrega
    const tipoEntrega = document.querySelector("input[name='entrega']:checked").value;

    let entregaTexto = "";

    if(tipoEntrega === "retirada"){

        entregaTexto = "Retirar no Local";

    }else{

        entregaTexto = "Entrega em Domicílio";

    }

    // Forma de pagamento
    const pagamento = document.querySelector("input[name='pagamento']:checked").value;

    let pagamentoTexto = "";

    if(pagamento === "pix"){

        pagamentoTexto = "PIX";

    }else{

        pagamentoTexto = "Cartão de Crédito";

    }

    //==========================
    // MONTA A MENSAGEM
    //==========================

    let mensagem = `🛍️ *${CONFIG.nomeLoja}*

        ═══════════════════════

        👤 *Cliente:*
        ${nome}

        📱 *WhatsApp:*
        ${telefone}

        ═══════════════════════

        🚚 *Entrega:*
        ${entregaTexto}

        💳 *Pagamento:*
        ${pagamentoTexto}

        ═══════════════════════

        🛒 *PRODUTOS*

        `;

    //==========================
    // Comprar Agora
    //==========================

    const idComprarAgora = localStorage.getItem("comprarAgora");

    if(idComprarAgora){

        const produto = produtos.find(p => p.id == idComprarAgora);

        if(produto){

            mensagem += `
        • ${produto.nome}

        Quantidade: 1

        Valor: R$ ${produto.preco.toFixed(2)}

        `;

        }

    }else{

        //==========================
        // Carrinho
        //==========================

        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        carrinho.forEach(produto => {

            mensagem += `
• ${produto.nome}

Quantidade: ${produto.quantidade}

Valor: R$ ${(produto.preco * produto.quantidade).toFixed(2)}

`;

        });

    }

    mensagem += `

═══════════════════════

Subtotal: ${document.getElementById("subtotal").textContent}

Frete: ${document.getElementById("frete").textContent}

💰 *TOTAL*

${document.getElementById("total").textContent}

═══════════════════════

🌹 Obrigado pela preferência!

    Equipe ${CONFIG.nomeLoja}
`;

    //==========================
    // Envia WhatsApp
    //==========================

    const numeroLoja = CONFIG.whatsapp; // <-- coloque seu número aqui

    const texto = encodeURIComponent(mensagem);

    const url = `https://wa.me/${numeroLoja}?text=${texto}`;

    window.open(url, "_blank");

}
