-- CreateEnum
CREATE TYPE "StatusAktif" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "StatusPembelian" AS ENUM ('draft', 'submitted', 'received', 'cancelled');

-- CreateEnum
CREATE TYPE "StatusProduksi" AS ENUM ('draft', 'processing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "StatusPreOrder" AS ENUM ('pending', 'confirmed', 'production', 'ready', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "StatusPenjualan" AS ENUM ('draft', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "TipePenjualan" AS ENUM ('regular', 'pre_order');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('cash', 'transfer', 'qris', 'debit', 'credit');

-- CreateEnum
CREATE TYPE "TipeItem" AS ENUM ('bahan_baku', 'produk_jadi');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('waste', 'damaged', 'expired', 'found', 'correction');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('in', 'out');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kontak" TEXT,
    "alamat" TEXT,
    "email" TEXT,
    "status" "StatusAktif" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bahan_baku" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "harga_beli" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "stok" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "stok_minimum" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "supplier_id" TEXT,
    "status" "StatusAktif" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bahan_baku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produk" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "deskripsi" TEXT,
    "hpp" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "harga_jual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "margin_persen" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "margin_rupiah" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "stok" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "stok_minimum" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "dapat_pre_order" BOOLEAN NOT NULL DEFAULT true,
    "waktu_produksi_hari" INTEGER,
    "status" "StatusAktif" NOT NULL DEFAULT 'active',
    "gambar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resep" (
    "id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "nama_resep" TEXT NOT NULL,
    "porsi_hasil" DECIMAL(15,3) NOT NULL,
    "satuan_hasil" TEXT NOT NULL,
    "catatan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resep_detail" (
    "id" TEXT NOT NULL,
    "resep_id" TEXT NOT NULL,
    "bahan_baku_id" TEXT NOT NULL,
    "qty" DECIMAL(15,3) NOT NULL,
    "satuan" TEXT NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resep_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_pembelian" (
    "id" TEXT NOT NULL,
    "nomor_po" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "diskon" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pajak" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ongkir" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "StatusPembelian" NOT NULL DEFAULT 'draft',
    "tanggal_terima" DATE,
    "catatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_pembelian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembelian_detail" (
    "id" TEXT NOT NULL,
    "pembelian_id" TEXT NOT NULL,
    "bahan_baku_id" TEXT NOT NULL,
    "qty" DECIMAL(15,3) NOT NULL,
    "satuan" TEXT NOT NULL,
    "harga_satuan" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembelian_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_produksi" (
    "id" TEXT NOT NULL,
    "nomor_produksi" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "resep_id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "qty_batch" DECIMAL(15,3) NOT NULL,
    "qty_hasil" DECIMAL(15,3) NOT NULL,
    "total_hpp" DECIMAL(15,2) NOT NULL,
    "hpp_per_unit" DECIMAL(15,2) NOT NULL,
    "status" "StatusProduksi" NOT NULL DEFAULT 'draft',
    "tanggal_selesai" DATE,
    "pre_order_id" TEXT,
    "catatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_produksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_order" (
    "id" TEXT NOT NULL,
    "nomor_po" TEXT NOT NULL,
    "tanggal_order" DATE NOT NULL,
    "tanggal_dibutuhkan" DATE NOT NULL,
    "customer_nama" TEXT NOT NULL,
    "customer_kontak" TEXT NOT NULL,
    "customer_alamat" TEXT,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "diskon" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pajak" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "dp" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "sisa_bayar" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_hpp" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_profit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "StatusPreOrder" NOT NULL DEFAULT 'pending',
    "catatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_order_detail" (
    "id" TEXT NOT NULL,
    "pre_order_id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "qty" DECIMAL(15,3) NOT NULL,
    "satuan" TEXT NOT NULL,
    "harga_satuan" DECIMAL(15,2) NOT NULL,
    "hpp_satuan" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "subtotal_hpp" DECIMAL(15,2) NOT NULL,
    "profit" DECIMAL(15,2) NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_order_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_penjualan" (
    "id" TEXT NOT NULL,
    "nomor_invoice" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "tipe" "TipePenjualan" NOT NULL DEFAULT 'regular',
    "pre_order_id" TEXT,
    "customer_nama" TEXT,
    "customer_kontak" TEXT,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "diskon" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pajak" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_hpp" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_profit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "metode_bayar" "MetodeBayar" NOT NULL,
    "status" "StatusPenjualan" NOT NULL DEFAULT 'draft',
    "catatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_penjualan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penjualan_detail" (
    "id" TEXT NOT NULL,
    "penjualan_id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "qty" DECIMAL(15,3) NOT NULL,
    "satuan" TEXT NOT NULL,
    "harga_satuan" DECIMAL(15,2) NOT NULL,
    "hpp_satuan" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "subtotal_hpp" DECIMAL(15,2) NOT NULL,
    "profit" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penjualan_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_adjustment" (
    "id" TEXT NOT NULL,
    "nomor_adjustment" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "tipe_item" "TipeItem" NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_nama" TEXT NOT NULL,
    "adjustment_type" "AdjustmentType" NOT NULL,
    "qty_before" DECIMAL(15,3) NOT NULL,
    "qty_adjustment" DECIMAL(15,3) NOT NULL,
    "qty_after" DECIMAL(15,3) NOT NULL,
    "nilai_hpp" DECIMAL(15,2) NOT NULL,
    "alasan" TEXT NOT NULL,
    "catatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_movement" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipe_item" "TipeItem" NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_nama" TEXT NOT NULL,
    "movement_type" "MovementType" NOT NULL,
    "qty" DECIMAL(15,3) NOT NULL,
    "stok_before" DECIMAL(15,3) NOT NULL,
    "stok_after" DECIMAL(15,3) NOT NULL,
    "transaksi_type" TEXT NOT NULL,
    "transaksi_id" TEXT,
    "transaksi_nomor" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_kode_key" ON "suppliers"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "bahan_baku_kode_key" ON "bahan_baku"("kode");

-- CreateIndex
CREATE INDEX "bahan_baku_supplier_id_idx" ON "bahan_baku"("supplier_id");

-- CreateIndex
CREATE INDEX "bahan_baku_status_idx" ON "bahan_baku"("status");

-- CreateIndex
CREATE UNIQUE INDEX "produk_kode_key" ON "produk"("kode");

-- CreateIndex
CREATE INDEX "produk_status_idx" ON "produk"("status");

-- CreateIndex
CREATE INDEX "resep_produk_id_idx" ON "resep"("produk_id");

-- CreateIndex
CREATE INDEX "resep_is_active_idx" ON "resep"("is_active");

-- CreateIndex
CREATE INDEX "resep_detail_resep_id_idx" ON "resep_detail"("resep_id");

-- CreateIndex
CREATE INDEX "resep_detail_bahan_baku_id_idx" ON "resep_detail"("bahan_baku_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_pembelian_nomor_po_key" ON "transaksi_pembelian"("nomor_po");

-- CreateIndex
CREATE INDEX "transaksi_pembelian_supplier_id_idx" ON "transaksi_pembelian"("supplier_id");

-- CreateIndex
CREATE INDEX "transaksi_pembelian_status_idx" ON "transaksi_pembelian"("status");

-- CreateIndex
CREATE INDEX "transaksi_pembelian_tanggal_idx" ON "transaksi_pembelian"("tanggal");

-- CreateIndex
CREATE INDEX "pembelian_detail_pembelian_id_idx" ON "pembelian_detail"("pembelian_id");

-- CreateIndex
CREATE INDEX "pembelian_detail_bahan_baku_id_idx" ON "pembelian_detail"("bahan_baku_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_produksi_nomor_produksi_key" ON "transaksi_produksi"("nomor_produksi");

-- CreateIndex
CREATE INDEX "transaksi_produksi_resep_id_idx" ON "transaksi_produksi"("resep_id");

-- CreateIndex
CREATE INDEX "transaksi_produksi_produk_id_idx" ON "transaksi_produksi"("produk_id");

-- CreateIndex
CREATE INDEX "transaksi_produksi_pre_order_id_idx" ON "transaksi_produksi"("pre_order_id");

-- CreateIndex
CREATE INDEX "transaksi_produksi_status_idx" ON "transaksi_produksi"("status");

-- CreateIndex
CREATE INDEX "transaksi_produksi_tanggal_idx" ON "transaksi_produksi"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "pre_order_nomor_po_key" ON "pre_order"("nomor_po");

-- CreateIndex
CREATE INDEX "pre_order_status_idx" ON "pre_order"("status");

-- CreateIndex
CREATE INDEX "pre_order_tanggal_order_idx" ON "pre_order"("tanggal_order");

-- CreateIndex
CREATE INDEX "pre_order_tanggal_dibutuhkan_idx" ON "pre_order"("tanggal_dibutuhkan");

-- CreateIndex
CREATE INDEX "pre_order_detail_pre_order_id_idx" ON "pre_order_detail"("pre_order_id");

-- CreateIndex
CREATE INDEX "pre_order_detail_produk_id_idx" ON "pre_order_detail"("produk_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_penjualan_nomor_invoice_key" ON "transaksi_penjualan"("nomor_invoice");

-- CreateIndex
CREATE INDEX "transaksi_penjualan_pre_order_id_idx" ON "transaksi_penjualan"("pre_order_id");

-- CreateIndex
CREATE INDEX "transaksi_penjualan_status_idx" ON "transaksi_penjualan"("status");

-- CreateIndex
CREATE INDEX "transaksi_penjualan_tanggal_idx" ON "transaksi_penjualan"("tanggal");

-- CreateIndex
CREATE INDEX "penjualan_detail_penjualan_id_idx" ON "penjualan_detail"("penjualan_id");

-- CreateIndex
CREATE INDEX "penjualan_detail_produk_id_idx" ON "penjualan_detail"("produk_id");

-- CreateIndex
CREATE UNIQUE INDEX "stok_adjustment_nomor_adjustment_key" ON "stok_adjustment"("nomor_adjustment");

-- CreateIndex
CREATE INDEX "stok_adjustment_tipe_item_item_id_idx" ON "stok_adjustment"("tipe_item", "item_id");

-- CreateIndex
CREATE INDEX "stok_adjustment_adjustment_type_idx" ON "stok_adjustment"("adjustment_type");

-- CreateIndex
CREATE INDEX "stok_adjustment_tanggal_idx" ON "stok_adjustment"("tanggal");

-- CreateIndex
CREATE INDEX "stok_movement_tipe_item_item_id_idx" ON "stok_movement"("tipe_item", "item_id");

-- CreateIndex
CREATE INDEX "stok_movement_transaksi_type_transaksi_id_idx" ON "stok_movement"("transaksi_type", "transaksi_id");

-- CreateIndex
CREATE INDEX "stok_movement_tanggal_idx" ON "stok_movement"("tanggal");

-- AddForeignKey
ALTER TABLE "bahan_baku" ADD CONSTRAINT "bahan_baku_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resep" ADD CONSTRAINT "resep_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resep_detail" ADD CONSTRAINT "resep_detail_resep_id_fkey" FOREIGN KEY ("resep_id") REFERENCES "resep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resep_detail" ADD CONSTRAINT "resep_detail_bahan_baku_id_fkey" FOREIGN KEY ("bahan_baku_id") REFERENCES "bahan_baku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_pembelian" ADD CONSTRAINT "transaksi_pembelian_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembelian_detail" ADD CONSTRAINT "pembelian_detail_pembelian_id_fkey" FOREIGN KEY ("pembelian_id") REFERENCES "transaksi_pembelian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembelian_detail" ADD CONSTRAINT "pembelian_detail_bahan_baku_id_fkey" FOREIGN KEY ("bahan_baku_id") REFERENCES "bahan_baku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_produksi" ADD CONSTRAINT "transaksi_produksi_resep_id_fkey" FOREIGN KEY ("resep_id") REFERENCES "resep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_produksi" ADD CONSTRAINT "transaksi_produksi_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_produksi" ADD CONSTRAINT "transaksi_produksi_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_order_detail" ADD CONSTRAINT "pre_order_detail_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_order_detail" ADD CONSTRAINT "pre_order_detail_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_penjualan" ADD CONSTRAINT "transaksi_penjualan_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan_detail" ADD CONSTRAINT "penjualan_detail_penjualan_id_fkey" FOREIGN KEY ("penjualan_id") REFERENCES "transaksi_penjualan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan_detail" ADD CONSTRAINT "penjualan_detail_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
