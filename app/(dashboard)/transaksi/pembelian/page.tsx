import { Suspense } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PembelianTableServer } from "@/components/tables/pembelian-table-server"
import { PembelianTableSkeleton } from "@/components/tables/pembelian-table-skeleton"

export default function PembelianPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pembelian</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola pembelian bahan baku dari supplier
          </p>
        </div>
        <Link href="/transaksi/pembelian/tambah">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Pembelian
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembelian</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PembelianTableSkeleton />}>
            <PembelianTableServer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}