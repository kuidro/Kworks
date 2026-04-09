import { getPuntajeLabel, getPuntajeColor } from "@/lib/utils"

interface Competencia {
  id: string
  competencia: {
    nombre: string
  }
  puntaje: number | null
  comentario: string | null
}

interface EvaluacionAnteriorCardProps {
  orden: number
  evaluadorNombre: string
  competencias: Competencia[]
  comentarioGeneral: string | null
  decision: "AVANZA" | "TERMINA" | null
  completadoEn: Date | string | null
}

function StarDisplay({ puntaje }: { puntaje: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 ${star <= puntaje ? "text-[#c9a84c]" : "text-gray-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function EvaluacionAnteriorCard({
  orden,
  evaluadorNombre,
  competencias,
  comentarioGeneral,
  decision,
  completadoEn,
}: EvaluacionAnteriorCardProps) {
  const promedioNumerador = competencias.filter((c) => c.puntaje !== null).reduce((sum, c) => sum + (c.puntaje || 0), 0)
  const promedioCount = competencias.filter((c) => c.puntaje !== null).length
  const promedio = promedioCount > 0 ? (promedioNumerador / promedioCount).toFixed(1) : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{orden}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Etapa {orden}</h3>
              <p className="text-xs text-gray-500">{evaluadorNombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {promedio && (
              <div className="text-center">
                <p className="text-xs text-gray-400">Promedio</p>
                <p className="text-lg font-bold text-[#1e3a5f]">{promedio}</p>
              </div>
            )}
            {decision && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  decision === "AVANZA"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {decision === "AVANZA" ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Avanzó
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Terminado
                  </>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Competencias */}
      <div className="px-5 py-4">
        <div className="space-y-4">
          {competencias.map((comp) => (
            <div key={comp.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">{comp.competencia.nombre}</span>
                <div className="flex items-center gap-2">
                  {comp.puntaje !== null && (
                    <>
                      <StarDisplay puntaje={comp.puntaje} />
                      <span className={`text-xs font-semibold ${getPuntajeColor(comp.puntaje)}`}>
                        {getPuntajeLabel(comp.puntaje)}
                      </span>
                    </>
                  )}
                  {comp.puntaje === null && (
                    <span className="text-xs text-gray-400">Sin calificar</span>
                  )}
                </div>
              </div>
              {comp.comentario && (
                <p className="text-xs text-gray-500 italic mt-1 bg-gray-50 rounded px-2 py-1.5">
                  &ldquo;{comp.comentario}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Comentario general */}
        {comentarioGeneral && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Comentario General
            </p>
            <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 border border-blue-100">
              {comentarioGeneral}
            </p>
          </div>
        )}

        {completadoEn && (
          <p className="text-xs text-gray-400 mt-3 text-right">
            Completado: {new Date(completadoEn).toLocaleDateString("es-CL")}
          </p>
        )}
      </div>
    </div>
  )
}
