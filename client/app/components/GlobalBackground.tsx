"use client"

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-10 transition-all duration-700 ease-in-out">
      {/* Gradiente principal mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-platinum-100 to-primary-100 dark:from-neutral-900 dark:via-midnight-100 dark:to-neutral-800"></div>

      {/* Gradiente secundario para más profundidad */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-platinum-50/50 to-primary-50/30 dark:from-transparent dark:via-neutral-800/30 dark:to-midnight-200/20"></div>

      {/* Elementos decorativos flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculo superior derecho - Azul platinado / Azul oscuro */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-platinum-300/20 dark:from-primary-800/20 dark:to-midnight-200/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse transition-all duration-700"></div>

        {/* Círculo inferior izquierdo - Platinado / Negro suave */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-platinum-200/25 to-neutral-200/15 dark:from-neutral-700/15 dark:to-midnight-100/8 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse delay-1000 transition-all duration-700"></div>

        {/* Círculos adicionales para más profundidad */}
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-gradient-to-br from-primary-100/20 to-platinum-200/15 dark:from-primary-900/10 dark:to-neutral-800/8 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-2xl animate-pulse delay-500 transition-all duration-700"></div>

        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-gradient-to-tl from-platinum-100/20 to-primary-50/15 dark:from-neutral-800/10 dark:to-midnight-200/8 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-2xl animate-pulse delay-1500 transition-all duration-700"></div>

        {/* Patrón de cuadrícula sutil mejorado */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(14, 165, 233, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        {/* Overlay de textura nocturna para modo oscuro */}
        <div className="absolute inset-0 opacity-0 dark:opacity-[0.03] pointer-events-none transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neutral-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-midnight-100/30 to-transparent"></div>
        </div>
      </div>

      {/* Velo suave para transición entre modos */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/20 transition-all duration-700"></div>
    </div>
  )
}
