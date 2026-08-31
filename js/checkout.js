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

    lista =
        document.getElementById("lista-checkout");

    subtotal =
        document.getElementById("subtotal");

    frete =
        document.getElementById("frete");

    total =
        document.getElementById("total");

    endereco =
        document.getElementById("endereco");

    radiosEntrega =
        document.querySelectorAll(
            "input[name='entrega']"
        );


    if(!lista){

        console.error(
            "Elemento #lista-checkout não encontrado."
        );

        return;

    }


    // Carregar produtos

    carregarProdutos();


    // Atualizar entrega

    atualizarEntrega();


    // ====================================
    // BOTÃO FINALIZAR
    // ====================================

    const btnFinalizar =
        document.getElementById("btn-finalizar");


    console.log(
        "Botão Finalizar encontrado:",
        btnFinalizar
    );


    if(btnFinalizar){

        btnFinalizar.addEventListener(
            "click",
            finalizarPedido
        );

    }


    // ====================================
    // ENTREGA
    // ====================================

    radiosEntrega.forEach(radio => {

        radio.addEventListener(
            "change",
            atualizarEntrega
        );

    });

}


// ====================================
// 03. PRODUTOS
// ====================================

function carregarProdutos(){

    produtosPedido = [];

    valorSubtotal = 0;

    lista.innerHTML = "";


    const comprarAgora =
        carregar(STORAGE.COMPRAR_AGORA);


    console.log(
        "Carrinho:",
        carregar(STORAGE.CARRINHO)
    );


    // ====================================
    // COMPRAR AGORA
    // ====================================

    if(comprarAgora){

        const produto =
            produtos.find(
                p => p.id == comprarAgora
            );


        if(produto){

            mostrarProduto(
                produto,
                1
            );

        }


        localStorage.removeItem(
            "comprarAgora"
        );


        return;

    }


    // ====================================
    // CARRINHO
    // ====================================

    const carrinho =
        carregar(STORAGE.CARRINHO) || [];


    carrinho.forEach(produto => {

        mostrarProduto(
            produto,
            produto.quantidade
        );

    });

}


// ====================================
// MOSTRAR PRODUTO
// ====================================

function mostrarProduto(
    produto,
    quantidade
){

    valorSubtotal +=
        produto.preco * quantidade;


    produtosPedido.push({

        nome: produto.nome,

        quantidade: quantidade,

        preco: produto.preco

    });


    lista.insertAdjacentHTML(
        "beforeend",
        `

        <div class="produto-checkout">

            <img
                src="${produto.imagem}"
                alt="${produto.nome}"
            >

            <div>

                <h3>
                    ${produto.nome}
                </h3>

                <p>
                    Quantidade: ${quantidade}
                </p>

                <strong>

                    R$
                    ${(
                        produto.preco *
                        quantidade
                    ).toFixed(2)}

                </strong>

            </div>

        </div>

        `
    );


    atualizarTotais();

}


// ====================================
// 04. TOTAIS
// ====================================

function atualizarTotais(){

    subtotal.textContent =
        "R$ " +
        valorSubtotal.toFixed(2);


    frete.textContent =
        valorFrete === 0
            ? "Grátis"
            : "R$ " +
              valorFrete.toFixed(2);


    total.textContent =
        "R$ " +
        (
            valorSubtotal +
            valorFrete
        ).toFixed(2);


    // Salva o total

    localStorage.setItem(
        "totalPedido",
        valorSubtotal + valorFrete
    );

}


// ====================================
// 05. ENTREGA
// ====================================

function atualizarEntrega(){

    const radioSelecionado =
        document.querySelector(
            "input[name='entrega']:checked"
        );


    if(!radioSelecionado){

        return;

    }


    const tipoEntrega =
        radioSelecionado.value;


    // ====================================
    // RETIRADA
    // ====================================

    if(tipoEntrega === "retirada"){

        endereco.style.display =
            "none";

        valorFrete = 0;

    }


    // ====================================
    // ENTREGA
    // ====================================

    else{

        endereco.style.display =
            "block";


        const bairro =
            document
                .getElementById("bairro")
                .value;


        valorFrete =
            calcularFrete(bairro);

    }


    atualizarTotais();


    console.log(
        "Subtotal:",
        valorSubtotal
    );


    console.log(
        "Frete:",
        valorFrete
    );


    console.log(
        "Total:",
        valorSubtotal + valorFrete
    );

}


