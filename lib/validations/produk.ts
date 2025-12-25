import { z } from "zod"

const numberFromString = z.union([
  z.number(),
  z.string().transform((val) => parseFloat(val) || 0)
]).transform((val) => Number(val))

export const produkSchema = z.object({
  kode: z.string().min(1, "Kode produk wajib diisi"),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  kategori: z.string().min(1, "Kategori wajib diisi"),
  deskripsi: z.string().optional().or(z.literal("")),
  hargaJual: numberFromString,
  stokMinimum: numberFromString,
  dapatPreOrder: z.boolean().default(true),
  waktuProduksiHari: z.union([
    z.number(),
    z.string().transform((val) => {
      const num = parseInt(val)
      return isNaN(num) ? null : num
    })
  ]).nullable().optional(),
  status: z.enum(["active", "inactive"]),
  gambarUrl: z.string().optional().or(z.literal("")),
}).refine(
  (data) => data.hargaJual >= 0,
  { message: "Harga jual tidak boleh negatif", path: ["hargaJual"] }
).refine(
  (data) => data.stokMinimum >= 0,
  { message: "Stok minimum tidak boleh negatif", path: ["stokMinimum"] }
)

export type ProdukFormValues = z.infer<typeof produkSchema>

// Kategori produk yang umum
export const kategoriProduk = [
  "Kue",
  "Roti",
  "Pastry",
  "Cake",
  "Cookies",
  "Minuman",
  "Snack",
  "Lainnya",
] as const