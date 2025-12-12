export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // El layout global ya maneja la navegación, solo devolvemos el contenido
  return <>{children}</>
}