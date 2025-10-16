# Exemplos de Payloads (pré-moldados)

Cole exemplos prontos abaixo para copiar/colar nas requisições ao testar a API. Use JSON no body (Content-Type: application/json) a menos que indicado.

---

## 1) Criar usuário - POST /createUser

Body (JSON):
{
"name": "João Silva",
"number": "+5511999999999",
"email": "joao.silva@example.com",
"password": "SenhaSegura123"
}

Resposta esperada: 201 com token e user.

---

## 2) Login - POST /login

Body (JSON):
{
"email": "joao.silva@example.com",
"password": "SenhaSegura123"
}

Resposta esperada: 201 com user e token.

---

## 3) Produtos favoritos - POST /ProductsFavorit

Body (JSON):
{
"favoritProducts": [
"652f3e5b8a4f5b001234abcd",
"652f3e5b8a4f5b001234abce"
]
}

Resposta esperada: 200 com array de produtos.

---

## 4) Adicionar favorito - POST /addFavoritos

Body (JSON):
{
"userId": "652f3d9a8a4f5b001234abf0",
"productId": "652f3e5b8a4f5b001234abcd"
}

Resposta esperada: 200 com updatedUser.

---

## 5) Remover favorito - POST /removeFavoritos

Body (JSON):
{
"userId": "652f3d9a8a4f5b001234abf0",
"productId": "652f3e5b8a4f5b001234abcd"
}

Resposta esperada: 200 com updatedUser.

---

## 6) Produtos do carrinho - POST /productsCart

Body (JSON):
{
"cartProducts": [
"652f3e5b8a4f5b001234abcd",
"652f3e5b8a4f5b001234abce"
]
}

Resposta esperada: 200 com array de produtos.

---

## 7) Adicionar ao carrinho - POST /addCarrinho

Body (JSON):
{
"userId": "652f3d9a8a4f5b001234abf0",
"productId": "652f3e5b8a4f5b001234abcd"
}

Resposta esperada: 200 com updatedUser.

---

## 8) Criar pedido - POST /creatOrderPaymant

Body (JSON):
{
"userId": "652f3d9a8a4f5b001234abf0",
"productIds": [
"652f3e5b8a4f5b001234abcd",
"652f3e5b8a4f5b001234abce"
],
"status": "pending",
"createdAt": "2025-10-05T12:00:00Z"
}

Resposta esperada: 201 com objeto do pedido criado.

---

## 9) Upload de produto - POST /upload

Content-Type: multipart/form-data (form-data)
Fields:

- files: (arquivo) 1 ou mais arquivos de imagem
- nome: "Poltrona Teste"
- slug: "poltrona-teste"
- preco: "1890.00"
- ambientes: ["Sala de Estar"] (envie como JSON string se necessário: "[\"Sala de Estar\"]")
- estilo: "Moderno"
- colecao: "Coleção Teste"
- estoque: 10
- requerMontagem: true
- garantia: "12 meses"
- ativo: true
- categoria: "Poltronas"
- descricao: "Descrição do produto teste"
- altura: 100
- largura: 80
- profundidade: 90
- peso: 20

Resposta esperada: 201 com o produto criado.

---

## Observações

- IDs de exemplo são ObjectId do MongoDB. Substitua pelos seus IDs.
- Se receber erro "JSON inválido recebido" verifique:
  - Content-Type: application/json
  - Não deixe trailing commas
  - Use aspas duplas para nomes de propriedades e strings
  - Fecha corretamente chaves e colchetes

---

Arquivo gerado automaticamente para facilitar testes.
