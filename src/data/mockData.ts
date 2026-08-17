import {
  Warga,
  Keluarga,
  PemilikRumah,
  SuratPengantar,
  TransaksiKeuangan,
  TagihanIuran,
  Pengaduan,
  Pengumuman,
  AgendaKegiatan,
  Pengurus,
  AuditLog
} from '../types/rt';

export const INITIAL_PEMILIK_RUMAH: PemilikRumah[] = [
  {
    pemilikRumahId: 'OWN-001',
    namaPemilik: 'H. Sudarsono',
    nomorTelepon: '081299887766',
    blokRumah: 'Blok C-12',
    statusKepemilikan: 'KONTRAKAN',
    createdAt: '2020-01-10T08:00:00.000Z'
  },
  {
    pemilikRumahId: 'OWN-002',
    namaPemilik: 'Hj. Mardiah',
    nomorTelepon: '081322334455',
    blokRumah: 'Blok C-14',
    statusKepemilikan: 'KOS',
    createdAt: '2021-03-15T09:30:00.000Z'
  }
];

export const INITIAL_WARGA: Warga[] = [
  {
    id_warga: 'WRG-001',
    wargaId: 'WRG-001',
    nik: '3507121508820001',
    no_kk: '3507120101150001',
    nomorKK: '3507120101150001',
    keluargaId: 'KK-001',
    nama_lengkap: 'Bambang Sugianto, S.T.',
    tempat_lahir: 'Malang',
    tanggal_lahir: '1982-08-15',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S1 Teknik',
    pekerjaan: 'Pegawai Swasta',
    no_hp: '081234567890',
    email: 'bambang.sugianto@gmail.com',
    alamat: 'Perum GPA Ngijo Blok C-07',
    blok: 'Blok C-07',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    statusWarga: 'TETAP',
    hubunganKeluarga: 'KEPALA_KELUARGA',
    tanggal_masuk: '2015-03-10',
    keterangan: 'Ketua RT 07'
  },
  {
    id_warga: 'WRG-002',
    wargaId: 'WRG-002',
    nik: '3507125204850002',
    no_kk: '3507120101150001',
    nomorKK: '3507120101150001',
    keluargaId: 'KK-001',
    nama_lengkap: 'Siti Rahmawati, S.Pd.',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '1985-04-12',
    jenis_kelamin: 'Perempuan',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S1 Pendidikan',
    pekerjaan: 'Guru',
    no_hp: '081298765432',
    email: 'siti.rahmawati@gmail.com',
    alamat: 'Perum GPA Ngijo Blok C-07',
    blok: 'Blok C-07',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    statusWarga: 'TETAP',
    hubunganKeluarga: 'ISTRI',
    tanggal_masuk: '2015-03-10'
  },
  {
    id_warga: 'WRG-003',
    wargaId: 'WRG-003',
    nik: '3507121011900003',
    no_kk: '3507120102180002',
    nomorKK: '3507120102180002',
    keluargaId: 'KK-002',
    nama_lengkap: 'Dr. Agus Hermawan',
    tempat_lahir: 'Kediri',
    tanggal_lahir: '1990-11-10',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S2 Kedokteran',
    pekerjaan: 'Dokter / Dosen',
    no_hp: '081345678912',
    email: 'agus.hermawan@gmail.com',
    alamat: 'Perum GPA Ngijo Blok C-08',
    blok: 'Blok C-08',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    statusWarga: 'TETAP',
    hubunganKeluarga: 'KEPALA_KELUARGA',
    tanggal_masuk: '2018-06-01',
    keterangan: 'Seksi Kesehatan & Sosial'
  },
  {
    id_warga: 'WRG-004',
    wargaId: 'WRG-004',
    nik: '3507122005930004',
    no_kk: '3507120103200003',
    nomorKK: '3507120103200003',
    keluargaId: 'KK-003',
    nama_lengkap: 'Hendrik Prasetyo',
    tempat_lahir: 'Blitar',
    tanggal_lahir: '1993-05-20',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Kawin',
    agama: 'Kristen',
    pendidikan: 'D3 Informatika',
    pekerjaan: 'Wirausaha / IT',
    no_hp: '081567890123',
    email: 'hendrik.p@gmail.com',
    alamat: 'Perum GPA Ngijo Blok C-12',
    blok: 'Blok C-12',
    rt: '07',
    rw: '11',
    status_warga: 'Kontrak',
    statusWarga: 'KONTRAK_SEWA',
    hubunganKeluarga: 'PENYEWA',
    namaPemilikRumah: 'H. Sudarsono',
    teleponPemilikRumah: '081299887766',
    tanggal_masuk: '2020-01-15'
  },
  {
    id_warga: 'WRG-005',
    wargaId: 'WRG-005',
    nik: '3507120809880005',
    no_kk: '3507120104190004',
    nomorKK: '3507120104190004',
    keluargaId: 'KK-004',
    nama_lengkap: 'Eko Nurcahyo',
    tempat_lahir: 'Malang',
    tanggal_lahir: '1988-09-08',
    jenis_kelamin: 'Laki-Laki',
    status_perkawinan: 'Kawin',
    agama: 'Islam',
    pendidikan: 'S1 Ekonomi',
    pekerjaan: 'Sekretaris / BUMN',
    no_hp: '081789012345',
    email: 'eko.nurcahyo@gmail.com',
    alamat: 'Perum GPA Ngijo Blok C-05',
    blok: 'Blok C-05',
    rt: '07',
    rw: '11',
    status_warga: 'Tetap',
    statusWarga: 'TETAP',
    hubunganKeluarga: 'KEPALA_KELUARGA',
    tanggal_masuk: '2017-09-10',
    keterangan: 'Sekretaris RT 07'
  }
];

