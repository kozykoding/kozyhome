"use client"

import { useState } from "react"
import PaycheckForm from "./PaycheckForm"
import BillsList from "./BillsList"
import OverviewTab from "./OverviewTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BudgetDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>
      <TabsContent value="income">
        <PaycheckForm />
      </TabsContent>
      <TabsContent value="expenses">
        <BillsList />
      </TabsContent>
    </Tabs>
  )
}

