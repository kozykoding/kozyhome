"use client"

import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Payment {
  amount: number
  date: string
  is_scheduled?: boolean
}

interface PaymentDialogProps {
  billId: number
  billName: string
  remainingBalance: number
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  isScheduling?: boolean
}

function formatDateForPostgres(dateString: string, isTimestamp: boolean = false): string {
  const date = new Date(dateString)
  if (isTimestamp) {
    return date.toISOString() // For timestamp fields (bills.payment_dates)
  }
  // For date fields (scheduled_payments.due_date)
  return date.toISOString().split('T')[0]
}

export default function PaymentDialog({ 
  billId, 
  billName,
  remainingBalance,
  isOpen, 
  onClose, 
  onSave,
  isScheduling = false 
}: PaymentDialogProps) {
  const [payment, setPayment] = useState<Payment>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    is_scheduled: isScheduling
  })
  const supabase = useSupabaseClient()

  const handleSave = async () => {
    if (isScheduling) {
      // Add to scheduled_payments table - use date format
      const { error } = await supabase
        .from('scheduled_payments')
        .insert([{
          bill_id: billId,
          amount: payment.amount,
          due_date: formatDateForPostgres(payment.date) // date only
        }])
      
      if (error) {
        console.error('Error scheduling payment:', error)
        return
      }
    } else {
      // Add to payment history and update remaining balance
      const newRemainingBalance = remainingBalance - payment.amount
      
      // First get the current arrays
      const { data: currentBill, error: fetchError } = await supabase
        .from('bills')
        .select('payment_dates, payment_amounts')
        .eq('id', billId)
        .single()

      if (fetchError) {
        console.error('Error fetching current bill:', fetchError)
        return
      }

      // Create new arrays with the additional payment
      const newPaymentDates = [
        ...(currentBill.payment_dates || []), 
        formatDateForPostgres(payment.date, true) // use timestamp format
      ]
      const newPaymentAmounts = [
        ...(currentBill.payment_amounts || []), 
        Number(payment.amount)
      ]

      // Update the bill with the new arrays
      const { error: updateError } = await supabase
        .from('bills')
        .update({
          remaining_balance: newRemainingBalance,
          payment_dates: newPaymentDates,
          payment_amounts: newPaymentAmounts
        })
        .eq('id', billId)

      if (updateError) {
        console.error('Error adding payment:', updateError)
        return
      }
    }
    
    onSave()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isScheduling ? 'Schedule Payment' : 'Add Payment'} for {billName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-amount">Payment Amount</Label>
            <Input
              id="payment-amount"
              type="number"
              value={payment.amount}
              onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })}
              placeholder="Enter payment amount"
            />
          </div>
          <div>
            <Label htmlFor="payment-date">
              {isScheduling ? 'Due Date' : 'Payment Date'}
            </Label>
            <Input
              id="payment-date"
              type="date"
              value={payment.date}
              onChange={(e) => setPayment({ ...payment, date: e.target.value })}
            />
          </div>
          {!isScheduling && (
            <div className="text-sm text-muted-foreground">
              Remaining Balance: ${remainingBalance.toFixed(2)}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSave}>
            {isScheduling ? 'Schedule Payment' : 'Add Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 