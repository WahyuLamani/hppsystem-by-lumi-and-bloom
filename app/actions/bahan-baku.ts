"use server"

import { prisma } from "@/lib/prisma"
import { bahanBakuSchema, type BahanBakuFormValues } from "@/lib/validations/bahan-baku"
import { revalidatePath } from "next/cache"
import { generateCode } from "@/lib/format"
import { z } from "zod"

/**
 * Get all bahan baku
 */
export async function getBahanBaku() {
  try {
    const bahanBaku = await prisma.bahanBaku.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: bahanBaku }
  } catch (error) {
    console.error("Error fetching bahan baku:", error)
    return { success: false, error: "Gagal mengambil data bahan baku" }
  }
}

/**
 * Get bahan baku by ID
 */
export async function getBahanBakuById(id: string) {
  try {
    const bahanBaku = await prisma.bahanBaku.findUnique({
      where: { id },
      include: {
        supplier: true,
        resepDetail: {
          include: {
            resep: {
              include: {
                produk: {
                  select: {
                    id: true,
                    nama: true,
                    kode: true,
                  },
                },
              },
            },
          },
        },
        pembelianDetail: {
          include: {
            pembelian: {
              select: {
                id: true,
                nomorPo: true,
                tanggal: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    })

    if (!bahanBaku) {
      return { success: false, error: "Bahan baku tidak ditemukan" }
    }

    return { success: true, data: bahanBaku }
  } catch (error) {
    console.error("Error fetching bahan baku:", error)
    return { success: false, error: "Gagal mengambil data bahan baku" }
  }
}

/**
 * Generate kode bahan baku otomatis
 */
export async function generateBahanBakuCode() {
  try {
    const lastBahan = await prisma.bahanBaku.findFirst({
      orderBy: { kode: "desc" },
    })

    if (!lastBahan) {
      return "BHN-001"
    }

    const lastNumber = parseInt(lastBahan.kode.split("-")[1]) || 0
    return generateCode("BHN", lastNumber + 1, 3)
  } catch (error) {
    console.error("Error generating bahan baku code:", error)
    return "BHN-001"
  }
}

/**
 * Create new bahan baku
 */
export async function createBahanBaku(data: BahanBakuFormValues) {
  try {
    const validated = bahanBakuSchema.parse(data)

    // Check if kode already exists
    const existing = await prisma.bahanBaku.findUnique({
      where: { kode: validated.kode },
    })

    if (existing) {
      return { success: false, error: "Kode bahan baku sudah digunakan" }
    }

    // Prepare data
    const createData: any = {
      kode: validated.kode,
      nama: validated.nama,
      kategori: validated.kategori,
      satuan: validated.satuan,
      hargaBeli: validated.hargaBeli,
      stok: validated.stok,
      stokMinimum: validated.stokMinimum,
      status: validated.status,
    }

    // Add supplier if provided
    if (validated.supplierId) {
      createData.supplierId = validated.supplierId
    }

    const bahanBaku = await prisma.bahanBaku.create({
      data: createData,
    })

    revalidatePath("/master/bahan-baku")
    return { success: true, data: bahanBaku }
  } catch (error) {
    console.error("Error creating bahan baku:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal membuat bahan baku" }
  }
}

/**
 * Update bahan baku
 */
export async function updateBahanBaku(id: string, data: BahanBakuFormValues) {
  try {
    const validated = bahanBakuSchema.parse(data)

    const existing = await prisma.bahanBaku.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: "Bahan baku tidak ditemukan" }
    }

    // Check if kode is being changed and already used
    if (validated.kode !== existing.kode) {
      const codeExists = await prisma.bahanBaku.findUnique({
        where: { kode: validated.kode },
      })

      if (codeExists) {
        return { success: false, error: "Kode bahan baku sudah digunakan" }
      }
    }

    // Prepare data
    const updateData: any = {
      kode: validated.kode,
      nama: validated.nama,
      kategori: validated.kategori,
      satuan: validated.satuan,
      hargaBeli: validated.hargaBeli,
      stok: validated.stok,
      stokMinimum: validated.stokMinimum,
      status: validated.status,
    }

    // Update supplier
    if (validated.supplierId) {
      updateData.supplierId = validated.supplierId
    } else {
      updateData.supplierId = null
    }

    const bahanBaku = await prisma.bahanBaku.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/master/bahan-baku")
    revalidatePath(`/master/bahan-baku/${id}`)
    return { success: true, data: bahanBaku }
  } catch (error) {
    console.error("Error updating bahan baku:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal mengupdate bahan baku" }
  }
}

/**
 * Delete bahan baku
 */
export async function deleteBahanBaku(id: string) {
  try {
    const existing = await prisma.bahanBaku.findUnique({
      where: { id },
      include: {
        resepDetail: true,
        pembelianDetail: true,
      },
    })

    if (!existing) {
      return { success: false, error: "Bahan baku tidak ditemukan" }
    }

    // Check if being used
    if (existing.resepDetail.length > 0) {
      return {
        success: false,
        error: `Bahan baku tidak dapat dihapus karena digunakan di ${existing.resepDetail.length} resep`,
      }
    }

    if (existing.pembelianDetail.length > 0) {
      return {
        success: false,
        error: `Bahan baku tidak dapat dihapus karena memiliki ${existing.pembelianDetail.length} transaksi pembelian`,
      }
    }

    await prisma.bahanBaku.delete({
      where: { id },
    })

    revalidatePath("/master/bahan-baku")
    return { success: true }
  } catch (error) {
    console.error("Error deleting bahan baku:", error)
    return { success: false, error: "Gagal menghapus bahan baku" }
  }
}

/**
 * Get bahan baku dengan stok menipis
 */
export async function getBahanBakuStokMenipis() {
  try {
    const bahanBaku = await prisma.$queryRaw`
      SELECT * FROM bahan_baku 
      WHERE stok <= stok_minimum 
      AND status = 'active'
      ORDER BY stok ASC
    `
    return { success: true, data: bahanBaku }
  } catch (error) {
    console.error("Error fetching bahan baku stok menipis:", error)
    return { success: false, error: "Gagal mengambil data" }
  }
}