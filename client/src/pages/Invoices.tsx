import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { Search, Printer, FileText, Leaf, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "wouter";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);
}

function InvoicePrint({ orderId }: { orderId: number }) {
  const { data, isLoading } = trpc.orders.getWithItems.useQuery({ id: orderId });

  if (isLoading) return <div className="p-8 text-center">Cargando factura...</div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Factura no encontrada</div>;

  const { order, items, client } = data;
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  return (
    <div className="bg-white p-8 max-w-2xl mx-auto font-sans text-sm" id="invoice-print">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-green-600">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">FreshVida</h1>
              <p className="text-xs text-gray-500">Plataforma Agrícola Integral</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>NIT: 900.123.456-7</p>
            <p>Tel: +57 (1) 234-5678</p>
            <p>info@freshvida.co</p>
            <p>Colombia</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">FACTURA</p>
            <p className="text-2xl font-bold text-green-800">{order.orderNumber}</p>
            <p className="text-xs text-gray-500 mt-1">
              Fecha: {new Date(order.createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <div className={`mt-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              order.status === "delivered" ? "bg-green-100 text-green-800" :
              order.status === "pending" ? "bg-amber-100 text-amber-800" :
              order.status === "processing" ? "bg-blue-100 text-blue-800" :
              "bg-red-100 text-red-800"
            }`}>
              {STATUS_LABELS[order.status]}
            </div>
          </div>
        </div>
      </div>

      {/* Client Info */}
      {client && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">FACTURAR A</p>
          <p className="font-bold text-gray-800 text-base">{client.name}</p>
          {client.email && <p className="text-gray-600 text-xs">{client.email}</p>}
          {client.phone && <p className="text-gray-600 text-xs">{client.phone}</p>}
          {client.address && <p className="text-gray-600 text-xs">{client.address}{client.city ? `, ${client.city}` : ""}</p>}
        </div>
      )}

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="bg-green-600 text-white">
            <th className="text-left py-2.5 px-3 text-xs font-semibold rounded-tl-lg">Descripción</th>
            <th className="text-center py-2.5 px-3 text-xs font-semibold">Cant.</th>
            <th className="text-right py-2.5 px-3 text-xs font-semibold">Precio Unit.</th>
            <th className="text-right py-2.5 px-3 text-xs font-semibold rounded-tr-lg">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="py-2.5 px-3 text-gray-800 font-medium">{item.productName ?? `Producto #${item.productId}`}</td>
              <td className="py-2.5 px-3 text-center text-gray-600">
                {item.quantity} {item.productUnit ?? "u."}
              </td>
              <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(Number(item.unitPrice))}</td>
              <td className="py-2.5 px-3 text-right font-semibold text-gray-800">{formatCurrency(Number(item.subtotal))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA (19%):</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-green-800 pt-2 border-t-2 border-green-600">
            <span>TOTAL:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-1">NOTAS:</p>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">Gracias por confiar en FreshVida — Agricultura con propósito</p>
        <p className="text-xs text-gray-400 mt-1">www.freshvida.co | info@freshvida.co</p>
      </div>
    </div>
  );
}

export default function Invoices() {
  const params = useParams<{ id?: string }>();
  const initialOrderId = params.id ? parseInt(params.id) : null;
  const { data: orders = [], isLoading } = trpc.orders.list.useQuery({});
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(initialOrderId);
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const printContent = document.getElementById("invoice-print");
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Factura FreshVida</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
            * { box-sizing: border-box; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }

  const filtered = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    (o.clientName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FreshVidaLayout title="Facturas">
      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">{orders.length} facturas disponibles</p>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar facturas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Factura</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">Cliente</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Estado</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Total</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Fecha</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-primary">{order.orderNumber}</td>
                        <td className="py-3.5 px-4 hidden md:table-cell text-foreground">{order.clientName ?? "—"}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            order.status === "delivered" ? "bg-green-100 text-green-800 border-green-200" :
                            order.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200" :
                            order.status === "processing" ? "bg-blue-100 text-blue-800 border-blue-200" :
                            "bg-red-100 text-red-800 border-red-200"
                          }`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold">{formatCurrency(Number(order.totalAmount))}</td>
                        <td className="py-3.5 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString("es-CO")}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Ver
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No hay facturas disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={selectedOrderId !== null} onOpenChange={(o) => { if (!o) setSelectedOrderId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-3 flex items-center justify-between no-print">
            <h2 className="font-semibold text-foreground">Vista previa de factura</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button size="sm" className="gap-2" onClick={handlePrint}>
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
            </div>
          </div>
          <div ref={printRef}>
            {selectedOrderId && <InvoicePrint orderId={selectedOrderId} />}
          </div>
        </DialogContent>
      </Dialog>
    </FreshVidaLayout>
  );
}
