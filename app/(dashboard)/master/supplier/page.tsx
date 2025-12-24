import { Suspense } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierTableServer } from "@/components/tables/supplier-table-server"
import { SupplierTableSkeleton } from "@/components/tables/supplier-table-skeleton"

export default function SupplierPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Supplier</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data supplier bahan baku
          </p>
        </div>
        <Link href="/master/supplier/tambah">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Supplier
          </Button>
        </Link>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SupplierTableSkeleton />}>
            <SupplierTableServer />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}