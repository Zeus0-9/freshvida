import FreshVidaLayout from "@/components/FreshVidaLayout";
import { BadgeCheck, CalendarDays, FileCheck, Leaf, ShieldCheck } from "lucide-react";

const certifications = [
  {
    name: "Certificación Orgánica",
    code: "ORG-RD-2026-001",
    product: "Cacao dominicano",
    province: "San Francisco de Macorís",
    status: "Vigente",
    expires: "15 agosto 2026",
    icon: Leaf,
  },
  {
    name: "Buenas Prácticas Agrícolas",
    code: "BPA-RD-2026-014",
    product: "Plátano y guineo",
    province: "La Vega",
    status: "En revisión",
    expires: "30 septiembre 2026",
    icon: ShieldCheck,
  },
  {
    name: "Calidad para Exportación",
    code: "EXP-RD-2026-008",
    product: "Mango banilejo",
    province: "Peravia",
    status: "Vigente",
    expires: "10 diciembre 2026",
    icon: BadgeCheck,
  },
];

export default function Certifications() {
  return (
    <FreshVidaLayout title="Certificaciones">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Certificaciones Agrícolas</h2>
          <p className="text-muted-foreground">
            Control de certificaciones orgánicas, calidad agrícola y exportación para productores dominicanos.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {certifications.map((cert) => {
            const Icon = cert.icon;

            return (
              <div
                key={cert.code}
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
                        : "bg-yellow-100 text-yellow-700"
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
              </div>
            );
          })}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-4">
          <FileCheck className="w-7 h-7 text-green-700 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-900">Importancia del módulo</h3>
            <p className="text-sm text-green-800">
              Este módulo permite que FreshVida ayude a productores dominicanos a organizar certificaciones
              necesarias para mejorar la confianza comercial, acceder a nuevos mercados y prepararse para exportación.
            </p>
          </div>
        </div>
      </div>
    </FreshVidaLayout>
  );
}