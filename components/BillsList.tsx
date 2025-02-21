"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import BillEditor from "./BillEditor"

interface Bill {
  id: number
  name: string
  amount: number
  due_date: string
  description: string
  total_owed: number
}

export default function BillsList() {
  const [bills, setBills] = useState<Bill[]>([])
  const [newBill, setNewBill] = useState({ name: "", amount: "", due_date: "", total_owed: "" })
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    const { data, error } = await supabase.from("bills").select("*").order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching bills:", error)
    } else {
      setBills(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from("bills").insert([
      {
        ...newBill,
        amount: Number.parseFloat(newBill.amount),
        total_owed: newBill.total_owed ? Number.parseFloat(newBill.total_owed) : null,
      },
    ])

    if (error) {
      console.error("Error inserting bill:", error)
    } else {
      console.log("Bill inserted successfully:", data)
      setNewBill({ name: "", amount: "", due_date: "", total_owed: "" })
      fetchBills()
    }
  }

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill)
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("bills").delete().eq("id", id)

    if (error) {
      console.error("Error deleting bill:", error)
    } else {
      fetchBills()
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Bill Name</Label>
          <Input
            id="name"
            value={newBill.name}
            onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
            placeholder="Enter bill name"
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={newBill.amount}
            onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
            placeholder="Enter amount"
            required
          />
        </div>
        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={newBill.due_date}
            onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="total_owed">Total Owed (if applicable)</Label>
          <Input
            id="total_owed"
            type="number"
            value={newBill.total_owed}
            onChange={(e) => setNewBill({ ...newBill, total_owed: e.target.value })}
            placeholder="Enter total amount owed"
          />
        </div>
        <Button type="submit">Add Bill</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Total Owed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>{bill.name}</TableCell>
              <TableCell>${bill.amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
              <TableCell>{bill.total_owed ? `$${bill.total_owed.toFixed(2)}` : "N/A"}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => handleEdit(bill)} className="space-x-2">
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(bill.id)} className="mx-2">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingBill && (
        <BillEditor
          bill={editingBill}
          onClose={() => setEditingBill(null)}
          onSave={() => {
            setEditingBill(null)
            fetchBills()
          }}
        />
      )}
    </div>
  )
}

