// ===== DATA: FAQ PAGE =====

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  category: string;
  items: FaqItem[];
}

export const faqs: FaqSection[] = [
  {
    category: "Proses Rekrutmen",
    items: [
      {
        q: "Bagaimana tahapan proses rekrutmen di TalentHub?",
        a: "Proses rekrutmen kami terdiri dari 4 tahap: (1) Seleksi CV & Administrasi, (2) Asesmen Online (psikotes/tes kemampuan), (3) Wawancara dengan HR & User, dan (4) Offering. Kami berkomitmen untuk memberikan update status kepada semua kandidat di setiap tahap.",
      },
      {
        q: "Berapa lama proses rekrutmen berlangsung?",
        a: "Rata-rata proses rekrutmen kami berlangsung antara 2-4 minggu dari tahap pendaftaran hingga penawaran kerja. Durasi ini dapat bervariasi tergantung pada posisi dan jumlah pelamar.",
      },
      {
        q: "Apakah saya bisa melamar lebih dari satu posisi sekaligus?",
        a: "Ya, Anda diperbolehkan melamar maksimal 2 posisi secara bersamaan dalam satu siklus rekrutmen. Pastikan kualifikasi Anda relevan dengan setiap posisi yang dilamar.",
      },
      {
        q: "Bagaimana cara mengetahui status lamaran saya?",
        a: "Setelah mendaftar, Anda dapat melacak status lamaran Anda secara real-time melalui dashboard akun kandidat. Kami juga akan mengirimkan notifikasi email di setiap perubahan status.",
      },
    ],
  },
  {
    category: "Pendaftaran & Akun",
    items: [
      {
        q: "Apakah ada biaya untuk mendaftar sebagai kandidat?",
        a: "Sama sekali tidak. Mendaftar, membuat profil, dan melamar posisi di TalentHub sepenuhnya gratis untuk semua kandidat. Kami tidak pernah memungut biaya apapun dalam proses rekrutmen.",
      },
      {
        q: "Dokumen apa saja yang perlu saya siapkan untuk mendaftar?",
        a: "Dokumen yang perlu Anda siapkan: CV terbaru (format PDF, maks 5MB), foto formal terbaru, dan transkrip nilai (untuk fresh graduate). Beberapa posisi tertentu juga memerlukan portofolio kerja.",
      },
      {
        q: "Bagaimana jika saya lupa password akun saya?",
        a: "Anda dapat melakukan reset password melalui halaman Login dengan klik 'Lupa Password'. Link reset akan dikirimkan ke email terdaftar Anda dalam beberapa menit. Periksa folder spam jika tidak menerima email.",
      },
    ],
  },
  {
    category: "Wawancara",
    items: [
      {
        q: "Apakah wawancara dilakukan secara online atau tatap muka?",
        a: "Kami menerapkan sistem wawancara yang fleksibel. Wawancara tahap awal (HR Interview) umumnya dilakukan secara online via Google Meet atau Zoom. Wawancara tahap lanjut (User Interview) dapat dilakukan secara online atau tatap muka di kantor kami.",
      },
      {
        q: "Apa yang perlu saya persiapkan sebelum wawancara?",
        a: "Kami menyarankan Anda untuk: (1) Riset mendalam tentang TalentHub dan posisi yang dilamar, (2) Siapkan contoh pengalaman nyata menggunakan metode STAR, (3) Siapkan pertanyaan untuk pewawancara, dan (4) Pastikan koneksi internet stabil jika wawancara online.",
      },
      {
        q: "Berapa banyak tahap wawancara yang biasanya ada?",
        a: "Umumnya ada 2-3 tahap wawancara: HR Interview (30-45 menit), User/Technical Interview dengan hiring manager (60-90 menit), dan untuk posisi senior mungkin ada Panel Interview dengan tim leadership.",
      },
    ],
  },
  {
    category: "Penawaran & Bergabung",
    items: [
      {
        q: "Apakah gaji yang tertera di lowongan bisa dinegosiasikan?",
        a: "Kisaran gaji yang kami tampilkan adalah rentang yang kompetitif sesuai dengan kualifikasi dan pengalaman. Negosiasi gaji adalah hal yang normal dan kami mendorong Anda untuk mendiskusikannya secara terbuka selama proses offering.",
      },
      {
        q: "Berapa lama masa probation di TalentHub?",
        a: "Masa probation standar di TalentHub adalah 3 bulan. Selama masa probation, Anda akan mendapatkan onboarding program yang terstruktur, mentoring dari rekan senior, dan review kinerja di akhir periode.",
      },
      {
        q: "Apakah TalentHub menyediakan relokasi untuk karyawan baru?",
        a: "Untuk posisi tertentu yang memerlukan relokasi, kami menyediakan bantuan relokasi (relocation allowance) yang besarannya akan diinformasikan saat proses offering. Silakan diskusikan kebutuhan relokasi Anda dengan tim HR kami.",
      },
    ],
  },
];
