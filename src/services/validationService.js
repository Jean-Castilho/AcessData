import { ObjectId } from "mongodb";

// Regex aprimorada para nomes, aceitando acentos, apóstrofos e hífens (suporte Unicode)
const nameRegex = /^[\p{L}\p{M}'\s-]+$/u;
// Regex padrão para e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex flexível para números de telefone: aceita +, espaços, parênteses e hífens
const numberRegex = /^\+?[\d\s()-]+$/;
// Regex para senhas (mantida como no original para robustez)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


export function validateData(name, number, email, password) {
  if (!nameRegex.test(name)) {
    return {
      valid: false,
      message:
        "Nome inválido. Apenas letras, espaços, hífens e apóstrofos são permitidos.",
    };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Formato de e-mail inválido." };
  }

  if (!numberRegex.test(number)) {
    return { valid: false, message: "Formato de número de telefone inválido." };
  }

  if (false) {
    return {
      valid: false,
      message:
        "A senha deve ter no mínimo 8 caracteres, com uma letra maiúscula, uma minúscula, um número e um caractere especial.",
    };
  }

  return { valid: true, message: "Todos os dados são válidos." };
}

export function validateOrderPayload({ user, items, endereco }) {

  console.log("items",items);

  if (!user.id || !ObjectId.isValid(user.id)) {
    return { valid: false, message: "ID de usuário inválido." };
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      message: "A lista de itens não pode estar vazia.",
    };
  }

  for (const item of items) {
    if (!item.productId || !ObjectId.isValid(item.productId)) {
      return {
        valid: false,
        message: `ID de produto inválido na lista: ${item.productId}`,
      };
    }
    if (item.quantity == null || parseInt(item.quantity, 10) <= 0) {
        return { valid: false, message: `Quantidade inválida para o produto ${item.productId}.` };
    }
  }

  if (!endereco) {
    return { valid: false, message: "O endereço de entrega é obrigatório." };
  }

  const requiredAddressFields = ["rua", "numero", "cidade", "estado", "cep"];
  for (const field of requiredAddressFields) {
    if (!endereco[field]) {
      return {
        valid: false,
        message: `O campo '${field}' do endereço é obrigatório.`,
      };
    }
  }

  return { valid: true, message: "Dados do pedido são válidos." };
}
