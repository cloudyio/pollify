export default function PollLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen flex-col">
      {children}
    </main>
  )
}
