"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, Eye, Power } from "lucide-react"
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
import { DeleteResepDialog } from "@/components/dialogs/delete-resep-dialog"
import { toggleResepActive } from "@/app/actions/resep"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { Resep, Produk, BahanBaku, ResepDetail } from "@prisma/client"

type ResepWithRelations = Resep & {
  produk: Pick<Produk, "id" | "nama" | "kode" | "hpp">
  resepDetail: (ResepDetail & {
    bahanBaku: Pick<BahanBaku, "id" | "nama" | "hargaBeli">
  })[]
}

interface ResepTableClientProps {
  resep: ResepWithRelations[]
}

export function ResepTableClient({ resep }: ResepTableClientProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedResep, setSelectedResep] = useState<ResepWithRelations | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleDelete = (resep: ResepWithRelations) => {
    setSelectedResep(resep)
    setDeleteDialogOpen(true)
  }

  const handleToggleActive = async (resep: ResepWithRelations) => {
    setTogglingId(resep.id)
    try {
      const result = await toggleResepActive(resep.id)
      if (result.success) {
        toast.success(
          resep.isActive ? "Resep dinonaktifkan" : "Resep diaktifkan"
        )
        router.refresh()
      } else {
        toast.error(result.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setTogglingId(null)
    }
  }

  // Calculate total biaya bahan
  const calculateTotalBiaya = (resep: ResepWithRelations) => {
    return resep.resepDetail.reduce((total, detail) => {
      return total + Number(detail.qty) * Number(detail.bahanBaku.hargaBeli)
    }, 0)
  }

  // Calculate HPP per unit
  const calculateHPP = (resep: ResepWithRelations) => {
    const totalBiaya = calculateTotalBiaya(resep)
    const porsiHasil = Number(resep.porsiHasil)
    return porsiHasil > 0 ? totalBiaya / porsiHasil : 0
  }

  if (resep.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Belum ada data resep</p>
        <Link href="/master/resep/tambah">
          <Button>Tambah Resep Pertama</Button>
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
              <TableHead>Nama Resep</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Porsi Hasil</TableHead>
              <TableHead>Total Biaya</TableHead>
              <TableHead>HPP/Unit</TableHead>
              <TableHead>Jumlah Bahan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resep.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.namaResep}</TableCell>
                <TableCell>
                  <Link
                    href={`/master/produk/${r.produk.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {r.produk.nama}
                  </Link>
                </TableCell>
                <TableCell>
                  {formatNumber(Number(r.porsiHasil), 2)} {r.satuanHasil}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(calculateTotalBiaya(r))}
                </TableCell>
                <TableCell className="font-medium text-blue-600">
                  {formatCurrency(calculateHPP(r))}
                </TableCell>
                <TableCell className="text-gray-600">
                  {r.resepDetail.length} bahan
                </TableCell>
                <TableCell>
                  <Badge
                    variant={r.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleToggleActive(r)}
                  >
                    {togglingId === r.id ? "..." : r.isActive ? "Aktif" : "Nonaktif"}
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
                        <Link href={`/master/resep/${r.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/master/resep/${r.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(r)}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {r.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(r)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteResepDialog
        resep={selectedResep}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}