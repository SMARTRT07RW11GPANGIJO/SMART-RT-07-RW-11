// SMART RT 07 RW 11 GPA NGIJO - RT ACTIVITY CALENDAR & EVENT GOVERNANCE v1.0
// Modal for Creating and Editing Kegiatan RT

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Tag, AlertCircle, Shield, Check, Info } from 'lucide-react';
import {
  KegiatanRT,
  EventCategory,
  JenisKegiatan,
  EventPriority,
  ActorSession
} from '../types/activity';
import { Warga } from '../types/rt';
import { activityCalendarService } from '../services/activityCalendarService';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  actor: ActorSession;
  wargaList: Warga[];
  eventToEdit?: KegiatanRT | null;
  onSuccess: (event: KegiatanRT, message: string) => void;
  onError: (error: string) => void;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'KERJA_BAKTI', label: 'Kerja Bakti / Gotong Royong' },
  { value: 'RAPAT_RT', label: 'Rapat Pleno RT 07' },
  { value: 'RAPAT_RW', label: 'Rapat Koordinasi RW 11' },
  { value: 'POSYANDU', label: 'Layanan Posyandu (Mawar 07)' },
  { value: 'KEAMANAN', label: 'Ronda & Keamanan Lingkungan' },
  { value: 'KEAGAMAAN', label: 'Kegiatan Keagamaan & Doa Bersama' },
  { value: 'SOSIAL', label: 'Sosial & Kepedulian Warga' },
  { value: 'PENDIDIKAN', label: 'Pendidikan & Literasi Warga' },
  { value: 'KEPEMUDAAN', label: 'Kepemudaan & Karang Taruna' },
  { value: 'OLAHRAGA', label: 'Olahraga & Senam Sehat' },
  { value: 'HUT_RI', label: 'Peringatan HUT RI / 17 Agustus' },
  { value: 'TIRAKATAN', label: 'Malam Tirakatan & Tasyakuran' },
  { value: 'GOTONG_ROYONG', label: 'Gotong Royong Insidental' },
  { value: 'PELAYANAN_WARGA', label: 'Pelayanan Warga & Administrasi' },
  { value: 'LAINNYA', label: 'Kegiatan Lainnya' }
];

const JENIS_LIST: { value: JenisKegiatan; label: string }[] = [
  { value: 'RUTIN', label: 'Kegiatan Rutin / Berkala' },
  { value: 'INSIDENTAL', label: 'Kegiatan Insidental / Khusus' },
  { value: 'PROGRAM_KERJA', label: 'Program Kerja Pengurus' },
  { value: 'HARI_BESAR', label: 'Peringatan Hari Besar Nasional / Agama' },
  { value: 'DARURAT', label: 'Kegiatan Darurat / Tanggap Bencana' }
];

