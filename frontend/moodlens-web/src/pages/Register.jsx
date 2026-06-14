import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { BsPerson, BsEnvelope, BsLock, BsEye, BsEyeSlash, BsCheckCircle } from "react-icons/bs";
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

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm]       = useState({ name:"", email:"", password:"" });
    const [showPw, setShowPw]   = useState(false);
    const [loading, setLoading] = useState(false);
    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const pwChecks = [
        { label:"Ít nhất 8 ký tự", pass: form.password.length >= 8     },
        { label:"Có chữ hoa",       pass: /[A-Z]/.test(form.password)   },
        { label:"Có số",             pass: /[0-9]/.test(form.password)   },
    ];
    const pwStrength = pwChecks.filter(c => c.pass).length;
    const pwBarColor = pwStrength === 3 ? "#4a7a3a"
                     : pwStrength === 2 ? "#b8a020"
                     : pwStrength === 1 ? "#c07020"
                     : P.border;

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin"); return;
        }
        try {
            setLoading(true);
            await api.post("/auth/register", form);
            toast.success("Tạo tài khoản thành công!");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Đăng ký thất bại");
        } finally { setLoading(false); }
    };

    const inputStyle = {
        background: P.card,
        border: `1px solid ${P.border}`,
        color: P.text,
        paddingLeft: 40,
        paddingRight: 40,
    };

    const fields = [
        { key:"name",     type:"text",                       placeholder:"Họ và tên", icon:<BsPerson   size={15} />, right:null },
        { key:"email",    type:"email",                      placeholder:"Email",     icon:<BsEnvelope size={15} />, right:null },
        { key:"password", type:showPw ? "text" : "password", placeholder:"Mật khẩu", icon:<BsLock     size={15} />,
          right:(
            <button type="button" onClick={() => setShowPw(!showPw)}
                    className="transition hover:opacity-60" style={{ color: P.muted }}>
                {showPw ? <BsEyeSlash size={15} /> : <BsEye size={15} />}
            </button>
          )
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
             style={{ background: P.bg }}>

            {/* Ambient glow nâu */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px]
                            rounded-full blur-3xl pointer-events-none"
                 style={{ background:"rgba(196,168,130,0.12)" }} />

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
                        Bắt đầu hành trình cảm xúc của bạn
                    </p>
                </div>

                {/* Card — trang giấy */}
                <div className="relative rounded-2xl overflow-hidden"
                     style={{
                         background: P.surface,
                         border: `1px solid ${P.border}`,
                         boxShadow:"0 8px 32px rgba(139,110,80,0.12), inset 0 0 0 1px rgba(255,255,255,0.6)"
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
                            Tạo tài khoản
                        </h2>

                        {/* Fields */}
                        <div className="space-y-3 mb-4">
                            {fields.map(f => (
                                <div key={f.key} className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2"
                                          style={{ color: P.muted }}>
                                        {f.icon}
                                    </span>
                                    <input
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        value={form[f.key]}
                                        onChange={set(f.key)}
                                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                        className="w-full py-3 rounded-xl text-sm outline-none transition"
                                        style={inputStyle}
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
                                             className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                             style={{ background: i < pwStrength ? pwBarColor : P.card }} />
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    {pwChecks.map(c => (
                                        <div key={c.label}
                                             className="flex items-center gap-2 text-xs transition"
                                             style={{ color: c.pass ? "#4a7a3a" : P.muted }}>
                                            <BsCheckCircle size={11} />
                                            {c.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button onClick={handleSubmit} disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background:`linear-gradient(135deg, ${P.spine}, ${P.accent})`, boxShadow:"0 4px 16px rgba(124,92,58,0.25)" }}>
                            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                        </button>

                        <p className="text-center mt-5 text-sm" style={{ color: P.muted }}>
                            Đã có tài khoản?{" "}
                            <Link to="/"
                                  className="font-medium hover:opacity-70 transition"
                                  style={{ color: P.accent }}>
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
