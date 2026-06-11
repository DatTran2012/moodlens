import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            await api.post("/auth/register", form);

            alert("Tạo tài khoản thành công");

            navigate("/");

        } catch (err) {

            alert(
                err?.response?.data?.message ||
                "Register failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6">

                <h1 className="text-3xl font-bold text-white mb-6">
                    Create Account
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full p-3 rounded bg-slate-800 text-white"
                        value={form.name}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                name: e.target.value
                            })
                        }
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 rounded bg-slate-800 text-white"
                        value={form.email}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                email: e.target.value
                            })
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 rounded bg-slate-800 text-white"
                        value={form.password}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password: e.target.value
                            })
                        }
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            py-3
                            rounded-lg
                            text-white
                            font-medium
                        "
                    >
                        {
                            loading
                                ? "Creating..."
                                : "Create Account"
                        }
                    </button>

                </form>

                <div className="mt-6 text-center text-gray-400">

                    Already have an account?

                    <Link
                        to="/login"
                        className="text-blue-400 ml-2"
                    >
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}