/**
 * نظام قيد (QAYD) - إدارة التراخيص، معرّف الجهاز، والتوقيع الرقمي أوفلاين
 * Offline License Verification, Hardware ID Fingerprint & Monotonic Clock Protection
 */

export interface LicensePayload {
  deviceId: string;
  clientName?: string;
  companyId?: string;
  plan: 'annual' | 'lifetime' | 'trial';
  amount: number; // 500 SAR
  durationDays: number; // 365
  graceDays: number; // 30
  issuedAt: number; // timestamp
  expiresAt: number; // timestamp
  nonce: string;
}

export interface LicenseInfo {
  status: 'active' | 'grace_period' | 'expired_locked' | 'tampered_locked';
  deviceId: string;
  clientName: string;
  expiresAt: number; // epoch ms
  graceExpiresAt: number; // epoch ms
  daysRemaining: number;
  graceDaysRemaining: number;
  isTampered: boolean;
  lastVerifiedAt: number;
  lastMonotonicTime: number;
  amount: number;
}

// ---------------------------------------------------------------------------
// Cryptographic Keys (ECDSA P-256)
// Public Key is embedded for 100% offline client-side verification
// ---------------------------------------------------------------------------
export const QAYD_PUBLIC_JWK: JsonWebKey = {
  kty: 'EC',
  x: 'qNmTS-ow4eUrgZlhNr2Tjr-Or5EdPIlru7nlFpReM5I',
  y: 'uQrGOWOqID0ZWorStbOoY8me0e6SRp242mQ-PBaJEec',
  crv: 'P-256'
};

// Private Key for Hostinger backend / Super Admin offline key generation
export const QAYD_ADMIN_PRIVATE_JWK: JsonWebKey = {
  kty: 'EC',
  x: 'qNmTS-ow4eUrgZlhNr2Tjr-Or5EdPIlru7nlFpReM5I',
  y: 'uQrGOWOqID0ZWorStbOoY8me0e6SRp242mQ-PBaJEec',
  crv: 'P-256',
  d: 'UOyMMZnbmxGV6xaWia22RBgwFGSAhd0SE1w2rJ85vXI'
};

const STORAGE_KEY_LICENSE = 'qayd_offline_license_data';
const STORAGE_KEY_DEVICE_ID = 'qayd_hardware_device_id';
const STORAGE_KEY_MONOTONIC = 'qayd_monotonic_timestamp';
const STORAGE_KEY_TAMPERED = 'qayd_clock_tampered';
const INITIAL_GRACE_DAYS = 30; // مهلة السداد 30 يوماً
const ANNUAL_FEE_SAR = 500; // 500 ريال سنوياً

// ---------------------------------------------------------------------------
// 1. Device Hardware ID Generation
// ---------------------------------------------------------------------------
export async function getOrCreateDeviceHardwareId(): Promise<string> {
  if (typeof window === 'undefined') return 'QAYD-HW-DEV-0000';

  try {
    const cached = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (cached && /^QAYD-HW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cached)) {
      return cached;
    }

    // Combine stable browser & hardware characteristics
    const screenRes = `${window.screen?.width || 1920}x${window.screen?.height || 1080}x${window.screen?.colorDepth || 24}`;
    const cores = navigator.hardwareConcurrency || 4;
    const lang = navigator.language || 'ar';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh';
    const ua = navigator.userAgent || 'QaydPOS';
    
    // Persistent machine seed
    let machineSeed = localStorage.getItem('qayd_hw_seed');
    if (!machineSeed) {
      machineSeed = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('qayd_hw_seed', machineSeed);
    }

    const rawFingerprint = `${screenRes}|${cores}|${lang}|${tz}|${ua}|${machineSeed}`;
    
    // SHA-256 hash using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(rawFingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Format: QAYD-HW-XXXX-XXXX-XXXX
    const p1 = hex.substring(0, 4);
    const p2 = hex.substring(4, 8);
    const p3 = hex.substring(8, 12);
    const formattedId = `QAYD-HW-${p1}-${p2}-${p3}`;

    localStorage.setItem(STORAGE_KEY_DEVICE_ID, formattedId);
    return formattedId;
  } catch (err) {
    console.warn('Error generating hardware ID:', err);
    return 'QAYD-HW-A1B2-C3D4-E5F6';
  }
}

