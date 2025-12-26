"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Loader2, Plus, Trash2, Calculator } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  resepWithDetailsSchema,
  type ResepWithDetailsFormValues,
} from "@/lib/validations/resep"
import { createResep, updateResep } from "@/app/actions/resep"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { Resep, ResepDetail, BahanBaku, Produk } from "@prisma/client"

type ResepWithDetails = Resep & {
  resepDetail: (ResepDetail & {
    bahanBaku: BahanBaku
  })[]
}

interface ResepFormProps {
  resep?: ResepWithDetails
  produk: Pick<Produk, "id" | "nama" | "kode">[]
  bahanBaku: Pick<BahanBaku, "id" | "nama" | "satuan" | "hargaBeli" | "stok">[]
  defaultProdukId?: string
}

export function ResepForm({ resep, produk, bahanBaku, defaultProdukId }: ResepFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!resep

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<ResepWithDetailsFormValues>({
    resolver: zodResolver(resepWithDetailsSchema) as any,
    defaultValues: {
      produkId: resep?.produkId || defaultProdukId || "",
      namaResep: resep?.namaResep || "",
      porsiHasil: resep ? Number(resep.porsiHasil) : 1,
      satuanHasil: resep?.satuanHasil || "",
      catatan: resep?.catatan || "",
      isActive: resep?.isActive ?? true,
      details: resep?.resepDetail.map((d) => ({
        bahanBakuId: d.bahanBakuId,
        qty: Number(d.qty),
        satuan: d.satuan,
        catatan: d.catatan || "",
      })) || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  })

  const produkId = watch("produkId")
  const porsiHasil = watch("porsiHasil")
  const isActive = watch("isActive")
  const details = watch("details")

  // Calculate total biaya & HPP
  const calculations = useMemo(() => {
    let totalBiaya = 0
    const detailsWithPrice = details.map((detail) => {
      const bahan = bahanBaku.find((b) => b.id === detail.bahanBakuId)
      const qty = Number(detail.qty) || 0
      const hargaBeli = bahan ? Number(bahan.hargaBeli) : 0
      const subtotal = qty * hargaBeli

      totalBiaya += subtotal

      return {
        ...detail,
        bahan,
        subtotal,
      }
    })

    const hpp = porsiHasil > 0 ? totalBiaya / Number(porsiHasil) : 0

    return {
      totalBiaya,
      hpp,
      detailsWithPrice,
    }
  }, [details, bahanBaku, porsiHasil])

  const addBahan = () => {
    append({
      bahanBakuId: "",
      qty: 0,
      satuan: "",
      catatan: "",
    })
  }

  const onSubmit = async (data: ResepWithDetailsFormValues) => {
    if (data.details.length === 0) {
      toast.error("Minimal 1 bahan harus ditambahkan")
      return
    }

    setIsSubmitting(true)

    try {
      const result = isEdit
        ? await updateResep(resep.id, data)
        : await createResep(data)

      if (result.success) {
        toast.success(
          isEdit ? "Resep berhasil diupdate" : "Resep berhasil ditambahkan"
        )
        router.push("/master/resep")
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
      {/* Info Resep */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Resep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produk */}
            <div className="space-y-2">
              <Label htmlFor="produkId">
                Produk <span className="text-red-500">*</span>
              </Label>
              <Select
                value={produkId}
                onValueChange={(value) => setValue("produkId", value)}
                disabled={isEdit}
              >
                <SelectTrigger className={errors.produkId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {produk.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.produkId && (
                <p className="text-sm text-red-500">{errors.produkId.message}</p>
              )}
            </div>

            {/* Nama Resep */}
            <div className="space-y-2">
              <Label htmlFor="namaResep">
                Nama Resep <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaResep"
                {...register("namaResep")}
                placeholder="Resep Brownies Original"
                className={errors.namaResep ? "border-red-500" : ""}
              />
              {errors.namaResep && (
                <p className="text-sm text-red-500">{errors.namaResep.message}</p>
              )}
            </div>

            {/* Porsi Hasil */}
            <div className="space-y-2">
              <Label htmlFor="porsiHasil">
                Porsi Hasil <span className="text-red-500">*</span>
              </Label>
              <Input
                id="porsiHasil"
                type="number"
                step="0.001"
                {...register("porsiHasil")}
                placeholder="10"
                className={errors.porsiHasil ? "border-red-500" : ""}
              />
              {errors.porsiHasil && (
                <p className="text-sm text-red-500">{errors.porsiHasil.message}</p>
              )}
            </div>

            {/* Satuan Hasil */}
            <div className="space-y-2">
              <Label htmlFor="satuanHasil">
                Satuan Hasil <span className="text-red-500">*</span>
              </Label>
              <Input
                id="satuanHasil"
                {...register("satuanHasil")}
                placeholder="potong, loyang, pcs"
                className={errors.satuanHasil ? "border-red-500" : ""}
              />
              {errors.satuanHasil && (
                <p className="text-sm text-red-500">{errors.satuanHasil.message}</p>
              )}
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Input
              id="catatan"
              {...register("catatan")}
              placeholder="Catatan tambahan..."
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", !!checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Aktifkan resep ini (akan digunakan untuk kalkulasi HPP)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Bahan-bahan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bahan-bahan</CardTitle>
            <Button type="button" onClick={addBahan} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada bahan ditambahkan</p>
              <Button type="button" onClick={addBahan} variant="outline" size="sm" className="mt-2">
                Tambah Bahan Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const selectedBahan = bahanBaku.find(
                  (b) => b.id === details[index]?.bahanBakuId
                )
                const subtotal = calculations.detailsWithPrice[index]?.subtotal || 0

                return (
                  <Card key={field.id} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Bahan Baku */}
                        <div className="md:col-span-5 space-y-2">
                          <Label>Bahan Baku</Label>
                          <Select
                            value={details[index]?.bahanBakuId || ""}
                            onValueChange={(value) => {
                              const bahan = bahanBaku.find((b) => b.id === value)
                              setValue(`details.${index}.bahanBakuId`, value)
                              if (bahan) {
                                setValue(`details.${index}.satuan`, bahan.satuan)
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih bahan" />
                            </SelectTrigger>
                            <SelectContent>
                              {bahanBaku.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.nama} (Stok: {formatNumber(Number(b.stok), 2)} {b.satuan})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.details?.[index]?.bahanBakuId && (
                            <p className="text-sm text-red-500">
                              {errors.details[index]?.bahanBakuId?.message}
                            </p>
                          )}
                        </div>

                        {/* Qty */}
                        <div className="md:col-span-2 space-y-2">
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            step="0.001"
                            {...register(`details.${index}.qty`)}
                            placeholder="0"
                          />
                        </div>

                        {/* Satuan */}
                        <div className="md:col-span-2 space-y-2">
                          <Label>Satuan</Label>
                          <Input
                            {...register(`details.${index}.satuan`)}
                            placeholder="kg"
                            disabled
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="md:col-span-2 space-y-2">
                          <Label>Subtotal</Label>
                          <div className="h-10 flex items-center font-medium text-gray-900">
                            {formatCurrency(subtotal)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="md:col-span-1 flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {selectedBahan && (
                        <div className="mt-2 text-xs text-gray-600">
                          Harga: {formatCurrency(Number(selectedBahan.hargaBeli))}/{selectedBahan.satuan} •
                          Stok tersedia: {formatNumber(Number(selectedBahan.stok), 2)} {selectedBahan.satuan}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {errors.details && typeof errors.details === 'object' && 'message' in errors.details && (
            <p className="text-sm text-red-500 mt-2">{errors.details.message as string}</p>
          )}
        </CardContent>
      </Card>

      {/* Kalkulasi */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            Kalkulasi HPP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Total Biaya Bahan:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(calculations.totalBiaya)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Porsi Hasil:</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatNumber(Number(porsiHasil), 2)} {watch("satuanHasil") || "unit"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">HPP per Unit:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculations.hpp)}
            </span>
          </div>
        </CardContent>
      </Card>

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
          {isEdit ? "Update Resep" : "Simpan Resep"}
        </Button>
      </div>
    </form>
  )
}