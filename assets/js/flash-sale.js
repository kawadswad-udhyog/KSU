// Extracted interactive scripts from flash-sale.html
// Responsible: mobile menu toggle, cart state, toasts, claim handlers, countdown

if (typeof lucide !== 'undefined') { try{ lucide.createIcons(); }catch(e){} }

// Mobile menu toggle
const mobileToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden');
    mobileToggle.setAttribute('aria-expanded', String(!isHidden));
  });
}

// Safe localStorage parsing
function safeJSONParse(str, fallback = []) { try { return JSON.parse(str) || fallback; } catch (e) { return fallback; } }
function storageAvailable(type) { try { var storage = window[type], x = '__storage_test__'; storage.setItem(x, x); storage.removeItem(x); return true; } catch(e) { return false; } }

let cart = [];
if (storageAvailable('localStorage')) { cart = safeJSONParse(localStorage.getItem('ks_cart'), []); }

function updateCartBadge() { let totalItems = cart.reduce((acc, item) => acc + (item.qty || 0), 0); const badge = document.getElementById('cart-badge'); if (badge) badge.textContent = totalItems; }
function saveCart() { if (!storageAvailable('localStorage')) return; localStorage.setItem('ks_cart', JSON.stringify(cart)); updateCartBadge(); }

function announceToast(msg) { const hub = document.getElementById('toast-hub'); if (!hub) return; const toast = document.createElement('div'); toast.className = 'glass-panel px-4 py-3 rounded-xl border border-brand-accent/40 text-xs font-bold text-white shadow-xl toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite'); toast.textContent = msg; hub.appendChild(toast); setTimeout(() => { toast.remove(); }, 2500); }

function claimDealFromData(attrs) {
  const { sku, title, weight, price, mrp, img } = attrs;
  let existing = cart.find(i => i.id === sku);
  if (existing) { existing.qty += 1; } else { cart.push({ id: sku, title, weight, price: Number(price), mrp: Number(mrp), shipping: weight === '1000g' ? 0 : 49, qty: 1, img }); }
  saveCart(); announceToast(`Claimed ${title}! Added to cart.`);
}

// Event delegation for claim buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-claim-sku]'); if (!btn) return;
  const sku = btn.getAttribute('data-claim-sku'); const title = btn.getAttribute('data-title') || 'Product';
  const weight = btn.getAttribute('data-weight') || ''; const price = btn.getAttribute('data-price') || 0;
  const mrp = btn.getAttribute('data-mrp') || 0; const img = btn.getAttribute('data-img') || '';
  claimDealFromData({ sku, title, weight, price, mrp, img });
});

// Robust countdown using a target end time (today at 18:00 local, or next day)
const saleEnd = (function(){ const now = new Date(); const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0); if (target.getTime() <= now.getTime()) { target.setDate(target.getDate() + 1); } return target.getTime(); })();
function updateTimer() {
  const now = Date.now(); let diff = Math.max(0, saleEnd - now);
  const hours = Math.floor(diff / 3600000); diff %= 3600000; const minutes = Math.floor(diff / 60000); diff %= 60000; const seconds = Math.floor(diff / 1000); const ms = Math.floor((diff % 1000) / 100);
  const elH = document.getElementById('timer-hours'); const elM = document.getElementById('timer-minutes'); const elS = document.getElementById('timer-seconds'); const elMs = document.getElementById('timer-ms'); if (elH) elH.textContent = String(hours).padStart(2,'0'); if (elM) elM.textContent = String(minutes).padStart(2,'0'); if (elS) elS.textContent = String(seconds).padStart(2,'0'); if (elMs) elMs.textContent = String(ms);
  if (saleEnd <= now) { document.querySelectorAll('[data-claim-sku]').forEach(b => { b.disabled = true; b.classList.add('opacity-50','cursor-not-allowed'); b.setAttribute('aria-disabled','true'); }); }
}
let timerTick = function(){ updateTimer(); setTimeout(timerTick, 100); };
timerTick();

document.addEventListener('DOMContentLoaded', () => { updateCartBadge(); });