const PRIORITIES: { value: EventPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Rendah (Low)', color: 'text-slate-600 bg-slate-100' },
  { value: 'NORMAL', label: 'Normal (Standar)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'HIGH', label: 'Tinggi (High)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'URGENT', label: 'Mendesak (Urgent)', color: 'text-rose-700 bg-rose-50 border-rose-200' }
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  actor,
  wargaList,
  eventToEdit,
  onSuccess,
  onError
}) => {
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<EventCategory>('KERJA_BAKTI');
  const [jenisKegiatan, setJenisKegiatan] = useState<JenisKegiatan>('RUTIN');
  const [prioritas, setPrioritas] = useState<EventPriority>('NORMAL');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [waktuMulai, setWaktuMulai] = useState('08:00');
  const [tanggalSelesai, setTanggalSelesai] = useState(new Date().toISOString().split('T')[0]);
  const [waktuSelesai, setWaktuSelesai] = useState('11:00');
  const [lokasi, setLokasi] = useState('Balai Warga / Pos Ronda RT 07');
  const [alamatLokasi, setAlamatLokasi] = useState('Perum Graha Pelita Asri Blok C Ngijo Karangploso');
  const [penyelenggara, setPenyelenggara] = useState('Pengurus RT 07 RW 11');
  const [penanggungJawabId, setPenanggungJawabId] = useState(wargaList[0]?.id_warga || 'WRG-001');
  const [targetPeserta, setTargetPeserta] = useState('Seluruh Warga RT 07 RW 11');
  const [estimasiPeserta, setEstimasiPeserta] = useState(30);
  const [isPublic, setIsPublic] = useState(true);
  const [isAllDay, setIsAllDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setJudul(eventToEdit.judul);
      setKategori(eventToEdit.kategori);
      setJenisKegiatan(eventToEdit.jenisKegiatan);
      setPrioritas(eventToEdit.prioritas);
      setDeskripsi(eventToEdit.deskripsi);
      setTanggalMulai(eventToEdit.tanggalMulai);
      setWaktuMulai(eventToEdit.waktuMulai);
      setTanggalSelesai(eventToEdit.tanggalSelesai);
      setWaktuSelesai(eventToEdit.waktuSelesai);
      setLokasi(eventToEdit.lokasi);
      setAlamatLokasi(eventToEdit.alamatLokasi);
      setPenyelenggara(eventToEdit.penyelenggara);
      setPenanggungJawabId(eventToEdit.penanggungJawabId);
      setTargetPeserta(eventToEdit.targetPeserta);
      setEstimasiPeserta(eventToEdit.estimasiPeserta);
      setIsPublic(eventToEdit.isPublic);
      setIsAllDay(eventToEdit.isAllDay);
    } else {
      // Reset defaults
      setJudul('');
      setKategori('KERJA_BAKTI');
      setJenisKegiatan('RUTIN');
      setPrioritas('NORMAL');
      setDeskripsi('');
      setTanggalMulai(new Date().toISOString().split('T')[0]);
      setWaktuMulai('08:00');
      setTanggalSelesai(new Date().toISOString().split('T')[0]);
      setWaktuSelesai('11:00');
      setLokasi('Balai Warga / Pos Ronda RT 07');
      setAlamatLokasi('Perum Graha Pelita Asri Blok C Ngijo Karangploso');
      setPenyelenggara('Pengurus RT 07 RW 11');
      setPenanggungJawabId(wargaList[0]?.id_warga || 'WRG-001');
      setTargetPeserta('Seluruh Warga RT 07 RW 11');
      setEstimasiPeserta(30);
      setIsPublic(true);
      setIsAllDay(false);
    }
  }, [eventToEdit, wargaList, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      onError('Judul kegiatan wajib diisi.');
      return;
    }

    const selectedWarga = wargaList.find((w) => w.id_warga === penanggungJawabId);
    const penanggungJawabNama = selectedWarga
      ? `${selectedWarga.nama_lengkap} (${selectedWarga.blok})`
      : 'Penanggung Jawab RT';

    setIsSubmitting(true);
    const requestId = activityCalendarService.generateRequestId();

    if (eventToEdit) {
      // UPDATE
      const res = activityCalendarService.updateKegiatan(
        actor,
        eventToEdit.idKegiatan,
        {
          judul,
          kategori,
          jenisKegiatan,
          prioritas,
          deskripsi,
          tanggalMulai,
          waktuMulai,
          tanggalSelesai,
          waktuSelesai,
          lokasi,
          alamatLokasi,
          penyelenggara,
          penanggungJawabId,
          penanggungJawabNama,
          targetPeserta,
          estimasiPeserta: Number(estimasiPeserta),
          isPublic,
          isAllDay
        },
        requestId
      );

      setIsSubmitting(false);
      if (res.success && res.data) {
        onSuccess(res.data, 'Data kegiatan berhasil diperbarui.');
        onClose();
      } else {
        onError(res.error || 'Gagal memperbarui kegiatan.');
      }
    } else {
      // CREATE
      const res = activityCalendarService.createKegiatan(
        actor,
        {
          judul,
          kategori,
          jenisKegiatan,
          prioritas,
          deskripsi,
          tanggalMulai,
          waktuMulai,
          tanggalSelesai,
          waktuSelesai,
          lokasi,
          alamatLokasi,
          penyelenggara,
          penanggungJawabId,
          penanggungJawabNama,
          targetPeserta,
          estimasiPeserta: Number(estimasiPeserta),
          isPublic,
          isAllDay
        },
        requestId,
        'DRAFT'
      );

      setIsSubmitting(false);
      if (res.success && res.data) {
        onSuccess(res.data, 'Kegiatan berhasil dibuat dalam status DRAFT.');
        onClose();
      } else {
        onError(res.error || 'Gagal menyimpan kegiatan baru.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-5 text-white flex items-center justify-between border-b border-[#2E7D52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D52] flex items-center justify-center text-[#D4A72C] font-bold border border-[#D4A72C]/40 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {eventToEdit ? 'Edit Data Kegiatan RT' : 'Tambah Agenda Kegiatan RT Baru'}
              </h3>
              <p className="text-xs text-slate-300">
                Single Source of Truth • SMART RT 07 RW 11 GPA Ngijo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Judul */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Judul Kegiatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Kerja Bakti Pemasangan Umbul-Umbul HUT RI"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#123B5D] focus:border-transparent outline-hidden"
            />
          </div>

          {/* Kategori & Jenis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Kategori Kegiatan
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as EventCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-[#123B5D] outline-hidden"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Jenis Kegiatan
              </label>
              <select
                value={jenisKegiatan}
                onChange={(e) => setJenisKegiatan(e.target.value as JenisKegiatan)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-[#123B5D] outline-hidden"
              >
                {JENIS_LIST.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prioritas & Penanggung Jawab Relasional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tingkat Prioritas
              </label>
              <select
                value={prioritas}
                onChange={(e) => setPrioritas(e.target.value as EventPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-[#123B5D] outline-hidden"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Penanggung Jawab (Data Warga)
              </label>
              <select
                value={penanggungJawabId}
                onChange={(e) => setPenanggungJawabId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-[#123B5D] outline-hidden"
              >
                {wargaList.map((w) => (
                  <option key={w.id_warga} value={w.id_warga}>
                    {w.nama_lengkap} ({w.blok})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal & Waktu Mulai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">
                Tanggal Mulai
              </label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">
                Waktu Mulai
              </label>
              <input
                type="time"
                required
                value={waktuMulai}
                onChange={(e) => setWaktuMulai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">
                Tanggal Selesai
              </label>
              <input
                type="date"
                required
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600">
                Waktu Selesai
              </label>
              <input
                type="time"
                required
                value={waktuSelesai}
                onChange={(e) => setWaktuSelesai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>
          </div>

          {/* Lokasi & Alamat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nama Lokasi / Tempat
              </label>
              <input
                type="text"
                required
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Pos Kamling / Lapangan Blok C"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Alamat Detail
              </label>
              <input
                type="text"
                value={alamatLokasi}
                onChange={(e) => setAlamatLokasi(e.target.value)}
                placeholder="Perum GPA Ngijo Karangploso"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          {/* Target & Estimasi Peserta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Sasaran Peserta
              </label>
              <input
                type="text"
                value={targetPeserta}
                onChange={(e) => setTargetPeserta(e.target.value)}
                placeholder="Seluruh Warga RT 07 / Ibu-Ibu PKK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Estimasi Jumlah Peserta (Orang)
              </label>
              <input
                type="number"
                min="1"
                value={estimasiPeserta}
                onChange={(e) => setEstimasiPeserta(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Deskripsi & Rencana Pelaksanaan
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Rincian agenda, perlengkapan yang perlu dibawa warga, dan susunan acara..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-hidden focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          {/* Visibility / Privacy Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublicCheck"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-[#2E7D52] rounded border-slate-300 focus:ring-[#2E7D52]"
              />
              <label htmlFor="isPublicCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                Publikasikan ke Kalender Warga (Public Event)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAllDayCheck"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="w-4 h-4 text-[#2E7D52] rounded border-slate-300 focus:ring-[#2E7D52]"
              />
              <label htmlFor="isAllDayCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                Kegiatan Sepanjang Hari (All Day)
              </label>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2E7D52] hover:bg-[#236340] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : eventToEdit ? 'Simpan Perubahan' : 'Buat Kegiatan (DRAFT)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
