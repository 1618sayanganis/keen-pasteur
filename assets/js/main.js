/**
 * Wedding Invitation - Kevin & Isabela
 * Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initGuestName();
  initCoverEnvelope();
  initBackgroundMusic();
  initPetalsCanvas();
  initScrollBackground();
  initCountdownTimer();
  initScrollAnimations();
  initGuestbook();
  initClipboardActions();
  initGalleryModal();
});

// 1. Guest Name from URL Parameter (?to=Nama+Tamu)
function initGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || urlParams.get('guest');
  const recipientNameEl = document.getElementById('guest-recipient-name');
  const rsvpNameInput = document.getElementById('rsvp-name');

  if (recipientNameEl && guestName) {
    recipientNameEl.textContent = decodeURIComponent(guestName.replace(/\+/g, ' '));
  }
  if (rsvpNameInput && guestName) {
    rsvpNameInput.value = decodeURIComponent(guestName.replace(/\+/g, ' '));
  }
}

// 2. Cover Opening Animation
function initCoverEnvelope() {
  const openBtn = document.getElementById('btn-open-invitation');
  const coverOverlay = document.getElementById('cover-overlay');
  const waxSeal = document.querySelector('.wax-seal');

  const triggerOpen = () => {
    if (coverOverlay && !coverOverlay.classList.contains('opened')) {
      coverOverlay.classList.add('opened');
      document.body.style.overflow = 'auto';

      // Play music automatically upon user gesture
      playMusic();

      // Trigger animation on first sections
      setTimeout(() => {
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
          heroSection.querySelectorAll('.reveal-on-scroll').forEach(el => {
            el.classList.add('revealed');
          });
        }
      }, 400);
    }
  };

  if (openBtn) openBtn.addEventListener('click', triggerOpen);
  if (waxSeal) waxSeal.addEventListener('click', triggerOpen);

  // Lock scroll when cover is closed
  if (coverOverlay && !coverOverlay.classList.contains('opened')) {
    document.body.style.overflow = 'hidden';
  }
}

// 3. Background Music Control
let audioInstance = null;
let isAudioPlaying = false;

function initBackgroundMusic() {
  audioInstance = document.getElementById('bg-audio');
  const musicToggleBtn = document.getElementById('music-toggle-btn');

  if (!musicToggleBtn || !audioInstance) return;

  musicToggleBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });
}

function playMusic() {
  if (!audioInstance) return;
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicIconPlay = document.getElementById('music-icon-play');
  const musicIconPause = document.getElementById('music-icon-pause');

  audioInstance.play().then(() => {
    isAudioPlaying = true;
    if (musicToggleBtn) musicToggleBtn.classList.add('rotating');
    if (musicIconPlay) musicIconPlay.classList.add('hidden');
    if (musicIconPause) musicIconPause.classList.remove('hidden');
  }).catch(err => {
    console.log('Autoplay deferred by browser policy:', err);
  });
}

function pauseMusic() {
  if (!audioInstance) return;
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicIconPlay = document.getElementById('music-icon-play');
  const musicIconPause = document.getElementById('music-icon-pause');

  audioInstance.pause();
  isAudioPlaying = false;
  if (musicToggleBtn) musicToggleBtn.classList.remove('rotating');
  if (musicIconPlay) musicIconPlay.classList.remove('hidden');
  if (musicIconPause) musicIconPause.classList.add('hidden');
}

// 4. Romantic Floating Petals / Sparkles Canvas Animation
function initPetalsCanvas() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petalsCount = 28;
  const petals = [];

  const petalColors = [
    'rgba(242, 218, 206, 0.65)',
    'rgba(247, 235, 224, 0.7)',
    'rgba(235, 189, 180, 0.55)',
    'rgba(223, 186, 115, 0.45)' // gold speckle
  ];

  for (let i = 0; i < petalsCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 6,
      speedX: (Math.random() - 0.5) * 1.2 + 0.3,
      speedY: Math.random() * 1.2 + 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      sway: Math.random() * 100,
      swaySpeed: Math.random() * 0.02 + 0.01
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(p.size / 2, -p.size, p.size, -p.size / 2, p.size, 0);
    ctx.bezierCurveTo(p.size, p.size / 2, p.size / 2, p.size, 0, 0);
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let p of petals) {
      p.sway += p.swaySpeed;
      p.x += p.speedX + Math.sin(p.sway) * 0.7;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) {
        p.x = -20;
      } else if (p.x < -20) {
        p.x = width + 20;
      }

      drawPetal(p);
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// 5. Dynamic Countdown Timer
function initCountdownTimer() {
  // Target: 24 October 2026 09:00:00 WIB
  const targetDate = new Date('2026-10-24T09:00:00+07:00').getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// 6. Intersection Observer for Scroll Animations
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// 7. Interactive Guestbook / RSVP with LocalStorage
function initGuestbook() {
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesList = document.getElementById('wishes-list');

  const defaultWishes = [
    {
      name: "Pdt. Markus & Keluarga",
      status: "Hadir",
      message: "Selamat menempuh hidup baru Kevin & Isabela. Kiranya kasih Kristus senantiasa menjadi fondasi yang kokoh dalam bahtera rumah tangga kalian. Tuhan memberkati berlimpah-limpah!",
      time: "Kemarin, 19:40"
    },
    {
      name: "David Christian & Partner",
      status: "Hadir",
      message: "Happy wedding bro Kevin & Isabela! Sangat bersukacita melihat perjalanan kalian dari awal sampai di pelaminan. Langgeng sampai maut memisahkan ya!",
      time: "2 hari lalu"
    },
    {
      name: "Priscillia & Family",
      status: "Hadir",
      message: "Congratulation Bela & Kevin! Semoga damai sejahtera dan sukacita sorgawi selalu menyertai keluarga baru kalian. Can't wait for your big day!",
      time: "3 hari lalu"
    }
  ];

  const API_URL = '/api/wishes';
  let cachedWishes = [];

  // 1. READ (GET)
  async function fetchWishes() {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        cachedWishes = data;
        localStorage.setItem('wedding_kevin_isabela_wishes', JSON.stringify(data));
        renderWishes(cachedWishes);
        return;
      }
    } catch (err) {
      console.log('API not available, fallback to local data/wishes.json & localStorage', err);
    }

    // Fallback: try data/wishes.json directly or localStorage
    try {
      const res = await fetch('data/wishes.json');
      if (res.ok) {
        const data = await res.json();
        cachedWishes = data;
        renderWishes(cachedWishes);
        return;
      }
    } catch (e) {}

    const stored = localStorage.getItem('wedding_kevin_isabela_wishes');
    cachedWishes = stored ? JSON.parse(stored) : defaultWishes;
    renderWishes(cachedWishes);
  }

  function renderWishes(wishes) {
    if (!wishesList) return;
    wishesList.innerHTML = '';

    if (!wishes || wishes.length === 0) {
      wishesList.innerHTML = '<p class="text-center text-xs text-stone-400 py-4">Belum ada ucapan doa. Jadilah yang pertama memberikan doa!</p>';
      return;
    }

    wishes.forEach(item => {
      const card = document.createElement('div');
      card.className = 'p-4 rounded-xl bg-white/70 border border-[#c59b27]/20 shadow-sm text-left transition hover:shadow-md relative group';
      
      const badgeColor = item.status === 'Hadir' 
        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
        : 'bg-amber-100 text-amber-800 border-amber-300';

      const itemId = item.id || Date.now().toString();

      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-stone-800 font-playfair">${escapeHtml(item.name)}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2.5 py-0.5 rounded-full border ${badgeColor} font-medium">${escapeHtml(item.status)}</span>
            <!-- Action buttons for CRUD -->
            <button class="btn-edit-wish text-stone-400 hover:text-amber-600 transition p-1" data-id="${itemId}" title="Edit Ucapan">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button class="btn-delete-wish text-stone-400 hover:text-red-600 transition p-1" data-id="${itemId}" title="Hapus Ucapan">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
        <p class="text-stone-600 text-sm leading-relaxed mb-2 font-normal">${escapeHtml(item.message)}</p>
        <div class="flex items-center justify-between text-[11px] text-stone-400">
          <span>${item.updatedAt ? 'Diedit' : ''}</span>
          <span>${escapeHtml(item.time || 'Baru saja')}</span>
        </div>
      `;
      wishesList.appendChild(card);
    });
  }

  // 2. CREATE (POST)
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvp-name').value.trim();
      const status = document.getElementById('rsvp-status').value;
      const message = document.getElementById('rsvp-message').value.trim();

      if (!name || !message) {
        showToast('Mohon isi nama dan ucapan doa Anda.');
        return;
      }

      const payload = {
        name: name,
        status: status,
        message: message
      };

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          showToast('Puji Tuhan, doa restu Anda berhasil disimpan!');
          rsvpForm.reset();
          await fetchWishes();
          return;
        }
      } catch (err) {
        console.log('Post API failed, saving locally', err);
      }

      // Local fallback
      const localNewWish = {
        id: Date.now().toString(),
        name: name,
        status: status,
        message: message,
        time: 'Baru saja',
        createdAt: new Date().toISOString()
      };
      cachedWishes.unshift(localNewWish);
      localStorage.setItem('wedding_kevin_isabela_wishes', JSON.stringify(cachedWishes));
      renderWishes(cachedWishes);
      rsvpForm.reset();
      showToast('Puji Tuhan, konfirmasi & doa restu Anda berhasil dikirim!');
    });
  }

  // 3. UPDATE (PUT) & 4. DELETE
  const editModal = document.getElementById('edit-wish-modal');
  const editForm = document.getElementById('edit-wish-form');
  const editIdInput = document.getElementById('edit-wish-id');
  const editNameInput = document.getElementById('edit-wish-name');
  const editStatusInput = document.getElementById('edit-wish-status');
  const editMessageInput = document.getElementById('edit-wish-message');
  const closeEditModalBtn = document.getElementById('close-edit-modal');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  const closeEditModal = () => {
    if (editModal) {
      editModal.classList.add('hidden');
      editModal.classList.remove('flex');
    }
  };

  if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  // Edit Form Submit (PUT)
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editIdInput.value;
      const name = editNameInput.value.trim();
      const status = editStatusInput.value;
      const message = editMessageInput.value.trim();

      if (!name || !message) {
        showToast('Nama dan doa restu tidak boleh kosong.');
        return;
      }

      const payload = { name, status, message };

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          showToast('Ucapan doa berhasil diperbarui!');
          closeEditModal();
          await fetchWishes();
          return;
        }
      } catch (err) {
        console.log('Update API failed, updating locally', err);
      }

      // Local fallback
      const idx = cachedWishes.findIndex(w => w.id === id);
      if (idx !== -1) {
        cachedWishes[idx].name = name;
        cachedWishes[idx].status = status;
        cachedWishes[idx].message = message;
        cachedWishes[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('wedding_kevin_isabela_wishes', JSON.stringify(cachedWishes));
        renderWishes(cachedWishes);
      }
      closeEditModal();
      showToast('Ucapan doa berhasil diperbarui!');
    });
  }

  // Click delegation for Edit & Delete buttons
  if (wishesList) {
    wishesList.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.btn-edit-wish');
      const deleteBtn = e.target.closest('.btn-delete-wish');

      // Edit Click
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const item = cachedWishes.find(w => w.id === id);
        if (item) {
          editIdInput.value = item.id;
          editNameInput.value = item.name;
          editStatusInput.value = item.status || 'Hadir';
          editMessageInput.value = item.message;
          if (editModal) {
            editModal.classList.remove('hidden');
            editModal.classList.add('flex');
          }
        }
        return;
      }

      // Delete Click
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (!confirm('Apakah Anda yakin ingin menghapus ucapan doa ini?')) {
          return;
        }

        try {
          const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Ucapan doa berhasil dihapus.');
            await fetchWishes();
            return;
          }
        } catch (err) {
          console.log('Delete API failed, deleting locally', err);
        }

        // Local fallback
        cachedWishes = cachedWishes.filter(w => w.id !== id);
        localStorage.setItem('wedding_kevin_isabela_wishes', JSON.stringify(cachedWishes));
        renderWishes(cachedWishes);
        showToast('Ucapan doa berhasil dihapus.');
      }
    });
  }

  // Initial Fetch
  fetchWishes();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// 8. Clipboard Copy & Toast Feedback
function initClipboardActions() {
  const copyButtons = document.querySelectorAll('.btn-copy-account');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const accountNum = btn.getAttribute('data-account');
      if (!accountNum) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(accountNum).then(() => {
          showToast(`Nomor rekening ${accountNum} berhasil disalin!`);
        }).catch(() => {
          fallbackCopy(accountNum);
        });
      } else {
        fallbackCopy(accountNum);
      }
    });
  });
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`Nomor rekening ${text} berhasil disalin!`);
  } catch (err) {
    showToast('Gagal menyalin nomor rekening.');
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg class="w-5 h-5 text-amber-400 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// 9. Photo Lightbox Modal & Load More
function initGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('modal-image');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !modalImg) return;

  // Event delegation to support dynamically loaded photos
  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('.gallery-thumb');
    if (thumb) {
      const src = thumb.getAttribute('data-fullsrc') || thumb.src;
      modalImg.src = src;
      modal.classList.add('active');
    }
  });

  const closeModal = () => {
    modal.classList.remove('active');
    modalImg.src = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Setup Load More Photos Button
  initLoadMorePhotos();
}

function initLoadMorePhotos() {
  const loadMoreBtn = document.getElementById('btn-load-more-photos');
  const extraGrid = document.getElementById('extra-gallery-grid');
  const loadMoreText = document.getElementById('load-more-text');

  if (!loadMoreBtn || !extraGrid) return;

  const initialPhotos = new Set([
    'DSC00155.jpg', 'DSC00180.jpg', 'DSC00194.jpg', 'DSC00160.jpg',
    'DSC00202.jpg', 'DSC00241.jpg', 'DSC00309.jpg', 'DSC00268.jpg'
  ]);

  let allPhotos = [];
  let loadedIndex = 0;
  const batchSize = 6;

  // Fetch available photos list
  fetch('assets/js/gallery_data.json')
    .then(res => res.json())
    .then(data => {
      allPhotos = data.filter(fname => !initialPhotos.has(fname));
      if (allPhotos.length === 0) {
        loadMoreBtn.parentElement.classList.add('hidden');
      }
    })
    .catch(() => {
      // Fallback list of curated compressed photos
      allPhotos = [
        'DSC00157.jpg', 'DSC00161.jpg', 'DSC00169.jpg', 'DSC00178.jpg',
        'DSC00183.jpg', 'DSC00205.jpg', 'DSC00250.jpg', 'DSC00269.jpg',
        'DSC00313.jpg', 'DSC00314.jpg'
      ];
    });

  loadMoreBtn.addEventListener('click', () => {
    if (allPhotos.length === 0) return;

    extraGrid.classList.remove('hidden');
    const nextBatch = allPhotos.slice(loadedIndex, loadedIndex + batchSize);

    nextBatch.forEach((photo, idx) => {
      const isSpan = (idx % 3 === 1);
      const card = document.createElement('div');
      card.className = `overflow-hidden rounded-2xl border border-gold/20 shadow-sm cursor-pointer group ${isSpan ? 'aspect-[3/4] row-span-2' : 'aspect-square'}`;
      card.innerHTML = `
        <img src="assets/images/${photo}" alt="Momen Prewedding" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 gallery-thumb" loading="lazy">
      `;
      extraGrid.appendChild(card);
    });

    loadedIndex += nextBatch.length;

    if (loadedIndex >= allPhotos.length) {
      loadMoreBtn.parentElement.classList.add('hidden');
    } else {
      if (loadMoreText) {
        loadMoreText.textContent = `Lihat Lebih Banyak (${allPhotos.length - loadedIndex} tersisa)`;
      }
    }
  });
}

// 10. Scroll-driven Canvas Motion Background (Mulai dari Section Firman Tuhan)
function initScrollBackground() {
  const canvas = document.getElementById('scroll-bg-canvas');
  const container = document.getElementById('scroll-bg-container');
  const triggerSection = document.getElementById('section-firman-tuhan');

  if (!canvas || !container || !triggerSection) return;

  const ctx = canvas.getContext('2d');
  const totalFrames = 50;
  const frames = [];
  let currentFrameIndex = 0;
  let isLoaded = false;
  let loadedCount = 0;

  // Set proper canvas pixel ratio
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    renderFrame(currentFrameIndex);
  }

  window.addEventListener('resize', resizeCanvas);

  // Preload frames (prioritaskan WebP yang ringan ~2.4MB total, fallback ke PNG)
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    const numStr = String(i).padStart(3, '0');
    img.src = `assets/bg_opt/ezgif-frame-${numStr}.webp`;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === 1) {
        renderFrame(0);
      }
      if (loadedCount >= totalFrames) {
        isLoaded = true;
      }
    };
    img.onerror = () => {
      // Fallback to original PNG if WebP fails
      img.src = `assets/bg/ezgif-frame-${numStr}.png`;
    };
    frames.push(img);
  }

  // Draw image to canvas cover-style
  function renderFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const ox = (cw - nw) / 2;
    const oy = (ch - nh) / 2;

    ctx.drawImage(img, ox, oy, nw, nh);
  }

  // Calculate scroll position relative to triggerSection
  function onScrollUpdate() {
    const sectionRect = triggerSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Trigger section top relative to document
    const sectionTopDoc = triggerSection.offsetTop;

    // Mulai tampilkan background saat section Firman Tuhan mendekati viewport
    if (sectionRect.top <= viewportHeight * 0.85) {
      container.style.opacity = '1';
    } else {
      container.style.opacity = '0';
    }

    // Hitung progress scroll dari Firman Tuhan sampai bawah halaman
    const scrollStart = sectionTopDoc - (viewportHeight * 0.5);
    const scrollEnd = docHeight - viewportHeight;
    const scrollDistance = Math.max(1, scrollEnd - scrollStart);

    let progress = (scrollTop - scrollStart) / scrollDistance;
    progress = Math.max(0, Math.min(1, progress));

    // Map progress 0..1 ke index frame 0..(totalFrames - 1)
    const targetIndex = Math.min(totalFrames - 1, Math.floor(progress * (totalFrames - 1)));

    if (targetIndex !== currentFrameIndex) {
      currentFrameIndex = targetIndex;
      requestAnimationFrame(() => renderFrame(currentFrameIndex));
    }
  }

  window.addEventListener('scroll', onScrollUpdate, { passive: true });
  resizeCanvas();
  onScrollUpdate();
}
