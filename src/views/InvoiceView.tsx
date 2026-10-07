import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService.ts';
import { formatCOP, formatDateTime } from '../utils/formatters.ts';
import { Invoice } from '../types/database.ts';
import { 
  Printer, 
  Download, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  QrCode,
  Share2
} from 'lucide-react';

interface InvoiceViewProps {
  invoiceId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ invoiceId, onNavigate }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (invoiceId) {
      const inv = salesService.getById(invoiceId);
      if (inv) setInvoice(inv);
    } else {
      // Default to latest invoice
      const all = salesService.getInvoices();
      if (all.length > 0) setInvoice(all[0]);
    }
  }, [invoiceId]);

  if (!invoice) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-stone-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Comprobante no encontrado</h2>
        <p className="text-xs text-stone-500">
          No se encontró la factura con radicado "{invoiceId}".
        </p>
        <button
          onClick={() => onNavigate('sales-history')}
          className="px-5 py-2.5 bg-[#B3202A] text-white rounded-xl text-xs font-bold hover:bg-[#8B1820]"
        >
          Ver Historial de Ventas
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Generate simulated printable document trigger or PDF alert
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Action Bar (hidden on physical print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => onNavigate('sales-history')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#B3202A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Historial de Ventas</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Descargar PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Factura</span>
          </button>
        </div>
      </div>

      {/* Official Printable Invoice Sheet (Pantalla 7) */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-stone-200 text-stone-800 space-y-8" id="printable-invoice">
        
        {/* Header: Company & Invoice Index */}
        <div className="flex flex-col md:flex-row md:items-start justify-between border-b-2 border-[#B3202A] pb-6 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#B3202A] text-white flex items-center justify-center font-black shadow-md">
                <svg className="w-7 h-7 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M21 4c-.6 0-1.7.5-2.5 1.5-1.2 1.5-2.5 2.5-4.5 2.5H10c-2 0-3.3-1-4.5-2.5C4.7 4.5 3.6 4 3 4c-.6 0-1 .4-1 1 0 1.2 1 3.5 2.5 5 1.1 1.1 2.2 1.8 3.5 2v1.5c0 2.5 1.8 4.5 4 4.5s4-2 4-4.5V12c1.3-.2 2.4-.9 3.5-2 1.5-1.5 2.5-3.8 2.5-5 0-.6-.4-1-1-1zm-9 13c-1.1 0-2-.9-2-2v-.5c.6.3 1.3.5 2 .5s1.4-.2 2-.5v.5c0 1.1-.9 2-2 2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#8B1820]">
                  GanadoCarnes S.A.S.
                </h1>
                <p className="text-xs text-stone-500 font-medium">
                  Comercializadora Pecuaria Nacional • Ganado Lechero y Carnal
                </p>
              </div>
            </div>

            <div className="text-xs text-stone-600 space-y-0.5">
              <p><strong>NIT:</strong> 901.884.230-8 • Régimen Común</p>
              <p><strong>Sede Principal:</strong> Montería, Córdoba • Cra 4 # 28-30</p>
              <p><strong>Contacto:</strong> +57 (310) 800-GANADO • facturas@ganadocarnes.com</p>
              <p><strong>Resolución DIAN:</strong> 18764000192842 de vigencia técnica pecuaria</p>
            </div>
          </div>

          {/* Unique invoice index & status */}
          <div className="flex flex-col items-start md:items-end">
            <div className="bg-[#F9E3E3] border border-rose-200 rounded-2xl p-4 text-left md:text-right min-w-[240px] shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B3202A] block">
                Factura de Venta Ganadera
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-[#8B1820] tracking-tight block">
                {invoice.id}
              </span>
              <div className="mt-1 flex items-center justify-start md:justify-end gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Estado: {invoice.status}</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-stone-500 text-left md:text-right">
              <span>Fecha y hora de emisión: </span>
              <strong className="text-stone-800 block sm:inline">{formatDateTime(invoice.date)}</strong>
            </div>
          </div>
        </div>

        {/* Buyer information (Datos del comprador) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
              Adquirente / Comprador
            </h3>
            <p className="font-bold text-stone-900 text-sm">{invoice.buyer.name}</p>
            <p className="text-stone-600 mt-0.5"><strong>Documento / NIT:</strong> {invoice.buyer.document}</p>
            <p className="text-stone-600"><strong>Teléfono:</strong> {invoice.buyer.phone}</p>
            <p className="text-stone-600"><strong>Correo:</strong> {invoice.buyer.email}</p>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
              Destino y Método de Pago
            </h3>
            <p className="text-stone-600"><strong>Predio / Finca:</strong> {invoice.buyer.address}</p>
            <p className="text-stone-600"><strong>Ciudad:</strong> {invoice.buyer.city}</p>
            <p className="text-stone-600 mt-1">
              <strong>Forma de Pago:</strong> <span className="font-semibold text-stone-800">{invoice.paymentMethod}</span>
            </p>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Atendido por: {invoice.createdByName}
            </p>
          </div>
        </div>

        {/* Lista de bovinos con ID, precio, subtotal, total (Requirement Pantalla 7) */}
        <div className="overflow-hidden rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">ID Bovino</th>
                <th className="py-3 px-4">Descripción del Ejemplar</th>
                <th className="py-3 px-4">Categoría / Raza</th>
                <th className="py-3 px-4 text-right">Precio Unitario</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {invoice.items.map((item, idx) => (
                <tr key={item.bovineId} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#8B1820]">{item.bovineId}</td>
                  <td className="py-3 px-4 font-bold text-stone-900">{item.name}</td>
                  <td className="py-3 px-4 text-stone-500">{item.category} • {item.breed}</td>
                  <td className="py-3 px-4 text-right text-stone-700">{formatCOP(item.price)}</td>
                  <td className="py-3 px-4 text-right font-black text-stone-900">{formatCOP(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal, Envío y Total */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t border-stone-200">
          {/* QR Verification Seal */}
          <div className="flex items-start gap-4 text-xs text-stone-500 max-w-sm">
            <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200 shrink-0">
              <QrCode className="w-16 h-16 text-stone-800" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Factura Oficial Electrónica DIAN</span>
              </div>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                Documento soporte en adquisición de semovientes. Amparado por la Ley de Trazabilidad e Identificación Bovina de Colombia.
              </p>
            </div>
          </div>

          {/* Totals */}
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal Neto:</span>
              <span className="font-bold text-stone-900">{formatCOP(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Transporte Pecuario:</span>
              <span className="font-bold text-emerald-700">GRATIS ($ 0)</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>IVA Ganadero / Semovientes:</span>
              <span className="font-bold text-stone-900">$ 0 (Exento)</span>
            </div>
            <div className="pt-3 border-t-2 border-stone-300 flex justify-between text-base font-black text-stone-900">
              <span>TOTAL FACTURADO:</span>
              <span className="text-xl sm:text-2xl font-black text-[#8B1820] font-mono">
                {formatCOP(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Physical signatures row for printed paper receipt */}
        <div className="pt-8 border-t border-dashed border-stone-300 grid grid-cols-2 gap-12 text-center text-xs text-stone-500">
          <div>
            <div className="h-10 border-b border-stone-400 w-3/4 mx-auto mb-2"></div>
            <p className="font-bold text-stone-700">GanadoCarnes S.A.S.</p>
            <p className="text-[10px] text-stone-400">Responsable de Entrega y Guía ICA</p>
          </div>
          <div>
            <div className="h-10 border-b border-stone-400 w-3/4 mx-auto mb-2"></div>
            <p className="font-bold text-stone-700">{invoice.buyer.name}</p>
            <p className="text-[10px] text-stone-400">Firma del Comprador / Recibí Conforme</p>
          </div>
        </div>

      </div>
    </div>
  );
};
