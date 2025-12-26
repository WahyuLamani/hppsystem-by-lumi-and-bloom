import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PembelianForm } from "@/components/forms/pembelian-form"
import { generatePembelianCode } from "@/app/actions/pembelian"
import { prisma } from "@/lib/prisma"
import { unstable_noStore as noStore } from "next/cache"

export default async function TambahPembelianPage() {
  noStore();
  const nomorPo = await generatePembelianCode()

  // Get suppliers
  const suppliers = await prisma.supplier.findMany({
    where: { status: "active" },
    select: {
      id: true,
      nama: true,
      kode: true,
    },
    orderBy: { nama: "asc" },
  })

  // Get bahan baku
  const bahanBaku = await prisma.bahanBaku.findMany({
    where: { status: "active" },
    select: {
      id: true,
      nama: true,
      satuan: true,
      hargaBeli: true,
    },
    orderBy: { nama: "asc" },
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/transaksi/pembelian">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Buat Pembelian
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Buat pembelian bahan baku dari supplier
          </p>
        </div>
      </div>

      {/* Form */}
      <PembelianForm
        defaultNomorPo={nomorPo}
        suppliers={suppliers}
        bahanBaku={bahanBaku}
      />
    </div>
  )
}