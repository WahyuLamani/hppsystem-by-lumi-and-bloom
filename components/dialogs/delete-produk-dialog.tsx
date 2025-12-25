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
import { deleteProduk } from "@/app/actions/produk"
import type { Produk } from "@prisma/client"

interface DeleteProdukDialogProps {
  produk: Produk | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProdukDialog({
  produk,
  open,
  onOpenChange,
}: DeleteProdukDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!produk) return

    setIsDeleting(true)

    try {
      const result = await deleteProduk(produk.id)

      if (result.success) {
        toast.success("Produk berhasil dihapus")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Gagal menghapus produk")
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
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3">
            Apakah Anda yakin ingin menghapus produk{" "}
            <span className="font-semibold text-gray-900">
              {produk?.nama}
            </span>
            ? Resep yang terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
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