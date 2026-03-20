import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SystemRole = "user" | "admin";
export type AccountType = "resident" | "official" | "super_admin";
export type VerificationStatus = "pending" | "approved";
export type OfficialPosition = "Barangay Captain" | "Kagawad" | "Secretary / Staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  barangay: string;
  authId: string;
  createdAt: Date;
  accountType: AccountType;
  verificationStatus: VerificationStatus;
  contactNumber?: string;
  address?: string;
  position?: OfficialPosition;
  accessCode?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  isActive?: boolean;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: "pending" | "in-progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  assignedOfficialId?: string;
  assignedOfficialName?: string;
  escalatedAt?: Date;
}

export type AnnouncementAudience = "all" | "residents" | "officials";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  createdAt: Date;
  createdBy: string;
}

export interface SystemSettings {
  barangayName: string;
  reportCategories: string[];
  reportStatusTypes: string[];
  features: {
    reporting: boolean;
    announcements: boolean;
    analytics: boolean;
  };
}

export interface SecurityAccount {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  failedLoginAttempts: number;
  lockedUntil: string | null;
}

interface RegisterInput {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  accessCode: string;
  contactNumber: string;
  address?: string;
  houseNo?: string;
  street?: string;
  purokZone?: string;
  position?: OfficialPosition;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User | null;
  error?: string;
}

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: SystemRole;
  barangay: string;
  auth_id: string;
  created_at: string;
  account_type: AccountType;
  verification_status: VerificationStatus;
  contact_number: string | null;
  address: string | null;
  position: OfficialPosition | null;
  access_code: string | null;
  failed_login_attempts: number | null;
  locked_until: string | null;
  is_active: boolean | null;
};

type ReportRow = {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: Report["status"];
  priority: Report["priority"];
  created_at: string;
  updated_at: string;
  image_url: string | null;
  assigned_official_id: string | null;
  assigned_official_name: string | null;
  escalated_at: string | null;
};

type AnnouncementRow = {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  created_at: string;
  created_by: string;
};

type SystemSettingsRow = {
  id: number;
  barangay_name: string;
  report_categories: string[] | null;
  report_status_types: string[] | null;
  features: SystemSettings["features"] | null;
};

const DEFAULT_BARANGAY_NAME = "Barangay Digital Reporting System";
const CACHE_KEYS = {
  currentUser: "app.currentUser",
  users: "app.users",
  reports: "app.reports",
  announcements: "app.announcements",
  systemSettings: "app.systemSettings",
  securityAccounts: "app.securityAccounts",
};

