import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BahanBakuForm } from "@/components/forms/bahan-baku-form"
import { getBahanBakuById } from "@/app/actions/bahan-baku"
import { prisma } from "@/lib/prisma"

interface EditBahanBakuPageProps {
  params: {
    id: string
  }
}

export default async function EditBahanBakuPage({ params }: EditBahanBakuPageProps) {
  const result = await getBahanBakuById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  // Get suppliers untuk dropdown
  const suppliers = await prisma.supplier.findMany({
    where: { status: "active" },
    select: {
      id: true,
      nama: true,
      kode: true,
    },
    orderBy: { nama: "asc" },
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={`/master/bahan-baku/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Bahan Baku
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update informasi bahan baku {result.data.nama}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informasi Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent>
          <BahanBakuForm bahanBaku={result.data} suppliers={suppliers} />
        </CardContent>
      </Card>
    </div>
  )
}