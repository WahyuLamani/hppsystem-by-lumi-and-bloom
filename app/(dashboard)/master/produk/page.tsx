import { Suspense } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProdukTableServer } from "@/components/tables/produk-table-server"
import { ProdukTableSkeleton } from "@/components/tables/produk-table-skeleton"

export default function ProdukPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola produk jadi dan harga jual
          </p>
        </div>
        <Link href="/master/produk/tambah">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProdukTableSkeleton />}>
            <ProdukTableServer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}