import { z } from "zod"

export const supplierSchema = z.object({
  kode: z.string().min(1, "Kode supplier wajib diisi"),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  kontak: z.string().optional(),
  alamat: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>