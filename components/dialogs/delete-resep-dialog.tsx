"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteResep } from "@/app/actions/resep"
import type { Resep } from "@prisma/client"

interface DeleteResepDialogProps {
  resep: Resep | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteResepDialog({
  resep,
  open,
  onOpenChange,
}: DeleteResepDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!resep) return

    setIsDeleting(true)

    try {
      const result = await deleteResep(resep.id)

      if (result.success) {
        toast.success("Resep berhasil dihapus")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Gagal menghapus resep")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Hapus Resep?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3">
            Apakah Anda yakin ingin menghapus resep{" "}
            <span className="font-semibold text-gray-900">
              {resep?.namaResep}
            </span>
            ? HPP produk akan dihitung ulang. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}