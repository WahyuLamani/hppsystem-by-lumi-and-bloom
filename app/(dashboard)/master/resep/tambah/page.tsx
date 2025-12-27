import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ResepForm } from "@/components/forms/resep-form"
import { prisma } from "@/lib/prisma"
import { getProdukActive } from "@/app/actions/produk"
import { getBahanBakuActive } from "@/app/actions/bahan-baku"

interface TambahResepPageProps {
  searchParams: {
    produkId?: string
  }
}

export default async function TambahResepPage({ searchParams }: TambahResepPageProps) {
  // Get produk untuk dropdown
  const produk = await getProdukActive();

  // Get bahan baku untuk dropdown
  const bahanBaku = await getBahanBakuActive({stok: true})

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/master/resep">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Resep
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Buat resep baru untuk menghitung HPP produk
          </p>
        </div>
      </div>

      {/* Form */}
      <ResepForm
        produk={produk}
        bahanBaku={bahanBaku}
        defaultProdukId={searchParams.produkId}
      />
    </div>
  )
}