const defaultSystemSettings: SystemSettings = {
  barangayName: DEFAULT_BARANGAY_NAME,
  reportCategories: ["Infrastructure", "Sanitation", "Public Safety", "Utilities", "Health", "Environment", "Other"],
  reportStatusTypes: ["Pending", "Ongoing", "Resolved", "Rejected"],
  features: {
    reporting: true,
    announcements: true,
    analytics: true,
  },
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const serverFunctionUrl = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/server/make-server-f8425d9e` : null;

const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));
const sanitizePhone = (value: string) => value.replace(/[^\d+]/g, "").trim();
const emailIsValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordIsStrong = (password: string) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

const readCache = <T>(key: string): T | null => {
  const value = localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const writeCache = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const clearCache = (key: string) => localStorage.removeItem(key);

const normalizeSystemSettings = (settings: Partial<SystemSettings> | null | undefined): SystemSettings => ({
  barangayName: settings?.barangayName?.trim() || DEFAULT_BARANGAY_NAME,
  reportCategories: settings?.reportCategories?.filter(Boolean).map((item) => item.trim()).filter(Boolean) || defaultSystemSettings.reportCategories,
  reportStatusTypes: settings?.reportStatusTypes?.filter(Boolean).map((item) => item.trim()).filter(Boolean) || defaultSystemSettings.reportStatusTypes,
  features: {
    reporting: settings?.features?.reporting ?? defaultSystemSettings.features.reporting,
    announcements: settings?.features?.announcements ?? defaultSystemSettings.features.announcements,
    analytics: settings?.features?.analytics ?? defaultSystemSettings.features.analytics,
  },
});

const mapProfileRow = (row: ProfileRow): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  barangay: row.barangay,
  authId: row.auth_id,
  createdAt: toDate(row.created_at),
  accountType: row.account_type,
  verificationStatus: row.verification_status,
  contactNumber: row.contact_number ?? undefined,
  address: row.address ?? undefined,
  position: row.position ?? undefined,
  accessCode: row.access_code ?? undefined,
  failedLoginAttempts: row.failed_login_attempts ?? 0,
  lockedUntil: row.locked_until,
  isActive: row.is_active ?? true,
});

const mapReportRow = (row: ReportRow): Report => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  title: row.title,
  category: row.category,
  description: row.description,
  location: row.location,
  status: row.status,
  priority: row.priority,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
  imageUrl: row.image_url ?? undefined,
  assignedOfficialId: row.assigned_official_id ?? undefined,
  assignedOfficialName: row.assigned_official_name ?? undefined,
  escalatedAt: row.escalated_at ? toDate(row.escalated_at) : undefined,
});

const mapAnnouncementRow = (row: AnnouncementRow): Announcement => ({
  id: row.id,
  title: row.title,
  message: row.message,
  audience: row.audience,
  createdAt: toDate(row.created_at),
  createdBy: row.created_by,
});

const mapSystemSettingsRow = (row: SystemSettingsRow | null): SystemSettings =>
  normalizeSystemSettings(
    row
      ? {
          barangayName: row.barangay_name,
          reportCategories: row.report_categories ?? undefined,
          reportStatusTypes: row.report_status_types ?? undefined,
          features: row.features ?? undefined,
        }
      : defaultSystemSettings,
  );

const cacheCurrentUser = (user: User | null) => {
  if (!user) clearCache(CACHE_KEYS.currentUser);
  else writeCache(CACHE_KEYS.currentUser, { ...user, createdAt: user.createdAt.toISOString() });
};

const cacheUsers = (users: User[]) =>
  writeCache(
    CACHE_KEYS.users,
    users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString() })),
  );

const cacheReports = (reports: Report[]) =>
  writeCache(
    CACHE_KEYS.reports,
    reports.map((report) => ({
      ...report,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      escalatedAt: report.escalatedAt?.toISOString(),
    })),
  );

const cacheAnnouncements = (announcements: Announcement[]) =>
  writeCache(
    CACHE_KEYS.announcements,
    announcements.map((announcement) => ({ ...announcement, createdAt: announcement.createdAt.toISOString() })),
  );

const cacheSystemSettings = (settings: SystemSettings) => writeCache(CACHE_KEYS.systemSettings, settings);

const cacheSecurityAccounts = (accounts: SecurityAccount[]) => writeCache(CACHE_KEYS.securityAccounts, accounts);

export const parseAccessCode = (value: string) => {
  const accessCode = value.trim().toUpperCase();
  if (!accessCode) return null;
  if (/^RES-\d{3}$/.test(accessCode)) return { accessCode, accountType: "resident" as const, role: "user" as const };
  if (/^(CAP-ADMIN|KWD-ACCESS)-\d{3}$/.test(accessCode)) return { accessCode, accountType: "official" as const, role: "admin" as const };
  if (/^SUPER-ADMIN-\d{3}$/.test(accessCode)) return { accessCode, accountType: "super_admin" as const, role: "admin" as const };
  return null;
};

export const getRoleLabel = (user: Pick<User, "accountType" | "position" | "role">) => {
  if (user.accountType === "super_admin") return "Super Admin";
  if (user.accountType === "official") return user.position ?? "Barangay Official";
  if (user.role === "admin") return "Administrator";
  return "Resident";
};

export const getDashboardPath = (user: Pick<User, "role">) => (user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");

export const getCurrentUser = (): User | null => {
  const cached = readCache<User & { createdAt: string }>(CACHE_KEYS.currentUser);
  return cached ? { ...cached, createdAt: toDate(cached.createdAt) } : null;
};

export const getUsers = (): User[] => {
  const cached = readCache<Array<User & { createdAt: string }>>(CACHE_KEYS.users) ?? [];
  return cached.map((user) => ({ ...user, createdAt: toDate(user.createdAt) }));
};

export const getReports = (): Report[] => {
  const cached = readCache<Array<Report & { createdAt: string; updatedAt: string; escalatedAt?: string }>>(CACHE_KEYS.reports) ?? [];
  return cached.map((report) => ({
    ...report,
    createdAt: toDate(report.createdAt),
    updatedAt: toDate(report.updatedAt),
    escalatedAt: report.escalatedAt ? toDate(report.escalatedAt) : undefined,
  }));
};

export const getAnnouncements = (): Announcement[] => {
  const cached = readCache<Array<Announcement & { createdAt: string }>>(CACHE_KEYS.announcements) ?? [];
  return cached.map((announcement) => ({ ...announcement, createdAt: toDate(announcement.createdAt) }));
};

export const getAnnouncementsForCurrentUser = (): Announcement[] => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  return getAnnouncements().filter((announcement) => {
    if (announcement.audience === "all") return true;
    if (announcement.audience === "residents") return currentUser.accountType === "resident";
    if (announcement.audience === "officials") return currentUser.role === "admin";
    return false;
  });
};

export const getSystemSettings = (): SystemSettings => normalizeSystemSettings(readCache<SystemSettings>(CACHE_KEYS.systemSettings));

export const getSecurityAccounts = (): SecurityAccount[] => readCache<SecurityAccount[]>(CACHE_KEYS.securityAccounts) ?? [];

const requireSupabase = () => {
  if (!supabase) throw new Error("Missing Supabase environment variables.");
  return supabase;
};

const clearAppCaches = () => {
  clearCache(CACHE_KEYS.currentUser);
  clearCache(CACHE_KEYS.users);
  clearCache(CACHE_KEYS.reports);
  clearCache(CACHE_KEYS.announcements);
  clearCache(CACHE_KEYS.systemSettings);
  clearCache(CACHE_KEYS.securityAccounts);
};

const fetchProfile = async (userId: string) => {
  const client = requireSupabase();
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).single<ProfileRow>();
  if (error) throw error;
  return mapProfileRow(data);
};

const refreshUsers = async (currentUser: User) => {
  const client = requireSupabase();
  if (currentUser.role !== "admin") {
    cacheUsers([]);
    return [];
  }
  const { data, error } = await client.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const users = ((data ?? []) as ProfileRow[]).map(mapProfileRow);
  cacheUsers(users);
  cacheSecurityAccounts(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      failedLoginAttempts: user.failedLoginAttempts ?? 0,
      lockedUntil: user.lockedUntil ?? null,
    })),
  );
  return users;
};

const refreshReports = async (currentUser: User) => {
  const client = requireSupabase();
  let query = client.from("reports").select("*").order("created_at", { ascending: false });
  if (currentUser.role !== "admin") query = query.eq("user_id", currentUser.id);
  const { data, error } = await query;
  if (error) throw error;
  const reports = ((data ?? []) as ReportRow[]).map(mapReportRow);
  cacheReports(reports);
  return reports;
};

const refreshAnnouncements = async () => {
  const client = requireSupabase();
  const { data, error } = await client.from("announcements").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const announcements = ((data ?? []) as AnnouncementRow[]).map(mapAnnouncementRow);
  cacheAnnouncements(announcements);
  return announcements;
};

const refreshSystemSettings = async () => {
  const client = requireSupabase();
  const { data, error } = await client.from("system_settings").select("*").eq("id", 1).maybeSingle<SystemSettingsRow>();
  if (error) throw error;
  const settings = mapSystemSettingsRow((data as SystemSettingsRow | null) ?? null);
  cacheSystemSettings(settings);
  return settings;
};

const hydrateUserContext = async (userId: string) => {
  const currentUser = await fetchProfile(userId);
  cacheCurrentUser(currentUser);
  await Promise.all([refreshReports(currentUser), refreshAnnouncements(), refreshSystemSettings(), refreshUsers(currentUser)]);
  return currentUser;
};

export const initializeAppData = async () => {
  if (!supabase) return false;
  const client = requireSupabase();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.user) {
    clearAppCaches();
    cacheSystemSettings(defaultSystemSettings);
    return true;
  }
  try {
    await hydrateUserContext(session.user.id);
    return true;
  } catch {
    clearAppCaches();
    await client.auth.signOut();
    return false;
  }
};

export const subscribeToAuthChanges = (callback: () => void) => {
  if (!supabase) return () => undefined;
  const client = requireSupabase();
  const { data } = client.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      clearAppCaches();
      cacheSystemSettings(defaultSystemSettings);
      callback();
      return;
    }
    try {
      await hydrateUserContext(session.user.id);
    } finally {
      callback();
    }
  });
  return () => data.subscription.unsubscribe();
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  if (!supabase) return { user: null, error: "Missing Supabase environment variables." };
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return { user: null, error: "Please enter your registered email and password." };

  const client = requireSupabase();
  const { error } = await client.auth.signInWithPassword({ email, password: input.password });
  if (error) return { user: null, error: "Incorrect email or password." };

  const {
    data: { user: authUser },
  } = await client.auth.getUser();
  if (!authUser) return { user: null, error: "Incorrect email or password." };

  const currentUser = await fetchProfile(authUser.id);
  if (currentUser.isActive === false) {
    await client.auth.signOut();
    return { user: null, error: "This account has been deactivated." };
  }
  if (currentUser.lockedUntil && new Date(currentUser.lockedUntil).getTime() > Date.now()) {
    await client.auth.signOut();
    return { user: null, error: "Account is temporarily locked due to repeated failed login attempts." };
  }
  if (currentUser.verificationStatus !== "approved") {
    await client.auth.signOut();
    return { user: null, error: "Your account is pending approval." };
  }

  await hydrateUserContext(currentUser.id);
  return { user: currentUser };
};

export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  if (!supabase) return { user: null, error: "Missing Supabase environment variables." };

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const confirmPassword = input.confirmPassword;
  const contactNumber = sanitizePhone(input.contactNumber);
  const codeDetails = parseAccessCode(input.accessCode);

  if (!name || !email || !password || !confirmPassword || !contactNumber || !input.accessCode.trim()) {
    return { user: null, error: "Please complete all signup fields." };
  }
  if (!codeDetails) return { user: null, error: "The access code you entered is incorrect or does not exist." };
  if (!emailIsValid(email)) return { user: null, error: "Please enter a valid email address." };
  if (password !== confirmPassword) return { user: null, error: "Passwords do not match." };
  if (!passwordIsStrong(password)) {
    return { user: null, error: "Use a stronger password with at least 8 characters, uppercase, lowercase, and a number." };
  }

  let address: string | undefined;
  let position: OfficialPosition | undefined;

  if (codeDetails.accountType === "resident") {
    const fullAddress = [input.houseNo?.trim(), input.street?.trim(), input.purokZone?.trim()].filter(Boolean).join(", ");
    address = fullAddress || input.address?.trim();
    if (!address) return { user: null, error: "Please complete your address information." };
  }
  if (codeDetails.accountType === "official") {
    position = input.position;
    if (!position) return { user: null, error: "Please select your position." };
  }

  const client = requireSupabase();
  const { data: existingCode, error: codeError } = await client.from("profiles").select("id").eq("access_code", codeDetails.accessCode).maybeSingle();
  if (codeError) return { user: null, error: "Unable to validate the access code right now." };
  if (existingCode) return { user: null, error: "The access code you entered is incorrect or does not exist." };

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  if (error || !data.user) return { user: null, error: error?.message ?? "Unable to create the account right now." };

  const verificationStatus: VerificationStatus = "approved";
  const { error: profileError } = await client.from("profiles").insert({
    id: data.user.id,
    email,
    name,
    role: codeDetails.role,
    barangay: DEFAULT_BARANGAY_NAME,
    auth_id: codeDetails.accessCode,
    account_type: codeDetails.accountType,
    verification_status: verificationStatus,
    contact_number: contactNumber,
    address: address ?? null,
    position: position ?? null,
    access_code: codeDetails.accessCode,
    failed_login_attempts: 0,
    locked_until: null,
    is_active: true,
  });
  if (profileError) return { user: null, error: "Unable to create the account profile right now." };

  await client.auth.signOut();
  clearAppCaches();
  cacheSystemSettings(defaultSystemSettings);
  return { user: null };
};

export const logout = async () => {
  if (supabase) {
    await requireSupabase().auth.signOut();
  }
  clearAppCaches();
  cacheSystemSettings(defaultSystemSettings);
};

export const createAnnouncement = async (input: Pick<Announcement, "title" | "message" | "audience">) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.accountType !== "super_admin") return null;
  const client = requireSupabase();
  const title = input.title.trim();
  const message = input.message.trim();
  if (!title || !message) return null;
  const { data, error } = await client
    .from("announcements")
    .insert({ title, message, audience: input.audience, created_by: currentUser.name })
    .select("*")
    .single<AnnouncementRow>();
  if (error || !data) return null;
  await refreshAnnouncements();
  return mapAnnouncementRow(data);
};

export const updateSystemSettings = async (updates: Partial<SystemSettings>) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.accountType !== "super_admin") return null;
  const client = requireSupabase();
  const currentSettings = getSystemSettings();
  const nextSettings = normalizeSystemSettings({
    ...currentSettings,
    ...updates,
    features: {
      ...currentSettings.features,
      ...updates.features,
    },
  });
  const { error } = await client.from("system_settings").upsert({
    id: 1,
    barangay_name: nextSettings.barangayName,
    report_categories: nextSettings.reportCategories,
    report_status_types: nextSettings.reportStatusTypes,
    features: nextSettings.features,
  });
  if (error) return null;
  cacheSystemSettings(nextSettings);
  return nextSettings;
};

export const deleteUserAccount = async (userId: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.accountType !== "super_admin") return false;
  if (currentUser.id === userId) return false;
  const client = requireSupabase();
  const { error } = await client.from("profiles").update({ is_active: false }).eq("id", userId);
  if (error) return false;
  await refreshUsers(currentUser);
  return true;
};

export const updateUserAdminControls = async (
  userId: string,
  updates: Partial<Pick<User, "role" | "accountType" | "verificationStatus" | "position">>,
) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.accountType !== "super_admin" || currentUser.id === userId) return null;
  const client = requireSupabase();
  const nextAccountType = updates.accountType ?? "resident";
  const nextRole = updates.role ?? (nextAccountType === "resident" ? "user" : "admin");
  const { data, error } = await client
    .from("profiles")
    .update({
      role: nextRole,
      account_type: nextAccountType,
      verification_status: updates.verificationStatus ?? "approved",
      position: nextAccountType === "official" ? updates.position ?? null : null,
    })
    .eq("id", userId)
    .select("*")
    .single<ProfileRow>();
  if (error || !data) return null;
  await refreshUsers(currentUser);
  return mapProfileRow(data);
};

export const clearUserFailedAttempts = async (userId: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.accountType !== "super_admin") return false;
  const client = requireSupabase();
  const { error } = await client.from("profiles").update({ failed_login_attempts: 0 }).eq("id", userId);
  if (error) return false;
  await refreshUsers(currentUser);
  return true;
};

export const setUserLockState = async (userId: string, locked: boolean) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.accountType !== "super_admin") return false;
  const client = requireSupabase();
  const lockUntil = locked ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;
  const { error } = await client.from("profiles").update({ locked_until: lockUntil }).eq("id", userId);
  if (error) return false;
  await refreshUsers(currentUser);
  return true;
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.accountType !== "super_admin" || !supabase || !serverFunctionUrl) return false;
  if (!passwordIsStrong(newPassword)) return false;

  const {
    data: { session },
  } = await requireSupabase().auth.getSession();

  if (!session?.access_token) return false;

  const response = await fetch(`${serverFunctionUrl}/admin/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      userId,
      newPassword,
    }),
  });

  if (!response.ok) return false;

  await refreshUsers(currentUser);
  return true;
};

