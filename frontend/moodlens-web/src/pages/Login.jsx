import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        const res = await api.post("/auth/login", {
            email,
            password,
        });

        login(res.data.token);

        navigate("/welcome");
    };

    return (
        <div className="min-h-screen flex items-center justify-center 
                  bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
                  p-4">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl 
                    border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl">

                <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-6">
                    MoodLens
                </h1>

                <p className="text-gray-300 text-center mb-6 text-sm sm:text-base">
                    Track your emotions with AI
                </p>

                <input
                    className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white 
                   placeholder-gray-300 border border-white/20 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full p-3 mb-5 rounded-lg bg-white/10 text-white 
                   placeholder-gray-300 border border-white/20 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 hover:bg-blue-600 transition 
                   text-white p-3 rounded-lg font-semibold active:scale-[0.98]"
                >
                    Sign In
                </button>
                <div className="text-center mt-6 text-gray-400">

                    Chưa có tài khoản?

                    <Link
                        to="/register"
                        className="text-blue-400 ml-2"
                    >
                        Đăng ký
                    </Link>

                </div>
            </div>

        </div>
    );
}