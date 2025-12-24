import { ArrowLeft, Pencil, Trash2, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getSupplierById } from "@/app/actions/supplier"
import { formatDate, formatCurrency } from "@/lib/format"

interface SupplierDetailPageProps {
  params: {
    id: string
  }
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const result = await getSupplierById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const supplier = result.data

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/master/supplier">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {supplier.nama}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kode: {supplier.kode}
            </p>
          </div>
          <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
            {supplier.status === "active" ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/master/supplier/${supplier.id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Supplier */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.kontak && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Kontak</p>
                  <p className="text-base text-gray-900">{supplier.kontak}</p>
                </div>
              </div>
            )}

            {supplier.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{supplier.email}</p>
                </div>
              </div>
            )}

            {supplier.alamat && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Alamat</p>
                  <p className="text-base text-gray-900">{supplier.alamat}</p>
                </div>
              </div>
            )}

            {!supplier.kontak && !supplier.email && !supplier.alamat && (
              <p className="text-sm text-gray-500 text-center py-4">
                Tidak ada informasi kontak
              </p>
            )}
          </CardContent>
        </Card>

        {/* Statistik */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bahan Baku</p>
              <p className="text-2xl font-bold text-gray-900">
                {supplier.bahanBaku?.length || 0}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pembelian</p>
              <p className="text-2xl font-bold text-gray-900">
                {supplier.pembelian?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bahan Baku dari Supplier */}
      {supplier.bahanBaku && supplier.bahanBaku.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bahan Baku</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {supplier.bahanBaku.map((bahan) => (
                <div
                  key={bahan.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="font-medium">{bahan.nama}</span>
                  <span className="text-sm text-gray-500">
                    Stok: {bahan.stok.toString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Riwayat Pembelian */}
      {supplier.pembelian && supplier.pembelian.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembelian Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {supplier.pembelian.map((pembelian) => (
                <div
                  key={pembelian.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{pembelian.nomorPo}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(pembelian.tanggal)}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(pembelian.total.toString())}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}