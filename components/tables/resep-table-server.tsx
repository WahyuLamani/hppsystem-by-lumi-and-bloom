import { getResep } from "@/app/actions/resep"
import { ResepTableClient } from "./resep-table-client"

export async function ResepTableServer() {
  const result = await getResep()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12 text-red-600">
        {result.error || "Gagal memuat data"}
      </div>
    )
  }

  return <ResepTableClient resep={result.data} />
}