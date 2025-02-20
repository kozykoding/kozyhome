import BudgetDashboard from "@/components/BudgetDashboard"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Personal Budget Manager</h1>
      <BudgetDashboard />
    </main>
  )
}

