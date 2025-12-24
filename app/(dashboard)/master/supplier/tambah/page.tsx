import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierForm } from "@/components/forms/supplier-form"
import { generateSupplierCode } from "@/app/actions/supplier"

export default async function TambahSupplierPage() {
  // Generate kode supplier otomatis
  const kodeSupplier = await generateSupplierCode()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/master/supplier">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Supplier
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan supplier bahan baku baru
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierForm defaultKode={kodeSupplier} />
        </CardContent>
      </Card>
    </div>
  )
}