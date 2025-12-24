"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle } from "lucide-react"
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
// import { DeleteBahanBakuDialog } from "@/components/dialogs/delete-bahan-baku-dialog"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { BahanBaku, Supplier } from "@prisma/client"

type BahanBakuWithSupplier = BahanBaku & {
  supplier: Pick<Supplier, "id" | "nama" | "kode"> | null
}

interface BahanBakuTableClientProps {
  bahanBaku: BahanBakuWithSupplier[]
}

export function BahanBakuTableClient({ bahanBaku }: BahanBakuTableClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBahan, setSelectedBahan] = useState<BahanBakuWithSupplier | null>(null)

  const handleDelete = (bahan: BahanBakuWithSupplier) => {
    setSelectedBahan(bahan)
    setDeleteDialogOpen(true)
  }

  // Check if stok <= stok minimum
  const isStokMenipis = (bahan: BahanBakuWithSupplier) => {
    return Number(bahan.stok) <= Number(bahan.stokMinimum)
  }

  if (bahanBaku.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Belum ada data bahan baku</p>
        <Link href="/master/bahan-baku/tambah">
          <Button>Tambah Bahan Baku Pertama</Button>
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
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Harga Beli</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bahanBaku.map((bahan) => (
              <TableRow key={bahan.id}>
                <TableCell className="font-medium">{bahan.kode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {bahan.nama}
                    {isStokMenipis(bahan) && (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{bahan.kategori}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span
                      className={
                        isStokMenipis(bahan) ? "text-red-600 font-medium" : ""
                      }
                    >
                      {formatNumber(Number(bahan.stok), 2)} {bahan.satuan}
                    </span>
                    <span className="text-xs text-gray-500">
                      Min: {formatNumber(Number(bahan.stokMinimum), 2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(Number(bahan.hargaBeli))}
                </TableCell>
                <TableCell className="text-gray-600">
                  {bahan.supplier?.nama || "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={bahan.status === "active" ? "default" : "secondary"}
                  >
                    {bahan.status === "active" ? "Aktif" : "Nonaktif"}
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
                        <Link href={`/master/bahan-baku/${bahan.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/master/bahan-baku/${bahan.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(bahan)}
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
      {/* <DeleteBahanBakuDialog
        bahanBaku={selectedBahan}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      /> */}
    </>
  )
}