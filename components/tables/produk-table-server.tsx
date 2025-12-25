import { getProduk } from "@/app/actions/produk"
import { ProdukTableClient } from "@/components/tables/produk-table-client"

export async function ProdukTableServer() {
  const result = await getProduk()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12 text-red-600">
        {result.error || "Gagal memuat data"}
      </div>
    )
  }

  return <ProdukTableClient produk={result.data} />
}