// ---------------------------------------------------------------------------
// 2. Monotonic Clock Tracking (Anti-Tampering Protection)
// ---------------------------------------------------------------------------
export function updateAndCheckMonotonicTime(): { effectiveTime: number; isTampered: boolean } {
  if (typeof window === 'undefined') {
    return { effectiveTime: Date.now(), isTampered: false };
  }

  const now = Date.now();
  const savedMonotonic = Number(localStorage.getItem(STORAGE_KEY_MONOTONIC) || '0');
  const wasTampered = localStorage.getItem(STORAGE_KEY_TAMPERED) === 'true';

  // Check if system clock was moved backwards by more than 5 minutes (300,000 ms)
  if (savedMonotonic > 0 && (savedMonotonic - now) > 300000) {
    console.error('QAYD SECURITY WARNING: System clock tampering detected!');
    localStorage.setItem(STORAGE_KEY_TAMPERED, 'true');
    // Lock monotonic time to the highest observed time watermark
    return { effectiveTime: savedMonotonic, isTampered: true };
  }

  const effectiveTime = Math.max(now, savedMonotonic);
  localStorage.setItem(STORAGE_KEY_MONOTONIC, String(effectiveTime));

  return { effectiveTime, isTampered: wasTampered };
}

// Reset tampered state (used after admin verification)
export function resetTamperedState() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_TAMPERED);
    localStorage.setItem(STORAGE_KEY_MONOTONIC, String(Date.now()));
  }
}

// ---------------------------------------------------------------------------
// 3. License State & Grace Period Evaluation
// ---------------------------------------------------------------------------
export async function getLicenseInfo(): Promise<LicenseInfo> {
  const deviceId = await getOrCreateDeviceHardwareId();
  const { effectiveTime, isTampered } = updateAndCheckMonotonicTime();

  if (typeof window === 'undefined') {
    return {
      status: 'active',
      deviceId,
      clientName: 'عميل قيد',
      expiresAt: effectiveTime + 86400000 * 365,
      graceExpiresAt: effectiveTime + 86400000 * 395,
      daysRemaining: 365,
      graceDaysRemaining: 30,
      isTampered: false,
      lastVerifiedAt: effectiveTime,
      lastMonotonicTime: effectiveTime,
      amount: ANNUAL_FEE_SAR
    };
  }

  let rawLicense = localStorage.getItem(STORAGE_KEY_LICENSE);
  let licenseData: {
    expiresAt: number;
    graceExpiresAt: number;
    clientName: string;
    amount: number;
    isActivated: boolean;
  };

  if (rawLicense) {
    try {
      licenseData = JSON.parse(rawLicense);
    } catch {
      licenseData = createDefaultTrial(effectiveTime);
    }
  } else {
    // Fresh install gets 30 days grace / trial period automatically
    licenseData = createDefaultTrial(effectiveTime);
    localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify(licenseData));
  }

  // Calculate day differences using effective Monotonic time
  const msPerDay = 86400000;
  const daysRemaining = Math.max(0, Math.ceil((licenseData.expiresAt - effectiveTime) / msPerDay));
  const graceDaysRemaining = Math.max(0, Math.ceil((licenseData.graceExpiresAt - effectiveTime) / msPerDay));

  let status: LicenseInfo['status'] = 'active';

  if (isTampered) {
    status = 'tampered_locked';
  } else if (effectiveTime <= licenseData.expiresAt) {
    status = 'active';
  } else if (effectiveTime <= licenseData.graceExpiresAt) {
    status = 'grace_period';
  } else {
    status = 'expired_locked';
  }

  return {
    status,
    deviceId,
    clientName: licenseData.clientName || 'مؤسسة قيد التجارية',
    expiresAt: licenseData.expiresAt,
    graceExpiresAt: licenseData.graceExpiresAt,
    daysRemaining,
    graceDaysRemaining,
    isTampered,
    lastVerifiedAt: Date.now(),
    lastMonotonicTime: effectiveTime,
    amount: licenseData.amount || ANNUAL_FEE_SAR
  };
}

function createDefaultTrial(now: number) {
  const graceDuration = INITIAL_GRACE_DAYS * 86400000;
  return {
    expiresAt: now, // already ready for activation
    graceExpiresAt: now + graceDuration, // 30 days grace period
    clientName: 'مؤسسة قيد التجارية',
    amount: ANNUAL_FEE_SAR,
    isActivated: false
  };
}

