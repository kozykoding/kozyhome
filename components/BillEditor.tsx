"use client"

import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Bill {
  id: number
  name: string
  amount: number
  due_date: string
  description: string
  total_owed: number
}

interface BillEditorProps {
  bill: Bill
  onClose: () => void
  onSave: () => void
}

export default function BillEditor({ bill, onClose, onSave }: BillEditorProps) {
  const [editedBill, setEditedBill] = useState(bill)
  const supabase = useSupabaseClient()

  const editor = useEditor({
    extensions: [StarterKit],
    content: bill.description || "",
  })

  const handleSave = async () => {
    const { error } = await supabase
      .from("bills")
      .update({
        ...editedBill,
        description: editor?.getHTML() || "",
      })
      .eq("id", bill.id)

    if (error) {
      console.error("Error updating bill:", error)
    } else {
      onSave()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Bill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Bill Name</Label>
            <Input
              id="edit-name"
              value={editedBill.name}
              onChange={(e) => setEditedBill({ ...editedBill, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              type="number"
              value={editedBill.amount}
              onChange={(e) => setEditedBill({ ...editedBill, amount: Number.parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="edit-due-date">Due Date</Label>
            <Input
              id="edit-due-date"
              type="date"
              value={editedBill.due_date}
              onChange={(e) => setEditedBill({ ...editedBill, due_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-total-owed">Total Owed (if applicable)</Label>
            <Input
              id="edit-total-owed"
              type="number"
              value={editedBill.total_owed || ''}
              onChange={(e) => setEditedBill({ 
                ...editedBill, 
                total_owed: e.target.value ? Number.parseFloat(e.target.value) : 0 
              })}
              placeholder="Enter total amount owed"
            />
          </div>
          <div>
            <Label>Description</Label>
            <EditorContent editor={editor} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

