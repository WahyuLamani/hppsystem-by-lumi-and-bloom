import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierForm } from "@/components/forms/supplier-form"
import { getSupplierById } from "@/app/actions/supplier"

interface EditSupplierPageProps {
  params: {
    id: string
  }
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  const result = await getSupplierById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={`/master/supplier/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Supplier
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update informasi supplier {result.data.nama}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierForm supplier={result.data} />
        </CardContent>
      </Card>
    </div>
  )
}