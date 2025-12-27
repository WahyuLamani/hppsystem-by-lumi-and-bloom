import { getProduksi } from "@/app/actions/produksi"
import { ProduksiTableClient } from "./produksi-table-client"

export async function ProduksiTableServer() {
  const result = await getProduksi()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12 text-red-600">
        {result.error || "Gagal memuat data"}
      </div>
    )
  }

  return <ProduksiTableClient produksi={result.data} />
}