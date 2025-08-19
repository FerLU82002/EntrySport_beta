export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
  }).format(precio)
}

export const formatearFecha = (fecha: Date): string => {
  return fecha.toISOString().split("T")[0]
}

export const obtenerRangoPrecio = (zonas: Array<{ precio: number }>): string => {
  const precios = zonas.map((zona) => zona.precio)
  const minimo = Math.min(...precios)
  const maximo = Math.max(...precios)

  if (minimo === maximo) {
    return formatearPrecio(minimo)
  }
  return `${formatearPrecio(minimo)} - ${formatearPrecio(maximo)}`
}
