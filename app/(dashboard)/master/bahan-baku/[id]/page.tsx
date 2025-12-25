import { ArrowLeft, Pencil, Trash2, Package, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getBahanBakuById } from "@/app/actions/bahan-baku"
import { formatCurrency, formatNumber, formatDate } from "@/lib/format"

interface BahanBakuDetailPageProps {
  params: {
    id: string
  }
}

export default async function BahanBakuDetailPage({ params }: BahanBakuDetailPageProps) {
  const result = await getBahanBakuById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const bahanBaku = result.data
  const isStokMenipis = Number(bahanBaku.stok) <= Number(bahanBaku.stokMinimum)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/master/bahan-baku">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {bahanBaku.nama}
              </h1>
              {isStokMenipis && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Stok Menipis
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Kode: {bahanBaku.kode} • {bahanBaku.kategori}
            </p>
          </div>
          <Badge variant={bahanBaku.status === "active" ? "default" : "secondary"}>
            {bahanBaku.status === "active" ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/master/bahan-baku/${bahanBaku.id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Utama */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Bahan Baku</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Kategori</p>
                <p className="text-base text-gray-900">{bahanBaku.kategori}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Satuan</p>
                <p className="text-base text-gray-900">{bahanBaku.satuan}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Harga Beli</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(Number(bahanBaku.hargaBeli))}
                </p>
                <p className="text-xs text-gray-500">per {bahanBaku.satuan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier</p>
                <p className="text-base text-gray-900">
                  {bahanBaku.supplier?.nama || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stok */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stok
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Stok Saat Ini</p>
              <p className={`text-3xl font-bold ${isStokMenipis ? "text-red-600" : "text-gray-900"}`}>
                {formatNumber(Number(bahanBaku.stok), 2)}
              </p>
              <p className="text-sm text-gray-500">{bahanBaku.satuan}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500">Stok Minimum</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatNumber(Number(bahanBaku.stokMinimum), 2)}
              </p>
              <p className="text-sm text-gray-500">{bahanBaku.satuan}</p>
            </div>

            {isStokMenipis && (
              <>
                <Separator />
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Stok Menipis
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Segera lakukan pembelian bahan baku
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Digunakan di Resep */}
      {bahanBaku.resepDetail && bahanBaku.resepDetail.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Digunakan di Resep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bahanBaku.resepDetail.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{detail.resep.produk.nama}</p>
                    <p className="text-sm text-gray-500">
                      {detail.resep.namaResep}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatNumber(Number(detail.qty), 3)} {detail.satuan}
                    </p>
                    <p className="text-xs text-gray-500">per batch</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Riwayat Pembelian */}
      {bahanBaku.pembelianDetail && bahanBaku.pembelianDetail.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembelian Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bahanBaku.pembelianDetail.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{detail.pembelian.nomorPo}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(detail.pembelian.tanggal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatNumber(Number(detail.qty), 2)} {detail.satuan}
                    </p>
                    <p className="text-sm text-gray-600">
                      @ {formatCurrency(Number(detail.hargaSatuan))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}