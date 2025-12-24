import { Suspense } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BahanBakuTableServer } from "@/components/tables/bahan-baku-table-server"
import { BahanBakuTableSkeleton } from "@/components/tables/bahan-baku-table-skeleton"

export default function BahanBakuPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bahan Baku</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data bahan baku untuk produksi
          </p>
        </div>
        <Link href="/master/bahan-baku/tambah">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan Baku
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<BahanBakuTableSkeleton />}>
            <BahanBakuTableServer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}