// ====================================
// 06. VALIDAÇÃO
// ====================================

function validarFormulario(){

    const nome =
        document
            .getElementById("nome")
            .value
            .trim();


    const telefone =
        document
            .getElementById("telefone")
            .value
            .trim();


    if(nome === ""){

        alert(
            "Informe seu nome."
        );

        return false;

    }


    if(telefone === ""){

        alert(
            "Informe seu WhatsApp."
        );

        return false;

    }


    return true;

}


// ====================================
// 07. MONTAR DADOS DA ENTREGA
// ====================================

function montarEntrega(){

    const tipoEntrega =
        document.querySelector(
            "input[name='entrega']:checked"
        ).value;


    const enderecoPedido = {

        cep:
            document
                .getElementById("cep")
                ?.value
                .trim() || "",

        estado:
            document
                .getElementById("estado")
                ?.value
                .trim() || "",

        cidade:
            document
                .getElementById("cidade")
                ?.value
                .trim() || "",

        bairro:
            document
                .getElementById("bairro")
                ?.value
                .trim() || "",

        rua:
            document
                .getElementById("rua")
                ?.value
                .trim() || "",

        numero:
            document
                .getElementById("numero")
                ?.value
                .trim() || "",

        complemento:
            document
                .getElementById("complemento")
                ?.value
                .trim() || "",

        referencia:
            document
                .getElementById("referencia")
                ?.value
                .trim() || ""

    };


    return {

        tipo: tipoEntrega,

        retirada:
            tipoEntrega === "retirada",

        endereco:
            enderecoPedido

    };

}


// ====================================
// 08. FINALIZAR PEDIDO
// ====================================

function finalizarPedido(){

    console.log(
        "🛒 Botão Finalizar clicado"
    );


    // ====================================
    // VALIDAR FORMULÁRIO
    // ====================================

    if(!validarFormulario()){

        return;

    }


    // ====================================
    // CAMPOS DO CLIENTE
    // ====================================

    const campoNome =
        document.getElementById("nome");


    const campoTelefone =
        document.getElementById("telefone");


    // ====================================
    // FORMA DE ENTREGA
    // ====================================

    const campoEntrega =
        document.querySelector(
            "input[name='entrega']:checked"
        );


    // ====================================
    // SEGURANÇA
    // ====================================

    if(
        !campoNome ||
        !campoTelefone ||
        !campoEntrega
    ){

        console.error(
            "Erro: campos do checkout não encontrados."
        );


        alert(
            "Não foi possível finalizar o pedido. " +
            "Verifique os campos do checkout."
        );


        return;

    }


    // ====================================
    // CRIAR DADOS DO PEDIDO
    // ====================================

    const dadosPedido = {

        cliente: {

            nome:
                campoNome.value.trim(),

            telefone:
                campoTelefone.value.trim()

        },


        entrega:
            montarEntrega(),


        // O pagamento ainda NÃO foi realizado.
        // O cliente escolherá PIX ou cartão
        // diretamente no Mercado Pago.

        pagamento: {

            status:
                "AGUARDANDO PAGAMENTO"

        },


        produtos:
            produtosPedido,


        valores: {

            subtotal:
                valorSubtotal,

            frete:
                valorFrete,

            total:
                valorSubtotal +
                valorFrete

        }

    };


    // ====================================
    // GERAR PEDIDO PADRONIZADO
    // ====================================

    const pedido =
        criarPedido(dadosPedido);


    // ====================================
    // LOG
    // ====================================

    console.log(
        "====== PEDIDO ======"
    );


    console.log(
        pedido
    );


    console.log(
        "====== PRODUTOS ======"
    );


    console.log(
        produtosPedido
    );


    console.log(
        "====== VALORES ======"
    );


    console.log(
        pedido.valores
    );


    // ====================================
    // SALVAR PEDIDO
    // ====================================

    salvarPedido(pedido);


    console.log(
        "✅ Pedido salvo."
    );


    // ====================================
    // IR PARA PAGAMENTO
    // ====================================

    console.log(
        "💳 Abrindo página de pagamento..."
    );


    window.location.href =
        "pagamento.html";

}