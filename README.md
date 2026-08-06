# Projeto3
Perfumaria
# 📦 Versão

**Solver Store v1.0**

Status:

- ✅ Loja Virtual
- ✅ Carrinho
- ✅ Checkout
- ✅ Frete
- ✅ Pagamento PIX
- ✅ Pagamento Cartão
- ✅ WhatsApp
- 🚧 Painel Administrativo (em desenvolvimento)

# 🛍️ Solver Store

Loja virtual desenvolvida para pequenos e médios negócios, com foco em simplicidade, desempenho e integração com WhatsApp.

---

# 📌 Tecnologias

- HTML5
- CSS3
- JavaScript (ES6)
- LocalStorage
- GitHub

---

# 📂 Estrutura do Projeto

```
Projeto3/

assets/
    banners/
    icons/
    logos/
    produtos/
    qrcode/

css/
    style.css
    carrinho.css
    checkout.css
    pagamento.css

img/
    feminino/
    masculino/
    fundo/

js/
    modules/
        armazenamento.js
        mensagem.js
        utils.js

    carrinho.js
    checkout.js
    config.js
    frete.js
    pagamento.js
    produtos.js

pages/
    carrinho.html
    checkout.html
    confirmacao.html
    feminino.html
    masculino.html
    pagamento.html

painel/
    css/
    img/
    js/

    login.html
    dashboard.html
    pedidos.html
    clientes.html
    produtos.html
    categorias.html
    configuracoes.html
```

---

# 📖 Padrão de Organização

## Arquivos JavaScript

Cada arquivo possui apenas uma responsabilidade.

| Arquivo | Responsabilidade |
|---------|------------------|
| config.js | Configurações gerais |
| produtos.js | Cadastro de produtos |
| carrinho.js | Carrinho de compras |
| checkout.js | Processo de checkout |
| pagamento.js | Página de pagamento |
| frete.js | Regras de frete |

---

## Pasta modules/

Contém funções reutilizáveis.

Exemplo:

- mensagem.js
- armazenamento.js
- utils.js

Nenhum código duplicado deve existir fora desta pasta.

---

# 🎨 Padrão CSS

Cada página possui seu próprio CSS.

Exemplo:

```
checkout.html
↓

checkout.css
```

```
pagamento.html
↓

pagamento.css
```

---

# 🖼️ Imagens

As imagens devem ficar organizadas conforme sua finalidade.

```
assets/

logos/

banners/

icons/

produtos/

qrcode/
```

As imagens específicas dos produtos permanecem em:

```
img/

feminino/

masculino/
```

---

# 📝 Convenção de Nomes

Arquivos:

```
checkout.js
pagamento.js
produtos.js
```

Sempre:

- letras minúsculas
- sem espaço
- sem acentos
- nomes objetivos

---

# 💻 Convenção de Código

Funções:

```
camelCase
```

Exemplo:

```javascript
carregarProdutos()

atualizarCarrinho()

enviarWhatsApp()
```

Variáveis:

```javascript
valorTotal

tipoEntrega

numeroPedido
```

Constantes:

```javascript
const CONFIG
```

---

# 🚀 Fluxo da Loja

```
Home

↓

Produto

↓

Carrinho

↓

Checkout

↓

Pagamento

↓

Confirmação

↓

WhatsApp
```

---

# 📅 Roadmap

Consulte o arquivo:

ROADMAP.md

---

# 👩‍💻 Desenvolvido por

Rose Mayara Galindo Ferreira

Solver Hub ©