// ---------------------------------------------------------------------------
// 4. Digital Signature Verification (100% Offline via Web Crypto)
// ---------------------------------------------------------------------------
export async function verifyOfflineActivationKey(
  keyString: string,
  targetDeviceId?: string
): Promise<{ success: boolean; message: string; payload?: LicensePayload }> {
  try {
    if (!keyString || typeof keyString !== 'string') {
      return { success: false, message: 'كود التفعيل غير مدخل أو فارغ' };
    }

    const cleanKey = keyString.trim().replace(/^QAYD-KEY-/i, '');
    const parts = cleanKey.split('.');
    if (parts.length !== 2) {
      return { success: false, message: 'صيغة كود التفعيل غير صالحة. تأكد من نسخ الكود كاملاً.' };
    }

    const [payloadB64, signatureB64] = parts;
    const payloadJsonStr = base64UrlDecode(payloadB64);
    const payload: LicensePayload = JSON.parse(payloadJsonStr);

    // Validate payload fields
    if (!payload.deviceId || !payload.expiresAt || !payload.plan) {
      return { success: false, message: 'بيانات كود التفعيل غير مكتملة' };
    }

    // Verify Device ID matches current machine (or master device wildcard)
    const currentDeviceId = targetDeviceId || await getOrCreateDeviceHardwareId();
    if (payload.deviceId !== '*' && payload.deviceId !== currentDeviceId) {
      return {
        success: false,
        message: `كود التفعيل مخصص لجهاز آخر (${payload.deviceId}) ولا يطابق معرّف هذا الجهاز (${currentDeviceId})`
      };
    }

    // Import Public Key into browser Web Crypto
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      QAYD_PUBLIC_JWK,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    // Verify ECDSA signature
    const signatureBytes = base64UrlToUint8Array(signatureB64);
    const dataBytes = new TextEncoder().encode(payloadB64);

    const isValid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      signatureBytes,
      dataBytes
    );

    if (!isValid) {
      return { success: false, message: 'فشل التحقق من التوقيع الرقمي! الكود غير أصلي أو تم التعديل عليه.' };
    }

    // Check expiry
    const { effectiveTime } = updateAndCheckMonotonicTime();
    if (payload.expiresAt <= effectiveTime) {
      return { success: false, message: 'كود التفعيل منتهي الصلاحية تاريخياً.' };
    }

    // Successfully verified! Apply license
    resetTamperedState();
    const graceDuration = (payload.graceDays || INITIAL_GRACE_DAYS) * 86400000;
    const newLicenseData = {
      expiresAt: payload.expiresAt,
      graceExpiresAt: payload.expiresAt + graceDuration,
      clientName: payload.clientName || 'مؤسسة قيد التجارية',
      amount: payload.amount || ANNUAL_FEE_SAR,
      isActivated: true,
      lastActivatedAt: Date.now(),
      plan: payload.plan
    };

    localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify(newLicenseData));
    localStorage.setItem(STORAGE_KEY_MONOTONIC, String(effectiveTime));

    return {
      success: true,
      message: `تم تفعيل الاشتراك السنوي بنجاح حتى تاريخ ${new Date(payload.expiresAt).toLocaleDateString('ar-SA')}`,
      payload
    };
  } catch (err: any) {
    console.error('Activation verification error:', err);
    return {
      success: false,
      message: `خطأ أثناء التحقق من كود التفعيل: ${err?.message || 'كود غير صالح'}`
    };
  }
}

// ---------------------------------------------------------------------------
// 5. Offline Activation Key Generator (for Admin, Hostinger backend, or Super Admin)
// ---------------------------------------------------------------------------
export async function generateOfflineActivationKey(
  deviceId: string,
  clientName: string = 'مؤسسة قيد التجارية',
  durationDays: number = 365,
  amount: number = ANNUAL_FEE_SAR
): Promise<string> {
  const now = Date.now();
  const expiresAt = now + durationDays * 86400000;
  const nonce = Math.random().toString(36).substring(2, 10);

  const payload: LicensePayload = {
    deviceId,
    clientName,
    plan: 'annual',
    amount,
    durationDays,
    graceDays: INITIAL_GRACE_DAYS,
    issuedAt: now,
    expiresAt,
    nonce
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));

  // Import Admin Private Key
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    QAYD_ADMIN_PRIVATE_JWK,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const dataBytes = new TextEncoder().encode(payloadB64);
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    dataBytes
  );

  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signatureBuffer));
  return `QAYD-KEY-${payloadB64}.${signatureB64}`;
}

// ---------------------------------------------------------------------------
// Base64Url Helpers (Safe for URLs and Copy/Paste)
// ---------------------------------------------------------------------------
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToUint8Array(str: string): Uint8Array {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
