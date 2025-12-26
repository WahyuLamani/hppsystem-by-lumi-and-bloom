import { ArrowLeft, Package, Check } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ReceiveButton } from "@/components/buttons/receive-button"
import { getPembelianById } from "@/app/actions/pembelian"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"

interface PembelianDetailPageProps {
  params: {
    id: string
  }
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  submitted: { label: "Diajukan", variant: "default" as const },
  received: { label: "Diterima", variant: "default" as const },
  cancelled: { label: "Dibatalkan", variant: "destructive" as const },
}

export default async function PembelianDetailPage({ params }: PembelianDetailPageProps) {
  const result = await getPembelianById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const pembelian = result.data
  const config = statusConfig[pembelian.status]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/transaksi/pembelian">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {pembelian.nomorPo}
              </h1>
              <Badge variant={config.variant}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(pembelian.tanggal, "dd MMMM yyyy")}
            </p>
          </div>
        </div>
        {pembelian.status !== "received" && pembelian.status !== "cancelled" && (
          <ReceiveButton pembelianId={pembelian.id} nomorPo={pembelian.nomorPo} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Pembelian */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Pembelian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Supplier</p>
                <Link
                  href={`/master/supplier/${pembelian.supplier.id}`}
                  className="text-base text-blue-600 hover:underline"
                >
                  {pembelian.supplier.nama}
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tanggal</p>
                <p className="text-base text-gray-900">
                  {formatDate(pembelian.tanggal, "dd MMMM yyyy")}
                </p>
              </div>
            </div>

            {pembelian.tanggalTerima && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Terima</p>
                  <p className="text-base text-gray-900">
                    {formatDate(pembelian.tanggalTerima, "dd MMMM yyyy")}
                  </p>
                </div>
              </>
            )}

            {pembelian.catatan && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Catatan</p>
                  <p className="text-base text-gray-900 mt-1">{pembelian.catatan}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(Number(pembelian.subtotal))}</span>
            </div>
            {Number(pembelian.diskon) > 0 && (
              <div className="flex justify-between text-red-600">
                <span className="text-sm">Diskon:</span>
                <span>-{formatCurrency(Number(pembelian.diskon))}</span>
              </div>
            )}
            {Number(pembelian.pajak) > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Pajak:</span>
                <span>{formatCurrency(Number(pembelian.pajak))}</span>
              </div>
            )}
            {Number(pembelian.ongkir) > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Ongkir:</span>
                <span>{formatCurrency(Number(pembelian.ongkir))}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(Number(pembelian.total))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detail Pembelian ({pembelian.detail.length} item)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pembelian.detail.map((detail) => (
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
                      @ {formatCurrency(Number(detail.hargaSatuan))}/{detail.satuan}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(Number(detail.subtotal))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Subtotal</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(Number(pembelian.subtotal))}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Status Info */}
      {pembelian.status === "received" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Pembelian Diterima
              </p>
              <p className="text-xs text-green-700 mt-1">
                Stok bahan baku dan harga beli sudah diupdate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}