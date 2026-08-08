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
        margin: 20mm;
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
        text-align: center;
        border-bottom: 3px double #123B5D;
        padding-bottom: 8px;
        margin-bottom: 20px;
        position: relative;
      }
      .kop-logo {
        position: absolute;
        left: 10px;
        top: 5px;
        width: 70px;
        height: 70px;
      }
      .kop-title {
        font-size: 16pt;
        font-weight: bold;
        color: #123B5D;
        text-transform: uppercase;
        margin: 0;
        letter-spacing: 1px;
      }
      .kop-subtitle {
        font-size: 14pt;
        font-weight: bold;
        color: #2E7D52;
        margin: 2px 0;
      }
      .kop-address {
        font-size: 10pt;
        color: #444;
        margin: 0;
        font-style: italic;
      }
      .kop-tagline {
        font-size: 9pt;
        color: #D4A72C;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 4px;
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
      <div class="kop-title">RUKUN TETANGGA 07 RUKUN WARGA 11</div>
      <div class="kop-subtitle">PERUMAHAN GPA NGIJO KARANGPLOSO</div>
      <div class="kop-address">Desa Ngijo, Kecamatan Karangploso, Kabupaten Malang, Jawa Timur 65152</div>
      <div class="kop-tagline">"Bersama Melayani, Bersama Membangun"</div>
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
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};
