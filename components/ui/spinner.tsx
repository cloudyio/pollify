export function Spinner({ className }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-4 border-t-transparent border-blue-600 ${className}`} />
  )
}
