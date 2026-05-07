import FreshVidaLayout from "@/components/FreshVidaLayout";
import {
  BadgeCheck,
  CalendarDays,
  FileCheck,
  Leaf,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Pencil,
} from "lucide-react";
import { useState } from "react";

type Certification = {
  id: number;
  name: string;
  code: string;
  product: string;
  province: string;
  status: string;
  expires: string;
};

const initialCertifications: Certification[] = [
  {
    id: 1,
    name: "Certificación Orgánica",
    code: "ORG-RD-2026-001",
    product: "Cacao dominicano",
    province: "San Francisco de Macorís",
    status: "Vigente",
    expires: "15 agosto 2026",
  },
  {
    id: 2,
    name: "Buenas Prácticas Agrícolas",
    code: "BPA-RD-2026-014",
    product: "Plátano y guineo",
    province: "La Vega",
    status: "En revisión",
    expires: "30 septiembre 2026",
  },
  {
    id: 3,
    name: "Calidad para Exportación",
    code: "EXP-RD-2026-008",
    product: "Mango banilejo",
    province: "Peravia",
    status: "Vigente",
    expires: "10 diciembre 2026",
  },
];

export default function Certifications() {
  const saved = localStorage.getItem("freshvida_certifications");

  const [certifications, setCertifications] = useState<Certification[]>(
    saved ? JSON.parse(saved) : initialCertifications
  );

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    product: "",
    province: "",
    status: "Vigente",
    expires: "",
  });

  function saveData(data: Certification[]) {
    setCertifications(data);
    localStorage.setItem("freshvida_certifications", JSON.stringify(data));
  }

  function resetForm() {
    setForm({
      name: "",
      code: "",
      product: "",
      province: "",
      status: "Vigente",
      expires: "",
    });
    setEditingId(null);
  }

  function handleSubmit() {
    if (!form.name || !form.code || !form.product || !form.province || !form.expires) {
      alert("Completa todos los campos.");
      return;
    }

    if (editingId) {
      const updated = certifications.map((cert) =>
        cert.id === editingId ? { ...cert, ...form } : cert
      );
      saveData(updated);
      resetForm();
      return;
    }

    const newCertification: Certification = {
      id: Date.now(),
      ...form,
    };

    saveData([...certifications, newCertification]);
    resetForm();
  }

  function handleEdit(cert: Certification) {
    setEditingId(cert.id);
    setForm({
      name: cert.name,
      code: cert.code,
      product: cert.product,
      province: cert.province,
      status: cert.status,
      expires: cert.expires,
    });
  }

  function handleDelete(id: number) {
    const confirmDelete = confirm("¿Seguro que deseas eliminar esta certificación?");
    if (!confirmDelete) return;

    const updated = certifications.filter((cert) => cert.id !== id);
    saveData(updated);
  }

  const filteredCertifications = certifications.filter((cert) =>
    `${cert.name} ${cert.code} ${cert.product} ${cert.province}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <FreshVidaLayout title="Certificaciones">
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Certificaciones Agrícolas</h2>
            <p className="text-muted-foreground">
              Control de certificaciones orgánicas, calidad agrícola y exportación para productores dominicanos.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full border rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Buscar certificación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold mb-4">
            {editingId ? "Editar certificación" : "Agregar nueva certificación"}
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Nombre de certificación"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Código"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />

            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Producto"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
            />

            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Provincia"
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            />

            <select
              className="border rounded-xl px-3 py-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Vigente</option>
              <option>En revisión</option>
              <option>Vencida</option>
            </select>

            <input
              className="border rounded-xl px-3 py-2"
              placeholder="Fecha de vencimiento"
              value={form.expires}
              onChange={(e) => setForm({ ...form, expires: e.target.value })}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {editingId ? "Guardar cambios" : "Agregar certificación"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="border px-5 py-2 rounded-xl"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {filteredCertifications.map((cert) => {
            const Icon =
              cert.name.toLowerCase().includes("orgánica")
                ? Leaf
                : cert.name.toLowerCase().includes("exportación")
                ? BadgeCheck
                : ShieldCheck;

            return (
              <div
                key={cert.id}
                className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-700" />
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      cert.status === "Vigente"
                        ? "bg-green-100 text-green-700"
                        : cert.status === "En revisión"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg">{cert.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cert.code}</p>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Producto:</strong> {cert.product}
                  </p>
                  <p>
                    <strong>Provincia:</strong> {cert.province}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-green-700" />
                    Vence: {cert.expires}
                  </p>
                </div>

                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => handleEdit(cert)}
                    className="flex-1 border rounded-xl py-2 text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="flex-1 border border-red-200 text-red-600 rounded-xl py-2 text-sm flex items-center justify-center gap-2 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-4">
          <FileCheck className="w-7 h-7 text-green-700 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-900">Importancia del módulo</h3>
            <p className="text-sm text-green-800">
              Este módulo permite registrar, consultar, editar y eliminar certificaciones agrícolas,
              ayudando a productores dominicanos a organizar documentos necesarios para calidad,
              confianza comercial y exportación.
            </p>
          </div>
        </div>
      </div>
    </FreshVidaLayout>
  );
}