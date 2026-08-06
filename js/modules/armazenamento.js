// ======================================================
// SOLVER STORE
// ARMAZENAMENTO
// ======================================================

// ====================================
// 01. SALVAR
// ====================================

function salvar(chave, dados){

    localStorage.setItem(

        chave,

        JSON.stringify(dados)

    );

}

// ====================================
// 02. CARREGAR
// ====================================

function carregar(chave){

    const dados = localStorage.getItem(chave);

    if(!dados){

        return null;

    }

    return JSON.parse(dados);

}

// ====================================
// 03. REMOVER
// ====================================

function remover(chave){

    localStorage.removeItem(chave);

}

// ====================================
// 04. EXISTE?
// ====================================

function existe(chave){

    return localStorage.getItem(chave) !== null;

}

// ====================================
// 05. LIMPAR TUDO
// ====================================

function limparTudo(){

    localStorage.clear();

}