export const INITIAL_KELUARGA: Keluarga[] = [
  {
    id_kk: 'KK-001',
    keluargaId: 'KK-001',
    no_kk: '3507120101150001',
    nomorKK: '3507120101150001',
    nama_kepala_keluarga: 'Bambang Sugianto, S.T.',
    kepalaKeluargaWargaId: 'WRG-001',
    alamat: 'Perum GPA Ngijo Blok C-07',
    blok: 'Blok C-07',
    jumlah_anggota: 4,
    status_rumah: 'Milik Sendiri',
    statusKeluarga: 'AKTIF',
    no_hp: '081234567890',
    keterangan: 'Aktif'
  },
  {
    id_kk: 'KK-002',
    keluargaId: 'KK-002',
    no_kk: '3507120102180002',
    nomorKK: '3507120102180002',
    nama_kepala_keluarga: 'Dr. Agus Hermawan',
    kepalaKeluargaWargaId: 'WRG-003',
    alamat: 'Perum GPA Ngijo Blok C-08',
    blok: 'Blok C-08',
    jumlah_anggota: 3,
    status_rumah: 'Milik Sendiri',
    statusKeluarga: 'AKTIF',
    no_hp: '081345678912',
    keterangan: 'Aktif'
  },
  {
    id_kk: 'KK-003',
    keluargaId: 'KK-003',
    no_kk: '3507120103200003',
    nomorKK: '3507120103200003',
    nama_kepala_keluarga: 'Hendrik Prasetyo',
    kepalaKeluargaWargaId: 'WRG-004',
    alamat: 'Perum GPA Ngijo Blok C-12',
    blok: 'Blok C-12',
    jumlah_anggota: 2,
    status_rumah: 'Sewa / Kontrak',
    statusKeluarga: 'AKTIF',
    no_hp: '081567890123',
    keterangan: 'Kontrak 2 Tahun'
  },
  {
    id_kk: 'KK-004',
    keluargaId: 'KK-004',
    no_kk: '3507120104190004',
    nomorKK: '3507120104190004',
    nama_kepala_keluarga: 'Eko Nurcahyo',
    kepalaKeluargaWargaId: 'WRG-005',
    alamat: 'Perum GPA Ngijo Blok C-05',
    blok: 'Blok C-05',
    jumlah_anggota: 4,
    status_rumah: 'Milik Sendiri',
    statusKeluarga: 'AKTIF',
    no_hp: '081789012345',
    keterangan: 'Aktif'
  }
];

