import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BsEnvelope, BsLock, BsEye, BsEyeSlash } from "react-icons/bs";
import toast from "react-hot-toast";

export default function Login() {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw]     = useState(false);
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }
        try {
            setLoading(true);
            const res = await api.post("/auth/login", { email, password });
            login(res.data.token);
            if (!localStorage.getItem("welcomeCompleted")) {
                navigate("/welcome");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Email hoặc mật khẩu không đúng");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className="min-h-screen flex items-center justify-center
                        bg-gray-950 p-4 relative overflow-hidden">

            {/* Ambient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px]
                            bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🔍❤️</div>
                    <h1 className="text-2xl font-bold text-white">MoodLens</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Theo dõi cảm xúc cùng AI
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10
                                rounded-2xl p-6 shadow-2xl">

                    <h2 className="text-lg font-semibold text-white mb-5">Đăng nhập</h2>

                    {/* Email */}
                    <div className="relative mb-3">
                        <BsEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2
                                               text-gray-500" size={15} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5
                                       border border-white/10 text-white placeholder-gray-600
                                       focus:outline-none focus:border-blue-500/60
                                       focus:bg-white/8 transition text-sm"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative mb-5">
                        <BsLock className="absolute left-3.5 top-1/2 -translate-y-1/2
                                           text-gray-500" size={15} />
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5
                                       border border-white/10 text-white placeholder-gray-600
                                       focus:outline-none focus:border-blue-500/60
                                       focus:bg-white/8 transition text-sm"
                        />
                        <button onClick={() => setShowPw(!showPw)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2
                                           text-gray-500 hover:text-gray-300 transition">
                            {showPw ? <BsEyeSlash size={15} /> : <BsEye size={15} />}
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                                   disabled:cursor-not-allowed text-white py-3 rounded-xl
                                   font-semibold transition active:scale-[0.98] text-sm"
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                    {/* Register link */}
                    <p className="text-center mt-5 text-sm text-gray-500">
                        Chưa có tài khoản?{" "}
                        <Link to="/register"
                              className="text-blue-400 hover:text-blue-300 transition font-medium">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
