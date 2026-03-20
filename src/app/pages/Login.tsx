import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BellRing, FileText, ScanSearch, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getCurrentUser, getDashboardPath, login, parseAccessCode, registerUser, type OfficialPosition } from "../lib/mockData";

type AuthMode = "login" | "signup";
type Language = "en" | "tl";

const officialPositions: OfficialPosition[] = ["Barangay Captain", "Kagawad", "Secretary / Staff"];
const localizedInfoPanels = {
  en: [
    {
      id: "reporting",
      label: "How Reporting Works",
      eyebrow: "Step By Step",
      title: "Submit, track, and follow updates in one flow.",
      description:
        "The system was designed to make complaint handling more organized from the moment a concern is filed up to the latest status update.",
      steps: [
        "Create an account using your assigned access code and active email.",
        "Submit a report with complete details so the concern can be reviewed clearly.",
        "Monitor the report status and wait for follow-up updates inside the system.",
      ],
    },
    {
      id: "purpose",
      label: "Why It Was Made",
      eyebrow: "System Purpose",
      title: "Built to reduce delays and improve communication.",
      description:
        "This platform gives the barangay a more reliable way to receive reports, avoid missed complaints, and keep information easier to manage.",
      steps: [
        "Reduce dependence on paper-based and manual complaint handling.",
        "Keep reports documented in a single digital record.",
        "Help residents and officials stay informed through clearer status tracking.",
      ],
    },
    {
      id: "benefits",
      label: "What It Improves",
      eyebrow: "Community Impact",
      title: "A clearer process for community concerns.",
      description:
        "Instead of scattered updates and delayed follow-up, the system gives a consistent process for reporting issues and checking progress.",
      steps: [
        "Faster submission of concerns from anywhere.",
        "More transparent monitoring of complaint progress.",
        "Better coordination for response and follow-through.",
      ],
    },
  ],
  tl: [
    {
      id: "reporting",
      label: "Paano Mag-Report",
      eyebrow: "Sunod-sunod na Hakbang",
      title: "Mag-report, mag-monitor, at tumanggap ng updates sa iisang daloy.",
      description:
        "Ginawa ang system na ito para mas maayos ang paghawak ng reklamo mula sa pag-submit ng concern hanggang sa pinakahuling update.",
      steps: [
        "Gumawa ng account gamit ang ibinigay na access code at active na email.",
        "Mag-submit ng report na kumpleto ang detalye para malinaw itong mareview.",
        "I-check ang status ng report at hintayin ang mga susunod na update sa system.",
      ],
    },
    {
      id: "purpose",
      label: "Bakit Ito Ginawa",
      eyebrow: "Layunin ng System",
      title: "Ginawa para mabawasan ang delay at mas gumanda ang communication.",
      description:
        "Mas maaasahan ang pagtanggap ng reports, mas iwas sa namimiss na reklamo, at mas madaling ayusin ang records sa barangay.",
      steps: [
        "Mabawasan ang pagdepende sa papel at mano-manong proseso.",
        "Maitala ang mga report sa iisang digital record.",
        "Mas malinaw ang updates at pag-track ng progress.",
      ],
    },
    {
      id: "benefits",
      label: "Ano ang Tulong Nito",
      eyebrow: "Epekto sa Komunidad",
      title: "Mas malinaw na proseso para sa mga concern ng komunidad.",
      description:
        "Imbes na kalat ang updates at mabagal ang follow-up, may iisang maayos na proseso para sa pag-report at pag-check ng progreso.",
      steps: [
        "Mas mabilis magpasa ng concern kahit nasaan ka.",
        "Mas klaro ang pag-monitor ng status ng reklamo.",
        "Mas maayos ang coordination para sa response at follow-through.",
      ],
    },
  ],
} as const;

