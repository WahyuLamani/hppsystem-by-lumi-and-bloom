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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  produkSchema,
  type ProdukFormValues,
  kategoriProduk,
} from "@/lib/validations/produk"
import { createProduk, updateProduk } from "@/app/actions/produk"
import type { Produk } from "@prisma/client"

interface ProdukFormProps {
  produk?: Produk
  defaultKode?: string
}

export function ProdukForm({ produk, defaultKode }: ProdukFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!produk

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProdukFormValues>({
    resolver: zodResolver(produkSchema) as any,
    defaultValues: {
      kode: produk?.kode || defaultKode || "",
      nama: produk?.nama || "",
      kategori: produk?.kategori || "",
      deskripsi: produk?.deskripsi || "",
      hargaJual: produk ? Number(produk.hargaJual) : 0,
      stokMinimum: produk ? Number(produk.stokMinimum) : 0,
      dapatPreOrder: produk ? produk.dapatPreOrder : true,
      waktuProduksiHari: produk?.waktuProduksiHari || null,
      status: (produk?.status as "active" | "inactive") || "active",
      gambarUrl: produk?.gambarUrl || "",
    },
  })

  const kategori = watch("kategori")
  const status = watch("status")
  const dapatPreOrder = watch("dapatPreOrder")

  const onSubmit = async (data: ProdukFormValues) => {
    setIsSubmitting(true)

    try {
      const result = isEdit
        ? await updateProduk(produk.id, data)
        : await createProduk(data)

      if (result.success) {
        toast.success(
          isEdit ? "Produk berhasil diupdate" : "Produk berhasil ditambahkan"
        )
        router.push("/master/produk")
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kode */}
        <div className="space-y-2">
          <Label htmlFor="kode">
            Kode Produk <span className="text-red-500">*</span>
          </Label>
          <Input
            id="kode"
            {...register("kode")}
            placeholder="PRD-001"
            disabled={isEdit}
            className={errors.kode ? "border-red-500" : ""}
          />
          {errors.kode && (
            <p className="text-sm text-red-500">{errors.kode.message}</p>
          )}
        </div>

        {/* Nama */}
        <div className="space-y-2">
          <Label htmlFor="nama">
            Nama Produk <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nama"
            {...register("nama")}
            placeholder="Brownies Coklat"
            className={errors.nama ? "border-red-500" : ""}
          />
          {errors.nama && (
            <p className="text-sm text-red-500">{errors.nama.message}</p>
          )}
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <Label htmlFor="kategori">
            Kategori <span className="text-red-500">*</span>
          </Label>
          <Select value={kategori} onValueChange={(value) => setValue("kategori", value)}>
            <SelectTrigger className={errors.kategori ? "border-red-500" : ""}>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {kategoriProduk.map((kat) => (
                <SelectItem key={kat} value={kat}>
                  {kat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.kategori && (
            <p className="text-sm text-red-500">{errors.kategori.message}</p>
          )}
        </div>

        {/* Harga Jual */}
        <div className="space-y-2">
          <Label htmlFor="hargaJual">
            Harga Jual <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hargaJual"
            type="number"
            step="0.01"
            {...register("hargaJual")}
            placeholder="0"
            className={errors.hargaJual ? "border-red-500" : ""}
          />
          {errors.hargaJual && (
            <p className="text-sm text-red-500">{errors.hargaJual.message}</p>
          )}
          {isEdit && produk && (
            <p className="text-xs text-gray-500">
              HPP saat ini: Rp {Number(produk.hpp).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Stok Minimum */}
        <div className="space-y-2">
          <Label htmlFor="stokMinimum">
            Stok Minimum <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stokMinimum"
            type="number"
            step="0.001"
            {...register("stokMinimum")}
            placeholder="0"
            className={errors.stokMinimum ? "border-red-500" : ""}
          />
          {errors.stokMinimum && (
            <p className="text-sm text-red-500">{errors.stokMinimum.message}</p>
          )}
        </div>

        {/* Waktu Produksi */}
        <div className="space-y-2">
          <Label htmlFor="waktuProduksiHari">Waktu Produksi (Hari)</Label>
          <Input
            id="waktuProduksiHari"
            type="number"
            {...register("waktuProduksiHari")}
            placeholder="0"
            className={errors.waktuProduksiHari ? "border-red-500" : ""}
          />
          {errors.waktuProduksiHari && (
            <p className="text-sm text-red-500">{errors.waktuProduksiHari.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Lead time untuk pre-order (opsional)
          </p>
        </div>
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          {...register("deskripsi")}
          placeholder="Deskripsi produk..."
          rows={3}
          className={errors.deskripsi ? "border-red-500" : ""}
        />
        {errors.deskripsi && (
          <p className="text-sm text-red-500">{errors.deskripsi.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dapat Pre-Order */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dapatPreOrder"
              checked={dapatPreOrder}
              onCheckedChange={(checked) => setValue("dapatPreOrder", !!checked)}
            />
            <Label htmlFor="dapatPreOrder" className="cursor-pointer">
              Dapat di Pre-Order
            </Label>
          </div>
          <p className="text-xs text-gray-500">
            Produk bisa dipesan sebelum diproduksi
          </p>
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
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
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
          {isEdit ? "Update Produk" : "Simpan Produk"}
        </Button>
      </div>

      {!isEdit && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Tips:</strong> Setelah produk dibuat, jangan lupa buat resep untuk menghitung HPP otomatis!
          </p>
        </div>
      )}
    </form>
  )
}