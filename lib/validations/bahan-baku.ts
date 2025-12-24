import { z } from "zod"

export const bahanBakuSchema = z.object({
  kode: z.string().min(1, "Kode bahan baku wajib diisi"),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  kategori: z.string().min(1, "Kategori wajib diisi"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  hargaBeli: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val) || 0)
  ]).transform((val) => Number(val)),
  stok: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val) || 0)
  ]).transform((val) => Number(val)),
  stokMinimum: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val) || 0)
  ]).transform((val) => Number(val)),
  supplierId: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]),
}).refine(
  (data) => data.hargaBeli >= 0,
  { message: "Harga tidak boleh negatif", path: ["hargaBeli"] }
).refine(
  (data) => data.stok >= 0,
  { message: "Stok tidak boleh negatif", path: ["stok"] }
).refine(
  (data) => data.stokMinimum >= 0,
  { message: "Stok minimum tidak boleh negatif", path: ["stokMinimum"] }
)

export type BahanBakuFormValues = z.infer<typeof bahanBakuSchema>

// Kategori bahan baku yang umum
export const kategoriBahanBaku = [
  "Tepung",
  "Gula & Pemanis",
  "Dairy & Telur",
  "Lemak & Minyak",
  "Cokelat & Kakao",
  "Buah & Sayur",
  "Kacang & Biji",
  "Rempah & Perasa",
  "Pengembang & Pengeras",
  "Lainnya",
] as const

// Satuan yang umum digunakan
export const satuanBahanBaku = [
  "kg",
  "gram",
  "liter",
  "ml",
  "pcs",
  "butir",
  "bungkus",
  "kaleng",
  "botol",
] as const