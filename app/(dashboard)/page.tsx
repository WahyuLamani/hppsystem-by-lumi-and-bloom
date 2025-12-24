import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/format"

export default async function DashboardPage() {
  // TODO: Fetch real data from database
  const stats = {
    totalProduk: 45,
    totalBahan: 120,
    penjualanHariIni: 5400000,
    stokMenipis: 8,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan sistem HPP Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Produk
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalProduk}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Produk aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bahan Baku
            </CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalBahan}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Item bahan baku
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Penjualan Hari Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.penjualanHariIni)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +12% dari kemarin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stok Menipis
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.stokMenipis}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Perlu restock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stok Menipis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Fitur ini akan menampilkan daftar bahan baku dan produk yang stoknya di bawah minimum.
            </p>
            <div className="mt-4 text-center text-gray-400 py-8">
              Belum ada data
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Riwayat transaksi terbaru akan muncul di sini.
            </p>
            <div className="mt-4 text-center text-gray-400 py-8">
              Belum ada transaksi
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}