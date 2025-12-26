"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DeletePembelianDialog } from "@/components/dialogs/delete-pembelian-dialog"
import { receivePembelian } from "@/app/actions/pembelian"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/format"
import type { TransaksiPembelian, Supplier, PembelianDetail, BahanBaku } from "@prisma/client"

type PembelianWithRelations = TransaksiPembelian & {
  supplier: Pick<Supplier, "id" | "nama" | "kode">
  detail: (PembelianDetail & {
    bahanBaku: Pick<BahanBaku, "id" | "nama">
  })[]
}

interface PembelianTableClientProps {
  pembelian: PembelianWithRelations[]
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  submitted: { label: "Diajukan", variant: "default" as const },
  received: { label: "Diterima", variant: "default" as const },
  cancelled: { label: "Dibatalkan", variant: "destructive" as const },
}

export function PembelianTableClient({ pembelian }: PembelianTableClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPembelian, setSelectedPembelian] = useState<PembelianWithRelations | null>(null)
  const [receivingId, setReceivingId] = useState<string | null>(null)

  const handleDelete = (p: PembelianWithRelations) => {
    setSelectedPembelian(p)
    setDeleteDialogOpen(true)
  }

  const handleReceive = async (p: PembelianWithRelations) => {
    if (!confirm(`Terima pembelian ${p.nomorPo}? Stok akan diupdate otomatis.`)) {
      return
    }

    setReceivingId(p.id)
    try {
      const result = await receivePembelian(p.id)
      if (result.success) {
        toast.success("Pembelian berhasil diterima")
        router.refresh()
      } else {
        toast.error(result.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setReceivingId(null)
    }
  }

  if (pembelian.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Belum ada data pembelian</p>
        <Link href="/transaksi/pembelian/tambah">
          <Button>Buat Pembelian Pertama</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor PO</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pembelian.map((p) => {
              const config = statusConfig[p.status]
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nomorPo}</TableCell>
                  <TableCell>{formatDate(p.tanggal, "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <Link
                      href={`/master/supplier/${p.supplier.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.supplier.nama}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {p.detail.length} item
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(p.total))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/transaksi/pembelian/${p.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Link>
                        </DropdownMenuItem>
                        {p.status !== "received" && p.status !== "cancelled" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleReceive(p)}
                              disabled={receivingId === p.id}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {receivingId === p.id ? "Memproses..." : "Terima Barang"}
                            </DropdownMenuItem>
                          </>
                        )}
                        {p.status === "draft" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(p)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <DeletePembelianDialog
        pembelian={selectedPembelian}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}