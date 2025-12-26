"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { receivePembelian } from "@/app/actions/pembelian"
import { toast } from "sonner"

interface ReceiveButtonProps {
  pembelianId: string
  nomorPo: string
}

export function ReceiveButton({ pembelianId, nomorPo }: ReceiveButtonProps) {
  const router = useRouter()
  const [isReceiving, setIsReceiving] = useState(false)

  const handleReceive = async () => {
    if (!confirm(`Terima pembelian ${nomorPo}? Stok akan diupdate otomatis.`)) {
      return
    }

    setIsReceiving(true)

    try {
      const result = await receivePembelian(pembelianId)

      if (result.success) {
        toast.success("Pembelian berhasil diterima")
        router.refresh()
      } else {
        toast.error(result.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    } finally {
      setIsReceiving(false)
    }
  }

  return (
    <Button onClick={handleReceive} disabled={isReceiving}>
      {isReceiving ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          <Check className="h-4 w-4 mr-2" />
          Terima Barang
        </>
      )}
    </Button>
  )
}