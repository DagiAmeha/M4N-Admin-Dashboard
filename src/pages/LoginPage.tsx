import { useState, type FormEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* ── floating gold particles ── */
interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 12 + 8,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.1,
      })),
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bottom-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            background: "radial-gradient(circle, #f5d060, #c8960c)",
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
          }}
        />
      ))}
    </div>
  );
}

/* ── animated divider that draws itself ── */
function AnimatedDivider() {
  return (
    <div className="flex items-center gap-3 mt-4 justify-center">
      <div
        className="h-px"
        style={{
          background: "linear-gradient(to right, transparent, #d4a017)",
          animation: "expandLine 1.4s 0.6s both ease-out",
          width: 0,
        }}
      />
      <span
        className="text-yellow-700 text-xs tracking-widest uppercase font-medium whitespace-nowrap"
        style={{ animation: "fadeInUp 0.8s 1s both" }}
      >
        Admin Dashboard
      </span>
      <div
        className="h-px"
        style={{
          background: "linear-gradient(to left, transparent, #d4a017)",
          animation: "expandLine 1.4s 0.6s both ease-out",
          width: 0,
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? (err instanceof Error ? err.message : "Login failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── global keyframes ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: var(--op, 0.3); }
          50%  { transform: translateY(-50vh) scale(1.4); opacity: calc(var(--op, 0.3) * 1.6); }
          100% { transform: translateY(-100vh) scale(0.6); opacity: 0; }
        }
        @keyframes breatheGlow {
          0%, 100% { transform: scale(1);   opacity: 0.18; }
          50%       { transform: scale(1.25); opacity: 0.38; }
        }
        @keyframes logoEntrance {
          0%   { transform: scale(0.7) rotate(-6deg); opacity: 0; }
          60%  { transform: scale(1.05) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes shimmerText {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandLine {
          0%   { width: 0px; }
          100% { width: 64px; }
        }
        @keyframes cardSlideIn {
          0%   { opacity: 0; transform: translateY(32px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,160,23,0), 0 0 24px 0 rgba(212,160,23,0.04); }
          50%       { box-shadow: 0 0 0 2px rgba(212,160,23,0.15), 0 0 40px 0 rgba(212,160,23,0.12); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

      <div className="min-h-screen flex bg-black overflow-hidden">
        {/* ════ LEFT branding panel ════ */}
        <div
          className="hidden lg:flex flex-col items-center justify-between w-1/2 p-12 relative overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at center top, #1a1200 0%, #000000 70%)",
          }}
        >
          {/* floating particles */}
          <Particles />

          {/* large diffuse glow in center */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, #d4a017 0%, transparent 65%)",
              animation: "breatheGlow 6s ease-in-out infinite",
              opacity: 0.18,
            }}
          />

          {/* top badge */}
          <div
            className="flex items-center gap-2 self-start z-10"
            style={{ animation: "fadeInUp 0.7s 0.2s both" }}
          >
            <div
              className="w-2 h-2 rounded-full bg-yellow-500"
              style={{ animation: "dotBlink 2s infinite" }}
            />
            <span className="text-yellow-600 text-xs font-semibold tracking-widest uppercase">
              Admin Portal
            </span>
          </div>

          {/* center: logo + name */}
          <div className="flex flex-col items-center gap-6 z-10">
            {/* logo */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, #d4a017 30%, transparent 70%)",
                  animation: "breatheGlow 4s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  mixBlendMode: "screen",
                  display: "inline-flex",
                  animation:
                    "logoEntrance 1s 0.3s both cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <img
                  src="/assets/logo.png"
                  alt="Mission For Nation Ministry"
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>

            {/* church name with shimmer */}
            <div
              className="text-center"
              style={{ animation: "fadeInUp 0.9s 0.8s both" }}
            >
              <h1
                className="text-3xl font-black tracking-wide leading-tight"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #c8960c 0%, #f5d060 30%, #fffbe6 50%, #f5d060 70%, #c8960c 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmerText 3.5s linear infinite",
                }}
              >
                Mission For Nation
              </h1>
              <h2
                className="text-xl font-bold tracking-widest uppercase mt-1"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #9a7209 0%, #e8c040 40%, #fffbe6 50%, #e8c040 60%, #9a7209 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmerText 3.5s 0.4s linear infinite",
                }}
              >
                Ministry
              </h2>
              <AnimatedDivider />
            </div>
          </div>

          {/* bottom verse */}
          <p
            className="text-center text-gray-600 text-xs italic leading-relaxed max-w-xs z-10"
            style={{ animation: "fadeInUp 0.8s 1.4s both" }}
          >
            "Go therefore and make disciples of all nations"
            <br />
            <span className="text-yellow-800 not-italic font-semibold">
              — Matthew 28:19
            </span>
          </p>
        </div>

        {/* ════ RIGHT login panel ════ */}
        <div
          className="relative flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)",
          }}
        >
          {/* subtle corner glow */}
          <div
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-5"
            style={{
              background: "radial-gradient(circle, #d4a017, transparent)",
            }}
          />

          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div
              className="flex flex-col items-center mb-8 lg:hidden"
              style={{ animation: "fadeInUp 0.7s both" }}
            >
              <div
                style={{ mixBlendMode: "screen", display: "inline-flex" }}
                className="mb-3"
              >
                <img
                  src="/assets/logo.png"
                  alt="logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <h1
                className="text-xl font-black tracking-wide text-center"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #c8960c 0%, #f5d060 50%, #c8960c 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmerText 3s linear infinite",
                }}
              >
                Mission For Nation Ministry
              </h1>
            </div>

            {/* Login card */}
            <div
              ref={cardRef}
              className="rounded-2xl border border-gray-800 p-6 sm:p-8"
              style={{
                background: "linear-gradient(145deg, #161616 0%, #111111 100%)",
                animation:
                  "cardSlideIn 0.7s 0.1s both, borderPulse 4s 1s ease-in-out infinite",
              }}
            >
              <div
                className="mb-7"
                style={{ animation: "fadeInUp 0.6s 0.4s both" }}
              >
                <h2 className="text-white text-2xl font-bold">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sign in to the admin dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div style={{ animation: "fadeInUp 0.6s 0.55s both" }}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-700 focus:ring-1 focus:ring-yellow-800 transition-all duration-300"
                      placeholder="admin@church.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ animation: "fadeInUp 0.6s 0.7s both" }}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-700 focus:ring-1 focus:ring-yellow-800 transition-all duration-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div style={{ animation: "fadeInUp 0.6s 0.85s both" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: loading
                        ? "#8a6a0a"
                        : "linear-gradient(135deg, #c8960c 0%, #f5d060 50%, #c8960c 100%)",
                      boxShadow: loading
                        ? "none"
                        : "0 4px 24px rgba(212,160,23,0.35)",
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        <LogIn size={16} />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <p
              className="text-center text-gray-700 text-xs mt-6"
              style={{ animation: "fadeInUp 0.6s 1s both" }}
            >
              Mission For Nation Ministry · Admin Access Only
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
