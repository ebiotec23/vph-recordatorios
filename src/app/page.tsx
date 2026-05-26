'use client';
import { useState, useMemo } from 'react';
import { Mail, Send, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';

export default function Home() {
  const [rawContacts, setRawContacts] = useState('');
  const [subject, setSubject] = useState('Recordatorio Importante: Campaña VPH - UCN');
  
  const [comuna, setComuna] = useState('');
  const [fecha, setFecha] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });

  // Expresión regular mejorada para extraer emails de texto crudo
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const matches = rawContacts.match(emailRegex);
  const validEmails = matches ? [...new Set(matches)] : [];

  const handlePreSend = () => {
    if (validEmails.length === 0) {
      setStatus({ type: 'error', text: 'No se encontraron correos válidos en la lista.' });
      return;
    }
    
    if (!comuna || !fecha) {
      setStatus({ type: 'error', text: 'Debe seleccionar la comuna y la fecha.' });
      return;
    }

    if (!subject.trim()) {
      setStatus({ type: 'error', text: 'El asunto no puede estar vacío.' });
      return;
    }

    setShowConfirm(true);
  };

  const handleSend = async () => {
    setShowConfirm(false);
    setIsSending(true);
    setStatus({ type: null, text: '' });

    try {
      // Formatear la fecha para que se vea bonita (ej: "jueves 28 de mayo")
      const dateObj = new Date(fecha + 'T00:00:00');
      const fechaFormateada = dateObj.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: validEmails,
          subject,
          comuna,
          fecha: fechaFormateada
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido al enviar.');
      }

      setStatus({ type: 'success', text: data.message });
      setRawContacts(''); // Clear after success
    } catch (error: any) {
      setStatus({ type: 'error', text: error.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-pink-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Programa piloto de pesquisa de VPH</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Universidad Católica del Norte</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {validEmails.length} contactos detectados
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Status Alert */}
        {status.type && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
            <div>
              <h3 className="font-semibold">{status.type === 'success' ? '¡Éxito!' : 'Error'}</h3>
              <p className="text-sm mt-1 opacity-90">{status.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Contacts */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-[500px]">
            <div className="bg-[#fff5f8] rounded-2xl shadow-sm border border-pink-200 p-5 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-slate-900">1. Lista de Destinatarios</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  {validEmails.length} válidos
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-3">
                Pega la lista de correos desde Excel o un documento. Separados por comas o saltos de línea.
              </p>
              <textarea
                value={rawContacts}
                onChange={(e) => setRawContacts(e.target.value)}
                placeholder="ejemplo1@correo.cl&#10;ejemplo2@correo.cl"
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-colors resize-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Column: Message */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-[500px]">
            <div className="bg-[#fff5f8] rounded-2xl shadow-sm border border-pink-200 p-5 flex flex-col h-full">
              <h2 className="text-base font-semibold text-slate-900 mb-4">2. Configuración del Recordatorio</h2>
              
              <div className="flex flex-col gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto del correo</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Comuna</label>
                    <select
                      value={comuna}
                      onChange={(e) => setComuna(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-colors appearance-none"
                    >
                      <option value="">Seleccione una comuna...</option>
                      <option value="Antofagasta">Antofagasta</option>
                      <option value="Calama">Calama</option>
                      <option value="Tocopilla">Tocopilla</option>
                      <option value="Mejillones">Mejillones</option>
                      <option value="María Elena">María Elena</option>
                      <option value="Taltal">Taltal</option>
                      <option value="San Pedro de Atacama">San Pedro de Atacama</option>
                      <option value="Sierra Gorda">Sierra Gorda</option>
                      <option value="Baquedano">Baquedano</option>
                      <option value="Ollagüe">Ollagüe</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de Toma de Muestra</label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Vista Previa del Mensaje a Enviar</label>
                  <div className="w-full h-full min-h-[150px] bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
                    <h3 className="font-bold text-slate-900 text-center mb-4 text-lg">Recordatorio de retiro de muestra de orina</h3>
                    <p className="mb-4">Estimado/a participante de <strong>{comuna || '[Comuna]'}</strong>,</p>
                    <p className="mb-4">Le recordamos que el retiro de su muestra de orina del Proyecto VPH está programado para el día <strong>{fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '[Fecha]'}</strong>.</p>
                    <div className="bg-pink-50 text-pink-800 p-4 rounded-lg border border-pink-100 font-medium flex items-center justify-between gap-6">
                      <div className="flex-1 text-left">
                        <p className="mb-2 text-pink-900">⚠️ <strong>Instrucción de toma de muestra:</strong></p>
                        <p className="mb-3">Para la precisión del examen, es obligatorio que recolecte su <strong>PRIMERA ORINA DE LA MAÑANA</strong> ese día.</p>
                        <p className="text-sm">
                          <strong>Volumen requerido:</strong> Llene el frasco hasta <strong>3/4 de su capacidad</strong>.
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-white p-2 rounded-xl border border-pink-100 shadow-sm">
                        <img src="/frasco.png" alt="Frasco 3/4" className="h-20 w-auto object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <div className="text-sm text-slate-500">
                    Asegúrese de revisar la vista previa antes de enviar.
                  </div>
                  <button
                    onClick={handlePreSend}
                    disabled={isSending}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm shadow-pink-600/20"
                  >
                    {isSending ? (
                      <>Enviando correos...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Preparar Envío
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Confirmar envío masivo</h2>
              <p className="text-slate-600 mb-6">
                Estás a punto de enviar este recordatorio a <strong>{validEmails.length} paciente(s)</strong> de la comuna de <strong>{comuna}</strong>. 
                ¿Estás seguro de que la información de fecha ({new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL')}) y el mensaje son correctos?
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  className="px-4 py-2 font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors shadow-sm"
                >
                  Sí, enviar a {validEmails.length} pacientes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
