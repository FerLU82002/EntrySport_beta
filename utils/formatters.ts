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

export const formatearFechaLocal = (fecha: Date): string => {
  // Obtener año, mes y día en la zona horaria local
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export const parsearFechaLocal = (fechaStr: string): Date => {
  // Parsear fecha en formato YYYY-MM-DD como fecha local (no UTC)
  const [year, month, day] = fechaStr.split('-').map(Number)
  return new Date(year, month - 1, day)
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