export const INITIAL_SURAT: SuratPengantar[] = [
  {
    id_surat: 'SRT-2026-0001',
    nomor_surat: '001/RT07-RW11/VIII/2026',
    jenis_surat: 'Surat Domisili',
    id_warga: 'WRG-004',
    nama_pemohon: 'Hendrik Prasetyo',
    nik_pemohon: '3507122005930004',
    no_kk: '3507120103200003',
    blok_rumah: 'Blok C-12',
    keperluan: 'Persyaratan Pembukaan Rekening Bank & Administrasi Pekerjaan',
    tanggal_pengajuan: '2026-08-01',
    tanggal_disetujui: '2026-08-02',
    status: 'SELESAI',
    catatan_admin: 'Dokumen lengkap, disetujui Ketua RT.',
    qr_code_hash: 'VERIFY-SRT-001-GPA0711',
    pdf_drive_url: 'https://drive.google.com/file/d/sample-surat-domisili-001'
  },
  {
    id_surat: 'SRT-2026-0002',
    nomor_surat: '002/RT07-RW11/VIII/2026',
    jenis_surat: 'Surat Pengantar SKCK',
    id_warga: 'WRG-003',
    nama_pemohon: 'Dr. Agus Hermawan',
    nik_pemohon: '3507121011900003',
    no_kk: '3507120102180002',
    blok_rumah: 'Blok C-08',
    keperluan: 'Permohonan Penerbitan SKCK Polres Malang',
    tanggal_pengajuan: '2026-08-05',
    status: 'MENUNGGU PERSETUJUAN',
    catatan_admin: 'Telah diverifikasi Sekretaris RT.',
    qr_code_hash: 'VERIFY-SRT-002-GPA0711'
  }
];

export const INITIAL_TRANSAKSI: TransaksiKeuangan[] = [
  {
    id_transaksi: 'TRX-2026-001',
    tanggal: '2026-08-01',
    jenis: 'Pemasukan',
    kategori: 'Iuran Warga',
    keterangan: 'Penerimaan Iuran Bulanan 45 KK periode Agustus 2026',
    pemasukan: 2250000,
    pengeluaran: 0,
    saldo_berjalan: 18450000,
    petugas: 'Bendahara RT (Ibu Anisa)'
  },
  {
    id_transaksi: 'TRX-2026-002',
    tanggal: '2026-08-03',
    jenis: 'Pengeluaran',
    kategori: 'Kebersihan & Sampah',
    keterangan: 'Honor Petugas Kebersihan & Pengangkutan Sampah Lingkungan',
    pemasukan: 0,
    pengeluaran: 850000,
    saldo_berjalan: 17600000,
    petugas: 'Bendahara RT (Ibu Anisa)'
  },
  {
    id_transaksi: 'TRX-2026-003',
    tanggal: '2026-08-05',
    jenis: 'Pengeluaran',
    kategori: 'Perbaikan Infrastruktur',
    keterangan: 'Pembelian 5 Lampu LED Pos Kamling & Kabel Penerangan Jalan Blok C',
    pemasukan: 0,
    pengeluaran: 320000,
    saldo_berjalan: 17280000,
    petugas: 'Seksi Keamanan & Infrastruktur'
  },
  {
    id_transaksi: 'TRX-2026-004',
    tanggal: '2026-08-07',
    jenis: 'Pemasukan',
    kategori: 'Sumbangan',
    keterangan: 'Sumbangan Kas Sukarela HLM HUT RI ke-81 dari Warga Blok C',
    pemasukan: 1500000,
    pengeluaran: 0,
    saldo_berjalan: 18780000,
    petugas: 'Panitia HUT RI RT 07'
  }
];

