import { z } from "zod"

const numberFromString = z.union([
  z.number(),
  z.string().transform((val) => parseFloat(val) || 0)
]).transform((val) => Number(val))

export const resepSchema = z.object({
  produkId: z.string().min(1, "Produk wajib dipilih"),
  namaResep: z.string().min(3, "Nama resep minimal 3 karakter"),
  porsiHasil: numberFromString,
  satuanHasil: z.string().min(1, "Satuan hasil wajib diisi"),
  catatan: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
}).refine(
  (data) => data.porsiHasil > 0,
  { message: "Porsi hasil harus lebih dari 0", path: ["porsiHasil"] }
)

export type ResepFormValues = z.infer<typeof resepSchema>

// Detail resep (bahan yang digunakan)
export const resepDetailSchema = z.object({
  bahanBakuId: z.string().min(1, "Bahan baku wajib dipilih"),
  qty: numberFromString,
  satuan: z.string().min(1, "Satuan wajib diisi"),
  catatan: z.string().optional().or(z.literal("")),
}).refine(
  (data) => data.qty > 0,
  { message: "Qty harus lebih dari 0", path: ["qty"] }
)

export type ResepDetailFormValues = z.infer<typeof resepDetailSchema>

// Form lengkap resep + detail
export const resepWithDetailsSchema = resepSchema.extend({
  details: z.array(resepDetailSchema).min(1, "Minimal 1 bahan harus ditambahkan"),
})

export type ResepWithDetailsFormValues = z.infer<typeof resepWithDetailsSchema>