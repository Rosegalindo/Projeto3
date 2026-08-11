// ======================================================
// SOLVER STORE
// PEDIDO
// ======================================================

// ====================================
// 01. CRIAR PEDIDO
// ====================================

function criarPedido(dados){

    return{

        numero: gerarNumeroPedido(),

        data: gerarData(),

        status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,

        cliente: dados.cliente,

        entrega: dados.entrega,

        pagamento: dados.pagamento,

        produtos: dados.produtos,

        valores: dados.valores

    };

}

// ====================================
// 02. SALVAR PEDIDO
// ====================================

function salvarPedido(pedido){

    salvar(STORAGE.PEDIDO, pedido);

}

// ====================================
// 03. CARREGAR PEDIDO
// ====================================

function carregarPedido(){

    return carregar(STORAGE.PEDIDO);

}

// ====================================
// 04. LIMPAR PEDIDO
// ====================================

function limparPedido(){

    remover(STORAGE.PEDIDO);

}

// ====================================
// 05. GERAR NÚMERO DO PEDIDO
// ====================================

function gerarNumeroPedido(){

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");

    const data = `${ano}${mes}${dia}`;

    let contador =
        Number(
            localStorage.getItem("contadorPedido")
        ) || 0;

    contador++;

    localStorage.setItem(
        "contadorPedido",
        contador
    );

    const numero = String(
        contador
    ).padStart(3, "0");

    return `PED-${data}-${numero}`;

}