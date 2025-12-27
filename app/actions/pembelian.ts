"use server"

import { prisma } from "@/lib/prisma"
import { pembelianWithDetailsSchema, type PembelianWithDetailsFormValues } from "@/lib/validations/pembelian"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { generateCode } from "@/lib/format"
import { z } from "zod"

/**
 * Get all pembelian
 */
export async function getPembelian() {
  noStore()
  try {
    const pembelian = await prisma.transaksiPembelian.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
        detail: {
          include: {
            bahanBaku: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
      orderBy: { tanggal: "desc" },
    })
    return { success: true, data: pembelian }
  } catch (error) {
    console.error("Error fetching pembelian:", error)
    return { success: false, error: "Gagal mengambil data pembelian" }
  }
}

/**
 * Get pembelian by ID
 */
export async function getPembelianById(id: string) {
  noStore()
  try {
    const pembelian = await prisma.transaksiPembelian.findUnique({
      where: { id },
      include: {
        supplier: true,
        detail: {
          include: {
            bahanBaku: true,
          },
        },
      },
    })

    if (!pembelian) {
      return { success: false, error: "Pembelian tidak ditemukan" }
    }

    return { success: true, data: pembelian }
  } catch (error) {
    console.error("Error fetching pembelian:", error)
    return { success: false, error: "Gagal mengambil data pembelian" }
  }
}

/**
 * Generate nomor PO otomatis
 */
export async function generatePembelianCode() {
  try {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    
    const lastPembelian = await prisma.transaksiPembelian.findFirst({
      where: {
        nomorPo: {
          startsWith: `PO-${dateStr}`,
        },
      },
      orderBy: { nomorPo: "desc" },
    })

    if (!lastPembelian) {
      return `PO-${dateStr}-001`
    }

    const lastNumber = parseInt(lastPembelian.nomorPo.split("-")[2]) || 0
    const newNumber = (lastNumber + 1).toString().padStart(3, "0")
    return `PO-${dateStr}-${newNumber}`
  } catch (error) {
    console.error("Error generating pembelian code:", error)
    return `PO-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-001`
  }
}

/**
 * Create pembelian
 */
export async function createPembelian(data: PembelianWithDetailsFormValues) {
  try {
    const validated = pembelianWithDetailsSchema.parse(data)

    // Check if nomorPo already exists
    const existing = await prisma.transaksiPembelian.findUnique({
      where: { nomorPo: validated.nomorPo },
    })

    if (existing) {
      return { success: false, error: "Nomor PO sudah digunakan" }
    }

    // Create pembelian with details
    const pembelian = await prisma.transaksiPembelian.create({
      data: {
        nomorPo: validated.nomorPo,
        tanggal: validated.tanggal,
        supplierId: validated.supplierId,
        subtotal: validated.subtotal,
        diskon: validated.diskon,
        pajak: validated.pajak,
        ongkir: validated.ongkir,
        total: validated.total,
        status: validated.status,
        tanggalTerima: validated.tanggalTerima,
        catatan: validated.catatan || null,
        createdBy: "system", // TODO: Get from auth
        detail: {
          create: validated.details.map((detail) => ({
            bahanBakuId: detail.bahanBakuId,
            qty: detail.qty,
            satuan: detail.satuan,
            hargaSatuan: detail.hargaSatuan,
            subtotal: detail.subtotal,
          })),
        },
      },
    })

    // If status is received, update stock and price
    if (validated.status === "received") {
      await processReceivedPembelian(pembelian.id)
    }

    revalidatePath("/transaksi/pembelian")
    return { success: true, data: pembelian }
  } catch (error) {
    console.error("Error creating pembelian:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal membuat pembelian" }
  }
}

/**
 * Update pembelian status to received and process stock
 */
export async function receivePembelian(id: string) {
  try {
    const pembelian = await prisma.transaksiPembelian.findUnique({
      where: { id },
    })

    if (!pembelian) {
      return { success: false, error: "Pembelian tidak ditemukan" }
    }

    if (pembelian.status === "received") {
      return { success: false, error: "Pembelian sudah diterima" }
    }

    // Update status
    await prisma.transaksiPembelian.update({
      where: { id },
      data: {
        status: "received",
        tanggalTerima: new Date(),
      },
    })

    // Process stock and price
    await processReceivedPembelian(id)

    revalidatePath("/transaksi/pembelian")
    revalidatePath(`/transaksi/pembelian/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error receiving pembelian:", error)
    return { success: false, error: "Gagal menerima pembelian" }
  }
}

/**
 * Process received pembelian: update stock and price
 */
async function processReceivedPembelian(pembelianId: string) {
  const pembelian = await prisma.transaksiPembelian.findUnique({
    where: { id: pembelianId },
    include: {
      detail: true,
    },
  })

  if (!pembelian) return

  for (const detail of pembelian.detail) {
    const bahanBaku = await prisma.bahanBaku.findUnique({
      where: { id: detail.bahanBakuId },
    })

    if (!bahanBaku) continue

    const stokBefore = Number(bahanBaku.stok)
    const stokAfter = stokBefore + Number(detail.qty)

    // Update bahan baku: harga beli & stok
    await prisma.bahanBaku.update({
      where: { id: detail.bahanBakuId },
      data: {
        hargaBeli: detail.hargaSatuan,
        stok: stokAfter,
      },
    })

    // Create stock movement log
    await prisma.stokMovement.create({
      data: {
        tanggal: new Date(),
        tipeItem: "bahan_baku",
        itemId: detail.bahanBakuId,
        itemNama: bahanBaku.nama,
        movementType: "in",
        qty: detail.qty,
        stokBefore: stokBefore,
        stokAfter: stokAfter,
        transaksiType: "pembelian",
        transaksiId: pembelianId,
        transaksiNomor: pembelian.nomorPo,
        keterangan: `Pembelian dari supplier`,
      },
    })
  }
}

/**
 * Delete pembelian (only draft)
 */
export async function deletePembelian(id: string) {
  try {
    const existing = await prisma.transaksiPembelian.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: "Pembelian tidak ditemukan" }
    }

    if (existing.status === "received") {
      return {
        success: false,
        error: "Pembelian yang sudah diterima tidak dapat dihapus",
      }
    }

    // Delete pembelian (cascade akan delete details)
    await prisma.transaksiPembelian.delete({
      where: { id },
    })

    revalidatePath("/transaksi/pembelian")
    return { success: true }
  } catch (error) {
    console.error("Error deleting pembelian:", error)
    return { success: false, error: "Gagal menghapus pembelian" }
  }
}