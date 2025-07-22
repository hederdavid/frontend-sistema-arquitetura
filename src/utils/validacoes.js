export const validarEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0,
    resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
};

export const validarCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho++;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

// Validações específicas para projetos
export const validarProjeto = (projeto) => {
  const erros = [];

  // Validar nome do projeto
  if (!projeto.nome || projeto.nome.trim().length === 0) {
    erros.push("Nome do projeto é obrigatório");
  } else if (projeto.nome.trim().length < 3) {
    erros.push("Nome do projeto deve ter pelo menos 3 caracteres");
  } else if (projeto.nome.trim().length > 100) {
    erros.push("Nome do projeto deve ter no máximo 100 caracteres");
  }

  // Validar descrição
  if (!projeto.descricao || projeto.descricao.trim().length === 0) {
    erros.push("Descrição do projeto é obrigatória");
  } else if (projeto.descricao.trim().length < 10) {
    erros.push("Descrição deve ter pelo menos 10 caracteres");
  } else if (projeto.descricao.trim().length > 1000) {
    erros.push("Descrição deve ter no máximo 1000 caracteres");
  }

  // Validar cliente
  if (!projeto.clienteId || projeto.clienteId.trim().length === 0) {
    erros.push("Cliente é obrigatório");
  }

  // Validar datas
  if (!projeto.dataInicio) {
    erros.push("Data de início é obrigatória");
  }

  if (!projeto.dataFimPrevista) {
    erros.push("Data fim prevista é obrigatória");
  }

  // Validar se data de início não é no passado (mais de 1 dia)
  if (projeto.dataInicio) {
    const dataInicio = new Date(projeto.dataInicio);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataInicio < hoje) {
      const diffDays = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        erros.push("Data de início não pode ser muito anterior à data atual");
      }
    }
  }

  // Validar se data fim é posterior à data início
  if (projeto.dataInicio && projeto.dataFimPrevista) {
    const dataInicio = new Date(projeto.dataInicio);
    const dataFim = new Date(projeto.dataFimPrevista);

    if (dataFim <= dataInicio) {
      erros.push("Data fim prevista deve ser posterior à data de início");
    }

    // Verificar se o projeto não é muito longo (mais de 5 anos)
    const diffTime = Math.abs(dataFim - dataInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1825) {
      // 5 anos
      erros.push("Duração do projeto não pode exceder 5 anos");
    }
  }

  return {
    valido: erros.length === 0,
    erros,
  };
};

export const validarSubprojeto = (subprojeto) => {
  const erros = [];

  if (!subprojeto.subprojetoId || subprojeto.subprojetoId.trim().length === 0) {
    erros.push("Subprojeto deve ser selecionado");
  }

  if (!subprojeto.tarefas || subprojeto.tarefas.length === 0) {
    erros.push("Subprojeto deve ter pelo menos uma tarefa");
  }

  return {
    valido: erros.length === 0,
    erros,
  };
};

export const validarTarefa = (tarefa, index) => {
  const erros = [];

  if (!tarefa.tarefaId || tarefa.tarefaId.trim().length === 0) {
    erros.push(`Tarefa ${index + 1}: ID da tarefa é obrigatório`);
  }

  // Validar datas da tarefa
  if (tarefa.dataInicio && tarefa.dataFimPrevista) {
    const dataInicio = new Date(tarefa.dataInicio);
    const dataFimPrevista = new Date(tarefa.dataFimPrevista);

    if (dataFimPrevista <= dataInicio) {
      erros.push(
        `Tarefa ${
          index + 1
        }: Data fim prevista deve ser posterior à data de início`
      );
    }
  }

  // Validar data fim real (se fornecida)
  if (tarefa.dataFimReal) {
    if (tarefa.dataInicio) {
      const dataInicio = new Date(tarefa.dataInicio);
      const dataFimReal = new Date(tarefa.dataFimReal);

      if (dataFimReal < dataInicio) {
        erros.push(
          `Tarefa ${
            index + 1
          }: Data fim real não pode ser anterior à data de início`
        );
      }
    }

    // Se a tarefa tem data fim real, o status deve ser CONCLUIDA ou CANCELADA
    if (tarefa.status && !["CONCLUIDA", "CANCELADA"].includes(tarefa.status)) {
      erros.push(
        `Tarefa ${
          index + 1
        }: Tarefa com data fim real deve ter status 'Concluída' ou 'Cancelada'`
      );
    }
  }

  // Validar status
  const statusValidos = [
    "NAO_INICIADA",
    "EM_ANDAMENTO",
    "CONCLUIDA",
    "ATRASADA",
    "CANCELADA",
  ];
  if (tarefa.status && !statusValidos.includes(tarefa.status)) {
    erros.push(`Tarefa ${index + 1}: Status inválido`);
  }

  // Validar observações (se fornecidas)
  if (tarefa.observacoes && tarefa.observacoes.length > 500) {
    erros.push(
      `Tarefa ${index + 1}: Observações devem ter no máximo 500 caracteres`
    );
  }

  return {
    valido: erros.length === 0,
    erros,
  };
};

export const validarProjetoCompleto = (projeto) => {
  const resultadoProjeto = validarProjeto(projeto);

  if (!resultadoProjeto.valido) {
    return resultadoProjeto;
  }

  const errosGerais = [];

  // Validar subprojetos
  if (projeto.subprojetos && projeto.subprojetos.length > 0) {
    projeto.subprojetos.forEach((subprojeto, subIndex) => {
      const resultadoSub = validarSubprojeto(subprojeto);
      if (!resultadoSub.valido) {
        errosGerais.push(
          `Subprojeto ${subIndex + 1}: ${resultadoSub.erros.join(", ")}`
        );
      }

      // Validar tarefas do subprojeto
      if (subprojeto.tarefas && subprojeto.tarefas.length > 0) {
        subprojeto.tarefas.forEach((tarefa, tarefaIndex) => {
          const resultadoTarefa = validarTarefa(tarefa, tarefaIndex);
          if (!resultadoTarefa.valido) {
            errosGerais.push(
              `Subprojeto ${subIndex + 1} - ${resultadoTarefa.erros.join(", ")}`
            );
          }
        });
      }
    });
  }

  return {
    valido: errosGerais.length === 0,
    erros: errosGerais,
  };
};

// Função para sanitizar dados antes do envio
export const sanitizarProjeto = (projeto) => {
  return {
    ...projeto,
    nome: projeto.nome?.trim() || "",
    descricao: projeto.descricao?.trim() || "",
    clienteId: projeto.clienteId?.trim() || "",
    dataInicio: projeto.dataInicio || "",
    dataFimPrevista: projeto.dataFimPrevista || "",
    subprojetos:
      projeto.subprojetos?.map((sub) => ({
        ...sub,
        subprojetoId: sub.subprojetoId?.trim() || "",
        tarefas:
          sub.tarefas?.map((tarefa) => ({
            ...tarefa,
            tarefaId: tarefa.tarefaId?.trim() || "",
            observacoes: tarefa.observacoes?.trim() || "",
            dataInicio: tarefa.dataInicio || "",
            dataFimPrevista: tarefa.dataFimPrevista || "",
            dataFimReal: tarefa.dataFimReal || "",
            status: tarefa.status || "NAO_INICIADA",
          })) || [],
      })) || [],
  };
};
