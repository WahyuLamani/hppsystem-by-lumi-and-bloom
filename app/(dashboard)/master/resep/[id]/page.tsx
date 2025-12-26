import { ArrowLeft, Pencil, Calculator, Package } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getResepById } from "@/app/actions/resep"
import { formatCurrency, formatNumber } from "@/lib/format"

interface ResepDetailPageProps {
  params: {
    id: string
  }
}

export default async function ResepDetailPage({ params }: ResepDetailPageProps) {
  const result = await getResepById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const resep = result.data

  // Calculate total biaya & HPP
  let totalBiaya = 0
  const detailsWithPrice = resep.resepDetail.map((detail) => {
    const qty = Number(detail.qty)
    const hargaBeli = Number(detail.bahanBaku.hargaBeli)
    const subtotal = qty * hargaBeli
    totalBiaya += subtotal

    return {
      ...detail,
      subtotal,
    }
  })

  const hpp = Number(resep.porsiHasil) > 0 ? totalBiaya / Number(resep.porsiHasil) : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/master/resep">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {resep.namaResep}
              </h1>
              <Badge variant={resep.isActive ? "default" : "secondary"}>
                {resep.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Produk: {resep.produk.nama}
            </p>
          </div>
        </div>
        <Link href={`/master/resep/${resep.id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Resep */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Resep</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Produk</p>
                <Link
                  href={`/master/produk/${resep.produk.id}`}
                  className="text-base text-blue-600 hover:underline"
                >
                  {resep.produk.nama}
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Porsi Hasil</p>
                <p className="text-base text-gray-900">
                  {formatNumber(Number(resep.porsiHasil), 2)} {resep.satuanHasil}
                </p>
              </div>
            </div>

            {resep.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Catatan</p>
                  <p className="text-base text-gray-900 mt-1">{resep.catatan}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* HPP Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calculator className="h-5 w-5" />
              Kalkulasi HPP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Biaya:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalBiaya)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">HPP per Unit:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(hpp)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bahan-bahan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bahan-bahan ({resep.resepDetail.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {detailsWithPrice.map((detail) => (
              <div
                key={detail.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {detail.bahanBaku.nama}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>
                      {formatNumber(Number(detail.qty), 3)} {detail.satuan}
                    </span>
                    <span>•</span>
                    <span>
                      @ {formatCurrency(Number(detail.bahanBaku.hargaBeli))}/{detail.satuan}
                    </span>
                    {detail.catatan && (
                      <>
                        <span>•</span>
                        <span className="italic">{detail.catatan}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(detail.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total Biaya Bahan</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBiaya)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      {resep.isActive && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900">
            ✓ Resep ini sedang aktif dan digunakan untuk menghitung HPP produk{" "}
            <span className="font-semibold">{resep.produk.nama}</span>
          </p>
        </div>
      )}
    </div>
  )
}