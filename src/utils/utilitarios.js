import Swal from "sweetalert2";

export const mostrarAlertaErro = (title, text) => {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
    confirmButtonColor: "#d33", // botão vermelho
    confirmButtonText: "Ok",
  });
};

export const mostrarAlertaAtencao = (title, text) => {
  return Swal.fire({
    icon: "warning",
    title: title,
    text: text,
    confirmButtonColor: "#FFA500",
    confirmButtonText: "Confirmar",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#d33",
    customClass: {
      actions: "swal2-button-spacing", // aplica a classe personalizada ao container dos botões
    },
  });
};

export const mostrarAlertaSucesso = (title, text) => {
  Swal.fire({
    icon: "success",
    title: title,
    text: text,
    confirmButtonColor: "#28a745", // botão verde
    confirmButtonText: "Ok",
  });
};
export const mostrarAlertaInfo = (title, text) => {
  Swal.fire({
    icon: "info",
    title: title,
    text: text,
    confirmButtonColor: "#17a2b8", // botão azul
    confirmButtonText: "Ok",
  });
};
