import { useState } from "react";
import { useLocation } from "wouter";
import { Leaf, Lock, Mail } from "lucide-react";

const users = [
  {
    email: "admin@freshvida.com",
    password: "1234",
    name: "Juan Martinez",
    role: "admin",
  },
  {
    email: "comerciante@freshvida.com",
    password: "1234",
    name: "Comerciante Demo",
    role: "comerciante",
  },
];

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("admin@freshvida.com");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");

  function handleLogin() {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      setError("Correo o contraseña incorrectos");
      return;
    }

    localStorage.setItem("freshvida_user", JSON.stringify(foundUser));

    if (foundUser.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/workshops");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-green-600 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-3">
            <Leaf className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FreshVida</h1>
          <p className="text-gray-500 text-sm">Plataforma Agrícola RD</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Correo</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                className="w-full outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@freshvida.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                className="w-full outline-none text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Iniciar sesión
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Acceso restringido. Solo usuarios autorizados.
        </p>
      </div>
    </div>
  );
}