export const updateCurrentUserProfile = async (
  updates: Pick<User, "name" | "email" | "barangay"> & { createdAt?: string },
) => {
  const current = getCurrentUser();
  if (!current) return null;
  const nextName = updates.name.trim();
  const nextEmail = updates.email.trim().toLowerCase();
  const nextBarangay = updates.barangay.trim();
  const nextCreatedAt = updates.createdAt ? new Date(updates.createdAt) : current.createdAt;
  if (!nextName || !nextEmail || !nextBarangay || !emailIsValid(nextEmail) || Number.isNaN(nextCreatedAt.getTime())) return null;

  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .update({
      name: nextName,
      email: nextEmail,
      barangay: nextBarangay,
      created_at: nextCreatedAt.toISOString(),
    })
    .eq("id", current.id)
    .select("*")
    .single<ProfileRow>();
  if (error || !data) return null;
  const updatedUser = mapProfileRow(data);
  cacheCurrentUser(updatedUser);
  await Promise.all([refreshReports(updatedUser), refreshUsers(updatedUser)]);
  return updatedUser;
};

export const createReport = async (report: Pick<Report, "title" | "category" | "description" | "location" | "priority">) => {
  const user = getCurrentUser();
  if (!user) return null;
  const client = requireSupabase();
  const title = report.title.trim();
  const description = report.description.trim();
  const location = report.location.trim();
  if (!title || !description || !location) return null;
  const { data, error } = await client
    .from("reports")
    .insert({
      user_id: user.id,
      user_name: user.name,
      title,
      category: report.category,
      description,
      location,
      status: "pending",
      priority: report.priority,
    })
    .select("*")
    .single<ReportRow>();
  if (error || !data) return null;
  await refreshReports(user);
  return mapReportRow(data);
};

export const updateReportStatus = async (reportId: string, status: Report["status"]) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") return null;
  const client = requireSupabase();
  const { data, error } = await client
    .from("reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", reportId)
    .select("*")
    .single<ReportRow>();
  if (error || !data) return null;
  await refreshReports(currentUser);
  return mapReportRow(data);
};

export const updateReportEscalation = async (
  reportId: string,
  updates: { assignedOfficialId?: string; priority?: Report["priority"]; status?: Report["status"] },
) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") return null;
  const assignedOfficial = updates.assignedOfficialId ? getUsers().find((user) => user.id === updates.assignedOfficialId) : null;
  const client = requireSupabase();
  const { data, error } = await client
    .from("reports")
    .update({
      assigned_official_id: assignedOfficial?.id ?? null,
      assigned_official_name: assignedOfficial?.name ?? null,
      priority: updates.priority,
      status: updates.status,
      escalated_at: assignedOfficial || updates.priority === "high" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select("*")
    .single<ReportRow>();
  if (error || !data) return null;
  await refreshReports(currentUser);
  return mapReportRow(data);
};
