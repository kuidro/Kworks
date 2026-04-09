"use client"

import { getPuntajeLabel, getPuntajeColor } from "@/lib/utils"

interface PuntajeSelectorProps {
  value: number | null
  onChange: (puntaje: number) => void
  disabled?: boolean
}

export default function PuntajeSelector({ value, onChange, disabled = false }: PuntajeSelectorProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(star)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:scale-110 active:scale-95"
            } ${
              value !== null && star <= value
                ? "text-[#c9a84c]"
                : "text-gray-300"
            }`}
            title={getPuntajeLabel(star)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {value !== null && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(0)}
            className="ml-1 text-xs text-gray-400 hover:text-gray-600 underline disabled:cursor-not-allowed"
            title="Limpiar selección"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Etiquetas numéricas y label */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(num)}
              className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              } ${
                value === num
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        {value !== null && value > 0 && (
          <span className={`text-sm font-semibold ${getPuntajeColor(value)}`}>
            {getPuntajeLabel(value)}
          </span>
        )}
        {(value === null || value === 0) && (
          <span className="text-sm text-gray-400">Sin calificar</span>
        )}
      </div>
    </div>
  )
}
