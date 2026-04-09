export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function getPuntajeLabel(puntaje: number): string {
  switch (puntaje) {
    case 1:
      return "Deficiente"
    case 2:
      return "Regular"
    case 3:
      return "Bueno"
    case 4:
      return "Muy Bueno"
    case 5:
      return "Excelente"
    default:
      return "Sin calificar"
  }
}

export function getPuntajeColor(puntaje: number): string {
  switch (puntaje) {
    case 1:
      return "text-red-600"
    case 2:
      return "text-orange-500"
    case 3:
      return "text-yellow-500"
    case 4:
      return "text-blue-500"
    case 5:
      return "text-green-600"
    default:
      return "text-gray-400"
  }
}
