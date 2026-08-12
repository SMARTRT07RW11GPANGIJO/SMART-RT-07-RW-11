import QRCode from 'qrcode';
import { DigitalDocument } from '../types/rt';

// Generate QR Code as Data URL
export const generateQRCodeDataUrl = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 250,
      margin: 1,
      color: {
        dark: '#123B5D',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Error generating QR code DataURL:', err);
    return '';
  }
};

// Generate HTML Content for A4 Document Print / PDF Export
export const renderDocumentHTML = async (doc: DigitalDocument): Promise<string> => {
  const qrUrl = doc.qrVerificationUrl || `${window.location.origin}/verify/${doc.documentId}`;
  const qrDataUrl = await generateQRCodeDataUrl(qrUrl);

  let logoDataUrl = '/logo-kabupaten-malang.png';
  try {
    const resp = await fetch('/logo-kabupaten-malang.png');
    if (resp.ok) {
      const blob = await resp.blob();
      logoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('/logo-kabupaten-malang.png');
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    logoDataUrl = '/logo-kabupaten-malang.png';
  }

  const formattedDate = new Date(doc.tanggalSurat).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <title>${doc.nomorSurat.replace(/\//g, '_')} - ${doc.jenisSurat}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 18mm 20mm 20mm 20mm;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
        margin: 0;
        padding: 0;
      }
      .kop-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        border-bottom: 3px double #123B5D;
        padding-bottom: 12px;
        margin-bottom: 22px;
      }
      .kop-logo {
        width: 85px;
        height: 102px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .kop-text-block {
        text-align: center;
        flex: 1;
      }
      .kop-title {
        font-size: 16pt;
        font-weight: bold;
        color: #123B5D;
        text-transform: uppercase;
        margin: 0;
        letter-spacing: 0.5px;
        line-height: 1.25;
      }
      .kop-subtitle {
        font-size: 13.5pt;
        font-weight: bold;
        color: #2E7D52;
        margin: 3px 0 2px 0;
        text-transform: uppercase;
        line-height: 1.2;
      }
      .kop-district {
        font-size: 11pt;
        font-weight: bold;
        color: #111827;
        text-transform: uppercase;
        margin: 2px 0;
        line-height: 1.2;
      }
      .kop-address {
        font-size: 9.5pt;
        color: #333333;
        margin: 2px 0 0 0;
        font-style: italic;
        line-height: 1.2;
      }
      .kop-tagline {
        font-size: 8.5pt;
        color: #D4A72C;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 2px;
        letter-spacing: 0.5px;
      }
      .doc-title {
        text-align: center;
        margin-top: 25px;
        margin-bottom: 20px;
      }
      .doc-title h2 {
        font-size: 14pt;
        font-weight: bold;
        text-transform: uppercase;
        text-decoration: underline;
        margin: 0;
      }
      .doc-title p {
        font-size: 11pt;
        margin: 4px 0 0 0;
      }
      .doc-body {
        text-align: justify;
        margin-bottom: 25px;
      }
      .table-data {
        width: 100%;
        margin: 15px 0 20px 20px;
        border-collapse: collapse;
      }
      .table-data td {
        padding: 4px 6px;
        vertical-align: top;
      }
      .table-data td.label {
        width: 180px;
      }
      .signature-section {
        margin-top: 40px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      .signature-box {
        text-align: center;
        width: 250px;
      }
      .signature-img {
        height: 70px;
        margin: 10px auto;
        display: block;
      }
      .qr-box {
        border: 1px solid #123B5D;
        border-radius: 8px;
        padding: 8px;
        text-align: center;
        background: #F8FAFC;
        width: 160px;
      }
      .qr-box img {
        width: 130px;
        height: 130px;
      }
      .qr-box p {
        font-size: 8pt;
        color: #123B5D;
        font-weight: bold;
        margin: 4px 0 0 0;
      }
      .watermark-status {
        position: absolute;
        top: 45%;
        left: 20%;
        transform: rotate(-30deg);
        font-size: 52pt;
        font-weight: bold;
        color: rgba(198, 40, 40, 0.12);
        border: 8px solid rgba(198, 40, 40, 0.12);
        padding: 10px 30px;
        text-transform: uppercase;
        pointer-events: none;
        user-select: none;
      }
      .doc-footer {
        margin-top: 40px;
        border-top: 1px solid #ccc;
        padding-top: 8px;
        font-size: 8pt;
        color: #666;
        text-align: center;
      }
    </style>
  </head>
  <body>
    ${doc.status === 'REVOKED' ? '<div class="watermark-status">DOKUMEN DICABUT</div>' : ''}
    
    <div class="kop-header">
      <img src="${logoDataUrl}" alt="Logo Kabupaten Malang" class="kop-logo" />
      <div class="kop-text-block">
        <div class="kop-title">RUKUN TETANGGA 07 RUKUN WARGA 11</div>
        <div class="kop-subtitle">PERUMAHAN GPA NGIJO</div>
        <div class="kop-district">KECAMATAN KARANGPLOSO • KABUPATEN MALANG</div>
        <div class="kop-address">Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152</div>
      </div>
    </div>

    <div class="doc-title">
      <h2>${doc.jenisSurat.toUpperCase()}</h2>
      <p>Nomor: ${doc.nomorSurat}</p>
    </div>

    <div class="doc-body">
      <p>Yang bertanda tangan di bawah ini Pengurus RT 07 RW 11 Perumahan GPA Ngijo, Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, dengan ini menerangkan bahwa:</p>
      
      <table class="table-data">
        <tr>
          <td class="label">Nama Lengkap</td>
          <td>: <strong>${doc.pemohonNama}</strong></td>
        </tr>
        <tr>
          <td class="label">NIK (Terverifikasi)</td>
          <td>: ${doc.pemohonNikMasked}</td>
        </tr>
        <tr>
          <td class="label">Alamat Rumah</td>
          <td>: ${doc.pemohonAlamat}</td>
        </tr>
        <tr>
          <td class="label">Jenis Layanan</td>
          <td>: ${doc.jenisSurat}</td>
        </tr>
        <tr>
          <td class="label">Maksud / Keperluan</td>
          <td>: ${doc.keperluan}</td>
        </tr>
      </table>

      <p>Orang tersebut di atas adalah benar-benar warga yang bertempat tinggal / berdomisili di wilayah RT 07 RW 11 Perum GPA Ngijo dan berklasifikasi baik dalam administrasi kependudukan lingkungan.</p>
      
      <p>Demikian Surat Keterangan / Pengantar ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
    </div>

    <div class="signature-section">
      <div class="qr-box">
        <img src="${qrDataUrl}" alt="QR Verification" />
        <p>SCAN UNTUK VERIFIKASI DOKUMEN DIGITAL</p>
        <p style="font-size:7pt; color:#666; font-weight:normal; margin-top:2px;">ID: ${doc.documentId}</p>
      </div>

      <div class="signature-box">
        <p style="margin:0;">Karangploso, ${formattedDate}</p>
        <p style="margin:2px 0 0 0; font-weight:bold;">Ketua RT 07 RW 11 Perum GPA Ngijo</p>
        
        <div style="height:70px; margin:10px 0; display:flex; align-items:center; justify-center; border:1px dashed #2E7D52; border-radius:8px; background:#f0fdf4; padding:4px;">
          <div style="font-size:8pt; color:#2E7D52; font-weight:bold;">
            ✓ DIGITAL SIGNATURE<br/>
            <span style="font-size:7pt; color:#444;">HASH: ${doc.verificationToken}</span>
          </div>
        </div>

        <p style="margin:0; font-weight:bold; text-decoration:underline;">${doc.namaKetua}</p>
        <p style="margin:2px 0 0 0; font-size:10pt;">${doc.jabatanKetua}</p>
      </div>
    </div>

    <div class="doc-footer">
      Dokumen ini diterbitkan secara elektronik oleh Sistem Administrasi Digital SMART RT 07 RW 11 GPA Ngijo.<br/>
      Keabsahan dan status keaktifan dokumen ini dapat diverifikasi kapan saja melalui scan QR Code atau kunjungan URL: ${doc.qrVerificationUrl}
    </div>
  </body>
  </html>
  `;
};

// Open print / preview window for standard A4 PDF download
export const printOrSavePDF = async (doc: DigitalDocument) => {
  const htmlContent = await renderDocumentHTML(doc);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  // Strategy 1: Try opening clean print window
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow && printWindow.document) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          console.warn('Print in popup window failed:', e);
        }
      }, 400);
      return;
    }
  } catch (e) {
    console.warn('window.open blocked in iframe sandbox:', e);
  }

  // Strategy 2: Hidden Iframe Print inside current window
  let iframePrinted = false;
  try {
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.top = '-9999px';
    printIframe.style.left = '-9999px';
    printIframe.style.width = '210mm';
    printIframe.style.height = '297mm';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const docObj = printIframe.contentWindow?.document;
    if (docObj) {
      docObj.open();
      docObj.write(htmlContent);
      docObj.close();

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
            iframePrinted = true;
          } catch (err) {
            console.warn('Iframe print failed:', err);
          }
          setTimeout(() => {
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
            resolve();
          }, 1000);
        }, 500);
      });
    }
  } catch (err) {
    console.warn('Iframe setup failed:', err);
  }

  if (iframePrinted) return;

  // Strategy 3: Direct window.print() on parent
  try {
    window.print();
  } catch (e) {
    console.warn('window.print() failed:', e);
    // Fallback: Open Blob URL
    window.open(blobUrl, '_blank');
  }
};

// Open document in a new tab or trigger file download
export const openDocumentInNewTab = async (doc: DigitalDocument) => {
  const htmlContent = await renderDocumentHTML(doc);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  
  const win = window.open(blobUrl, '_blank');
  if (!win) {
    // If popup blocked, force download file
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `Dokumen_${doc.nomorSurat.replace(/[\/\\]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
