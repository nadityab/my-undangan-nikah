/**
 * Logika Integrasi API Ucapan & Doa Restu (MongoDB)
 * Standar Clean Architecture - 100% INSTANT SHOW (NO AOS ANIMATION)
 */

// Konfigurasi URL API Backend (Ubah ke IP/Domain VPS jika sudah deploy)
const API_URL = "http://localhost:3001/api/ucapan";

// Helper XSS Protection untuk menetralkan input karakter ilegal dari tamu usil
function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        tag
      ] || tag)
  );
}

// 1. FUNGSI FETCH DATA (GET): Mengambil & Merender List Ucapan dari MongoDB (Instant Tampil)
// 1. FUNGSI FETCH DATA (GET): Mengambil & Merender List Ucapan dari MongoDB (Instant Tampil & Compact Mobile UX)
export async function muatDaftarUcapan() {
  const containerComments = document.getElementById("comments");
  if (!containerComments) return;

  try {
    containerComments.setAttribute("data-loading", "true");
    containerComments.innerHTML = `
        <div class="text-center my-4">
          <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
          <div class="small text-body-secondary">Memuat ucapan hangat...</div>
        </div>
      `;

    const response = await fetch(API_URL);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      let htmlContent = "";

      result.data.forEach((item) => {
        // Pemetaan status konfirmasi kehadiran tamu
        let statusKehadiran = "❔ Ragu";
        let badgeClass =
          "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle";
        if (item.kehadiran === 1) {
          statusKehadiran = "✅ Hadir";
          badgeClass =
            "bg-success-subtle text-success-emphasis border border-success-subtle";
        }
        if (item.kehadiran === 2) {
          statusKehadiran = "❌ Absen";
          badgeClass =
            "bg-danger-subtle text-danger-emphasis border border-danger-subtle";
        }

        // Formatting timestamp database ke format lokal Indonesia
        const tanggal = new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // STRUKTUR KOMPONEN KARTU - SEJAJAR HORIZONTAL DI MOBILE (COMPACT & CLEAN UX)
        htmlContent += `
            <div class="card bg-theme-auto border border-secondary-subtle shadow-sm p-3 mb-2 rounded-4">
              <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                <h6 class="m-0 fw-bold text-body text-truncate" style="font-size: 0.9rem; max-width: 65%;">
                  <i class="fa-regular fa-user me-1 text-primary opacity-75"></i>${escapeHTML(
                    item.nama
                  )}
                </h6>
                <span class="badge ${badgeClass} rounded-pill flex-shrink-0" style="font-size: 0.65rem; padding: 0.35em 0.65em; font-weight: 600;">
                  ${statusKehadiran}
                </span>
              </div>
              <p class="mb-1 text-body" style="white-space: pre-line; line-height: 1.5; font-size: 0.85rem; letter-spacing: 0.1px;">
                ${escapeHTML(item.ucapan)}
              </p>
              <div class="text-end pt-1" style="margin-top: -3px;">
                <small class="text-body-secondary fw-normal" style="font-size: 0.6rem; opacity: 0.8;">
                  <i class="fa-regular fa-clock me-1" style="font-size: 0.55rem;"></i>${tanggal}
                </small>
              </div>
            </div>
          `;
      });

      containerComments.innerHTML = htmlContent;
    } else {
      containerComments.innerHTML =
        '<div class="text-center my-4"><small class="text-body-secondary opacity-75">Belum ada ucapan doa. Jadilah yang pertama!</small></div>';
    }
  } catch (error) {
    console.error("❌ Gagal memuat ucapan:", error);
    containerComments.innerHTML =
      '<div class="text-center my-4"><small class="text-danger fw-bold">Gagal memuat daftar ucapan dari server.</small></div>';
  } finally {
    containerComments.setAttribute("data-loading", "false");
  }
}

// 2. FUNGSI SUBMIT DATA (POST): Mengirim ucapan baru dari form tamu ke API
export async function kirimUcapanBaru(e) {
  if (e) e.preventDefault();

  const namaInput = document.getElementById("form-name-view");
  const kehadiranInput = document.getElementById("form-presence-view");
  const ucapanInput = document.getElementById("form-comment-view");
  const infoBox = document.getElementById("information");

  const namaValue = namaInput ? namaInput.value.trim() : "";
  const ucapanValue = ucapanInput ? ucapanInput.value.trim() : "";
  const kehadiranValue = kehadiranInput ? parseInt(kehadiranInput.value) : 0;

  // VALIDASI 1: Cek apakah Nama kosong
  if (
    !namaValue ||
    (namaValue.toLowerCase() === "anonymous" && namaInput.value.trim() === "")
  ) {
    if (infoBox) {
      infoBox.innerHTML = `
          <div class="alert alert-warning p-2 small border-0 rounded-3 d-flex align-items-center">
            <i class="fa-solid fa-triangle-exclamation me-2"></i> Mohon mengisi nama anda terlebih dahulu!
          </div>
        `;
    }
    namaInput?.focus();
    return;
  }

  // VALIDASI 2: Cek apakah opsi Kehadiran belum dipilih (Masih bernilai 0)
  if (kehadiranValue === 0) {
    if (infoBox) {
      infoBox.innerHTML = `
          <div class="alert alert-warning p-2 small border-0 rounded-3 d-flex align-items-center">
            <i class="fa-solid fa-triangle-exclamation me-2"></i> Tolong konfirmasi kehadiran Anda terlebih dahulu!
          </div>
        `;
    }
    kehadiranInput?.focus();
    return;
  }

  // VALIDASI 3: Cek apakah Ucapan/Pesan Doa kosong
  if (!ucapanValue) {
    if (infoBox) {
      infoBox.innerHTML = `
          <div class="alert alert-warning p-2 small border-0 rounded-3 d-flex align-items-center">
            <i class="fa-solid fa-triangle-exclamation me-2"></i> Mohon menuliskan ucapan atau doa restu Anda terlebih dahulu!
          </div>
        `;
    }
    ucapanInput?.focus();
    return;
  }

  const payload = {
    nama: namaValue,
    kehadiran: kehadiranValue,
    ucapan: ucapanValue,
  };

  try {
    if (infoBox) {
      infoBox.innerHTML = `
        <div class="alert alert-info p-2 small border-0 rounded-3 d-flex align-items-center">
          <div class="spinner-border spinner-border-sm text-info me-2" role="status"></div> Mengirim pesan doa...
        </div>
      `;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      if (infoBox) {
        infoBox.innerHTML = `
          <div class="alert alert-success p-2 small border-0 rounded-3 d-flex align-items-center">
            <i class="fa-solid fa-circle-check me-2"></i> 🎉 Terima kasih! Ucapan berhasil terkirim.
          </div>
        `;
      }

      ucapanInput.value = "";
      if (kehadiranInput) kehadiranInput.value = "0";

      setTimeout(() => {
        if (infoBox) infoBox.innerHTML = "";
      }, 3000);

      // Ambil ulang list ucapan dari MongoDB secara instan
      muatDaftarUcapan();
    } else {
      if (infoBox)
        infoBox.innerHTML = `<div class="alert alert-danger p-2 small border-0 rounded-3">Gagal: ${result.message}</div>`;
    }
  } catch (error) {
    console.error("❌ Gagal mengirim data ucapan:", error);
    if (infoBox)
      infoBox.innerHTML =
        '<div class="alert alert-danger p-2 small border-0 rounded-3">Terjadi gangguan jaringan ke server backend.</div>';
  }
}
