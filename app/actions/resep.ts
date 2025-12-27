"use server"

import { prisma } from "@/lib/prisma"
import { resepWithDetailsSchema, type ResepWithDetailsFormValues } from "@/lib/validations/resep"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

/**
 * Helper: Kalkulasi HPP dari resep detail
 */
async function calculateHPP(resepId: string) {
  const resepDetails = await prisma.resepDetail.findMany({
    where: { resepId },
    include: {
      bahanBaku: {
        select: {
          hargaBeli: true,
        },
      },
      resep: {
        select: {
          porsiHasil: true,
          produkId: true,
        },
      },
    },
  })

  if (resepDetails.length === 0) {
    return 0
  }

  // Total biaya = Σ(qty × harga_beli)
  let totalBiaya = 0
  for (const detail of resepDetails) {
    const qty = Number(detail.qty)
    const hargaBeli = Number(detail.bahanBaku.hargaBeli)
    totalBiaya += qty * hargaBeli
  }

  // HPP per unit = total biaya / porsi hasil
  const porsiHasil = Number(resepDetails[0].resep.porsiHasil)
  const hpp = porsiHasil > 0 ? totalBiaya / porsiHasil : 0

  return hpp
}

/**
 * Helper: Update HPP dan margin produk
 */
async function updateProdukHPP(produkId: string) {
  // Get active resep
  const resep = await prisma.resep.findFirst({
    where: {
      produkId,
      isActive: true,
    },
  })

  if (!resep) {
    // Jika tidak ada resep aktif, set HPP = 0
    await prisma.produk.update({
      where: { id: produkId },
      data: {
        hpp: 0,
        marginRupiah: 0,
        marginPersen: 0,
      },
    })
    return
  }

  // Calculate HPP
  const hpp = await calculateHPP(resep.id)

  // Get produk untuk hitung margin
  const produk = await prisma.produk.findUnique({
    where: { id: produkId },
    select: { hargaJual: true },
  })

  if (!produk) return

  const hargaJual = Number(produk.hargaJual)
  const marginRupiah = hargaJual - hpp
  const marginPersen = hpp > 0 ? (marginRupiah / hpp) * 100 : 0

  // Update produk
  await prisma.produk.update({
    where: { id: produkId },
    data: {
      hpp: hpp,
      marginRupiah: marginRupiah,
      marginPersen: marginPersen,
    },
  })
}

/**
 * Get all resep
 */
