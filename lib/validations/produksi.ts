import { z } from "zod"

const numberFromString = z.union([
  z.number(),
  z.string().transform((val) => parseFloat(val) || 0),
]).transform((val) => Number(val))

// ================= BASE =================
const produksiBaseSchema = z.object({
  nomorProduksi: z.string().min(1, "Nomor produksi wajib diisi"),
  tanggal: z.date(),
  resepId: z.string().min(1, "Resep wajib dipilih"),
  produkId: z.string().min(1, "Produk wajib dipilih"),
  qtyBatch: numberFromString,
  qtyHasil: numberFromString,
  totalHpp: numberFromString,
  hppPerUnit: numberFromString,
  status: z.enum(["draft", "processing", "completed", "cancelled"]),
  tanggalSelesai: z.date().nullable().optional(),
  preOrderId: z.string().optional().or(z.literal("")),
  catatan: z.string().optional().or(z.literal("")),
})

// ================= FINAL =================
export const produksiSchema = produksiBaseSchema.refine(
  (data) => data.qtyBatch > 0,
  { message: "Qty batch harus lebih dari 0", path: ["qtyBatch"] }
)

export type ProduksiFormValues = z.infer<typeof produksiSchema>