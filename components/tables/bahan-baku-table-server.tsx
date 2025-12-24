import { getBahanBaku } from "@/app/actions/bahan-baku"
import { BahanBakuTableClient } from "./bahan-baku-table-client"

export async function BahanBakuTableServer() {
  const result = await getBahanBaku()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12 text-red-600">
        {result.error || "Gagal memuat data"}
      </div>
    )
  }

  return <BahanBakuTableClient bahanBaku={result.data} />
}