// ====================================
// AMAKHA PARIS
// BACKEND
// ====================================

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3000;

// ====================================
// MIDDLEWARES
// ====================================

app.use(cors());

app.use(express.json());

// ====================================
// ROTA DE TESTE
// ====================================

app.get("/", (req, res) => {

    res.json({
        sucesso: true,
        mensagem: "Backend Amakha Paris funcionando!"
    });

});

// ====================================
// INICIAR SERVIDOR
// ====================================

app.listen(PORT, () => {

    console.log(
        `🚀 Backend iniciado em http://localhost:${PORT}`
    );

});