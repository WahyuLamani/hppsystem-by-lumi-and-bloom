import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ResepForm } from "@/components/forms/resep-form"
import { prisma } from "@/lib/prisma"

interface TambahResepPageProps {
  searchParams: {
    produkId?: string
  }
}

export default async function TambahResepPage({ searchParams }: TambahResepPageProps) {
  // Get produk untuk dropdown
  const produk = await prisma.produk.findMany({
    where: { status: "active" },
    select: {
      id: true,
      nama: true,
      kode: true,
    },
    orderBy: { nama: "asc" },
  })

  // Get bahan baku untuk dropdown
  const bahanBaku = await prisma.bahanBaku.findMany({
    where: { status: "active" },
    select: {
      id: true,
      nama: true,
      satuan: true,
      hargaBeli: true,
      stok: true,
    },
    orderBy: { nama: "asc" },
  })

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