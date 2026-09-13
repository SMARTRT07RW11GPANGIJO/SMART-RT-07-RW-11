import React from 'react';
import { 
  Users, 
  Home, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Baby,
  Building2,
  PhoneCall
} from 'lucide-react';
import { 
  DashboardCalculationResult, 
  DashboardData 
} from '../../dashboard/calculationTypes';

interface OfficialMetricsViewProps {
  calculationResult: DashboardCalculationResult;
  onResetFilter: () => void;
}

export const OfficialMetricsView: React.FC<OfficialMetricsViewProps> = ({
  calculationResult,
  onResetFilter
}) => {
  if (calculationResult.status === 'calculation_error') {
    return (
      <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-3xl text-rose-900 space-y-3">
        <div className="flex items-center gap-2 text-base font-black text-rose-700">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Kesalahan Perhitungan Calculation Engine [{calculationResult.error.stage}]</span>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed">
          {calculationResult.error.message}
        </p>
        <p className="text-[11px] text-rose-600 italic">
          Sesuai aturan SSoT, sistem tidak menampilkan data fallback, dummy, atau angka perkiraan saat terjadi kesalahan kalkulasi.
        </p>
      </div>
    );
  }

  if (calculationResult.status === 'empty') {
    const totalWargaAktif = calculationResult.data.summary.totalWargaAktif;
    return (
      <div className="p-8 bg-amber-50/70 border border-amber-200 rounded-3xl text-amber-900 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h4 className="font-black text-base text-amber-900">
            Tidak Ada Warga Aktif Sesuai Kriteria Filter
          </h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            Menampilkan <strong>0</strong> warga aktif dari total <strong>{totalWargaAktif}</strong> warga aktif SSoT RT 07.
          </p>
        </div>
        <div>
          <button
            onClick={onResetFilter}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Semua Filter ke Default (ALL)
          </button>
        </div>
      </div>
    );
  }

  const data: DashboardData = calculationResult.data;
  const { summary, domisili, demografi, usia, pendidikan, pekerjaan, blok, keluarga, nonTetap } = data;

  const renderPercentage = (formatted?: string, pct?: number | null) => {
    if (formatted) return formatted;
    if (pct === null || pct === undefined) return '— / Tidak tersedia';
    return `${pct.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Context Banner: Menampilkan X warga aktif dari Y warga aktif */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#123B5D] text-white">
              Official SSoT Metrics
            </span>
            <span className="text-xs font-bold text-slate-700">
              Menampilkan {summary.totalWargaTerfilter} warga aktif dari {summary.totalWargaAktif} warga aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Terhubung ke Calculation Engine resmi. Perhitungan berbasis data aktif tanpa PII.
          </p>
        </div>

        {summary.totalFilterAktif > 0 && (
          <button
            onClick={onResetFilter}
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset {summary.totalFilterAktif} Filter Aktif
          </button>
        )}
      </div>

      {/* Grid 1: Demografi & Domisili SSoT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Status Domisili (STATUS_TINGGAL) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#123B5D]" />
              <h4 className="font-bold text-sm text-[#123B5D]">Status Tempat Tinggal (Domisili)</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Basis: STATUS_TINGGAL
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Warga Tetap', cat: domisili.categories.TETAP, color: 'bg-emerald-600' },
              { label: 'Kontrak / Sewa', cat: domisili.categories.KONTRAK_SEWA, color: 'bg-amber-500' },
              { label: 'Kos', cat: domisili.categories.KOS, color: 'bg-rose-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">
                    {item.cat.count} Jiwa{' '}
                    <span className="text-slate-400 font-normal">
                      ({renderPercentage(item.cat.formattedPercentage, item.cat.percentage)})
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(0, item.cat.percentage ?? 0))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jenis Kelamin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E7D52]" />
              <h4 className="font-bold text-sm text-[#123B5D]">Komposisi Gender</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Total Valid: {demografi.totalValid}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-sky-50/70 border border-sky-100 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-sky-700 uppercase block">Laki-Laki (L)</span>
              <span className="text-xl font-black text-sky-900 block">
                {demografi.gender.L.count} Jiwa
              </span>
              <span className="text-xs font-semibold text-sky-600 block">
                {renderPercentage(demografi.gender.L.formattedPercentage, demografi.gender.L.percentage)}
              </span>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">Perempuan (P)</span>
              <span className="text-xl font-black text-rose-900 block">
                {demografi.gender.P.count} Jiwa
              </span>
              <span className="text-xs font-semibold text-rose-600 block">
                {renderPercentage(demografi.gender.P.formattedPercentage, demografi.gender.P.percentage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Kelompok Usia BPS & Kohor Posyandu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Usia BPS U1-U5 */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-sm text-[#123B5D]">Kelompok Usia (Klasifikasi BPS)</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Tanggal Lahir Dinamis
            </span>
          </div>
          <div className="space-y-2">
            {[
              { id: 'U1', label: 'U1 Anak (0-12 th)', cat: usia.groups.U1 },
              { id: 'U2', label: 'U2 Remaja (13-17 th)', cat: usia.groups.U2 },
              { id: 'U3', label: 'U3 Dewasa Muda (18-29 th)', cat: usia.groups.U3 },
              { id: 'U4', label: 'U4 Dewasa (30-59 th)', cat: usia.groups.U4 },
              { id: 'U5', label: 'U5 Lansia (≥60 th)', cat: usia.groups.U5 },
            ].map((u) => (
              <div key={u.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-700">{u.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{u.cat.count} Jiwa</span>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md min-w-[50px] text-right">
                    {renderPercentage(u.cat.formattedPercentage, u.cat.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {usia.invalidOrMissingCount > 0 && (
            <p className="text-[10px] text-amber-600 italic pt-1">
              * Terdapat {usia.invalidOrMissingCount} warga dengan tanggal lahir belum valid/terisi.
            </p>
          )}
        </div>

        {/* Kohor Posyandu */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Baby className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-sm text-[#123B5D]">Kohor Posyandu Balita & Anak</h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Kesehatan
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Bayi (<1 th)', cat: usia.posyandu.bayi },
              { label: 'Batita (1-<3 th)', cat: usia.posyandu.batita },
              { label: 'Balita (3-<5 th)', cat: usia.posyandu.balita },
              { label: 'Total Balita (<5 th)', cat: usia.posyandu.balitaTotal, highlight: true },
              { label: 'Anak (5-12 th)', cat: usia.posyandu.anak },
            ].map((p) => (
              <div
                key={p.label}
                className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl ${
                  p.highlight ? 'bg-emerald-50 font-bold text-emerald-900 border border-emerald-200' : 'text-slate-700'
                }`}
              >
                <span>{p.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{p.cat.count} Jiwa</span>
                  <span className="text-[10px] text-slate-500">
                    ({renderPercentage(p.cat.formattedPercentage, p.cat.percentage)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 3: Pendidikan & Pekerjaan (P1–P13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pendidikan (10 Kategori Resmi) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#123B5D]" />
              <h4 className="font-bold text-sm text-[#123B5D]">Jenjang Pendidikan Resmi</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              10 Kategori SSoT
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {[
              { id: 'SD', label: 'SD', cat: pendidikan.categories.SD },
              { id: 'SMP', label: 'SMP', cat: pendidikan.categories.SMP },
              { id: 'SMA_SMK', label: 'SMA / SMK', cat: pendidikan.categories['SMA/SMK'] },
              { id: 'D1', label: 'Diploma 1 (D1)', cat: pendidikan.categories.D1 },
              { id: 'D2', label: 'Diploma 2 (D2)', cat: pendidikan.categories.D2 },
              { id: 'D3', label: 'Diploma 3 (D3)', cat: pendidikan.categories.D3 },
              { id: 'D4', label: 'Diploma 4 (D4)', cat: pendidikan.categories.D4 },
              { id: 'S1', label: 'Sarjana (S1)', cat: pendidikan.categories.S1 },
              { id: 'S2', label: 'Magister (S2)', cat: pendidikan.categories.S2 },
              { id: 'S3', label: 'Doktor (S3)', cat: pendidikan.categories.S3 },
            ].map((ped) => (
              <div key={ped.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-500 block truncate">{ped.label}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-800">{ped.cat.count}</span>
                  <span className="text-[10px] font-semibold text-[#123B5D]">
                    {renderPercentage(ped.cat.formattedPercentage, ped.cat.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {pendidikan.belumTerisiCount > 0 && (
            <p className="text-[10px] text-slate-400 italic pt-1">
              * {pendidikan.belumTerisiCount} data pendidikan belum terisi (dikecualikan dari penyebut persentase).
            </p>
          )}
        </div>

        {/* Pekerjaan P1-P13 */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-sm text-[#123B5D]">Klasifikasi Pekerjaan (P1–P13)</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Standar SSoT RT
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {[
              { id: 'P1', label: 'Pelajar/Mahasiswa', cat: pekerjaan.categories.P1 },
              { id: 'P2', label: 'PNS/ASN', cat: pekerjaan.categories.P2 },
              { id: 'P3', label: 'TNI/Polri', cat: pekerjaan.categories.P3 },
              { id: 'P4', label: 'Karyawan/Pegawai Swasta', cat: pekerjaan.categories.P4 },
              { id: 'P5', label: 'Wiraswasta/Pengusaha', cat: pekerjaan.categories.P5 },
              { id: 'P6', label: 'Profesional', cat: pekerjaan.categories.P6 },
              { id: 'P7', label: 'Pedagang', cat: pekerjaan.categories.P7 },
              { id: 'P8', label: 'Petani/Peternak/Nelayan', cat: pekerjaan.categories.P8 },
              { id: 'P9', label: 'Ibu Rumah Tangga', cat: pekerjaan.categories.P9 },
              { id: 'P10', label: 'Pekerja Harian/Buruh', cat: pekerjaan.categories.P10 },
              { id: 'P11', label: 'Pensiunan', cat: pekerjaan.categories.P11 },
              { id: 'P12', label: 'Tidak Bekerja', cat: pekerjaan.categories.P12 },
              { id: 'P13', label: 'Lainnya/Belum Terklasifikasi', cat: pekerjaan.categories.P13 },
            ].map((pek) => (
              <div key={pek.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-500 block truncate" title={`${pek.id} · ${pek.label}`}>
                  <span className="font-bold text-slate-700">{pek.id}</span> · {pek.label}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-800">{pek.cat.count}</span>
                  <span className="text-[10px] font-semibold text-amber-700">
                    {renderPercentage(pek.cat.formattedPercentage, pek.cat.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 4: Sebaran Blok & Data Warga Non-Tetap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sebaran Wilayah / Blok */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2E7D52]" />
              <h4 className="font-bold text-sm text-[#123B5D]">Sebaran Wilayah Blok</h4>
            </div>
            <span className="text-[10px] font-bold text-[#2E7D52] bg-emerald-50 px-2 py-0.5 rounded-full">
              {blok.totalBlok} Blok Aktif
            </span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {Object.entries(blok.distribution).map(([blockName, bData]) => (
              <div key={blockName} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-700">Blok {blockName}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{bData.count} Jiwa</span>
                  <span className="text-[10px] text-slate-500 min-w-[45px] text-right">
                    {renderPercentage(bData.formattedPercentage, bData.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warga Non-Tetap & Audit Kelengkapan Kontak Pemilik */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-purple-600" />
              <h4 className="font-bold text-sm text-[#123B5D]">Warga Non-Tetap & Audit Pemilik Hunian</h4>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {nonTetap.totalNonTetap} Warga Non-Tetap
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-purple-700 uppercase block">Kontrak / Sewa</span>
              <span className="text-lg font-black text-purple-900 block">{nonTetap.kontrakSewa.count} Jiwa</span>
              <span className="text-[10px] text-purple-600">
                {renderPercentage(nonTetap.kontrakSewa.formattedPercentage, nonTetap.kontrakSewa.percentage)}
              </span>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Kos</span>
              <span className="text-lg font-black text-amber-900 block">{nonTetap.kos.count} Jiwa</span>
              <span className="text-[10px] text-amber-600">
                {renderPercentage(nonTetap.kos.formattedPercentage, nonTetap.kos.percentage)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Rerata Anggota / KK</span>
              <span className="text-lg font-black text-[#123B5D] block">{keluarga.averageMembersPerKK}</span>
              <span className="text-[10px] text-slate-500">Dari {keluarga.totalKK} KK Warga</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Audit Kelengkapan Kontak Pemilik Hunian (Non-Tetap):
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-semibold text-emerald-800 block">Lengkap</span>
                <span className="font-black text-emerald-900">
                  {nonTetap.ownerDataCompleteness.lengkap.count}
                </span>
                <span className="text-[9px] text-emerald-600 block">
                  {renderPercentage(nonTetap.ownerDataCompleteness.lengkap.formattedPercentage, nonTetap.ownerDataCompleteness.lengkap.percentage)}
                </span>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-semibold text-amber-800 block">Sebagian</span>
                <span className="font-black text-amber-900">
                  {nonTetap.ownerDataCompleteness.sebagian.count}
                </span>
                <span className="text-[9px] text-amber-600 block">
                  {renderPercentage(nonTetap.ownerDataCompleteness.sebagian.formattedPercentage, nonTetap.ownerDataCompleteness.sebagian.percentage)}
                </span>
              </div>
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] font-semibold text-rose-800 block">Tidak Ada</span>
                <span className="font-black text-rose-900">
                  {nonTetap.ownerDataCompleteness.tidakAda.count}
                </span>
                <span className="text-[9px] text-rose-600 block">
                  {renderPercentage(nonTetap.ownerDataCompleteness.tidakAda.formattedPercentage, nonTetap.ownerDataCompleteness.tidakAda.percentage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
