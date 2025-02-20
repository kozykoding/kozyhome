"use client"

import { useState, useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Bill {
  id: number
  name: string
  amount: number
  due_date: string
  description: string
  total_owed: number
}

interface Paycheck {
  id: number
  amount: number
  frequency: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function OverviewTab() {
  const [bills, setBills] = useState<Bill[]>([])
  const [paychecks, setPaychecks] = useState<Paycheck[]>([])
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchBills()
    fetchPaychecks()
  }, [])

  const fetchBills = async () => {
    const { data, error } = await supabase.from("bills").select("*")
    if (error) {
      console.error("Error fetching bills:", error)
    } else {
      setBills(data || [])
    }
  }

  const fetchPaychecks = async () => {
    const { data, error } = await supabase.from("paychecks").select("*")
    if (error) {
      console.error("Error fetching paychecks:", error)
    } else {
      setPaychecks(data || [])
    }
  }

  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0)
  const totalIncome = paychecks.reduce((sum, paycheck) => {
    if (paycheck.frequency === "bi-weekly") {
      return sum + paycheck.amount * 2
    }
    return sum + paycheck.amount
  }, 0)

  const pieChartData = bills.map((bill) => ({
    name: bill.name,
    value: bill.amount,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Income: ${totalIncome.toFixed(2)}</div>
          <div className="text-2xl font-bold text-red-500">Expenses: ${totalBills.toFixed(2)}</div>
          <div className="text-2xl font-bold text-green-500">Remaining: ${(totalIncome - totalBills).toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`$${totalBills.toFixed(2)}`}
                  position="center"
                  fill="#888"
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map((bill) => (
          <Card key={bill.id}>
            <CardHeader>
              <CardTitle>{bill.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>Amount: ${bill.amount.toFixed(2)}</div>
                {bill.total_owed && (
                  <>
                    <div>Total Owed: ${bill.total_owed.toFixed(2)}</div>
                    <Progress value={(bill.amount / bill.total_owed) * 100} />
                    <div>Paid: {((bill.amount / bill.total_owed) * 100).toFixed(2)}%</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

