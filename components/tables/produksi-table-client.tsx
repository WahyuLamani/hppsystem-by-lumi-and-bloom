"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, Trash2, CheckCircle } from "lucide-react"
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
import { DeleteProduksiDialog } from "@/components/dialogs/delete-produksi-dialog"
import { completeProduksi } from "@/app/actions/produksi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import type { TransaksiProduksi, Resep, Produk } from "@prisma/client"

type ProduksiWithRelations = TransaksiProduksi & {
  resep: Pick<Resep, "id" | "namaResep">
  produk: Pick<Produk, "id" | "nama" | "kode">
}

interface ProduksiTableClientProps {
  produksi: ProduksiWithRelations[]
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  processing: { label: "Proses", variant: "default" as const },
  completed: { label: "Selesai", variant: "default" as const },
  cancelled: { label: "Dibatalkan", variant: "destructive" as const },
}

export function ProduksiTableClient({ produksi }: ProduksiTableClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduksi, setSelectedProduksi] = useState<ProduksiWithRelations | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const handleDelete = (p: ProduksiWithRelations) => {
    setSelectedProduksi(p)
    setDeleteDialogOpen(true)
  }

  const handleComplete = async (p: ProduksiWithRelations) => {
    if (!confirm(`Selesaikan produksi ${p.nomorProduksi}? Stok akan diupdate otomatis.`)) {
      return
    }

    setCompletingId(p.id)
    try {
      const result = await completeProduksi(p.id)
      if (result.success) {
        toast.success("Produksi berhasil diselesaikan")
        router.refresh()
      } else {
        if (result.insufficient) {
          const items = result.insufficient.map((item: any) => 
            `${item.nama}: butuh ${formatNumber(item.needed, 2)} ${item.satuan}, tersedia ${formatNumber(item.available, 2)} ${item.satuan}`
          ).join(", ")
          toast.error(`Stok tidak cukup: ${items}`)
        } else {
          toast.error(result.error || "Terjadi kesalahan")
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setCompletingId(null)
    }
  }

  if (produksi.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Belum ada data produksi</p>
        <Link href="/transaksi/produksi/tambah">
          <Button>Buat Produksi Pertama</Button>
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
              <TableHead>Nomor Produksi</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Resep</TableHead>
              <TableHead>Qty Hasil</TableHead>
              <TableHead>Total HPP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produksi.map((p) => {
              const config = statusConfig[p.status]
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nomorProduksi}</TableCell>
                  <TableCell>{formatDate(p.tanggal, "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <Link
                      href={`/master/produk/${p.produk.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.produk.nama}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {p.resep.namaResep}
                  </TableCell>
                  <TableCell>
                    {formatNumber(Number(p.qtyHasil), 2)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(p.totalHpp))}
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
                          <Link href={`/transaksi/produksi/${p.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Link>
                        </DropdownMenuItem>
                        {p.status !== "completed" && p.status !== "cancelled" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleComplete(p)}
                              disabled={completingId === p.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {completingId === p.id ? "Memproses..." : "Selesaikan"}
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

      <DeleteProduksiDialog
        produksi={selectedProduksi}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}