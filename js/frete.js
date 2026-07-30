// ================================
// TABELA DE FRETES
// ================================

function calcularFrete(bairro){

    bairro = bairro.trim().toLowerCase();

    const tabela = {

        "centro":10,

        "topolândia":12,

        "pontal da cruz":15,

        "barequeçaba":18,

        "boiçucanga":25,

        "maresias":30

    };

// ================================
// CALCULAR FRETE
// ================================

  return tabela[bairro] || 15;
}