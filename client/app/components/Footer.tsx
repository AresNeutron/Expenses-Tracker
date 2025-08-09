import { Info, ShieldCheck } from "lucide-react"

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Application footer"
      className="border-t border-border-primary bg-surface-primary/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Author / Ownership */}
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
              Built and maintained by{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">AresNeutron</span>
            </p>
          </div>

          {/* Development Notice */}
          <div className="w-full sm:w-auto">
            <div className="card bg-surface-secondary border-border-primary px-3 sm:px-4 py-3 rounded-card">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-warning-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="space-y-1">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    This app is in active development. You may encounter occasional issues, but your data is safe.
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    If you find a problem, please let me know at{" "}
                    <a
                      href="mailto:arexneutron@gmail.com"
                      className="font-medium text-primary-700 dark:text-primary-300 underline decoration-primary-200 hover:decoration-primary-300 underline-offset-2"
                    >
                      arexneutron@gmail.com
                    </a>
                    . Thank you for your help and patience!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
