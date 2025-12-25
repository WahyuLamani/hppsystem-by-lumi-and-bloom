import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProdukForm } from "@/components/forms/produk-form"
import { generateProdukCode } from "@/app/actions/produk"

export default async function TambahProdukPage() {
  const kodeProduk = await generateProdukCode()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/master/produk">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Produk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan produk jadi yang akan dijual
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <ProdukForm defaultKode={kodeProduk} />
        </CardContent>
      </Card>
    </div>
  )
}