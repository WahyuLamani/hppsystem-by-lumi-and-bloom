import { Suspense } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProduksiTableServer } from "@/components/tables/produksi-table-server"
import { ProduksiTableSkeleton } from "@/components/tables/produksi-table-skeleton"

export default function ProduksiPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produksi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola produksi dan konversi bahan baku ke produk jadi
          </p>
        </div>
        <Link href="/transaksi/produksi/tambah">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Produksi
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProduksiTableSkeleton />}>
            <ProduksiTableServer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}