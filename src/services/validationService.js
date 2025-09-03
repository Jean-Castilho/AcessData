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
    return { valid: false, message: 'Nome inválido. Apenas letras, espaços, hífens e apóstrofos são permitidos.' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Formato de e-mail inválido.' };
  }

  if (!numberRegex.test(number)) {
    return { valid: false, message: 'Formato de número de telefone inválido.' };
  }

  if (!passwordRegex.test(password)) {
    return { valid: false, message: 'A senha deve ter no mínimo 8 caracteres, com uma letra maiúscula, uma minúscula, um número e um caractere especial.' };
  }

  return { valid: true, message: 'Todos os dados são válidos.' };
}
