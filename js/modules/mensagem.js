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

        const endereco = pedido.entrega.endereco;

        texto += `Entrega
    ${endereco.rua}
    ${endereco.numero}
    ${endereco.complemento}
    ${endereco.bairro}
    ${endereco.cidade}
    `;

    }

    texto += "\n";

    return texto;
}



// ======================================================
// 03. PAGAMENTO
// ======================================================

function montarPagamento(pedido){

    const tipo =
        pedido.pagamento?.tipo;

    let metodo = "MERCADO PAGO";

    if(tipo === "bank_transfer"){

        metodo = "PIX";

    }else if(tipo === "credit_card"){

        metodo = "CARTÃO DE CRÉDITO";

    }else if(tipo === "debit_card"){

        metodo = "CARTÃO DE DÉBITO";

    }else if(tipo === "account_money"){

        metodo = "SALDO MERCADO PAGO";

    }else if(pedido.pagamento?.metodo){

        metodo =
            pedido.pagamento.metodo.toUpperCase();

    }

    return `══════════════════════
*PAGAMENTO*
══════════════════════
${metodo}

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