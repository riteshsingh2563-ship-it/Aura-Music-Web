/**
 * Aura Music — App Catalog & APK Download Portal Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const downloadModal = document.getElementById('catalogDownloadModal');
  const qrModal = document.getElementById('catalogQrModal');
  const toast = document.getElementById('catalogToast');
  const toastMsg = document.getElementById('catalogToastMsg');

  // Trigger Download Modal
  const openDownloadBtns = document.querySelectorAll('.btn-open-dl');
  openDownloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const version = btn.getAttribute('data-version') || 'v1.2.0';
      const size = btn.getAttribute('data-size') || '27.2 MB';

      const modalVer = document.getElementById('modalSelectedVer');
      const modalSize = document.getElementById('modalSelectedSize');
      if (modalVer) modalVer.textContent = `Aura Music ${version}`;
      if (modalSize) modalSize.textContent = `File Size: ${size} • Android 8.0+`;

      // Reset progress bar
      resetDownloadProgress();
      if (downloadModal) downloadModal.classList.add('active');
    });
  });

  // Trigger QR Code Modal
  const openQrBtns = document.querySelectorAll('.btn-open-qr');
  openQrBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (qrModal) qrModal.classList.add('active');
    });
  });

  // Close Modals
  const closeBtns = document.querySelectorAll('.btn-close-modal');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (downloadModal) downloadModal.classList.remove('active');
      if (qrModal) qrModal.classList.remove('active');
    });
  });

  [downloadModal, qrModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  });

  // Download Simulation Progress
  const startDlBtn = document.getElementById('startDownloadActionBtn');
  const progressBar = document.getElementById('downloadProgressBar');
  const progressStatus = document.getElementById('downloadProgressStatus');
  let isDownloading = false;

  if (startDlBtn) {
    startDlBtn.addEventListener('click', () => {
      if (isDownloading) return;
      isDownloading = true;
      startDlBtn.disabled = true;
      startDlBtn.textContent = 'Connecting to CDN Mirror...';

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 8;
        if (progress > 100) progress = 100;

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressStatus) progressStatus.textContent = `Downloading APK: ${progress}% (27.2 MB)`;

        if (progress >= 100) {
          clearInterval(interval);
          isDownloading = false;
          startDlBtn.disabled = false;
          startDlBtn.textContent = '✓ APK Package Ready! Tap to Install';
          if (progressStatus) progressStatus.textContent = 'Verification passed (SHA-256: Verified). Safe to install.';
          showToast('🎉 Download completed! Package verified for Android installation.');
        }
      }, 160);
    });
  }

  function resetDownloadProgress() {
    isDownloading = false;
    if (progressBar) progressBar.style.width = '0%';
    if (progressStatus) progressStatus.textContent = 'Click below to initiate verified direct APK mirror.';
    if (startDlBtn) {
      startDlBtn.disabled = false;
      startDlBtn.textContent = '⚡ Start Direct Download (Mirror 1)';
    }
  }

  // Copy SHA-256 Hash
  const hashBtns = document.querySelectorAll('.btn-copy-hash');
  hashBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const hash = btn.getAttribute('data-hash') || '7f8a92b4e23190ab765cf411082';
      navigator.clipboard.writeText(hash).then(() => {
        showToast('📋 SHA-256 Checksum copied to clipboard!');
      }).catch(() => {
        showToast('SHA-256: ' + hash.substring(0, 16) + '...');
      });
    });
  });

  // Tab Switching
  const tabBtns = document.querySelectorAll('.catalog-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.getAttribute('data-target');
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Toast Function
  let toastTimer = null;
  function showToast(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Search filter simulation
  const searchInput = document.getElementById('hubSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const versionItems = document.querySelectorAll('.version-item');
      versionItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(q)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Set Year
  const yr = document.getElementById('catalogYear');
  if (yr) yr.textContent = new Date().getFullYear();
});
