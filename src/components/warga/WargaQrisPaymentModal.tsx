import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Download, 
  AlertCircle,
  RefreshCw,
  Wallet,
  Sparkles
} from 'lucide-react';
import { WargaInvoiceItem, WargaInvoiceFundType } from '../../types/wargaDashboard';
import { WargaDashboardService } from '../../services/wargaDashboardService';
import { AuthoritativeSessionContext } from '../../security/authorization';

interface WargaQrisPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: WargaInvoiceItem | null;
  authContext: AuthoritativeSessionContext;
  onPaymentSuccess: (message: string) => void;
}

export const WargaQrisPaymentModal: React.FC<WargaQrisPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  authContext,
  onPaymentSuccess
}) => {
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedNmid, setCopiedNmid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !invoice) {
      setSecondsLeft(900);
      setIsVerifying(false);
      setIsSuccess(false);
      setErrorMsg(null);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const formatTime = (totalSec: number) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getFundBadge = (fundType: WargaInvoiceFundType) => {
    switch (fundType) {
      case 'DANA_KEMATIAN':
        return {
          label: '🕊️ Pos Dana Kematian RT 07',
          color: 'bg-teal-50 text-teal-800 border-teal-200'
        };
      case 'OMPLOGAN':
        return {
          label: '🎉 Pos Omplongan Agustusan',
          color: 'bg-rose-50 text-rose-800 border-rose-200'
        };
      default:
        return {
          label: '💰 Pos Kas RT Umum',
          color: 'bg-emerald-50 text-[#2E7D52] border-emerald-200'
        };
    }
  };

  const fundInfo = getFundBadge(invoice.fundType);

  const handleCopyNMID = () => {
    navigator.clipboard.writeText('ID2026071100078');
    setCopiedNmid(true);
    setTimeout(() => setCopiedNmid(false), 2500);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      try {
        const result = WargaDashboardService.processPayment(
          authContext,
          invoice.id,
          invoice.fundType,
          'QRIS'
        );

        if (result.success) {
          setIsSuccess(true);
          setTimeout(() => {
            onPaymentSuccess(result.message);
            onClose();
          }, 1800);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Pembayaran gagal diverifikasi.');
      } finally {
        setIsVerifying(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123B5D] to-[#2E7D52] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <QrCode className="w-5 h-5 text-[#D4A72C]" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Pembayaran QRIS RT 07</h3>
              <p className="text-[11px] text-slate-200">Perum GPA Ngijo • Terverifikasi Otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Fund Type Isolation Banner */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${fundInfo.color}`}>
            <span>{fundInfo.label}</span>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white shadow-xs">
              {invoice.fundType}
            </span>
          </div>

          {/* Invoice Summary Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Nama Tagihan:</span>
              <span className="font-bold text-slate-800">{invoice.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Periode:</span>
              <span className="font-bold text-slate-800">{invoice.periode}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/80 pt-2">
              <span className="text-slate-700 font-bold">Total Pembayaran:</span>
              <span className="text-lg font-black text-[#2E7D52]">
                Rp {invoice.nominal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* QR Code Section */}
          {!isSuccess ? (
            <div className="flex flex-col items-center space-y-3">
              {/* QR Container */}
              <div className="p-3.5 bg-white rounded-3xl border-2 border-dashed border-[#2E7D52] shadow-sm relative group">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021226680016ID.CO.GOPAY.WWW01189360000000000000000215ID20260711000780303UMI51440014ID.LINKAJA.WWW01189360000000000000000215ID20260711000780303UMI5204581253033605406${invoice.nominal}5802ID5912SMART_RT07_GPA6007MALANG61056515262070703A01630489AB`}
                  alt="QRIS SMART RT 07"
                  className="w-44 h-44 object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-[#123B5D]/5 rounded-2xl pointer-events-none" />
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Sisa waktu pembayaran: </span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {formatTime(secondsLeft)}
                </span>
              </div>

              {/* NMID Details */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>NMID: <b>ID2026071100078</b></span>
                <button
                  onClick={handleCopyNMID}
                  className="text-[#2E7D52] hover:underline font-bold flex items-center gap-0.5"
                >
                  <Copy className="w-3 h-3" />
                  {copiedNmid ? 'Tersalin!' : 'Salin'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center max-w-xs leading-relaxed">
                Scan QRIS di atas menggunakan GoPay, OVO, Dana, BCA, Mandiri, atau Mobile Banking lainnya.
              </p>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2E7D52] flex items-center justify-center border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-base text-slate-800">Pembayaran Berhasil!</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Status tagihan diperbarui menjadi Lunas. Notifikasi & kwitansi WhatsApp telah dikirimkan.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {!isSuccess && (
              <button
                onClick={handleSimulatePayment}
                disabled={isVerifying || secondsLeft === 0}
                className="w-full bg-[#2E7D52] hover:bg-[#236340] text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memverifikasi Pembayaran...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4A72C]" />
                    Simulasi Verifikasi Pembayaran Selesai
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-2xl transition-all text-xs"
            >
              {isSuccess ? 'Selesai & Tutup' : 'Batal / Bayar Nanti'}
            </button>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D52]" />
            <span>Rekening Resmi RT 07 RW 11 GPA Ngijo • Enkripsi SSL</span>
          </div>

        </div>

      </div>
    </div>
  );
};