export async function getResep() {
  noStore()
  try {
    const resep = await prisma.resep.findMany({
      include: {
        produk: {
          select: {
            id: true,
            nama: true,
            kode: true,
            hpp: true,
          },
        },
        resepDetail: {
          include: {
            bahanBaku: {
              select: {
                id: true,
                nama: true,
                hargaBeli: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: resep }
  } catch (error) {
    console.error("Error fetching resep:", error)
    return { success: false, error: "Gagal mengambil data resep" }
  }
}

/**
 * Get resep by ID
 */
export async function getResepById(id: string) {
  noStore();
  try {
    const resep = await prisma.resep.findUnique({
      where: { id },
      include: {
        produk: true,
        resepDetail: {
          include: {
            bahanBaku: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!resep) {
      return { success: false, error: "Resep tidak ditemukan" }
    }

    return { success: true, data: resep }
  } catch (error) {
    console.error("Error fetching resep:", error)
    return { success: false, error: "Gagal mengambil data resep" }
  }
}

/**
 * Get resep by produk ID
 */
export async function getResepByProdukId(produkId: string) {
  noStore()
  try {
    const resep = await prisma.resep.findMany({
      where: { produkId },
      include: {
        resepDetail: {
          include: {
            bahanBaku: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: resep }
  } catch (error) {
    console.error("Error fetching resep:", error)
    return { success: false, error: "Gagal mengambil data resep" }
  }
}

/**
 * Create resep with details
 */
export async function createResep(data: ResepWithDetailsFormValues) {
  try {
    const validated = resepWithDetailsSchema.parse(data)

    // Create resep
    const resep = await prisma.resep.create({
      data: {
        produkId: validated.produkId,
        namaResep: validated.namaResep,
        porsiHasil: validated.porsiHasil,
        satuanHasil: validated.satuanHasil,
        catatan: validated.catatan || null,
        isActive: validated.isActive,
      },
    })

    // Create resep details
    for (const detail of validated.details) {
      await prisma.resepDetail.create({
        data: {
          resepId: resep.id,
          bahanBakuId: detail.bahanBakuId,
          qty: detail.qty,
          satuan: detail.satuan,
          catatan: detail.catatan || null,
        },
      })
    }

    // Update HPP produk
    await updateProdukHPP(validated.produkId)

    revalidatePath("/master/resep")
    revalidatePath("/master/produk")
    revalidatePath(`/master/produk/${validated.produkId}`)
    return { success: true, data: resep }
  } catch (error) {
    console.error("Error creating resep:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal membuat resep" }
  }
}

/**
 * Update resep
 */
export async function updateResep(id: string, data: ResepWithDetailsFormValues) {
  try {
    const validated = resepWithDetailsSchema.parse(data)

    const existing = await prisma.resep.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: "Resep tidak ditemukan" }
    }

    // Update resep
    const resep = await prisma.resep.update({
      where: { id },
      data: {
        namaResep: validated.namaResep,
        porsiHasil: validated.porsiHasil,
        satuanHasil: validated.satuanHasil,
        catatan: validated.catatan || null,
        isActive: validated.isActive,
      },
    })

    // Delete existing details
    await prisma.resepDetail.deleteMany({
      where: { resepId: id },
    })

    // Create new details
    for (const detail of validated.details) {
      await prisma.resepDetail.create({
        data: {
          resepId: resep.id,
          bahanBakuId: detail.bahanBakuId,
          qty: detail.qty,
          satuan: detail.satuan,
          catatan: detail.catatan || null,
        },
      })
    }

    // Update HPP produk
    await updateProdukHPP(validated.produkId)

    revalidatePath("/master/resep")
    revalidatePath(`/master/resep/${id}`)
    revalidatePath("/master/produk")
    revalidatePath(`/master/produk/${validated.produkId}`)
    return { success: true, data: resep }
  } catch (error) {
    console.error("Error updating resep:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: "Gagal mengupdate resep" }
  }
}

/**
 * Delete resep
 */
export async function deleteResep(id: string) {
  try {
    const existing = await prisma.resep.findUnique({
      where: { id },
      include: {
        produk: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!existing) {
      return { success: false, error: "Resep tidak ditemukan" }
    }

    const produkId = existing.produk.id

    // Delete resep (cascade akan delete details)
    await prisma.resep.delete({
      where: { id },
    })

    // Update HPP produk
    await updateProdukHPP(produkId)

    revalidatePath("/master/resep")
    revalidatePath("/master/produk")
    revalidatePath(`/master/produk/${produkId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting resep:", error)
    return { success: false, error: "Gagal menghapus resep" }
  }
}

/**
 * Toggle resep active status
 */
export async function toggleResepActive(id: string) {
  try {
    const existing = await prisma.resep.findUnique({
      where: { id },
      include: {
        produk: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!existing) {
      return { success: false, error: "Resep tidak ditemukan" }
    }

    // If activating, deactivate others for same produk
    if (!existing.isActive) {
      await prisma.resep.updateMany({
        where: {
          produkId: existing.produkId,
          id: { not: id },
        },
        data: { isActive: false },
      })
    }

    // Toggle
    const resep = await prisma.resep.update({
      where: { id },
      data: { isActive: !existing.isActive },
    })

    // Update HPP produk
    await updateProdukHPP(existing.produkId)

    revalidatePath("/master/resep")
    revalidatePath(`/master/resep/${id}`)
    revalidatePath("/master/produk")
    revalidatePath(`/master/produk/${existing.produkId}`)

    return { success: true, data: resep }
  } catch (error) {
    console.error("Error toggling resep:", error)
    return { success: false, error: "Gagal mengubah status resep" }
  }
}