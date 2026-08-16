import React, { useState } from 'react';
import { PesertaDanaKematian, TagihanIuranDK, PemasukanDK, PengeluaranDK, KejadianKematianDK, SantunanDK } from '../../types/deathFund';
import { formatRupiah } from '../../types/finance';
import { OfficialKopSurat } from '../OfficialKopSurat';
import { DOCUMENT_BRANDING, getLetterPlace, getChairmanName } from '../../config/documentBranding';
import { 
  Printer, 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  HeartHandshake, 
  Users, 
  ShieldCheck,
  Building
} from 'lucide-react';

interface DeathFundLaporanTabProps {
  pesertaList: PesertaDanaKematian[];
  tagihanList: TagihanIuranDK[];
  pemasukanList: PemasukanDK[];
  pengeluaranList: PengeluaranDK[];
  kejadianList: KejadianKematianDK[];
  santunanList: SantunanDK[];
  saldoSaatIni: number;
}

export const DeathFundLaporanTab: React.FC<DeathFundLaporanTabProps> = ({
  pesertaList,
  tagihanList,
  pemasukanList,
  pengeluaranList,
  kejadianList,
  santunanList,
  saldoSaatIni
}) => {
  const [selectedBulan, setSelectedBulan] = useState<string>('ALL');
  const [selectedTahun, setSelectedTahun] = useState<number>(2025);

  const totalPemasukan = pemasukanList.reduce((sum, p) => sum + p.nominal, 0);
  const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + p.nominal, 0);
  const totalSantunan = santunanList.filter(s => s.status === 'DIBAYARKAN').reduce((sum, s) => sum + s.nominal, 0);
  const totalWargaAktif = pesertaList.filter(p => p.status === 'AKTIF').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['TANGGAL', 'TIPE', 'NO_TRANSAKSI', 'KATEGORI', 'URAIAN', 'NOMINAL_RUPIAH', 'PETUGAS'],
      ...pemasukanList.map(p => [p.tanggal, 'PEMASUKAN', p.nomorTransaksi, p.kategori, `"${p.keterangan || p.sumber}"`, p.nominal, p.petugas]),
      ...pengeluaranList.map(p => [p.tanggal, 'PENGELUARAN', p.nomorTransaksi, p.kategori, `"${p.keterangan || p.penerima}"`, p.nominal, p.petugas]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Dana_Kematian_RT07_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Laporan Pertanggungjawaban Dana Kematian
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan keuangan resmi periodik, transparansi kas duka, mutasi kas, dan rekapitulasi penyaluran santunan warga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-4 h-4" /> Unduh CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT CONTAINER */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Official Kop Surat */}
        <OfficialKopSurat theme="slate" />

        <div className="text-center">
          <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-full uppercase tracking-wider">
            LAPORAN KEUANGAN DAN PERTANGGUNGJAWABAN DANA KEMATIAN
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">PERIODE: TAHUN 2026</p>
        </div>

        {/* Info Ringkasan Eksekutif */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold">Saldo Kas Dana Kematian</div>
            <div className="text-lg font-black text-teal-700 mt-1">{formatRupiah(saldoSaatIni)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Posisi Kas Terkini</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-emerald-700 font-semibold">Total Pemasukan Kas</div>
            <div className="text-lg font-black text-emerald-700 mt-1">{formatRupiah(totalPemasukan)}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">{pemasukanList.length} Transaksi Kredit</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-rose-700 font-semibold">Total Pengeluaran & Santunan</div>
            <div className="text-lg font-black text-rose-700 mt-1">{formatRupiah(totalPengeluaran)}</div>
            <div className="text-[10px] text-rose-600 mt-0.5">{pengeluaranList.length} Transaksi Debet</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold">Partisipasi Warga</div>
            <div className="text-lg font-black text-slate-800 mt-1">{totalWargaAktif} / {pesertaList.length} KK</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Kepesertaan Aktif RT 07</div>
          </div>
        </div>

        {/* Section: Rekapitulasi Santunan */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-600" /> Rekapitulasi Kejadian Duka Cita & Penyaluran Santunan
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2 border border-slate-200">Tgl Wafat</th>
                  <th className="p-2 border border-slate-200">Nama Almarhum</th>
                  <th className="p-2 border border-slate-200">Keluarga Terkait</th>
                  <th className="p-2 border border-slate-200">Penerima Santunan</th>
                  <th className="p-2 border border-slate-200 text-right">Nominal Santunan</th>
                  <th className="p-2 border border-slate-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {santunanList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">
                      Belum ada catatan penyaluran santunan.
                    </td>
                  </tr>
                ) : (
                  santunanList.map((s) => (
                    <tr key={s.idSantunan}>
                      <td className="p-2 border border-slate-200 font-medium text-slate-600">{s.tanggal}</td>
                      <td className="p-2 border border-slate-200 font-bold text-slate-800">{s.namaAlmarhum}</td>
                      <td className="p-2 border border-slate-200 text-slate-700">{s.namaKepalaKeluarga}</td>
                      <td className="p-2 border border-slate-200 text-slate-700">{s.namaPenerima} ({s.hubunganPenerima})</td>
                      <td className="p-2 border border-slate-200 text-right font-bold text-rose-700">{formatRupiah(s.nominal)}</td>
                      <td className="p-2 border border-slate-200 text-center">
                        <span className="font-bold text-[10px] text-emerald-700">{s.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Rekap Mutasi Terbaru */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Rincian Mutasi Arus Kas Terakhir
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2 border border-slate-200">Tanggal</th>
                  <th className="p-2 border border-slate-200">No. Bukti</th>
                  <th className="p-2 border border-slate-200">Uraian / Keterangan</th>
                  <th className="p-2 border border-slate-200 text-right">Pemasukan (Rp)</th>
                  <th className="p-2 border border-slate-200 text-right">Pengeluaran (Rp)</th>
                  <th className="p-2 border border-slate-200 text-center">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pemasukanList.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td className="p-2 border border-slate-200">{p.tanggal}</td>
                    <td className="p-2 border border-slate-200 font-mono text-[11px]">{p.nomorTransaksi}</td>
                    <td className="p-2 border border-slate-200">{p.keterangan || p.sumber}</td>
                    <td className="p-2 border border-slate-200 text-right font-bold text-emerald-600">+{formatRupiah(p.nominal)}</td>
                    <td className="p-2 border border-slate-200 text-right text-slate-400">-</td>
                    <td className="p-2 border border-slate-200 text-center">{p.petugas}</td>
                  </tr>
                ))}
                {pengeluaranList.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td className="p-2 border border-slate-200">{p.tanggal}</td>
                    <td className="p-2 border border-slate-200 font-mono text-[11px]">{p.nomorTransaksi}</td>
                    <td className="p-2 border border-slate-200">{p.keterangan || p.penerima}</td>
                    <td className="p-2 border border-slate-200 text-right text-slate-400">-</td>
                    <td className="p-2 border border-slate-200 text-right font-bold text-rose-600">-{formatRupiah(p.nominal)}</td>
                    <td className="p-2 border border-slate-200 text-center">{p.petugas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tanda Tangan Pengurus */}
        <div className="pt-8 grid grid-cols-3 text-center text-xs gap-4 text-slate-900">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800 mt-0.5">{DOCUMENT_BRANDING.chairmanTitle}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                [Tervalidasi Digital]
              </span>
            </div>
            <p className="font-bold text-slate-900 underline">{getChairmanName()}</p>
            <p className="text-[10px] text-slate-400">{DOCUMENT_BRANDING.chairmanTitle}</p>
          </div>

          <div>
            <p className="text-slate-500">Diperiksa oleh,</p>
            <p className="font-bold text-slate-800 mt-0.5">Seksi Kematian & Sosial</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                [Tervalidasi Digital]
              </span>
            </div>
            <p className="font-bold text-slate-900 underline">Bpk. Budi Hermanto</p>
            <p className="text-[10px] text-slate-400">Koordinator Sie Kematian</p>
          </div>

          <div>
            <p className="text-slate-500">{getLetterPlace()}, 15 Agustus 2026</p>
            <p className="font-bold text-slate-800 mt-0.5">Bendahara Dana Kematian</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                [Tervalidasi Digital]
              </span>
            </div>
            <p className="font-bold text-slate-900 underline">Ibu Siti Rahayu</p>
            <p className="text-[10px] text-slate-400">Bendahara Kas RT 07</p>
          </div>
        </div>
      </div>
    </div>
  );
};
