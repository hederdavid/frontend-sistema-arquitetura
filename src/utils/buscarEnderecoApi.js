export const buscarEndereco = async (cep) => {
  const cepCorreto = cep.replace(/\D/g, "");

  if (cep.length !== 8) {
    alert("CEP inválido. Deve conter 8 dígitos.");
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      alert("CEP não encontrado.");
      return;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    alert("Erro ao buscar endereço. Verifique sua conexão.");
  }
};