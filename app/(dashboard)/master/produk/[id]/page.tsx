import { ArrowLeft, Pencil, BookOpen, Package, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getProdukById } from "@/app/actions/produk"
import { formatCurrency, formatNumber, formatPercentage, formatDate } from "@/lib/format"

interface ProdukDetailPageProps {
  params: {
    id: string
  }
}

export default async function ProdukDetailPage({ params }: ProdukDetailPageProps) {
  const result = await getProdukById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const produk = result.data
  const isStokMenipis = Number(produk.stok) <= Number(produk.stokMinimum)
  const hasResep = produk.resep && produk.resep.length > 0
  const activeResep = produk.resep?.find((r) => r.isActive)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/master/produk">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {produk.nama}
              </h1>
              {isStokMenipis && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Stok Menipis
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Kode: {produk.kode} • {produk.kategori}
            </p>
          </div>
          <Badge variant={produk.status === "active" ? "default" : "secondary"}>
            {produk.status === "active" ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/master/produk/${produk.id}/resep`}>
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Kelola Resep
            </Button>
          </Link>
          <Link href={`/master/produk/${produk.id}/edit`}>
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
            <CardTitle>Informasi Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {produk.deskripsi && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Deskripsi</p>
                  <p className="text-base text-gray-900 mt-1">{produk.deskripsi}</p>
                </div>
                <Separator />
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Kategori</p>
                <p className="text-base text-gray-900">{produk.kategori}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stok Minimum</p>
                <p className="text-base text-gray-900">
                  {formatNumber(Number(produk.stokMinimum), 2)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Pre-Order</p>
                <Badge variant={produk.dapatPreOrder ? "default" : "secondary"}>
                  {produk.dapatPreOrder ? "Ya" : "Tidak"}
                </Badge>
              </div>
              {produk.waktuProduksiHari && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Waktu Produksi</p>
                  <p className="text-base text-gray-900">
                    {produk.waktuProduksiHari} hari
                  </p>
                </div>
              )}
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
                {formatNumber(Number(produk.stok), 2)}
              </p>
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
                        Segera lakukan produksi
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* HPP & Harga */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">HPP (Harga Pokok Produksi)</CardTitle>
          </CardHeader>
          <CardContent>
            {hasResep ? (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(produk.hpp))}
                </p>
                <p className="text-xs text-gray-500 mt-1">per unit</p>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-yellow-600">Belum ada resep</p>
                <Link href={`/master/produk/${produk.id}/resep`}>
                  <Button size="sm" variant="outline" className="mt-2">
                    Buat Resep
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Harga Jual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(Number(produk.hargaJual))}
            </p>
            <p className="text-xs text-gray-500 mt-1">per unit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Margin Keuntungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasResep ? (
              <>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(produk.marginRupiah))}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatPercentage(Number(produk.marginPersen))}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Menunggu resep</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resep Aktif */}
      {activeResep && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resep Aktif: {activeResep.namaResep}</CardTitle>
              <Link href={`/master/produk/${produk.id}/resep`}>
                <Button size="sm" variant="outline">
                  Lihat Detail
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Menghasilkan {formatNumber(Number(activeResep.porsiHasil), 2)} {activeResep.satuanHasil}
            </p>
            {activeResep.resepDetail && activeResep.resepDetail.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Bahan yang digunakan:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeResep.resepDetail.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-center justify-between p-2 rounded border text-sm"
                    >
                      <span>{detail.bahanBaku.nama}</span>
                      <span className="text-gray-600">
                        {formatNumber(Number(detail.qty), 3)} {detail.satuan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Riwayat Penjualan */}
      {produk.penjualanDetail && produk.penjualanDetail.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Penjualan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {produk.penjualanDetail.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{detail.penjualan.nomorInvoice}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(detail.penjualan.tanggal)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatNumber(Number(detail.qty), 2)} unit
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