export const INITIAL_IURAN: TagihanIuran[] = [
  {
    id_iuran: 'IRN-202608-001',
    bulan_tahun: 'Agustus 2026',
    id_kk: 'KK-001',
    nama_kepala_keluarga: 'Bambang Sugianto, S.T.',
    blok: 'Blok C-07',
    nominal_tagihan: 50000,
    nominal_dibayar: 50000,
    tanggal_bayar: '2026-08-01',
    status: 'LUNAS',
    metode_bayar: 'QRIS RT'
  },
  {
    id_iuran: 'IRN-202608-002',
    bulan_tahun: 'Agustus 2026',
    id_kk: 'KK-002',
    nama_kepala_keluarga: 'Dr. Agus Hermawan',
    blok: 'Blok C-08',
    nominal_tagihan: 50000,
    nominal_dibayar: 50000,
    tanggal_bayar: '2026-08-02',
    status: 'LUNAS',
    metode_bayar: 'Transfer Bank'
  },
  {
    id_iuran: 'IRN-202608-003',
    bulan_tahun: 'Agustus 2026',
    id_kk: 'KK-003',
    nama_kepala_keluarga: 'Hendrik Prasetyo',
    blok: 'Blok C-12',
    nominal_tagihan: 50000,
    nominal_dibayar: 0,
    status: 'BELUM LUNAS'
  },
  {
    id_iuran: 'IRN-202608-004',
    bulan_tahun: 'Agustus 2026',
    id_kk: 'KK-004',
    nama_kepala_keluarga: 'Eko Nurcahyo',
    blok: 'Blok C-05',
    nominal_tagihan: 50000,
    nominal_dibayar: 50000,
    tanggal_bayar: '2026-08-01',
    status: 'LUNAS',
    metode_bayar: 'Tunai / Petugas'
  }
];

export const INITIAL_PENGADUAN: Pengaduan[] = [
  {
    id_pengaduan: 'ADU-001',
    nomor_tiket: 'ADU-2026-0001',
    nama_pelapor: 'Ahmad Dahlan (Blok C-10)',
    no_hp: '081299887766',
    kategori: 'Lampu jalan',
    lokasi: 'Pertigaan Pos Kamling Utama Blok C',
    deskripsi: 'Lampu jalan utama mati sejak 2 hari lalu, kondisi gelap saat malam hari.',
    tanggal: '2026-08-06',
    status: 'DIPROSES',
    tanggapan_admin: 'Sudah dibelikan bohlam LED baru oleh Seksi Infrastruktur, dijadwalkan pasang sore ini.'
  },
  {
    id_pengaduan: 'ADU-002',
    nomor_tiket: 'ADU-2026-0002',
    nama_pelapor: 'Ibu Rahayu (Blok C-03)',
    no_hp: '081377665544',
    kategori: 'Kebersihan',
    lokasi: 'Taman Depan Blok C',
    deskripsi: 'Ada dahan pohon peneduh yang rapuh dan menutupi kabel listrik.',
    tanggal: '2026-08-07',
    status: 'BARU'
  }
];

export const INITIAL_PENGUMUMAN: Pengumuman[] = [
  {
    id_pengumuman: 'PGM-001',
    judul: 'Kerja Bakti & Kerja Bersama Persiapan Peringatan HUT RI Ke-81',
    isi: 'Diberitahukan kepada seluruh warga RT 07 RW 11 Perum GPA Ngijo bahwa akan dilaksanakan Kerja Bakti lingkungan dalam rangka pemasangan bendera, umbul-umbul, dan pengecatan gapura pada Minggu, 10 Agustus 2026 Pukul 06.30 WIB.',
    tanggal: '2026-08-04',
    kategori: 'Kegiatan',
    status: 'PUBLISHED',
    penulis: 'Pengurus RT 07'
  },
  {
    id_pengumuman: 'PGM-002',
    judul: 'Digitalisasi Layanan Administrasi RT 07 Melalui SMART RT App',
    isi: 'Kini pengurusan Surat Pengantar KTP, KK, Domisili, dan Pengaduan Lingkungan dapat dilakukan secara praktis melalui Portal Digital SMART RT. Warga dapat mengajukan layanan kapan saja dari HP.',
    tanggal: '2026-08-01',
    kategori: 'Administrasi',
    status: 'PUBLISHED',
    penulis: 'Sekretariat RT'
  }
];

