"use server"

import { prisma } from "@/lib/prisma"
import { produksiSchema, type ProduksiFormValues } from "@/lib/validations/produksi"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { z } from "zod"

/**
 * Get all produksi
 */
export async function getProduksi() {
  noStore()
  try {
    const produksi = await prisma.transaksiProduksi.findMany({
      include: {
        resep: {
          select: {
            id: true,
            namaResep: true,
          },
        },
        produk: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    })
    return { success: true, data: produksi }
  } catch (error) {
    console.error("Error fetching produksi:", error)
    return { success: false, error: "Gagal mengambil data produksi" }
  }
}

/**
 * Get produksi by ID
 */
export async function getProduksiById(id: string) {
  noStore();
  try {
    const produksi = await prisma.transaksiProduksi.findUnique({
      where: { id },
      include: {
        resep: {
          include: {
            resepDetail: {
              include: {
                bahanBaku: true,
              },
            },
          },
        },
        produk: true,
      },
    })

    if (!produksi) {
      return { success: false, error: "Produksi tidak ditemukan" }
    }

    return { success: true, data: produksi }
  } catch (error) {
    console.error("Error fetching produksi:", error)
    return { success: false, error: "Gagal mengambil data produksi" }
  }
}

/**
 * Generate nomor produksi otomatis
 */
export async function generateProduksiCode() {
  try {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    
    const lastProduksi = await prisma.transaksiProduksi.findFirst({
      where: {
        nomorProduksi: {
          startsWith: `PROD-${dateStr}`,
        },
      },
      orderBy: { nomorProduksi: "desc" },
    })

    if (!lastProduksi) {
      return `PROD-${dateStr}-001`
    }

    const lastNumber = parseInt(lastProduksi.nomorProduksi.split("-")[2]) || 0
    const newNumber = (lastNumber + 1).toString().padStart(3, "0")
    return `PROD-${dateStr}-${newNumber}`
  } catch (error) {
    console.error("Error generating produksi code:", error)
    return `PROD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-001`
  }
}

/**
 * Check if bahan baku stock is sufficient
 */
export async function checkBahanStock(resepId: string, qtyBatch: number) {
  try {
    const resepDetail = await prisma.resepDetail.findMany({
      where: { resepId },
      include: {
        bahanBaku: {
          select: {
            id: true,
            nama: true,
            stok: true,
            satuan: true,
          },
        },
      },
    })

    const insufficient = []
    for (const detail of resepDetail) {
      const needed = Number(detail.qty) * qtyBatch
      const available = Number(detail.bahanBaku.stok)
      
      if (needed > available) {
        insufficient.push({
          nama: detail.bahanBaku.nama,
          needed,
          available,
          satuan: detail.satuan,
        })
      }
    }

    if (insufficient.length > 0) {
      return { 
        success: false, 
        error: "Stok bahan tidak cukup",
        insufficient 
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error checking bahan stock:", error)
    return { success: false, error: "Gagal mengecek stok" }
  }
}

/**
 * Create produksi
 */
export async function createProduksi(data: ProduksiFormValues) {
  try {
    const validated = produksiSchema.parse(data)

    // Check if nomorProduksi already exists
    const existing = await prisma.transaksiProduksi.findUnique({
      where: { nomorProduksi: validated.nomorProduksi },
    })

    if (existing) {
      return { success: false, error: "Nomor produksi sudah digunakan" }
    }

    // Check stock if status is completed
    if (validated.status === "completed") {
      const stockCheck = await checkBahanStock(validated.resepId, validated.qtyBatch)
      if (!stockCheck.success) {
        return stockCheck
      }
    }

    // Create produksi
    const produksi = await prisma.transaksiProduksi.create({
      data: {
        nomorProduksi: validated.nomorProduksi,
        tanggal: validated.tanggal,
        resepId: validated.resepId,
        produkId: validated.produkId,
        qtyBatch: validated.qtyBatch,
        qtyHasil: validated.qtyHasil,
        totalHpp: validated.totalHpp,
        hppPerUnit: validated.hppPerUnit,
        status: validated.status,
        tanggalSelesai: validated.tanggalSelesai,
        preOrderId: validated.preOrderId || null,
        catatan: validated.catatan || null,
        createdBy: "system", // TODO: Get from auth
      },
    })

    // If status is completed, process stock
    if (validated.status === "completed") {
      await processCompletedProduksi(produksi.id)
    }

    revalidatePath("/transaksi/produksi")
    return { success: true, data: produksi }
  } catch (error) {
    console.error("Error creating produksi:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal membuat produksi" }
  }
}

/**
 * Complete produksi and process stock
 */
export async function completeProduksi(id: string) {
  try {
    const produksi = await prisma.transaksiProduksi.findUnique({
      where: { id },
    })

    if (!produksi) {
      return { success: false, error: "Produksi tidak ditemukan" }
    }

    if (produksi.status === "completed") {
      return { success: false, error: "Produksi sudah selesai" }
    }

    // Check stock
    const stockCheck = await checkBahanStock(produksi.resepId, Number(produksi.qtyBatch))
    if (!stockCheck.success) {
      return stockCheck
    }

    // Update status
    await prisma.transaksiProduksi.update({
      where: { id },
      data: {
        status: "completed",
        tanggalSelesai: new Date(),
      },
    })

    // Process stock
    await processCompletedProduksi(id)

    revalidatePath("/transaksi/produksi")
    revalidatePath(`/transaksi/produksi/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error completing produksi:", error)
    return { success: false, error: "Gagal menyelesaikan produksi" }
  }
}

/**
 * Process completed produksi: reduce bahan stock, increase produk stock
 */
async function processCompletedProduksi(produksiId: string) {
  const produksi = await prisma.transaksiProduksi.findUnique({
    where: { id: produksiId },
    include: {
      resep: {
        include: {
          resepDetail: {
            include: {
              bahanBaku: true,
            },
          },
        },
      },
      produk: true,
    },
  })

  if (!produksi) return

  // Reduce bahan baku stock
  for (const detail of produksi.resep.resepDetail) {
    const needed = Number(detail.qty) * Number(produksi.qtyBatch)
    const stokBefore = Number(detail.bahanBaku.stok)
    const stokAfter = stokBefore - needed

    await prisma.bahanBaku.update({
      where: { id: detail.bahanBakuId },
      data: { stok: stokAfter },
    })

    // Log stock movement
    await prisma.stokMovement.create({
      data: {
        tanggal: new Date(),
        tipeItem: "bahan_baku",
        itemId: detail.bahanBakuId,
        itemNama: detail.bahanBaku.nama,
        movementType: "out",
        qty: needed,
        stokBefore: stokBefore,
        stokAfter: stokAfter,
        transaksiType: "produksi",
        transaksiId: produksiId,
        transaksiNomor: produksi.nomorProduksi,
        keterangan: `Produksi ${produksi.produk.nama}`,
      },
    })
  }

  // Increase produk stock
  const produkStokBefore = Number(produksi.produk.stok)
  const produkStokAfter = produkStokBefore + Number(produksi.qtyHasil)

  await prisma.produk.update({
    where: { id: produksi.produkId },
    data: { stok: produkStokAfter },
  })

  // Log stock movement
  await prisma.stokMovement.create({
    data: {
      tanggal: new Date(),
      tipeItem: "produk_jadi",
      itemId: produksi.produkId,
      itemNama: produksi.produk.nama,
      movementType: "in",
      qty: produksi.qtyHasil,
      stokBefore: produkStokBefore,
      stokAfter: produkStokAfter,
      transaksiType: "produksi",
      transaksiId: produksiId,
      transaksiNomor: produksi.nomorProduksi,
      keterangan: `Hasil produksi`,
    },
  })
}

/**
 * Delete produksi (only draft)
 */
export async function deleteProduksi(id: string) {
  try {
    const existing = await prisma.transaksiProduksi.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: "Produksi tidak ditemukan" }
    }

    if (existing.status === "completed") {
      return {
        success: false,
        error: "Produksi yang sudah selesai tidak dapat dihapus",
      }
    }

    await prisma.transaksiProduksi.delete({
      where: { id },
    })

    revalidatePath("/transaksi/produksi")
    return { success: true }
  } catch (error) {
    console.error("Error deleting produksi:", error)
    return { success: false, error: "Gagal menghapus produksi" }
  }
}