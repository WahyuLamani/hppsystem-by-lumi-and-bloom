import { getPembelian } from "@/app/actions/pembelian"
import { PembelianTableClient } from "./pembelian-table-client"

export async function PembelianTableServer() {
  const result = await getPembelian()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12 text-red-600">
        {result.error || "Gagal memuat data"}
      </div>
    )
  }

  return <PembelianTableClient pembelian={result.data} />
}