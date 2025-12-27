"use server"

import { prisma } from "@/lib/prisma"
import { produkSchema, type ProdukFormValues } from "@/lib/validations/produk"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { generateCode } from "@/lib/format"
import { z } from "zod"
import { Prisma } from "@prisma/client"

/**
 * Get all produk
 */
export async function getProduk() {
  noStore()
  try {
    const produk = await prisma.produk.findMany({
      include: {
        resep: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: produk }
  } catch (error) {
    console.error("Error fetching produk:", error)
    return { success: false, error: "Gagal mengambil data produk" }
  }
}

/**
 * Get produk by ID
 */
export async function getProdukById(id: string) {
  noStore();
  try {
    const produk = await prisma.produk.findUnique({
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
          orderBy: { createdAt: "desc" },
        },
        penjualanDetail: {
          include: {
            penjualan: {
              select: {
                id: true,
                nomorInvoice: true,
                tanggal: true,
                total: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!produk) {
      return { success: false, error: "Produk tidak ditemukan" }
    }

    return { success: true, data: produk }
  } catch (error) {
    console.error("Error fetching produk:", error)
    return { success: false, error: "Gagal mengambil data produk" }
  }
}

/**
 * Get Produk Active
 */
export async function getProdukActive(
  select?: Prisma.ProdukSelect
) {
  noStore();
  return await prisma.produk.findMany({
    where: { status: "active" },
    select: {
      id: true,
      nama: true,
      kode: true,
      ...select,
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Generate kode produk otomatis
 */
export async function generateProdukCode() {
  try {
    const lastProduk = await prisma.produk.findFirst({
      orderBy: { kode: "desc" },
    })

    if (!lastProduk) {
      return "PRD-001"
    }

    const lastNumber = parseInt(lastProduk.kode.split("-")[1]) || 0
    return generateCode("PRD", lastNumber + 1, 3)
  } catch (error) {
    console.error("Error generating produk code:", error)
    return "PRD-001"
  }
}

/**
 * Create new produk
 */
export async function createProduk(data: ProdukFormValues) {
  try {
    const validated = produkSchema.parse(data)

    // Check if kode already exists
    const existing = await prisma.produk.findUnique({
      where: { kode: validated.kode },
    })

    if (existing) {
      return { success: false, error: "Kode produk sudah digunakan" }
    }

    const produk = await prisma.produk.create({
      data: {
        kode: validated.kode,
        nama: validated.nama,
        kategori: validated.kategori,
        deskripsi: validated.deskripsi || null,
        hargaJual: validated.hargaJual,
        stokMinimum: validated.stokMinimum,
        dapatPreOrder: validated.dapatPreOrder,
        waktuProduksiHari: validated.waktuProduksiHari || null,
        status: validated.status,
        gambarUrl: validated.gambarUrl || null,
        // hpp, marginPersen, marginRupiah akan dihitung setelah resep dibuat
        hpp: 0,
        marginPersen: 0,
        marginRupiah: 0,
        stok: 0,
      },
    })

    revalidatePath("/master/produk")
    return { success: true, data: produk }
  } catch (error) {
    console.error("Error creating produk:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal membuat produk" }
  }
}

/**
 * Update produk
 */
export async function updateProduk(id: string, data: ProdukFormValues) {
  try {
    const validated = produkSchema.parse(data)

    const existing = await prisma.produk.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan" }
    }

    // Check if kode is being changed and already used
    if (validated.kode !== existing.kode) {
      const codeExists = await prisma.produk.findUnique({
        where: { kode: validated.kode },
      })

      if (codeExists) {
        return { success: false, error: "Kode produk sudah digunakan" }
      }
    }

    // Calculate margin
    const hpp = Number(existing.hpp)
    const hargaJual = Number(validated.hargaJual)
    const marginRupiah = hargaJual - hpp
    const marginPersen = hpp > 0 ? (marginRupiah / hpp) * 100 : 0

    const produk = await prisma.produk.update({
      where: { id },
      data: {
        kode: validated.kode,
        nama: validated.nama,
        kategori: validated.kategori,
        deskripsi: validated.deskripsi || null,
        hargaJual: validated.hargaJual,
        marginPersen: marginPersen,
        marginRupiah: marginRupiah,
        stokMinimum: validated.stokMinimum,
        dapatPreOrder: validated.dapatPreOrder,
        waktuProduksiHari: validated.waktuProduksiHari || null,
        status: validated.status,
        gambarUrl: validated.gambarUrl || null,
      },
    })

    revalidatePath("/master/produk")
    revalidatePath(`/master/produk/${id}`)
    return { success: true, data: produk }
  } catch (error) {
    console.error("Error updating produk:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal mengupdate produk" }
  }
}

/**
 * Delete produk
 */
export async function deleteProduk(id: string) {
  try {
    const existing = await prisma.produk.findUnique({
      where: { id },
      include: {
        resep: true,
        penjualanDetail: true,
        preOrderDetail: true,
      },
    })

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan" }
    }

    // Check if being used
    if (existing.penjualanDetail.length > 0) {
      return {
        success: false,
        error: `Produk tidak dapat dihapus karena memiliki ${existing.penjualanDetail.length} transaksi penjualan`,
      }
    }

    if (existing.preOrderDetail.length > 0) {
      return {
        success: false,
        error: `Produk tidak dapat dihapus karena memiliki ${existing.preOrderDetail.length} pre-order`,
      }
    }

    // Delete resep first (cascade akan delete resep detail)
    if (existing.resep.length > 0) {
      await prisma.resep.deleteMany({
        where: { produkId: id },
      })
    }

    await prisma.produk.delete({
      where: { id },
    })

    revalidatePath("/master/produk")
    return { success: true }
  } catch (error) {
    console.error("Error deleting produk:", error)
    return { success: false, error: "Gagal menghapus produk" }
  }
}