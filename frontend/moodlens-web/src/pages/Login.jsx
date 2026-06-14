import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BsEnvelope, BsLock, BsEye, BsEyeSlash } from "react-icons/bs";
import toast from "react-hot-toast";

const P = {
    bg:      "#faf6f0",
    surface: "#f5ede0",
    card:    "#ede3d2",
    border:  "#d6c9b4",
    spine:   "#c4a882",
    text:    "#3b2f1e",
    muted:   "#8c7560",
    accent:  "#7c5c3a",
    line:    "rgba(139,110,80,0.07)",
};

export default function Login() {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw]     = useState(false);
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin"); return;
        }
        try {
            setLoading(true);
            const res = await api.post("/auth/login", { email, password });
            login(res.data.token);
            navigate(localStorage.getItem("welcomeCompleted") ? "/dashboard" : "/welcome");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Email hoặc mật khẩu không đúng");
        } finally { setLoading(false); }
    };

    const inputCls = "w-full py-3 rounded-xl text-sm outline-none transition";

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
             style={{ background: P.bg }}>

            {/* Ambient glow — nâu ấm */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px]
                            rounded-full blur-3xl pointer-events-none"
                 style={{ background:"rgba(196,168,130,0.15)" }} />

            <div className="relative w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🧠</div>
                    <h1 className="text-2xl font-bold"
                        style={{ color: P.accent, fontFamily:"'Georgia', serif" }}>
                        MoodLens
                    </h1>
                    <p className="text-sm mt-1 italic"
                       style={{ color: P.muted, fontFamily:"'Georgia', serif" }}>
                        Listen To Your Mind
                    </p>
                </div>

                {/* Card — trang giấy */}
                <div className="relative rounded-2xl overflow-hidden"
                     style={{
                         background: P.surface,
                         border: `1px solid ${P.border}`,
                         boxShadow: "0 8px 32px rgba(139,110,80,0.12), inset 0 0 0 1px rgba(255,255,255,0.6)"
                     }}>

                    {/* Gáy sổ trên */}
                    <div className="h-1.5 w-full"
                         style={{ background:`linear-gradient(to right, ${P.spine}, #a8896a, ${P.spine})`, opacity:0.8 }} />

                    {/* Đường kẻ trang */}
                    <div className="absolute inset-0 pointer-events-none"
                         style={{
                             backgroundImage:`repeating-linear-gradient(transparent,transparent 39px,${P.line} 39px,${P.line} 40px)`,
                             backgroundPositionY:"64px"
                         }} />

                    <div className="relative p-6">
                        <h2 className="text-lg font-semibold mb-5"
                            style={{ color: P.text, fontFamily:"'Georgia', serif" }}>
                            Đăng nhập
                        </h2>

                        {/* Email */}
                        <div className="relative mb-3">
                            <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                        size={15} style={{ color: P.muted }} />
                            <input type="email" placeholder="Email" value={email}
                                   onChange={e => setEmail(e.target.value)}
                                   onKeyDown={e => e.key === "Enter" && handleLogin()}
                                   className={inputCls}
                                   style={{
                                       paddingLeft:40, paddingRight:16,
                                       background: P.card,
                                       border: `1px solid ${P.border}`,
                                       color: P.text,
                                   }} />
                        </div>

                        {/* Password */}
                        <div className="relative mb-6">
                            <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                    size={15} style={{ color: P.muted }} />
                            <input type={showPw ? "text" : "password"} placeholder="Mật khẩu"
                                   value={password}
                                   onChange={e => setPassword(e.target.value)}
                                   onKeyDown={e => e.key === "Enter" && handleLogin()}
                                   className={inputCls}
                                   style={{
                                       paddingLeft:40, paddingRight:40,
                                       background: P.card,
                                       border: `1px solid ${P.border}`,
                                       color: P.text,
                                   }} />
                            <button onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:opacity-60"
                                    style={{ color: P.muted }}>
                                {showPw ? <BsEyeSlash size={15} /> : <BsEye size={15} />}
                            </button>
                        </div>

                        {/* Submit */}
                        <button onClick={handleLogin} disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background:`linear-gradient(135deg, ${P.spine}, ${P.accent})`, boxShadow:"0 4px 16px rgba(124,92,58,0.25)" }}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>

                        <p className="text-center mt-5 text-sm" style={{ color: P.muted }}>
                            Chưa có tài khoản?{" "}
                            <Link to="/register"
                                  className="font-medium hover:opacity-70 transition"
                                  style={{ color: P.accent }}>
                                Đăng ký
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
