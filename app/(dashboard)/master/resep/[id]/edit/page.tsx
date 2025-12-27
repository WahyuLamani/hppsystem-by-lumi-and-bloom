import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResepForm } from "@/components/forms/resep-form"
import { getResepById } from "@/app/actions/resep"
import { prisma } from "@/lib/prisma"
import { getProdukActive } from "@/app/actions/produk"
import { getBahanBakuActive } from "@/app/actions/bahan-baku"

interface EditResepPageProps {
  params: {
    id: string
  }
}

export default async function EditResepPage({ params }: EditResepPageProps) {
  const result = await getResepById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  // Get produk untuk dropdown
  const produk = await getProdukActive();

  // Get bahan baku untuk dropdown
  const bahanBaku = await getBahanBakuActive({stok: true})
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={`/master/resep/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Resep
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update resep {result.data.namaResep}
          </p>
        </div>
      </div>

      {/* Form */}
      <ResepForm
        resep={result.data}
        produk={produk}
        bahanBaku={bahanBaku}
      />
    </div>
  )
}