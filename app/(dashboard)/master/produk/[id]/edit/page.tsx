import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProdukForm } from "@/components/forms/produk-form"
import { getProdukById } from "@/app/actions/produk"

interface EditProdukPageProps {
  params: {
    id: string
  }
}

export default async function EditProdukPage({ params }: EditProdukPageProps) {
  const result = await getProdukById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={`/master/produk/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Produk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update informasi produk {result.data.nama}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <ProdukForm produk={result.data} />
        </CardContent>
      </Card>
    </div>
  )
}