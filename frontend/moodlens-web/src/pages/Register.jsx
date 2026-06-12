import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { BsPerson, BsEnvelope, BsLock, BsEye, BsEyeSlash, BsCheckCircle } from "react-icons/bs";
import toast from "react-hot-toast";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm]       = useState({ name: "", email: "", password: "" });
    const [showPw, setShowPw]   = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    // Kiểm tra độ mạnh password
    const pwChecks = [
        { label: "Ít nhất 8 ký tự",  pass: form.password.length >= 8        },
        { label: "Có chữ hoa",        pass: /[A-Z]/.test(form.password)      },
        { label: "Có số",             pass: /[0-9]/.test(form.password)      },
    ];
    const pwStrength = pwChecks.filter(c => c.pass).length;
    const pwColor = pwStrength === 3 ? "bg-green-500"
                  : pwStrength === 2 ? "bg-yellow-500"
                  : pwStrength === 1 ? "bg-orange-500"
                  : "bg-white/10";

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }
        try {
            setLoading(true);
            await api.post("/auth/register", form);
            toast.success("Tạo tài khoản thành công!");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    const fields = [
        {
            key: "name", type: "text", placeholder: "Họ và tên",
            icon: <BsPerson size={15} />,
            right: null
        },
        {
            key: "email", type: "email", placeholder: "Email",
            icon: <BsEnvelope size={15} />,
            right: null
        },
        {
            key: "password", type: showPw ? "text" : "password",
            placeholder: "Mật khẩu",
            icon: <BsLock size={15} />,
            right: (
                <button type="button" onClick={() => setShowPw(!showPw)}
                        className="text-gray-500 hover:text-gray-300 transition">
                    {showPw ? <BsEyeSlash size={15} /> : <BsEye size={15} />}
                </button>
            )
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center
                        bg-gray-950 p-4 relative overflow-hidden">

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px]
                            bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🔍❤️</div>
                    <h1 className="text-2xl font-bold text-white">MoodLens</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Bắt đầu hành trình cảm xúc của bạn
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10
                                rounded-2xl p-6 shadow-2xl">

                    <h2 className="text-lg font-semibold text-white mb-5">Tạo tài khoản</h2>

                    <div className="space-y-3 mb-4">
                        {fields.map(f => (
                            <div key={f.key} className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2
                                                 text-gray-500">
                                    {f.icon}
                                </span>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={form[f.key]}
                                    onChange={set(f.key)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5
                                               border border-white/10 text-white placeholder-gray-600
                                               focus:outline-none focus:border-blue-500/60
                                               focus:bg-white/8 transition text-sm"
                                />
                                {f.right && (
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                        {f.right}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Password strength */}
                    {form.password && (
                        <div className="mb-5">
                            <div className="flex gap-1 mb-2">
                                {[0,1,2].map(i => (
                                    <div key={i}
                                         className={`h-1 flex-1 rounded-full transition-all duration-300
                                                     ${i < pwStrength ? pwColor : "bg-white/10"}`} />
                                ))}
                            </div>
                            <div className="space-y-1">
                                {pwChecks.map(c => (
                                    <div key={c.label}
                                         className={`flex items-center gap-2 text-xs transition
                                                     ${c.pass ? "text-green-400" : "text-gray-600"}`}>
                                        <BsCheckCircle size={11} />
                                        {c.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                                   disabled:cursor-not-allowed text-white py-3 rounded-xl
                                   font-semibold transition active:scale-[0.98] text-sm"
                    >
                        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                    </button>

                    {/* Login link */}
                    <p className="text-center mt-5 text-sm text-gray-500">
                        Đã có tài khoản?{" "}
                        <Link to="/"
                              className="text-blue-400 hover:text-blue-300 transition font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
