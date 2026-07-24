export interface Produk {
  id_produk: string;
  nama_produk: string;
  modal_produk: number;
  harga_produk: number;
  diskon_produk: number;
  stok_produk: number;
}

export interface KeranjangItem {
  id_produk: string;
  qty: number;
}

export interface Penjualan {
  id_transaksi: number;
  id_produk: string;
  nama_produk: string;
  harga_produk: number;
  diskon_produk: number;
  modal_produk: number;
  qty: number;
}

export interface Transaksi {
  id_transaksi: number;
  tanggal: string;
  total: number;
  total_awal: number;
  bayar: number;
}

export interface Toko {
  nama_toko: string;
  alamat_toko: string;
  pemilik_toko: string;
}
