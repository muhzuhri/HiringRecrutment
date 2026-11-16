import nodemailer from "nodemailer";

/**
 * Konfigurasi Transporter SMTP Nodemailer.
 * Fleksibel mendukung Gmail SMTP, Google Workspace, atau custom SMTP.
 */
function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, ""),
    },
  });
}

/**
 * Fungsi Pengirim Email Utama
 */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getMailTransporter();
    const fromAddress =
      process.env.SMTP_FROM ||
      `"Nexora Digital Recruitment" <${process.env.SMTP_USER || "noreply@nexoradigital.com"}>`;

    if (!transporter) {
      console.log(`\n===============================================================`);
      console.log(`📧 [SIMULASI PENGIRIMAN EMAIL OTOMATIS - NEXORA DIGITAL]`);
      console.log(`Kepada  : ${options.to}`);
      console.log(`Subjek  : ${options.subject}`);
      console.log(`Status  : Berhasil dicatat (Kredensial SMTP_USER & SMTP_PASS belum diset di .env.local).`);
      console.log(`===============================================================\n`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
      headers: {
        "X-Mailer": "Nexora Digital Recruitment Platform",
        "X-Priority": "3",
      },
    });

    console.log(`📧 [EMAIL TERKIRIM] ke: ${options.to} | Subjek: "${options.subject}" | MessageId: ${info.messageId}`);
    return { success: true, simulated: false, messageId: info.messageId };
  } catch (err: any) {
    console.error("❌ [EMAIL ERROR] Gagal mengirim email:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Wrapper Styling Email Template Resmi Nexora Digital
 */
function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexora Digital Recruitment</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0B132B; padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Nexora <span style="color: #14b8a6;">Digital</span>
              </h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                Sistem Informasi Rekrutmen & Penilaian Terpadu
              </p>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6;">
                Email ini dikirimkan secara otomatis oleh Sistem Rekrutmen Resmi <strong>PT Nexora Digital Nusantara</strong>.<br/>
                Harap tidak membalas email ini secara langsung. Jika ada pertanyaan, hubungi tim HR melalui portal resmi.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #94a3b8;">
                © ${new Date().getFullYear()} Nexora Digital. Hak Cipta Dilindungi Undang-Undang.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Email ke Kandidat: Undangan Seleksi (Tes Teknis, Interview HR, Interview User)
 */
export async function sendCandidateStageNotification(data: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  stageName: string;
  scheduledAt: string;
  location?: string;
  gmapsUrl?: string;
  notes?: string;
  evaluatorName?: string;
}) {
  const formattedDate = new Date(data.scheduledAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(data.scheduledAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `[Nexora Digital] Undangan ${data.stageName} - Posisi: ${data.jobTitle}`;

  const html = emailLayout(`
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; border: 1px solid #a7f3d0; margin-bottom: 12px;">
        ✨ Selamat! Anda Lolos ke Tahap Berikutnya
      </span>
      <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 20px; font-weight: 800;">
        Undangan Pelaksanaan ${data.stageName}
      </h2>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Halo <strong>${data.candidateName}</strong>, terima kasih atas antusiasme Anda. Berdasarkan evaluasi berkas dan penilaian tahap sebelumnya, Anda dinyatakan <strong>LOLOS</strong> untuk mengikuti tahap <strong>${data.stageName}</strong> pada posisi <strong>${data.jobTitle}</strong>.
      </p>
    </div>

    <!-- Kotak Jadwal & Lokasi -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        📋 Rincian Jadwal & Tempat Pelaksanaan
      </h3>

      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #334155;">
        <tr>
          <td width="35%" style="font-weight: 600; color: #64748b;">📅 Hari & Tanggal</td>
          <td width="65%" style="font-weight: 700; color: #0f172a;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">⏰ Waktu Pelaksanaan</td>
          <td style="font-weight: 700; color: #0f172a;">${formattedTime} WIB</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">🏢 Lokasi / Ruangan</td>
          <td style="font-weight: 600; color: #0f172a;">${data.location || "Kantor Pusat Nexora Digital"}</td>
        </tr>
        ${
          data.gmapsUrl
            ? `<tr>
                <td style="font-weight: 600; color: #64748b;">📍 Peta Google Maps</td>
                <td>
                  <a href="${data.gmapsUrl}" target="_blank" style="display: inline-block; color: #0284c7; font-weight: 700; text-decoration: underline;">
                    Buka Rute Google Maps Gedung &rarr;
                  </a>
                </td>
              </tr>`
            : ""
        }
        ${
          data.evaluatorName
            ? `<tr>
                <td style="font-weight: 600; color: #64748b;">👤 Penilai / Pewawancara</td>
                <td style="font-weight: 600; color: #0f172a;">${data.evaluatorName}</td>
              </tr>`
            : ""
        }
      </table>

      ${
        data.notes
          ? `<div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Catatan Tambahan dari Tim HR:</span>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #334155; line-height: 1.5;">${data.notes}</p>
            </div>`
          : ""
      }
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 12px; color: #166534; line-height: 1.6;">
      💡 <strong>Petunjuk:</strong> Harap hadir 15 menit sebelum jadwal yang ditentukan. Pastikan membawa kartu identitas asli (KTP) serta portofolio/berkas pendukung jika relevan.
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/applications" style="display: inline-block; background-color: #0F766E; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);">
        Pantau Status Lamaran di Portal
      </a>
    </div>
  `);

  const text = `
Undangan ${data.stageName} - PT Nexora Digital Nusantara

Halo ${data.candidateName},
Terima kasih atas antusiasme Anda. Anda dinyatakan LOLOS ke tahap ${data.stageName} untuk posisi ${data.jobTitle}.

Rincian Jadwal Pelaksanaan:
- Hari, Tanggal : ${formattedDate}
- Waktu         : ${formattedTime} WIB
- Lokasi        : ${data.location || "Kantor Pusat Nexora Digital"}
${data.gmapsUrl ? `- Google Maps : ${data.gmapsUrl}` : ""}
${data.evaluatorName ? `- Pewawancara : ${data.evaluatorName}` : ""}
${data.notes ? `- Catatan     : ${data.notes}` : ""}

Petunjuk: Harap hadir 15 menit sebelum jadwal yang ditentukan dengan membawa kartu identitas asli (KTP) serta portofolio yang relevan.

Email ini dikirim otomatis oleh Sistem Rekrutmen Resmi PT Nexora Digital Nusantara.
  `.trim();

  return sendMail({ to: data.candidateEmail, subject, html, text });
}

/**
 * 2. Email ke Penilai / Asesor: Penugasan Jadwal Uji Kandidat
 */
export async function sendAssessorAssignmentNotification(data: {
  assessorEmail: string;
  assessorName: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  stageName: string;
  scheduledAt: string;
  location?: string;
  gmapsUrl?: string;
  notes?: string;
  totalCandidateQueue?: number;
}) {
  const formattedDate = new Date(data.scheduledAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(data.scheduledAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `[Tugas Penilai] Jadwal Uji ${data.stageName}: ${data.candidateName} - ${data.jobTitle}`;

  const html = emailLayout(`
    <div style="margin-bottom: 24px;">
      <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; border: 1px solid #bfdbfe; margin-bottom: 12px;">
        📌 Penugasan Tim Penilai & Pewawancara
      </span>
      <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 20px; font-weight: 800;">
        Pemberitahuan Jadwal Pengujian Kandidat
      </h2>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Halo <strong>${data.assessorName}</strong>, Anda telah ditugaskan oleh Tim HR untuk menguji dan menilai kandidat berikut pada tahapan <strong>${data.stageName}</strong>.
      </p>
    </div>

    <!-- Ringkasan Kandidat & Antrean -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        🎯 Rincian Kandidat & Pelaksanaan
      </h3>

      <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #334155;">
        <tr>
          <td width="38%" style="font-weight: 600; color: #64748b;">Nama Kandidat</td>
          <td width="62%" style="font-weight: 700; color: #0f172a;">${data.candidateName}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">Posisi Dilamar</td>
          <td style="font-weight: 700; color: #0F766E;">${data.jobTitle}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">Jenis Pengujian</td>
          <td style="font-weight: 700; color: #0f172a;">${data.stageName}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">📅 Jadwal Uji</td>
          <td style="font-weight: 700; color: #0f172a;">${formattedDate}, ${formattedTime} WIB</td>
        </tr>
        <tr>
          <td style="font-weight: 600; color: #64748b;">🏢 Lokasi Ruangan</td>
          <td style="font-weight: 600; color: #0f172a;">${data.location || "Kantor Pusat Nexora Digital"}</td>
        </tr>
        ${
          data.gmapsUrl
            ? `<tr>
                <td style="font-weight: 600; color: #64748b;">📍 Link Google Maps</td>
                <td>
                  <a href="${data.gmapsUrl}" target="_blank" style="color: #0284c7; font-weight: 700; text-decoration: underline;">
                    Lihat Peta Lokasi &rarr;
                  </a>
                </td>
              </tr>`
            : ""
        }
        ${
          data.totalCandidateQueue !== undefined
            ? `<tr>
                <td style="font-weight: 600; color: #64748b;">👥 Total Antrean Uji Anda</td>
                <td style="font-weight: 700; color: #b45309;">${data.totalCandidateQueue} Kandidat Dijadwalkan</td>
              </tr>`
            : ""
        }
      </table>

      ${
        data.notes
          ? `<div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Instruksi HR / Catatan:</span>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #334155; line-height: 1.5;">${data.notes}</p>
            </div>`
          : ""
      }
    </div>

    <div style="text-align: center; margin-bottom: 10px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/evaluations" style="display: inline-block; background-color: #0B132B; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(11, 19, 43, 0.25);">
        Buka Portal Penilaian Seleksi
      </a>
    </div>
  `);

  return sendMail({ to: data.assessorEmail, subject, html });
}

/**
 * 3. Email ke Kandidat: Keputusan Gugur / Ditolak (Periode Ini)
 */
export async function sendCandidateRejectedNotification(data: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  reason?: string;
}) {
  const subject = `[Nexora Digital] Pemberitahuan Hasil Seleksi - Posisi: ${data.jobTitle}`;

  const html = emailLayout(`
    <div style="margin-bottom: 24px;">
      <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 800;">
        Pemberitahuan Hasil Seleksi Lamaran
      </h2>
      <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Halo <strong>${data.candidateName}</strong>,
      </p>
      <p style="margin: 12px 0 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Terima kasih atas waktu, dedikasi, dan partisipasi Anda dalam rangkaian proses rekrutmen untuk posisi <strong>${data.jobTitle}</strong> di PT Nexora Digital Nusantara.
      </p>
      <p style="margin: 12px 0 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Setelah mempertimbangkan kualifikasi seluruh pelamar serta kebutuhan spesifik tim kami pada periode ini dengan saksama, kami menyampaikan bahwa <strong>kami belum dapat melanjutkan lamaran Anda ke tahapan berikutnya</strong> pada periode seleksi saat ini.
      </p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; font-weight: 700;">
        💡 Kesempatan di Periode / Batch Mendatang
      </h4>
      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;">
        Data profil Anda tetap tersimpan dalam basis data talent kami. Anda diperkenankan untuk mendaftar kembali apabila lowongan ini telah <strong>ditutup / expired</strong> dan kemudian <strong>dibuka kembali (re-opened)</strong> oleh Tim HR untuk batch penerimaan baru di masa mendatang.
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
      Kami sangat mengapresiasi minat Anda dan mendoakan kesuksesan dalam perjalanan karier profesional Anda selanjutnya.
    </p>
  `);

  const text = `
Pemberitahuan Hasil Seleksi Lamaran - PT Nexora Digital Nusantara

Halo ${data.candidateName},
Terima kasih atas waktu dan partisipasi Anda dalam proses seleksi untuk posisi ${data.jobTitle}.
Setelah mempertimbangkan kualifikasi seluruh pelamar dengan saksama, kami menyampaikan bahwa saat ini kami belum dapat melanjutkan lamaran Anda ke tahapan berikutnya pada periode ini.

Data Anda tetap tersimpan dalam database talent kami untuk kesempatan di masa mendatang.

Salam sukses,
Tim Rekrutmen PT Nexora Digital Nusantara
  `.trim();

  return sendMail({ to: data.candidateEmail, subject, html, text });
}

/**
 * 4. Email ke Kandidat: Lolos & Diterima (Hired / Offering)
 */
export async function sendCandidateHiredNotification(data: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  notes?: string;
}) {
  const subject = `[Nexora Digital] Selamat! Penawaran Kerja Resmi (Offering) - Posisi: ${data.jobTitle}`;

  const html = emailLayout(`
    <div style="margin-bottom: 24px; text-align: center;">
      <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: #ecfdf5; color: #047857; font-size: 13px; font-weight: 800; border: 1px solid #a7f3d0; margin-bottom: 12px;">
        🎉 SELAMAT BERGABUNG!
      </span>
      <h2 style="margin: 6px 0 0 0; color: #0f172a; font-size: 22px; font-weight: 800;">
        Penawaran Kerja Resmi (Offering Letter)
      </h2>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Halo <strong>${data.candidateName}</strong>, dengan bangga kami informasikan bahwa Anda telah menyelesaikan seluruh rangkaian seleksi dan dinyatakan <strong>DITERIMA (HIRED)</strong> untuk bergabung bersama keluarga besar Nexora Digital pada posisi <strong>${data.jobTitle}</strong>!
      </p>
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: 700;">
        📄 Langkah Selanjutnya & Proses Onboarding
      </h3>
      <p style="margin: 0; font-size: 13px; color: #14532d; line-height: 1.6;">
        Dokumen Offering Letter resmi beserta rincian kompensasi, jadwal penandatanganan kontrak, dan tanggal mulai bekerja (onboarding) akan disampaikan oleh Tim People & Culture HR kami.
      </p>
      ${
        data.notes
          ? `<div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #86efac; font-size: 12px; color: #166534;">
              <strong>Pesan Tim HR:</strong> ${data.notes}
            </div>`
          : ""
      }
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/applications" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);">
        Buka Portal Lamaran Anda
      </a>
    </div>
  `);

  const text = `
Selamat! Penawaran Kerja Resmi (Offering) - PT Nexora Digital Nusantara

Halo ${data.candidateName},
Selamat! Anda dinyatakan DITERIMA (HIRED) untuk bergabung bersama Nexora Digital pada posisi ${data.jobTitle}.
Dokumen Offering Letter resmi serta langkah onboarding akan disampaikan oleh Tim HR.
${data.notes ? `Pesan Tim HR: ${data.notes}` : ""}

Salam hangat,
PT Nexora Digital Nusantara
  `.trim();

  return sendMail({ to: data.candidateEmail, subject, html, text });
}
