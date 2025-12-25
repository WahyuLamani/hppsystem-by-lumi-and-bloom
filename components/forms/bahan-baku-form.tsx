"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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
import {
  bahanBakuSchema,
  type BahanBakuFormValues,
  kategoriBahanBaku,
  satuanBahanBaku,
} from "@/lib/validations/bahan-baku"
import { createBahanBaku, updateBahanBaku } from "@/app/actions/bahan-baku"
import { formatNumber } from "@/lib/format"
import type { BahanBaku, Supplier } from "@prisma/client"

interface BahanBakuFormProps {
  bahanBaku?: BahanBaku
  defaultKode?: string
  suppliers: Pick<Supplier, "id" | "nama" | "kode">[]
}

export function BahanBakuForm({ bahanBaku, defaultKode, suppliers }: BahanBakuFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!bahanBaku

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BahanBakuFormValues>({
    resolver: zodResolver(bahanBakuSchema) as any,
    defaultValues: {
      kode: bahanBaku?.kode || defaultKode || "",
      nama: bahanBaku?.nama || "",
      kategori: bahanBaku?.kategori || "",
      satuan: bahanBaku?.satuan || "",
      hargaBeli: bahanBaku ? Number(bahanBaku.hargaBeli) : 0,
      stok: bahanBaku ? Number(bahanBaku.stok) : 0,
      stokMinimum: bahanBaku ? Number(bahanBaku.stokMinimum) : 0,
      supplierId: bahanBaku?.supplierId || "",
      status: (bahanBaku?.status as "active" | "inactive") || "active",
    },
  })

  const kategori = watch("kategori")
  const satuan = watch("satuan")
  const status = watch("status")
  const supplierId = watch("supplierId")

  const onSubmit = async (data: BahanBakuFormValues) => {
    setIsSubmitting(true)

    try {
      const result = isEdit
        ? await updateBahanBaku(bahanBaku.id, data)
        : await createBahanBaku(data)

      if (result.success) {
        toast.success(
          isEdit ? "Bahan baku berhasil diupdate" : "Bahan baku berhasil ditambahkan"
        )
        router.push("/master/bahan-baku")
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
            Kode Bahan Baku <span className="text-red-500">*</span>
          </Label>
          <Input
            id="kode"
            {...register("kode")}
            placeholder="BHN-001"
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
            Nama Bahan Baku <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nama"
            {...register("nama")}
            placeholder="Tepung Terigu"
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
              {kategoriBahanBaku.map((kat) => (
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

        {/* Satuan */}
        <div className="space-y-2">
          <Label htmlFor="satuan">
            Satuan <span className="text-red-500">*</span>
          </Label>
          <Select value={satuan} onValueChange={(value) => setValue("satuan", value)}>
            <SelectTrigger className={errors.satuan ? "border-red-500" : ""}>
              <SelectValue placeholder="Pilih satuan" />
            </SelectTrigger>
            <SelectContent>
              {satuanBahanBaku.map((sat) => (
                <SelectItem key={sat} value={sat}>
                  {sat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.satuan && (
            <p className="text-sm text-red-500">{errors.satuan.message}</p>
          )}
        </div>

        {/* Harga Beli */}
        <div className="space-y-2">
          <Label htmlFor="hargaBeli">
            Harga Beli <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hargaBeli"
            type="number"
            step="0.01"
            {...register("hargaBeli")}
            placeholder="0"
            className={errors.hargaBeli ? "border-red-500" : ""}
          />
          {errors.hargaBeli && (
            <p className="text-sm text-red-500">{errors.hargaBeli.message}</p>
          )}
        </div>

        {/* Stok */}
        <div className="space-y-2">
          <Label htmlFor="stok">
            Stok Awal <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stok"
            type="number"
            step="0.001"
            {...register("stok")}
            placeholder="0"
            className={errors.stok ? "border-red-500" : ""}
          />
          {errors.stok && (
            <p className="text-sm text-red-500">{errors.stok.message}</p>
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
          <p className="text-xs text-gray-500">
            Alert akan muncul jika stok mencapai nilai ini
          </p>
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplierId">Supplier</Label>
          <Select
            value={supplierId || "none"}
            onValueChange={(value) => setValue("supplierId", value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih supplier (opsional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Tidak ada</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {suppliers.length === 0 && (
            <p className="text-xs text-gray-500">
              Belum ada supplier.{" "}
              <a href="/master/supplier/tambah" className="text-blue-600 hover:underline">
                Tambah supplier
              </a>
            </p>
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
          {isEdit ? "Update Bahan Baku" : "Simpan Bahan Baku"}
        </Button>
      </div>
    </form>
  )
}