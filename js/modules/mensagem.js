// ======================================================
// SOLVER STORE
// MENSAGEM
// ======================================================

// ======================================
// 01. CABEÇALHO
// ======================================

function montarCabecalho(pedido){

    return `══════════════════════
*${CONFIG.loja.nome}*
══════════════════════
${pedido.cliente.nome}

Whatsapp
${pedido.cliente.telefone}
`;
}

// ======================================================
// 02. ENTREGA
// ======================================================

function montarEntrega(pedido){

    let texto = `══════════════════════
*ENTREGA*
══════════════════════
`;
    if(pedido.entrega.retirada){

        texto += "Retirada na Loja\n";

    }else{

        texto += `
Entrega

${pedido.entrega.endereco}

${pedido.entrega.numero}

${pedido.entrega.bairro}

${pedido.entrega.cidade}
`;

    }

    texto += "\n";

    return texto;

}



// ======================================================
// 03. PAGAMENTO
// ======================================================

function montarPagamento(pedido){

    return `══════════════════════
​*PAGAMENTO*
══════════════════════
${pedido.pagamento.metodo.toUpperCase()}

`;

}
// ======================================================
// 04. PRODUTOS
// ======================================================

function montarProdutos(pedido){

    let texto = `══════════════════════
​*PRODUTOS*
══════════════════════
`;

    if(!pedido.produtos || pedido.produtos.length === 0){

        texto += "Produtos não encontrados.\n";

        return texto;

    }

    pedido.produtos.forEach(produto =>{

        texto +=
`• ${produto.nome}
Qtd: ${produto.quantidade}
Valor: ${formatarMoeda(produto.preco)}

`;

    });

    return texto;

}

// ======================================================
// 05. TOTAL
// ======================================================

function montarTotal(pedido){

    return `══════════════════════
​*TOTAL*
══════════════════════

Subtotal: ${formatarMoeda(pedido.valores.subtotal)}

Frete: ${formatarMoeda(pedido.valores.frete)}

TOTAL: ${formatarMoeda(pedido.valores.total)}

`;

}

// ======================================================
// 06. RODAPÉ
// ======================================================

function montarRodape(){

    return `══════════════════════

Obrigado pela preferência 

${CONFIG.loja.nome}

`;

}



// ======================================================
// 07. MONTAR MENSAGEM
// ======================================================

function montarMensagem(pedido){

    let mensagem = "";

    mensagem += montarCabecalho(pedido);

    mensagem += montarEntrega(pedido);

    mensagem += montarPagamento(pedido);

    mensagem += montarProdutos(pedido);

    mensagem += montarTotal(pedido);

    mensagem += montarRodape();

    return mensagem;

}



// ======================================================
// 08. ENVIAR WHATSAPP
// ======================================================

function enviarWhatsApp(mensagem){

    const texto = encodeURIComponent(mensagem);

    const url =
`https://wa.me/${CONFIG.loja.whatsapp}?text=${texto}`;

    window.open(
        url,
        "_blank"
    );

}