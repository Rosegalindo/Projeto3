// ======================================================
// SOLVER STORE
// UTILITÁRIOS
// ======================================================

// ====================================
// 01. FORMATAR MOEDA
// ====================================
function formatarMoeda(valor){

    return "R$ " + Number(valor).toFixed(2);

}

// ====================================
// 02. FORMATAR TELEFONE
// ====================================
function formatarTelefone(numero){

    numero = numero.replace(/\D/g,"");

    if(numero.length !== 11){

        return numero;

    }

    return `(${numero.substring(0,2)}) ${numero.substring(2,7)}-${numero.substring(7)}`;

}

// ====================================
// 03. GERAR NÚMERO DO PEDIDO
// ====================================
function gerarNumeroPedido(){

    return "PED-" + Date.now();

}

// ====================================
// 04. GERAR DATA
// ====================================
function gerarData(){

    return new Date().toLocaleString("pt-BR");

}

// ====================================
// 05. COPIAR TEXTO
// ====================================
function copiarTexto(texto){

    navigator.clipboard.writeText(texto);

}