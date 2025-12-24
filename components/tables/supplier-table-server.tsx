import { getSuppliers } from "@/app/actions/supplier"
import { SupplierTableClient } from "@/components/tables/supplier-table-client"

export async function SupplierTableServer() {
  const result = await getSuppliers()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12 text-red-600">
        {result.error || "Gagal memuat data"}
      </div>
    )
  }

  return <SupplierTableClient suppliers={result.data} />
}