const content = {
  en: {
    systemName: "Barangay Digital Reporting System",
    welcome: "Welcome to the Barangay Digital Reporting System.",
    intro:
      "Access the system using your registered email and password. New users must register with a valid email address and a barangay-issued access code.",
    language: "Language",
    english: "English",
    tagalog: "Tagalog",
    reportInfo: "Reports can be filed online with complete details so concerns are easier to document, review, and track.",
    updateInfo: "Each access code is unique, and the system uses it to set the correct account setup automatically.",
    loginTitle: "Login",
    signupTitle: "Sign Up",
    loginDescription: "Enter your registered email and password to access your account.",
    signupDescription: "Fill out the registration form using accurate information and your assigned access code.",
    loginInstructions: "Login Instructions",
    loginInstructionText: "Enter your registered email and password. Your dashboard will open based on your assigned role.",
    signupInstructions: "Sign-Up Instructions",
    signupInstructionText: "Please fill out the registration form using accurate information. Use your active email address and assigned access code.",
    email: "Email",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    contactNumber: "Contact Number",
    accessCode: "Access Code",
    address: "Address",
    houseNo: "House No.",
    street: "Street",
    purokZone: "Purok/Zone",
    position: "Position",
    selectPosition: "Select your position",
    loginButton: "Login",
    loginLoading: "Signing In...",
    registerButton: "Register",
    registerLoading: "Creating Account...",
    emailPlaceholder: "name@email.com",
    passwordPlaceholder: "Enter password",
    accessCodePlaceholder: "Enter your assigned access code",
    contactPlaceholder: "09XXXXXXXXX",
    addressPlaceholder: "Complete address",
    signupPasswordPlaceholder: "At least 8 characters with uppercase, lowercase, and number",
    detectedRole: "Detected role",
    resident: "Resident",
    official: "Barangay Official",
    superAdmin: "Super Admin",
    enterCodeHint: "Enter your barangay-issued access code to unlock the correct registration fields automatically.",
    systemBehavior: "System Behavior",
    systemBehavior1: "Residents can submit reports and track report status.",
    systemBehavior2: "Barangay officials can view and manage reports and respond to complaints.",
    systemBehavior3: "Super admins can monitor users, manage access, and view system-wide reports.",
    systemBehavior4: "Newly registered accounts must wait for verification before login access is granted.",
    loginSuccess: "Login successful! Redirecting to your dashboard...",
    signupSuccess: "Registration successful! Please wait for account verification before logging in.",
  },
  tl: {
    systemName: "Barangay Digital Reporting System",
    welcome: "Welcome sa Barangay Digital Reporting System.",
    intro:
      "Gamitin ang registered mong email at password para makapasok sa system. Kung bago ka, mag-sign up gamit ang valid na email at access code na galing sa barangay.",
    language: "Wika",
    english: "English",
    tagalog: "Tagalog",
    reportInfo: "Puwedeng mag-file ng report online na kumpleto ang detalye para mas madaling maidokumento, ma-review, at ma-track ang concern.",
    updateInfo: "Bawat access code ay unique, at ito ang gamit ng system para ma-set ang tamang account setup mo.",
    loginTitle: "Mag-Login",
    signupTitle: "Mag-Sign Up",
    loginDescription: "Ilagay ang registered mong email at password para makapasok sa account mo.",
    signupDescription: "Punan nang tama ang form gamit ang valid na impormasyon at ang ibinigay na access code.",
    loginInstructions: "Paano Mag-Login",
    loginInstructionText: "Ilagay ang registered mong email at password. Lalabas ang dashboard base sa account mo.",
    signupInstructions: "Paano Mag-Sign Up",
    signupInstructionText: "Punan nang tama ang registration form. Gumamit ng active na email at access code na ibinigay sa'yo.",
    email: "Email",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Buong Pangalan",
    contactNumber: "Contact Number",
    accessCode: "Access Code",
    address: "Address",
    houseNo: "House No.",
    street: "Street",
    purokZone: "Purok/Zone",
    position: "Position",
    selectPosition: "Piliin ang position",
    loginButton: "Mag-Login",
    loginLoading: "Nagla-login...",
    registerButton: "Mag-Register",
    registerLoading: "Ginagawa ang account...",
    emailPlaceholder: "name@email.com",
    passwordPlaceholder: "Ilagay ang password",
    accessCodePlaceholder: "Ilagay ang ibinigay na access code",
    contactPlaceholder: "09XXXXXXXXX",
    addressPlaceholder: "Kumpletong address",
    signupPasswordPlaceholder: "Hindi bababa sa 8 characters na may malaking letra, maliit na letra, at numero",
    detectedRole: "Natukoy na role",
    resident: "Resident",
    official: "Barangay Official",
    superAdmin: "Super Admin",
    enterCodeHint: "Ilagay ang access code na galing sa barangay para automatic na lumabas ang tamang fields.",
    systemBehavior: "Gamit ng System",
    systemBehavior1: "Puwedeng magsumite ng report at i-check ang status nito.",
    systemBehavior2: "Puwedeng tingnan at asikasuhin ang mga report at reklamo.",
    systemBehavior3: "Puwedeng bantayan ang users, access, at buong system reports.",
    systemBehavior4: "Ang bagong account ay kailangang ma-verify muna bago makapag-login.",
    loginSuccess: "Successful ang login! Dinadala ka na sa dashboard mo...",
    signupSuccess: "Successful ang registration! Hintayin muna ang verification bago mag-login.",
  },
} as const;

