import React, { useState } from 'react';
import { X, Search, Filter, FileText, Printer, ShieldCheck, Ban, Eye, Download, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { DigitalDocument } from '../types/rt';

interface DocumentArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  digitalDocs: DigitalDocument[];
  onSelectDoc: (doc: DigitalDocument) => void;
  onRevokeClick: (doc: DigitalDocument) => void;
  currentRole: string;
}

export const DocumentArchiveModal: React.FC<DocumentArchiveModalProps> = ({
  isOpen,
  onClose,
  digitalDocs,
  onSelectDoc,
  onRevokeClick,
  currentRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredDocs = digitalDocs.filter((doc) => {
    const matchesSearch =
      doc.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.pemohonNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.jenisSurat.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && doc.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A2338] text-white w-full max-w-5xl rounded-3xl shadow-2xl border-2 border-emerald-500 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-[#123B5D] border-b border-[#2E7D52] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52] flex items-center justify-center border border-[#D4A72C] shadow">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                ARSIP DOKUMEN SURAT RESMI DIGITAL RT 07
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400">
                  {digitalDocs.length} DOKUMEN
                </span>
              </h3>
              <p className="text-xs text-slate-300">Management & QR Code Security Archive System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Filter & Search */}
        <div className="p-4 bg-[#051320] border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari ID, Nomor Surat, atau Pemohon..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A2338] border border-slate-700 text-white font-medium focus:outline-none focus:border-[#D4A72C]"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 flex items-center gap-1 font-bold">
              <Filter className="w-3.5 h-3.5" /> Filter Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0A2338] border border-slate-700 text-white font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-[#D4A72C]"
            >
              <option value="ALL">Semua Status</option>
              <option value="VALID">✓ VALID</option>
              <option value="REVOKED">✖ REVOKED / DICABUT</option>
            </select>
          </div>

        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          {filteredDocs.length === 0 ? (
            <div className="bg-[#051320] p-10 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              Tidak ada dokumen digital yang sesuai dengan pencarian.
            </div>
          ) : (
            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#123B5D] text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Document ID</th>
                    <th className="p-3">Nomor Surat</th>
                    <th className="p-3">Jenis Layanan</th>
                    <th className="p-3">Pemohon</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#051320]">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.documentId} className="hover:bg-slate-800/50 text-slate-300">
                      <td className="p-3 font-mono font-bold text-emerald-400">{doc.documentId}</td>
                      <td className="p-3 font-mono text-amber-300 font-bold">{doc.nomorSurat}</td>
                      <td className="p-3 font-bold text-white">{doc.jenisSurat}</td>
                      <td className="p-3 font-bold text-slate-200">{doc.pemohonNama}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{doc.tanggalSurat}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          doc.status === 'VALID' ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-red-950 text-red-300 border-red-600'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectDoc(doc)}
                            className="bg-[#2E7D52] hover:bg-[#236340] text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[11px] shadow"
                            title="Buka Preview PDF & Print"
                          >
                            <Printer className="w-3.5 h-3.5" /> PDF / Print
                          </button>

                          {(currentRole === 'ADMIN' || currentRole === 'KETUA_RT' || currentRole === 'PENGURUS') && doc.status === 'VALID' && (
                            <button
                              onClick={() => onRevokeClick(doc)}
                              className="bg-red-700 hover:bg-red-800 text-white font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 text-[11px]"
                              title="Cabut Dokumen Ini"
                            >
                              <Ban className="w-3.5 h-3.5" /> Cabut
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#123B5D] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> Sistem Arsip Resmi SMART RT 07 RW 11 GPA Ngijo
          </span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold">
            Tutup Arsip
          </button>
        </div>

      </div>
    </div>
  );
};