export const INITIAL_AGENDA: AgendaKegiatan[] = [
  {
    id_agenda: 'AGD-001',
    judul: 'Kerja Bakti Pemasangan Umbul-Umbul HUT RI',
    tanggal: '2026-08-10',
    jam: '06:30 - 10:00 WIB',
    lokasi: 'Pos Kamling & Gapura Blok C RT 07',
    deskripsi: 'Pemasangan hiasan Merah Putih, pembersihan selokan, dan perapian taman.',
    penanggung_jawab: 'Seksi Lingkungan (Bpk. Mulyono)',
    kategori: 'Gotong Royong'
  },
  {
    id_agenda: 'AGD-002',
    judul: 'Rapat Bulanan Pengurus & Warga RT 07',
    tanggal: '2026-08-15',
    jam: '19:30 - 21:30 WIB',
    lokasi: 'Balai Warga / Pos Kamling RT 07',
    deskripsi: 'Pembahasan Laporan Keuangan Bulan Juli-Agustus dan Pembentukan Panitia Jalan Sehat.',
    penanggung_jawab: 'Ketua RT 07 (Bpk. Eko Sucahyono)',
    kategori: 'Rapat RT'
  },
  {
    id_agenda: 'AGD-003',
    judul: 'Malam Tirakatan & Puncak Peringatan 17 Agustus',
    tanggal: '2026-08-16',
    jam: '19:00 - Selesai',
    lokasi: 'Lapangan Serbaguna RT 07',
    deskripsi: 'Doa bersama, pemotongan tumpeng, pemutaran film dokumenter, dan ramah tamah warga.',
    penanggung_jawab: 'Panitia HUT RI RT 07',
    kategori: 'Kegiatan Sosial'
  }
];

export const INITIAL_PENGURUS: Pengurus[] = [
  {
    id_pengurus: 'PGR-01',
    nama: 'Eko Sucahyono',
    jabatan: 'Ketua RT 07',
    no_hp: '081234567890',
    email: 'rt07rw11.gpa@gmail.com',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    periode: '2025 - 2028',
    blok: 'Blok C-07'
  },
  {
    id_pengurus: 'PGR-02',
    nama: 'Eko Nurcahyo',
    jabatan: 'Sekretaris RT',
    no_hp: '081789012345',
    email: 'sekretaris.rt07@gmail.com',
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    periode: '2025 - 2028',
    blok: 'Blok C-05'
  },
  {
    id_pengurus: 'PGR-03',
    nama: 'Ibu Anisa Wulandari',
    jabatan: 'Bendahara RT',
    no_hp: '081233445566',
    email: 'bendahara.rt07@gmail.com',
    foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    periode: '2025 - 2028',
    blok: 'Blok C-02'
  },
  {
    id_pengurus: 'PGR-04',
    nama: 'Dr. Agus Hermawan',
    jabatan: 'Seksi Kesehatan & Sosial',
    no_hp: '081345678912',
    email: 'sosial.rt07@gmail.com',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    periode: '2025 - 2028',
    blok: 'Blok C-08'
  },
  {
    id_pengurus: 'PGR-05',
    nama: 'Mulyono',
    jabatan: 'Seksi Keamanan & Lingkungan',
    no_hp: '081890123456',
    email: 'keamanan.rt07@gmail.com',
    foto_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    periode: '2025 - 2028',
    blok: 'Blok C-15'
  }
];

export const INITIAL_AUDIT_LOG: AuditLog[] = [
  {
    id_log: 'LOG-001',
    timestamp: '2026-08-08 09:15:00',
    user: 'Ketua RT (Eko Sucahyono)',
    action: 'APPROVE_SURAT',
    module: 'Administrasi Surat',
    record_id: 'SRT-2026-0001',
    status: 'SUCCESS',
    description: 'Menyetujui Surat Domisili an. Hendrik Prasetyo dan menerbitkan PDF.'
  },
  {
    id_log: 'LOG-002',
    timestamp: '2026-08-07 14:22:10',
    user: 'Bendahara RT (Anisa)',
    action: 'CREATE_TRANSAKSI',
    module: 'Keuangan',
    record_id: 'TRX-2026-004',
    status: 'SUCCESS',
    description: 'Mencatat pemasukan sumbangan HUT RI Rp 1.500.000.'
  },
  {
    id_log: 'LOG-003',
    timestamp: '2026-08-06 18:40:05',
    user: 'Warga Public',
    action: 'SUBMIT_PENGADUAN',
    module: 'Pengaduan Warga',
    record_id: 'ADU-2026-0001',
    status: 'SUCCESS',
    description: 'Membuat tiket pengaduan lampu jalan mati di Blok C.'
  }
];