const translateError = (message: string | undefined, language: Language) => {
  if (!message || language === "en") return message;

  const translations: Record<string, string> = {
    "Incorrect email or password.": "Mali ang email o password.",
    "Your account is pending approval.": "Pending pa ang approval ng account mo.",
    "Please enter your registered email and password.": "Ilagay ang registered mong email at password.",
    "Please complete all signup fields.": "Pakikumpleto ang lahat ng kailangang fields.",
    "The access code you entered is incorrect or does not exist.": "Mali ang access code na nilagay mo o wala ito sa system.",
    "Please enter a valid email address.": "Maglagay ng valid na email address.",
    "This email is already in use. Please log in or use another email.": "Gamit na ang email na ito. Mag-login o gumamit ng ibang email.",
    "Passwords do not match.": "Hindi magkapareho ang passwords.",
    "Use a stronger password with at least 8 characters, uppercase, lowercase, and a number.":
      "Gumamit ng mas malakas na password na may hindi bababa sa 8 characters, malaking letra, maliit na letra, at numero.",
    "Please complete your address information.": "Pakikumpleto ang address information mo.",
    "Please select your position.": "Piliin ang iyong position.",
  };

  return translations[message] ?? message;
};

export default function Login() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [activeInfoPanel, setActiveInfoPanel] = useState<(typeof localizedInfoPanels.en)[number]["id"]>("reporting");
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupContactNumber, setSignupContactNumber] = useState("");
  const [signupAccessCode, setSignupAccessCode] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupHouseNo, setSignupHouseNo] = useState("");
  const [signupStreet, setSignupStreet] = useState("");
  const [signupPurokZone, setSignupPurokZone] = useState("");
  const [signupPosition, setSignupPosition] = useState<OfficialPosition | "">("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const accessCodeDetails = useMemo(() => parseAccessCode(signupAccessCode), [signupAccessCode]);
  const infoPanels = localizedInfoPanels[language];
  const activePanel = infoPanels.find((panel) => panel.id === activeInfoPanel) ?? infoPanels[0];
  const t = content[language];

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate(getDashboardPath(user));
    }
  }, [navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login({ email: loginEmail, password: loginPassword });

      if (!result.user) {
        toast.error(translateError(result.error ?? "Incorrect email or password.", language));
        return;
      }

      toast.success(t.loginSuccess);
      navigate(getDashboardPath(result.user));
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await registerUser({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        accessCode: signupAccessCode,
        contactNumber: signupContactNumber,
        address: signupAddress,
        houseNo: signupHouseNo,
        street: signupStreet,
        purokZone: signupPurokZone,
        position: signupPosition || undefined,
      });

      if (!result.user && result.error) {
        toast.error(translateError(result.error, language));
        return;
      }

      toast.success(t.signupSuccess);
      setMode("login");
      setSignupName("");
      setSignupEmail("");
      setSignupContactNumber("");
      setSignupAccessCode("");
      setSignupAddress("");
      setSignupHouseNo("");
      setSignupStreet("");
      setSignupPurokZone("");
      setSignupPosition("");
      setSignupPassword("");
      setSignupConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -left-28 top-24 h-64 w-64 rounded-full bg-cyan-300/40 blur-3xl float-slow" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-emerald-300/35 blur-3xl float-slow [animation-delay:900ms]" />

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-7xl items-stretch gap-4 md:gap-6 xl:grid-cols-[1fr_1.1fr]">
        <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-slate-100 shadow-xl fade-up md:p-8 xl:flex xl:flex-col xl:justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs tracking-wide uppercase">
              <ShieldCheck className="h-4 w-4" />
              {t.systemName}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{t.welcome}</h1>
              <div className="rounded-full border border-white/15 bg-white/8 p-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={
                      language === "en"
                        ? "rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950"
                        : "rounded-full px-3 py-1.5 text-xs font-semibold text-slate-200"
                    }
                  >
                    {t.english}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("tl")}
                    className={
                      language === "tl"
                        ? "rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950"
                        : "rounded-full px-3 py-1.5 text-xs font-semibold text-slate-200"
                    }
                  >
                    {t.tagalog}
                  </button>
                </div>
              </div>
            </div>
            <p className="max-w-xl text-sm text-slate-300 md:text-base">{t.intro}</p>

            <div className="grid gap-4 pt-4">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2">
                  {infoPanels.map((panel) => (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setActiveInfoPanel(panel.id)}
                      className={
                        activeInfoPanel === panel.id
                          ? "rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 transition"
                          : "rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/14"
                      }
                    >
                      {panel.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">{activePanel.eyebrow}</p>
                  <h2 className="mt-3 text-xl font-semibold leading-tight text-white md:text-2xl">{activePanel.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">{activePanel.description}</p>

                  <div className="mt-6 grid gap-3">
                    {activePanel.steps.map((step, index) => (
                      <div key={step} className="flex items-start gap-3 rounded-xl bg-white/8 p-4 transition hover:bg-white/12">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-sm font-semibold text-cyan-200">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-6 text-slate-200">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:mt-0">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <ScanSearch className="h-4 w-4 text-cyan-300" />
              <p className="text-sm">{t.reportInfo}</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <BellRing className="h-4 w-4 text-emerald-300" />
              <p className="text-sm">{t.updateInfo}</p>
            </div>
          </div>
        </section>

        <Card className="my-auto w-full border-0 bg-white/85 shadow-2xl backdrop-blur-md fade-up [animation-delay:150ms]">
          <CardHeader className="px-4 pb-4 text-center sm:px-6">
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-3.5 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{t.systemName}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? t.loginDescription
                : t.signupDescription}
            </CardDescription>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                className={mode === "login" ? "shadow-sm" : ""}
                onClick={() => setMode("login")}
              >
                {t.loginTitle}
              </Button>
              <Button
                type="button"
                variant={mode === "signup" ? "default" : "ghost"}
                className={mode === "signup" ? "shadow-sm" : ""}
                onClick={() => setMode("signup")}
              >
                {t.signupTitle}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-5 sm:px-6">
            {mode === "login" ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">{t.loginInstructions}</p>
                  <p className="mt-1">{t.loginInstructionText}</p>
                </div>

                <form onSubmit={onLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.email}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.password}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t.passwordPlaceholder}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <Button type="submit" className="h-11 w-full rounded-xl bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? t.loginLoading : t.loginButton}
                  </Button>
                </form>

              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">{t.signupInstructions}</p>
                  <p className="mt-1">{t.signupInstructionText}</p>
                </div>

                <form onSubmit={onSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="access-code">{t.accessCode}</Label>
                    <Input
                      id="access-code"
                      value={signupAccessCode}
                      onChange={(e) => setSignupAccessCode(e.target.value.toUpperCase())}
                      placeholder={t.accessCodePlaceholder}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                    <p className="text-xs text-slate-500">
                      {accessCodeDetails
                        ? `${t.detectedRole}: ${accessCodeDetails.accountType === "resident" ? t.resident : accessCodeDetails.accountType === "official" ? t.official : t.superAdmin}`
                        : t.enterCodeHint}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t.fullName}</Label>
                    <Input
                      id="signup-name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t.emailAddress}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-contact">{t.contactNumber}</Label>
                    <Input
                      id="signup-contact"
                      value={signupContactNumber}
                      onChange={(e) => setSignupContactNumber(e.target.value)}
                      placeholder={t.contactPlaceholder}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                  </div>

                  {accessCodeDetails?.accountType === "resident" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="signup-address">{t.address}</Label>
                        <Input
                          id="signup-address"
                          value={signupAddress}
                          onChange={(e) => setSignupAddress(e.target.value)}
                          placeholder={t.addressPlaceholder}
                          className="h-11 rounded-xl border-slate-200 bg-white"
                          required
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="signup-house-no">{t.houseNo}</Label>
                          <Input
                            id="signup-house-no"
                            value={signupHouseNo}
                            onChange={(e) => setSignupHouseNo(e.target.value)}
                            className="h-11 rounded-xl border-slate-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-street">{t.street}</Label>
                          <Input
                            id="signup-street"
                            value={signupStreet}
                            onChange={(e) => setSignupStreet(e.target.value)}
                            className="h-11 rounded-xl border-slate-200 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-purok">{t.purokZone}</Label>
                          <Input
                            id="signup-purok"
                            value={signupPurokZone}
                            onChange={(e) => setSignupPurokZone(e.target.value)}
                            className="h-11 rounded-xl border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                    </>
                  ) : null}

                  {accessCodeDetails?.accountType === "official" ? (
                    <div className="space-y-2">
                      <Label htmlFor="signup-position">{t.position}</Label>
                      <Select value={signupPosition} onValueChange={(value) => setSignupPosition(value as OfficialPosition)}>
                        <SelectTrigger id="signup-position" className="h-11 rounded-xl border-slate-200 bg-white">
                          <SelectValue placeholder={t.selectPosition} />
                        </SelectTrigger>
                        <SelectContent>
                          {officialPositions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t.password}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder={t.signupPasswordPlaceholder}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">{t.confirmPassword}</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white"
                      required
                    />
                  </div>

                  <Button type="submit" className="h-11 w-full rounded-xl bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? t.registerLoading : t.registerButton}
                  </Button>
                </form>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-medium">{t.systemBehavior}</p>
                  <p className="mt-1">{t.systemBehavior1}</p>
                  <p>{t.systemBehavior2}</p>
                  <p>{t.systemBehavior3}</p>
                  <p>{t.systemBehavior4}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
