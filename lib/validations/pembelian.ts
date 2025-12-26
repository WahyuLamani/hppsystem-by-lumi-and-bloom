import { z } from "zod"

const numberFromString = z.union([
  z.number(),
  z.string().transform((val) => parseFloat(val) || 0),
]).transform((val) => Number(val))

// ================= BASE =================
const pembelianBaseSchema = z.object({
  nomorPo: z.string().min(1, "Nomor PO wajib diisi"),
  tanggal: z.date(),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  subtotal: numberFromString,
  diskon: numberFromString,
  pajak: numberFromString,
  ongkir: numberFromString,
  total: numberFromString,
  status: z.enum(["draft", "submitted", "received", "cancelled"]),
  tanggalTerima: z.date().nullable().optional(),
  catatan: z.string().optional().or(z.literal("")),
})

// ================= FINAL =================
export const pembelianSchema = pembelianBaseSchema.refine(
  (data) => data.total >= 0,
  { message: "Total tidak boleh negatif", path: ["total"] }
)

export type PembelianFormValues = z.infer<typeof pembelianSchema>

// ================= DETAIL =================
const pembelianDetailBaseSchema = z.object({
  bahanBakuId: z.string().min(1, "Bahan baku wajib dipilih"),
  qty: numberFromString,
  satuan: z.string().min(1, "Satuan wajib diisi"),
  hargaSatuan: numberFromString,
  subtotal: numberFromString,
})

export const pembelianDetailSchema = pembelianDetailBaseSchema.refine(
  (data) => data.qty > 0,
  { message: "Qty harus lebih dari 0", path: ["qty"] }
).refine(
  (data) => data.hargaSatuan >= 0,
  { message: "Harga satuan tidak boleh negatif", path: ["hargaSatuan"] }
)

export type PembelianDetailFormValues = z.infer<typeof pembelianDetailSchema>

// ================= WITH DETAILS =================
export const pembelianWithDetailsSchema = pembelianBaseSchema.extend({
  details: z.array(pembelianDetailSchema).min(1, "Minimal 1 bahan harus ditambahkan"),
}).refine(
  (data) => data.total >= 0,
  { message: "Total tidak boleh negatif", path: ["total"] }
)

export type PembelianWithDetailsFormValues = z.infer<typeof pembelianWithDetailsSchema>