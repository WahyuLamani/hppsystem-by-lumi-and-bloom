import { ArrowLeft, Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProdukById } from "@/app/actions/produk"
import { getResepByProdukId } from "@/app/actions/resep"
import { formatCurrency, formatNumber } from "@/lib/format"

interface ProdukResepPageProps {
  params: {
    id: string
  }
}

export default async function ProdukResepPage({ params }: ProdukResepPageProps) {
  const [produkResult, resepResult] = await Promise.all([
    getProdukById(params.id),
    getResepByProdukId(params.id),
  ])

  if (!produkResult.success || !produkResult.data) {
    notFound()
  }

  const produk = produkResult.data
  const resepList = resepResult.success ? resepResult.data : []

  // Calculate HPP for each resep
  const resepWithHPP = resepList?.map((resep) => {
    let totalBiaya = 0
    resep.resepDetail.forEach((detail) => {
      totalBiaya += Number(detail.qty) * Number(detail.bahanBaku.hargaBeli)
    })
    const hpp = Number(resep.porsiHasil) > 0 ? totalBiaya / Number(resep.porsiHasil) : 0
    return { ...resep, totalBiaya, hpp }
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/master/produk/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Kelola Resep
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Resep untuk produk: {produk.nama}
            </p>
          </div>
        </div>
        <Link href={`/master/resep/tambah?produkId=${params.id}`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Resep Baru
          </Button>
        </Link>
      </div>

      {/* Info Produk */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">HPP Saat Ini</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(Number(produk.hpp))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Harga Jual</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Number(produk.hargaJual))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Margin</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(produk.marginRupiah))}
              </p>
              <p className="text-sm text-gray-500 text-right">
                ({formatNumber(Number(produk.marginPersen), 2)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daftar Resep */}
      {resepWithHPP && resepWithHPP.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resepWithHPP.map((resep) => (
            <Card key={resep.id} className={resep.isActive ? "border-blue-500 border-2" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {resep.namaResep}
                      {resep.isActive && (
                        <Badge variant="default">Aktif</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Menghasilkan {formatNumber(Number(resep.porsiHasil), 2)} {resep.satuanHasil}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* HPP Info */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Biaya:</span>
                    <span className="font-semibold">{formatCurrency(resep.totalBiaya)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">HPP per Unit:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(resep.hpp)}
                    </span>
                  </div>
                </div>

                {/* Bahan Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{resep.resepDetail.length} bahan digunakan</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/master/resep/${resep.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Detail
                    </Button>
                  </Link>
                  <Link href={`/master/resep/${resep.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Resep
              </h3>
              <p className="text-gray-500 mb-4">
                Buat resep untuk menghitung HPP produk ini
              </p>
              <Link href={`/master/resep/tambah?produkId=${params.id}`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Resep Pertama
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      {resepWithHPP && resepWithHPP.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            💡 <strong>Tips:</strong> Hanya satu resep yang bisa aktif sekaligus. Resep aktif akan digunakan untuk menghitung HPP produk.
          </p>
        </div>
      )}
    </div>
  )
}