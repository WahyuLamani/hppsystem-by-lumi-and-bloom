import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PembelianForm } from "@/components/forms/pembelian-form"
import { generatePembelianCode } from "@/app/actions/pembelian"
import { getBahanBakuActive } from "@/app/actions/bahan-baku"
import { getSupplierActive } from "@/app/actions/supplier"

export default async function TambahPembelianPage() {
  const nomorPo = await generatePembelianCode()

  // Get suppliers
  const suppliers = await getSupplierActive();

  // Get bahan baku
  const bahanBaku = await getBahanBakuActive()

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