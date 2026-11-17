/**
 * Secure Backend Authentication & RBAC Service for AKU MUSLIM Owner & Admin
 * Communicates with backend endpoints (/api/auth/...)
 * Employs RFC 6238 TOTP Two-Factor Authentication & Cryptographic Session Tokens
 */

export interface AuthenticatedUser {
  id: string;
  username: string;
  displayName: string;
  role: 'OWNER' | 'ADMIN_KONTEN' | 'REVIEWER_AGAMA';
}

export interface LoginStep1Response {
  success: boolean;
  requiresMfa: boolean;
  mfaEnrolled?: boolean;
  requiresMfaSetup?: boolean;
  challengeToken?: string;
  setupKey?: string;
  otpauthUri?: string;
  qrCodeDataUrl?: string;
  ownerEmail?: string;
  message?: string;
  error?: string;
}

export interface MfaVerifyResponse {
  success: boolean;
  token?: string;
  user?: AuthenticatedUser;
  recoveryCodes?: string[];
  remainingRecoveryCodes?: number;
  message?: string;
  error?: string;
}

export interface MfaSetupInfo {
  username: string;
  role: string;
  totpSecret: string;
  otpAuthUri: string;
  currentLiveToken: string;
}

class OwnerAuthService {
  private sessionToken: string | null = null;
  private currentUser: AuthenticatedUser | null = null;

  constructor() {
    // Restore session if present in sessionStorage
    if (typeof window !== 'undefined') {
      this.sessionToken = sessionStorage.getItem('akumuslim_adm_session');
    }
  }

  getToken(): string | null {
    return this.sessionToken;
  }

  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUser;
  }

  /**
   * Step 1: Submit Username & Password to Server
   */
  async loginStep1(username: string, password: string): Promise<LoginStep1Response> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, requiresMfa: false, error: data.error || 'Autentikasi gagal.' };
      }
      return data;
    } catch {
      return { success: false, requiresMfa: false, error: 'Koneksi ke backend server gagal.' };
    }
  }

  /**
   * Step 2: Submit 6-digit TOTP Token to Server
   */
  async verifyMfa(challengeToken: string, totpCode: string): Promise<MfaVerifyResponse> {
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeToken, totpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verifikasi TOTP MFA gagal.' };
      }

      this.sessionToken = data.token;
      this.currentUser = data.user;
      if (typeof window !== 'undefined' && data.token) {
        sessionStorage.setItem('akumuslim_adm_session', data.token);
      }
      return data;
    } catch {
      return { success: false, error: 'Koneksi ke server gagal saat verifikasi MFA.' };
    }
  }

  /**
   * First-Time MFA Activation: Verify initial 6-digit code and receive recovery codes
   */
  async activateMfa(challengeToken: string, totpCode: string): Promise<MfaVerifyResponse> {
    try {
      const res = await fetch('/api/auth/mfa/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeToken, totpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Aktivasi Google Authenticator gagal.' };
      }

      this.sessionToken = data.token;
      this.currentUser = data.user;
      if (typeof window !== 'undefined' && data.token) {
        sessionStorage.setItem('akumuslim_adm_session', data.token);
      }
      return data;
    } catch {
      return { success: false, error: 'Koneksi ke server gagal saat aktivasi MFA.' };
    }
  }

  /**
   * Login using a single-use Recovery Code
   */
  async loginWithRecoveryCode(challengeToken: string, recoveryCode: string): Promise<MfaVerifyResponse> {
    try {
      const res = await fetch('/api/auth/mfa/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeToken, recoveryCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verifikasi kode pemulihan gagal.' };
      }

      this.sessionToken = data.token;
      this.currentUser = data.user;
      if (typeof window !== 'undefined' && data.token) {
        sessionStorage.setItem('akumuslim_adm_session', data.token);
      }
      return data;
    } catch {
      return { success: false, error: 'Koneksi ke server gagal saat memproses kode pemulihan.' };
    }
  }

  /**
   * Secure Owner MFA Reset Request
   */
  async resetMfa(username: string, password: string, ownerEmail: string, recoveryCode?: string): Promise<LoginStep1Response> {
    try {
      const res = await fetch('/api/auth/mfa/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, ownerEmail, recoveryCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, requiresMfa: false, error: data.error || 'Permintaan reset MFA gagal.' };
      }
      return data;
    } catch {
      return { success: false, requiresMfa: false, error: 'Koneksi ke server gagal saat reset MFA.' };
    }
  }

  /**
   * Check if current session token is still valid on backend
   */
  async checkSession(): Promise<AuthenticatedUser | null> {
    if (!this.sessionToken) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${this.sessionToken}` },
      });
      if (res.ok) {
        const user = await res.json();
        this.currentUser = user;
        return user;
      } else {
        this.logout();
        return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Terminate server session
   */
  async logout(): Promise<void> {
    if (this.sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.sessionToken}` },
        });
      } catch {
        // Ignore
      }
    }
    this.sessionToken = null;
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('akumuslim_adm_session');
    }
  }

  /**
   * Retrieve TOTP setup information from server (authenticated)
   */
  async getMfaSetupInfo(): Promise<MfaSetupInfo | null> {
    if (!this.sessionToken) return null;
    try {
      const res = await fetch('/api/auth/mfa/setup-info', {
        headers: { Authorization: `Bearer ${this.sessionToken}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Fetch server feature flags (Public read)
   */
  async getFeatureFlags() {
    try {
      const res = await fetch('/api/feature-flags');
      if (res.ok) return await res.json();
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Update server feature flags (Protected: OWNER only)
   */
  async updateFeatureFlags(flags: Record<string, boolean>) {
    if (!this.sessionToken) throw new Error('Unauthorized');
    const res = await fetch('/api/feature-flags', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sessionToken}`,
      },
      body: JSON.stringify(flags),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memperbarui feature flags di server.');
    }
    return await res.json();
  }

  /**
   * Fetch server audit logs (Protected: OWNER only)
   */
  async getAuditLogs() {
    if (!this.sessionToken) throw new Error('Unauthorized');
    const res = await fetch('/api/audit-logs', {
      headers: { Authorization: `Bearer ${this.sessionToken}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memuat audit log dari server.');
    }
    return await res.json();
  }

  /**
   * Create server announcement (Protected: OWNER or ADMIN_KONTEN)
   */
  async createAnnouncement(title: string, message: string, type: 'info' | 'important' | 'event' = 'info') {
    if (!this.sessionToken) throw new Error('Unauthorized');
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.sessionToken}`,
      },
      body: JSON.stringify({ title, message, type }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan pengumuman.');
    }
    return await res.json();
  }

  /**
   * Delete server announcement (Protected: OWNER or ADMIN_KONTEN)
   */
  async deleteAnnouncement(id: string) {
    if (!this.sessionToken) throw new Error('Unauthorized');
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.sessionToken}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghapus pengumuman.');
    }
    return await res.json();
  }

  /**
   * Fetch Quran dataset integrity status from server
   */
  async getQuranIntegrity() {
    try {
      const res = await fetch('/api/quran/integrity');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return null;
  }
}

export const ownerAuthService = new OwnerAuthService();
