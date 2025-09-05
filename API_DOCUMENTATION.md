# Documentação da API - AcessData (RESTful)

Este documento detalha como utilizar as rotas da API do projeto AcessData, que segue os padrões RESTful.

## Autenticação

Rotas que modificam dados (marcadas com 🔒) exigem autenticação via JWT. Após o login (`POST /auth/login`), um token é gerado e armazenado em um cookie HTTP-only chamado `token`. Todas as requisições subsequentes para rotas protegidas devem incluir este cookie.

---

## Recurso: Produtos (`/products`)

### 1. Listar Todos os Produtos

- **Endpoint**: `GET /products`
- **Descrição**: Retorna uma lista de todos os produtos cadastrados.
- **Respostas Possíveis**:
  - `200 OK`: Retorna um array de objetos de produto.
  - `500 Internal Server Error`: Erro ao obter produtos.

### 2. Obter um Produto

- **Endpoint**: `GET /products/:id`
- **Descrição**: Busca um produto específico pelo seu ID, incluindo as imagens em base64.
- **Parâmetros**:
  - `id` (URL): O ID do produto.
- **Respostas Possíveis**:
  - `200 OK`: Retorna o objeto do produto.
  - `404 Not Found`: Produto não encontrado.
  - `500 Internal Server Error`: Erro ao obter o produto.

### 3. Criar um Novo Produto

- **Endpoint**: `POST /products`
- **Descrição**: Cria um novo produto e faz o upload de suas imagens.
- **Corpo da Requisição** (`multipart/form-data`):
  - `files`: Um ou mais arquivos de imagem.
  - `preco`: Preço do produto.
  - `disponibilidade`: Disponibilidade do produto.
  - `descricao`: Descrição do produto.
  - `tamanho`: Tamanho do produto.
- **Respostas Possíveis**:
  - `201 Created`: Retorna o produto criado.
  - `500 Internal Server Error`: Erro ao criar o produto.

### 4. Atualizar um Produto 🔒

- **Endpoint**: `PUT /products/:id`
- **Descrição**: Atualiza as informações de um produto. Requer autenticação.
- **Parâmetros**:
  - `id` (URL): O ID do produto a ser atualizado.
- **Corpo da Requisição** (`application/json`): Objeto com os campos a serem atualizados.
  ```json
  {
    "preco": "99.90",
    "disponibilidade": "false"
  }
  ```
- **Respostas Possíveis**:
  - `200 OK`: `{ "message": "Produto atualizado com sucesso" }`
  - `401 Unauthorized`: Token inválido ou não fornecido.
  - `404 Not Found`: Produto não encontrado.
  - `500 Internal Server Error`: Erro ao atualizar.

### 5. Deletar um Produto 🔒

- **Endpoint**: `DELETE /products/:id`
- **Descrição**: Deleta um produto do sistema. Requer autenticação.
- **Parâmetros**:
  - `id` (URL): O ID do produto a ser deletado.
- **Respostas Possíveis**:
  - `200 OK`: `{ "message": "Produto deletado com sucesso" }`
  - `401 Unauthorized`: Token inválido ou não fornecido.
  - `404 Not Found`: Produto não encontrado.
  - `500 Internal Server Error`: Erro ao deletar.

---

## Recurso: Usuários (`/users`)

### 1. Criar Novo Usuário

- **Endpoint**: `POST /users`
- **Descrição**: Registra um novo usuário no sistema.
- **Corpo da Requisição** (`application/json`):
  ```json
  {
    "name": "string",
    "number": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Respostas Possíveis**:
  - `201 Created`: Usuário criado com sucesso. Retorna o usuário e um token.
  - `500 Internal Server Error`: Erro no servidor (ex: usuário já existe).

### 2. Listar Usuários / Buscar por Email

- **Endpoint**: `GET /users`
- **Descrição**: Retorna uma lista de todos os usuários ou busca um usuário por email.
- **Parâmetros de Query**:
  - `email` (opcional): Filtra o usuário pelo email.
- **Respostas Possíveis**:
  - `200 OK`: Retorna um array de usuários ou um único usuário se o email for fornecido.
  - `404 Not Found`: Usuário não encontrado (ao buscar por email).
  - `500 Internal Server Error`: Erro na requisição.

### 3. Obter um Usuário

- **Endpoint**: `GET /users/:id`
- **Descrição**: Busca um usuário específico pelo seu ID.
- **Parâmetros**:
  - `id` (URL): O ID do usuário.
- **Respostas Possíveis**:
  - `200 OK`: Retorna o objeto do usuário.
  - `404 Not Found`: Usuário não encontrado.
  - `500 Internal Server Error`: Erro na requisição.

### 4. Atualizar um Usuário 🔒

- **Endpoint**: `PUT /users/:id`
- **Descrição**: Atualiza as informações de um usuário. Requer autenticação.
- **Parâmetros**:
  - `id` (URL): O ID do usuário a ser atualizado.
- **Corpo da Requisição** (`application/json`): Objeto com os campos a serem atualizados.
- **Respostas Possíveis**:
  - `200 OK`: `{ "message": "User atualizado com sucesso" }`
  - `401 Unauthorized`: Token inválido ou não fornecido.
  - `404 Not Found`: Usuário não encontrado.
  - `500 Internal Server Error`: Erro ao atualizar.

### 5. Deletar um Usuário 🔒

- **Endpoint**: `DELETE /users/:id`
- **Descrição**: Deleta um usuário do sistema. Requer autenticação.
- **Parâmetros**:
  - `id` (URL): O ID do usuário a ser deletado.
- **Respostas Possíveis**:
  - `200 OK`: `{ "message": "Usuario deletado" }`
  - `401 Unauthorized`: Token inválido ou não fornecido.
  - `404 Not Found`: Usuário não encontrado.
  - `500 Internal Server Error`: Erro ao deletar.

---

## Recurso: Autenticação (`/auth`)

### 1. Login de Usuário

- **Endpoint**: `POST /auth/login`
- **Descrição**: Autentica um usuário e retorna um token de acesso.
- **Corpo da Requisição** (`application/json`):
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Respostas Possíveis**:
  - `200 OK`: Login bem-sucedido. Retorna o usuário e o token.
  - `401 Unauthorized`: Email ou senha incorretos.

---

## Recurso: WhatsApp (`/whatzapp`)

(As rotas do WhatsApp permanecem as mesmas e não foram afetadas pela refatoração RESTful.)

### 1. Enviar Código de Verificação

- **Endpoint**: `POST /whatzapp/send-code`
- **Descrição**: Envia um código de verificação para o número de WhatsApp fornecido.
- **Corpo da Requisição** (`application/json`):
  ```json
  {
    "number": "string"
  }
  ```
- **Respostas Possíveis**:
  - `200 OK`: Retorna a resposta da API do WhatsApp.
  - `500 Internal Server Error`: Erro no envio.

### 2. Verificar Código

- **Endpoint**: `POST /whatzapp/verify-code`
- **Descrição**: Verifica se o código fornecido é válido para o número.
- **Corpo da Requisição** (`application/json`):
  ```json
  {
    "number": "string",
    "code": "string"
  }
  ```
- **Respostas Possíveis**:
  - `200 OK`: Retorna o resultado da verificação.
  - `500 Internal Server Error`: Erro na verificação.