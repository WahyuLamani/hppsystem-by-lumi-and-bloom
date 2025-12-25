"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, Eye, BookOpen, AlertTriangle } from "lucide-react"
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
import { DeleteProdukDialog } from "@/components/dialogs/delete-produk-dialog"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/format"
import type { Produk, Resep } from "@prisma/client"

type ProdukWithResep = Produk & {
  resep: Resep[]
}

interface ProdukTableClientProps {
  produk: ProdukWithResep[]
}

export function ProdukTableClient({ produk }: ProdukTableClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduk, setSelectedProduk] = useState<ProdukWithResep | null>(null)

  const handleDelete = (prod: ProdukWithResep) => {
    setSelectedProduk(prod)
    setDeleteDialogOpen(true)
  }

  const isStokMenipis = (prod: ProdukWithResep) => {
    return Number(prod.stok) <= Number(prod.stokMinimum)
  }

  const hasResep = (prod: ProdukWithResep) => {
    return prod.resep && prod.resep.length > 0
  }

  if (produk.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Belum ada data produk</p>
        <Link href="/master/produk/tambah">
          <Button>Tambah Produk Pertama</Button>
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
              <TableHead>HPP</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produk.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell className="font-medium">{prod.kode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {prod.nama}
                    {!hasResep(prod) && (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" aria-label="Belum ada resep" />
                    )}
                    {isStokMenipis(prod) && (
                      <AlertTriangle className="h-4 w-4 text-red-600" aria-label="Stok menipis" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{prod.kategori}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatCurrency(Number(prod.hpp))}
                    </span>
                    {!hasResep(prod) && (
                      <span className="text-xs text-yellow-600">Belum ada resep</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(Number(prod.hargaJual))}
                </TableCell>
                <TableCell>
                  {hasResep(prod) ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-green-600">
                        {formatCurrency(Number(prod.marginRupiah))}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatPercentage(Number(prod.marginPersen))}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      isStokMenipis(prod) ? "text-red-600 font-medium" : ""
                    }
                  >
                    {formatNumber(Number(prod.stok), 2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={prod.status === "active" ? "default" : "secondary"}
                  >
                    {prod.status === "active" ? "Aktif" : "Nonaktif"}
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
                        <Link href={`/master/produk/${prod.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/master/produk/${prod.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/master/produk/${prod.id}/resep`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Kelola Resep
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(prod)}
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
      <DeleteProdukDialog
        produk={selectedProduk}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}