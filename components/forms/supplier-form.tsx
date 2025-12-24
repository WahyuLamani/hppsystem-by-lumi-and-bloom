"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supplierSchema, type SupplierFormValues } from "@/lib/validations/supplier"
import { createSupplier, updateSupplier } from "@/app/actions/supplier"
import type { Supplier } from "@prisma/client"

interface SupplierFormProps {
  supplier?: Supplier
  defaultKode?: string
}

export function SupplierForm({ supplier, defaultKode }: SupplierFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!supplier

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      kode: supplier?.kode || defaultKode || "",
      nama: supplier?.nama || "",
      kontak: supplier?.kontak || "",
      alamat: supplier?.alamat || "",
      email: supplier?.email || "",
      status: (supplier?.status as "active" | "inactive") || "active",
    },
  })

  const status = watch("status")

  const onSubmit = async (data: SupplierFormValues) => {
    setIsSubmitting(true)

    try {
      const result = isEdit
        ? await updateSupplier(supplier.id, data)
        : await createSupplier(data)

      if (result.success) {
        toast.success(
          isEdit ? "Supplier berhasil diupdate" : "Supplier berhasil ditambahkan"
        )
        router.push("/master/supplier")
        router.refresh()
      } else {
        toast.error(result.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Kode Supplier */}
      <div className="space-y-2">
        <Label htmlFor="kode">
          Kode Supplier <span className="text-red-500">*</span>
        </Label>
        <Input
          id="kode"
          {...register("kode")}
          placeholder="SUP-001"
          disabled={isEdit}
          className={errors.kode ? "border-red-500" : ""}
        />
        {errors.kode && (
          <p className="text-sm text-red-500">{errors.kode.message}</p>
        )}
        {isEdit && (
          <p className="text-xs text-gray-500">
            Kode tidak dapat diubah setelah dibuat
          </p>
        )}
      </div>

      {/* Nama Supplier */}
      <div className="space-y-2">
        <Label htmlFor="nama">
          Nama Supplier <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nama"
          {...register("nama")}
          placeholder="Toko Bahan Kue Sejahtera"
          className={errors.nama ? "border-red-500" : ""}
        />
        {errors.nama && (
          <p className="text-sm text-red-500">{errors.nama.message}</p>
        )}
      </div>

      {/* Kontak */}
      <div className="space-y-2">
        <Label htmlFor="kontak">Kontak</Label>
        <Input
          id="kontak"
          {...register("kontak")}
          placeholder="081234567890"
          className={errors.kontak ? "border-red-500" : ""}
        />
        {errors.kontak && (
          <p className="text-sm text-red-500">{errors.kontak.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="supplier@example.com"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Alamat */}
      <div className="space-y-2">
        <Label htmlFor="alamat">Alamat</Label>
        <Textarea
          id="alamat"
          {...register("alamat")}
          placeholder="Jl. Contoh No. 123, Jakarta"
          rows={3}
          className={errors.alamat ? "border-red-500" : ""}
        />
        {errors.alamat && (
          <p className="text-sm text-red-500">{errors.alamat.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-red-500">*</span>
        </Label>
        <Select
          value={status}
          onValueChange={(value) => setValue("status", value as "active" | "inactive")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Supplier" : "Simpan Supplier"}
        </Button>
      </div>
    </form>
  )
}