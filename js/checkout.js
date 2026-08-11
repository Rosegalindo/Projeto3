// ======================================================
// SOLVER STORE
// CHECKOUT 2.0
// ======================================================

// ====================================
// 01. VARIÁVEIS
// ====================================

let valorSubtotal = 0;
let valorFrete = 0;
let produtosPedido = [];


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
    lista = document.getElementById("lista-checkout");
    subtotal = document.getElementById("subtotal");
    frete = document.getElementById("frete");
    total = document.getElementById("total");
    endereco = document.getElementById("endereco");
    radiosEntrega = document.querySelectorAll("input[name='entrega']");

    if(!lista){

        console.error("Elemento #lista-checkout não encontrado.");

        return;

    }

    carregarProdutos();

    atualizarEntrega();

    // Eventos
    const btnFinalizar = document.getElementById("btn-finalizar");

    if(btnFinalizar){

        btnFinalizar.addEventListener("click", finalizarPedido);

    }

    radiosEntrega.forEach(radio => {

        radio.addEventListener("change", atualizarEntrega);

    });

}
// ====================================
// 03. PRODUTOS
// ====================================

function carregarProdutos(){

    produtosPedido = [];
    valorSubtotal = 0;

    lista.innerHTML = "";

    const comprarAgora = carregar(STORAGE.COMPRAR_AGORA);
    console.log("carrinho:", carregar(STORAGE.CARRINHO));

    if(comprarAgora){

        const produto = produtos.find(p => p.id == comprarAgora);

        if(produto){

            mostrarProduto(produto,1);

        }

        localStorage.removeItem("comprarAgora");

        return;

    }

    const carrinho = carregar(STORAGE.CARRINHO) || [];

    carrinho.forEach(produto => {

        mostrarProduto(produto, produto.quantidade);

    });

}

function mostrarProduto(produto, quantidade){

    valorSubtotal += produto.preco * quantidade;

    produtosPedido.push({

    nome: produto.nome,

    quantidade,

    preco: produto.preco

    });

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
        valorFrete === 0
        ? "Grátis"
        : "R$ " + valorFrete.toFixed(2);

    total.textContent =
        "R$ " +
        (valorSubtotal + valorFrete).toFixed(2);

    // SALVA O TOTAL
    localStorage.setItem(
        "totalPedido",
        valorSubtotal + valorFrete
    );

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
    console.log("Subtotal:", valorSubtotal);
    console.log("Frete:", valorFrete);
    console.log(carregar(STORAGE.TOTAL_PEDIDO));

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

    const nome = document.getElementById("nome").value.trim();

    const telefone = document.getElementById("telefone").value.trim();

return `══════════════════════
*${CONFIG.nomeLoja}*
══════════════════════
${nome}

WHATSAPP
${telefone}
`;
}

function montarEntrega(){

    const tipoEntrega =
        document.querySelector("input[name='entrega']:checked").value;

    let mensagem = `══════════════════════
ENTREGA
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
PAGAMENTO

${pagamento === "pix" ? "PIX" : "Cartão de Crédito"}
`;
}

function montarProdutos(){

    let mensagem = `
══════════════════════
PRODUTOS

`;
    produtosPedido.forEach(produto => {

mensagem += ` • ${produto.nome}

Quantidade: ${produto.quantidade}

Valor: R$ ${(produto.preco * produto.quantidade).toFixed(2)}

`;

    });

    return mensagem;

}

function montarRodape(){

return `══════════════════════
RESUMO DO PEDIDO 

Subtotal: ${subtotal.textContent}

Frete: ${frete.textContent}

====================

TOTAL: ${total.textContent}

══════════════════════

Obrigado pela preferência!

${CONFIG.nomeLoja}
`;
}

// ====================================
// 08. ENVIAR WHATSAPP
// ====================================

function enviarWhatsApp(mensagem){

    console.log("====== MENSAGEM ======");
    console.log(mensagem);

    const numeroLoja = CONFIG.whatsapp;

    const texto = encodeURIComponent(mensagem);

    console.log("====== URL ======");
    console.log(texto);

    const url = `https://wa.me/${numeroLoja}?text=${texto}`;

    window.open(url, "_blank");

}

// ====================================
// 09. FINALIZAR PEDIDO
// ====================================

function finalizarPedido(){

    console.log("Botão Finalizar clicado");

    // Valida o formulário
    if(!validarFormulario()){
        return;
    }

    // Campos do cliente
    const campoNome = document.getElementById("nome");
    const campoTelefone = document.getElementById("telefone");

    // Forma de entrega
    const campoEntrega = document.querySelector(
        "input[name='entrega']:checked"
    );

    // Forma de pagamento
    const campoPagamento = document.querySelector(
        "input[name='pagamento']:checked"
    );

    // Segurança
    if(
        !campoNome ||
        !campoTelefone ||
        !campoEntrega ||
        !campoPagamento
    ){

        console.error("Erro: campos do checkout não encontrados.");

        alert(
            "Não foi possível finalizar o pedido. Verifique os campos do checkout."
        );

        return;
    }

// ====================================
// CRIAR PEDIDO
// ====================================

const dadosPedido = {

    cliente: {

        nome: campoNome.value.trim(),

        telefone: campoTelefone.value.trim()

    },

    entrega: {

        tipo: campoEntrega.value,

        retirada: campoEntrega.value === "retirada",

        endereco: {

            cep:
                document.getElementById("cep")?.value.trim() || "",

            estado:
                document.getElementById("estado")?.value.trim() || "",

            cidade:
                document.getElementById("cidade")?.value.trim() || "",

            bairro:
                document.getElementById("bairro")?.value.trim() || "",

            rua:
                document.getElementById("rua")?.value.trim() || "",

            numero:
                document.getElementById("numero")?.value.trim() || "",

            complemento:
                document.getElementById("complemento")?.value.trim() || "",

            referencia:
                document.getElementById("referencia")?.value.trim() || ""

        }

    },

    pagamento: {

        metodo: campoPagamento.value

    },

    produtos: produtosPedido,

    valores: {

        subtotal: valorSubtotal,

        frete: valorFrete,

        total: valorSubtotal + valorFrete

    }

};

// ====================================
// GERAR PEDIDO PADRONIZADO
// ====================================

const pedido = criarPedido(dadosPedido);

// ====================================
// SALVAR PEDIDO
// ====================================

    console.log("====== PEDIDO ======");
    console.log(pedido);

    console.log("====== PRODUTOS ======");
    console.log(produtosPedido);

    console.log("====== VALORES ======");
    console.log(pedido.valores);

    salvarPedido(pedido);

// ====================================
// IR PARA PAGAMENTO
// ====================================

    window.location.href = "pagamento.html";

}