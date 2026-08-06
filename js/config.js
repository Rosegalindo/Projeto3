// ====================================
// CONFIGURAÇÕES DA LOJA
// ====================================

const CONFIG = {

    loja: {

        nome: "AMAKHA PARIS",

        whatsapp: "5512982072887",

        instagram: "#",

        email: "#"
    },

    pagamento: {

        pix: {
            chave:"41180675878",

            favorecido:"ROSE MAYARA GALINDO FERREIRA"
        },

        cartao: {

            linkMercadoPago: "#"
        }
    },

    endereco: {

        cidade: "SÃO SEBASTIÃO",

        estado: "SP",

        retirada: "PONTAL DA CRUZ, RUA XV DE NOVEMBRO, Nº 336 CASA 2",

        horario: "9h ás 18h"
    },

    financeiro: {

        moeda: "R$"
    }

};

STATUS_PEDIDO = {

    AGUARDANDO_PAGAMENTO: "AGUARDANDO PAGAMENTO",

    PAGO: "PAGO",

    EM_SEPARACAO: "EM SEPARAÇÃO",

    ENVIADO: "ENVIADO",

    FINALIZADO: "FINALIZADO"

};

const STORAGE = {

    PEDIDO: "pedido",

    CARRINHO: "carrinho",

    CLIENTE: "cliente",

    TOTAL: "totalPedido",

    PAGAMENTO: "pagamento",

    CUPOM: "cupom",

};