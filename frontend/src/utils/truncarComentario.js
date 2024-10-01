export const truncateComentario = (texto, maxLength = 50) => {
  if (texto.length > maxLength) {
    return `${texto.substring(0, maxLength)}...`;
  }
  return texto;
};
