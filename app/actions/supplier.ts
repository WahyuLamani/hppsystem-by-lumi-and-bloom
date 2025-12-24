"use server"

import { prisma } from "@/lib/prisma"
import { supplierSchema, type SupplierFormValues } from "@/lib/validations/supplier"
import { revalidatePath } from "next/cache"
import { generateCode } from "@/lib/format"
import { z } from "zod"

/**
 * Get all suppliers
 */
export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: suppliers }
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return { success: false, error: "Gagal mengambil data supplier" }
  }
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(id: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        bahanBaku: {
          select: {
            id: true,
            nama: true,
            stok: true,
          },
        },
        pembelian: {
          select: {
            id: true,
            nomorPo: true,
            tanggal: true,
            total: true,
          },
          orderBy: { tanggal: "desc" },
          take: 5,
        },
      },
    })

    if (!supplier) {
      return { success: false, error: "Supplier tidak ditemukan" }
    }

    return { success: true, data: supplier }
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return { success: false, error: "Gagal mengambil data supplier" }
  }
}

/**
 * Generate kode supplier otomatis
 */
export async function generateSupplierCode() {
  try {
    const lastSupplier = await prisma.supplier.findFirst({
      orderBy: { kode: "desc" },
    })

    if (!lastSupplier) {
      return "SUP-001"
    }

    // Extract number from last code (SUP-001 -> 001)
    const lastNumber = parseInt(lastSupplier.kode.split("-")[1]) || 0
    return generateCode("SUP", lastNumber + 1, 3)
  } catch (error) {
    console.error("Error generating supplier code:", error)
    return "SUP-001"
  }
}

/**
 * Create new supplier
 */
export async function createSupplier(data: SupplierFormValues) {
  try {
    // Validate input
    const validated = supplierSchema.parse(data)

    // Check if kode already exists
    const existing = await prisma.supplier.findUnique({
      where: { kode: validated.kode },
    })

    if (existing) {
      return { success: false, error: "Kode supplier sudah digunakan" }
    }

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: validated,
    })

    revalidatePath("/master/supplier")
    return { success: true, data: supplier }
  } catch (error) {
    console.error("Error creating supplier:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal membuat supplier" }
  }
}

/**
 * Update supplier
 */
export async function updateSupplier(id: string, data: SupplierFormValues) {
  try {
    // Validate input
    const validated = supplierSchema.parse(data)

    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: "Supplier tidak ditemukan" }
    }

    // Check if kode is being changed and already used
    if (validated.kode !== existing.kode) {
      const codeExists = await prisma.supplier.findUnique({
        where: { kode: validated.kode },
      })

      if (codeExists) {
        return { success: false, error: "Kode supplier sudah digunakan" }
      }
    }

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id },
      data: validated,
    })

    revalidatePath("/master/supplier")
    revalidatePath(`/master/supplier/${id}`)
    return { success: true, data: supplier }
  } catch (error) {
    console.error("Error updating supplier:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal mengupdate supplier" }
  }
}

/**
 * Delete supplier
 */
export async function deleteSupplier(id: string) {
  try {
    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: {
        bahanBaku: true,
        pembelian: true,
      },
    })

    if (!existing) {
      return { success: false, error: "Supplier tidak ditemukan" }
    }

    // Check if supplier is being used
    if (existing.bahanBaku.length > 0) {
      return {
        success: false,
        error: `Supplier tidak dapat dihapus karena masih digunakan oleh ${existing.bahanBaku.length} bahan baku`,
      }
    }

    if (existing.pembelian.length > 0) {
      return {
        success: false,
        error: `Supplier tidak dapat dihapus karena memiliki ${existing.pembelian.length} transaksi pembelian`,
      }
    }

    // Delete supplier
    await prisma.supplier.delete({
      where: { id },
    })

    revalidatePath("/master/supplier")
    return { success: true }
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return { success: false, error: "Gagal menghapus supplier" }
  }
}