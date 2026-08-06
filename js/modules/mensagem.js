// ======================================================
// SOLVER STORE
// MENSAGEM
// ======================================================

// ====================================
// 01. CABEÇALHO
// ====================================
function montarCabecalho(pedido){

return `══════════════════════
*${CONFIG.loja.nome}*
══════════════════════
${pedido.cliente.nome}

WHATSAPP:
${pedido.cliente.telefone}
`;
}
// ====================================
// 02. ENTREGA
// ====================================

// ====================================
// 03. PAGAMENTO
// ====================================

// ====================================
// 04. PRODUTOS
// ====================================

// ====================================
// 05. RODAPÉ
// ====================================

// ====================================
// 06. MONTAR MENSAGEM
// ====================================
function montarMensagem(pedido){

    let mensagem = "";

    mensagem += montarCabecalho(pedido);

    mensagem += montarEntrega(pedido);

    mensagem += montarPagamento(pedido);

    mensagem += montarProdutos(pedido);

    mensagem += montarRodape(pedido);

    return mensagem;

}
// ====================================
// 07. ENVIAR WHATSAPP
// ====================================
function enviarWhatsApp(mensagem){

    const numero = CONFIG.loja.whatsapp;

    const texto = encodeURIComponent(mensagem);

    window.open(

        `https://wa.me/${numero}?text=${texto}`,

        "_blank"

    );

}