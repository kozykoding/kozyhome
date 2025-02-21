"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import BillEditor from "./BillEditor"
import PaymentDialog from "./PaymentDialog"

interface Bill {
  id: number
  name: string
  amount: number
  due_date: string
  description: string
  total_owed: number
  is_recurring: boolean
  payment_dates?: string[]
  remaining_balance?: number
}

export default function BillsList() {
  const [bills, setBills] = useState<Bill[]>([])
  const [newBill, setNewBill] = useState({ 
    name: "", 
    amount: "", 
    due_date: "", 
    total_owed: "",
    is_recurring: false 
  })
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [addingPaymentToBill, setAddingPaymentToBill] = useState<Bill | null>(null)
  const [schedulingPaymentForBill, setSchedulingPaymentForBill] = useState<Bill | null>(null)
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
        remaining_balance: newBill.total_owed ? Number.parseFloat(newBill.total_owed) : null,
        payment_dates: [],
        payment_amounts: [],
      },
    ])

    if (error) {
      console.error("Error inserting bill:", error)
    } else {
      console.log("Bill inserted successfully:", data)
      setNewBill({ name: "", amount: "", due_date: "", total_owed: "", is_recurring: false })
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

  const handleAddPayment = (bill: Bill) => {
    setAddingPaymentToBill(bill)
  }

  const handleSchedulePayment = (bill: Bill) => {
    setSchedulingPaymentForBill(bill)
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
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_recurring"
            checked={newBill.is_recurring}
            onChange={(e) => setNewBill({ ...newBill, is_recurring: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="is_recurring">Recurring Monthly Bill</Label>
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
            <TableHead>Recurring</TableHead>
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
              <TableCell>{bill.is_recurring ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => handleEdit(bill)} className="space-x-2">
                  Edit
                </Button>
                {bill.total_owed && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAddPayment(bill)} 
                      className="mx-2"
                    >
                      Add Payment
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSchedulePayment(bill)} 
                      className="mx-2"
                    >
                      Schedule Payment
                    </Button>
                  </>
                )}
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

      {addingPaymentToBill && (
        <PaymentDialog
          billId={addingPaymentToBill.id}
          billName={addingPaymentToBill.name}
          remainingBalance={addingPaymentToBill.remaining_balance || addingPaymentToBill.total_owed}
          isOpen={true}
          onClose={() => setAddingPaymentToBill(null)}
          onSave={() => {
            setAddingPaymentToBill(null)
            fetchBills()
          }}
        />
      )}

      {schedulingPaymentForBill && (
        <PaymentDialog
          billId={schedulingPaymentForBill.id}
          billName={schedulingPaymentForBill.name}
          remainingBalance={schedulingPaymentForBill.remaining_balance || schedulingPaymentForBill.total_owed}
          isOpen={true}
          onClose={() => setSchedulingPaymentForBill(null)}
          onSave={() => {
            setSchedulingPaymentForBill(null)
            fetchBills()
          }}
          isScheduling={true}
        />
      )}
    </div>
  )
}

