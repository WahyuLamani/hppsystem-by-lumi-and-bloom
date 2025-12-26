import { Suspense } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResepTableServer } from "@/components/tables/resep-table-server"
import { ResepTableSkeleton } from "@/components/tables/resep-table-skeleton"

export default function ResepPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resep</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola resep produksi dan kalkulasi HPP
          </p>
        </div>
        <Link href="/master/resep/tambah">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Resep
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Resep</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ResepTableSkeleton />}>
            <ResepTableServer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}