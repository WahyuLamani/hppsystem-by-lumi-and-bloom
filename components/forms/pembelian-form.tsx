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
import { Textarea } from "@/components/ui/textarea"
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
  pembelianWithDetailsSchema,
  type PembelianWithDetailsFormValues,
} from "@/lib/validations/pembelian"
import { createPembelian } from "@/app/actions/pembelian"
import { formatCurrency } from "@/lib/format"
import type { Supplier, BahanBaku } from "@prisma/client"

interface PembelianFormProps {
  defaultNomorPo: string
  suppliers: Pick<Supplier, "id" | "nama" | "kode">[]
  bahanBaku: Pick<BahanBaku, "id" | "nama" | "satuan" | "hargaBeli">[]
}

export function PembelianForm({ defaultNomorPo, suppliers, bahanBaku }: PembelianFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<PembelianWithDetailsFormValues>({
    resolver: zodResolver(pembelianWithDetailsSchema) as any,
    defaultValues: {
      nomorPo: defaultNomorPo,
      tanggal: new Date(),
      supplierId: "",
      subtotal: 0,
      diskon: 0,
      pajak: 0,
      ongkir: 0,
      total: 0,
      status: "draft",
      tanggalTerima: null,
      catatan: "",
      details: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details",
  })

  const supplierId = watch("supplierId")
  const diskon = watch("diskon")
  const pajak = watch("pajak")
  const ongkir = watch("ongkir")
  const status = watch("status")
  const details = watch("details")

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = details.reduce((sum, detail) => {
      return sum + (Number(detail.subtotal) || 0)
    }, 0)

    const diskonAmount = Number(diskon) || 0
    const pajakAmount = Number(pajak) || 0
    const ongkirAmount = Number(ongkir) || 0

    const total = subtotal - diskonAmount + pajakAmount + ongkirAmount

    // Update form values
    setValue("subtotal", subtotal)
    setValue("total", total)

    return {
      subtotal,
      diskonAmount,
      pajakAmount,
      ongkirAmount,
      total,
    }
  }, [details, diskon, pajak, ongkir, setValue])

  const addBahan = () => {
    append({
      bahanBakuId: "",
      qty: 0,
      satuan: "",
      hargaSatuan: 0,
      subtotal: 0,
    })
  }

  // Update subtotal when qty or hargaSatuan changes
  const updateSubtotal = (index: number) => {
    const qty = Number(details[index]?.qty) || 0
    const hargaSatuan = Number(details[index]?.hargaSatuan) || 0
    const subtotal = qty * hargaSatuan
    setValue(`details.${index}.subtotal`, subtotal)
  }

  const onSubmit = async (data: PembelianWithDetailsFormValues) => {
    if (data.details.length === 0) {
      toast.error("Minimal 1 bahan harus ditambahkan")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createPembelian(data)

      if (result.success) {
        toast.success("Pembelian berhasil dibuat")
        router.push("/transaksi/pembelian")
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
      {/* Info Pembelian */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pembelian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nomor PO */}
            <div className="space-y-2">
              <Label htmlFor="nomorPo">
                Nomor PO <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomorPo"
                {...register("nomorPo")}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal"
                type="date"
                {...register("tanggal", {
                  setValueAs: (value) => value ? new Date(value) : new Date(),
                })}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Diajukan</SelectItem>
                  <SelectItem value="received">Diterima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplierId">
              Supplier <span className="text-red-500">*</span>
            </Label>
            <Select
              value={supplierId}
              onValueChange={(value) => setValue("supplierId", value)}
            >
              <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplierId && (
              <p className="text-sm text-red-500">{errors.supplierId.message}</p>
            )}
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              {...register("catatan")}
              placeholder="Catatan pembelian..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detail Pembelian */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detail Pembelian</CardTitle>
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

                return (
                  <Card key={field.id} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Bahan Baku */}
                        <div className="md:col-span-4 space-y-2">
                          <Label>Bahan Baku</Label>
                          <Select
                            value={details[index]?.bahanBakuId || ""}
                            onValueChange={(value) => {
                              const bahan = bahanBaku.find((b) => b.id === value)
                              setValue(`details.${index}.bahanBakuId`, value)
                              if (bahan) {
                                setValue(`details.${index}.satuan`, bahan.satuan)
                                setValue(`details.${index}.hargaSatuan`, Number(bahan.hargaBeli))
                                updateSubtotal(index)
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih bahan" />
                            </SelectTrigger>
                            <SelectContent>
                              {bahanBaku.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Qty */}
                        <div className="md:col-span-2 space-y-2">
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            step="0.001"
                            {...register(`details.${index}.qty`, {
                              onChange: () => updateSubtotal(index),
                            })}
                            placeholder="0"
                          />
                        </div>

                        {/* Satuan */}
                        <div className="md:col-span-2 space-y-2">
                          <Label>Satuan</Label>
                          <Input
                            {...register(`details.${index}.satuan`)}
                            disabled
                          />
                        </div>

                        {/* Harga Satuan */}
                        <div className="md:col-span-2 space-y-2">
                          <Label>Harga</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`details.${index}.hargaSatuan`, {
                              onChange: () => updateSubtotal(index),
                            })}
                            placeholder="0"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="md:col-span-1 space-y-2">
                          <Label>Subtotal</Label>
                          <div className="h-10 flex items-center font-medium">
                            {formatCurrency(details[index]?.subtotal || 0)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="md:col-span-1 flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {selectedBahan && (
                        <div className="mt-2 text-xs text-gray-600">
                          Harga terakhir: {formatCurrency(Number(selectedBahan.hargaBeli))}/{selectedBahan.satuan}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kalkulasi */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            Ringkasan Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Subtotal:</span>
            <span className="text-lg font-bold">
              {formatCurrency(calculations.subtotal)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diskon">Diskon</Label>
              <Input
                id="diskon"
                type="number"
                step="0.01"
                {...register("diskon")}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pajak">Pajak</Label>
              <Input
                id="pajak"
                type="number"
                step="0.01"
                {...register("pajak")}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ongkir">Ongkir</Label>
              <Input
                id="ongkir"
                type="number"
                step="0.01"
                {...register("ongkir")}
                placeholder="0"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculations.total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
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
          Simpan Pembelian
        </Button>
      </div>

      {status === "received" && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900">
            ⚠️ <strong>Perhatian:</strong> Status &quot;Diterima&quot; akan langsung mengupdate stok dan harga beli bahan baku.
          </p>
        </div>
      )}
    </form>
  )
}