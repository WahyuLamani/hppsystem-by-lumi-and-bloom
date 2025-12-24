"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
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
import { DeleteSupplierDialog } from "@/components/dialogs/delete-supplier-dialog"
import type { Supplier } from "@prisma/client"

interface SupplierTableClientProps {
  suppliers: Supplier[]
}

export function SupplierTableClient({ suppliers }: SupplierTableClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setDeleteDialogOpen(true)
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Belum ada data supplier</p>
        <Link href="/master/supplier/tambah">
          <Button>Tambah Supplier Pertama</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.kode}</TableCell>
                <TableCell>{supplier.nama}</TableCell>
                <TableCell className="text-gray-600">
                  {supplier.kontak || "-"}
                </TableCell>
                <TableCell className="text-gray-600">
                  {supplier.email || "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={supplier.status === "active" ? "default" : "secondary"}
                  >
                    {supplier.status === "active" ? "Aktif" : "Nonaktif"}
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
                        <Link href={`/master/supplier/${supplier.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/master/supplier/${supplier.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(supplier)}
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
      <DeleteSupplierDialog
        supplier={selectedSupplier}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}

// Server Component Wrapper
import { getSuppliers } from "@/app/actions/supplier"

export async function SupplierTable() {
  const result = await getSuppliers()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12 text-red-600">
        {result.error || "Gagal memuat data"}
      </div>
    )
  }

  return <SupplierTableClient suppliers={result.data} />
}