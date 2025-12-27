import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BahanBakuForm } from "@/components/forms/bahan-baku-form"
import { generateBahanBakuCode } from "@/app/actions/bahan-baku"
import { getSupplierActive } from "@/app/actions/supplier"

export default async function TambahBahanBakuPage() {
  // Generate kode bahan baku otomatis
  const kodeBahanBaku = await generateBahanBakuCode()

  // Get suppliers untuk dropdown
  const suppliers = await getSupplierActive();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/master/bahan-baku">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Bahan Baku
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan bahan baku baru untuk produksi
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informasi Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent>
          <BahanBakuForm defaultKode={kodeBahanBaku} suppliers={suppliers} />
        </CardContent>
      </Card>
    </div>
  )
}