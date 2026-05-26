'use client';
import { useState, useMemo } from 'react';
import { Mail, Send, AlertCircle, CheckCircle2, Loader2, Info, Calendar, MapPin, Edit3 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 text-slate-800 font-sans selection:bg-pink-200">
      {/* Header Glassmorphism */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-pink-500 to-pink-400 p-2 rounded-xl shadow-md shadow-pink-500/20 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 leading-none">Programa piloto de pesquisa de VPH</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Universidad Católica del Norte</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-pink-700 bg-pink-100/80 px-4 py-1.5 rounded-full border border-pink-200/50 shadow-sm transition-all">
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
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-pink-900/5 border border-white p-6 flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-pink-900/10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Destinatarios</h2>
                </div>
                <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-bold shadow-sm">
                  {validEmails.length} válidos
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4 font-medium">
                Pega la lista de correos desde Excel o un documento. Separados por comas o saltos de línea.
              </p>
              <textarea
                value={rawContacts}
                onChange={(e) => setRawContacts(e.target.value)}
                placeholder="ejemplo1@correo.cl&#10;ejemplo2@correo.cl"
                className="flex-1 w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-pink-400/40 focus:border-pink-500 transition-all resize-none placeholder:text-slate-300 shadow-inner text-slate-700 accent-pink-600"
              />
            </div>
          </div>

          {/* Right Column: Message */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-[500px]">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-pink-900/5 border border-white p-6 flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-pink-900/10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Configuración del Recordatorio</h2>
              </div>
              
              <div className="flex flex-col gap-5 flex-1">
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-pink-600">Asunto del correo</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-pink-400/40 focus:border-pink-500 transition-all shadow-sm text-slate-800 font-medium accent-pink-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-pink-600">Comuna</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors pointer-events-none" />
                      <select
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        className="w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-pink-400/40 focus:border-pink-500 transition-all appearance-none shadow-sm text-slate-800 font-medium cursor-pointer accent-pink-600"
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2 transition-colors group-focus-within:text-pink-600">Fecha de Toma de Muestra</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors pointer-events-none" />
                      <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-pink-400/40 focus:border-pink-500 transition-all shadow-sm text-slate-800 font-medium cursor-pointer accent-pink-600 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 mt-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vista Previa del Mensaje a Enviar</label>
                  <div className="w-full h-full min-h-[150px] bg-white border border-slate-100 shadow-sm rounded-2xl p-6 text-sm text-slate-600 transition-all hover:shadow-md">
                    <h3 className="font-extrabold text-slate-900 text-center mb-5 text-xl tracking-tight">Recordatorio de retiro de muestra de orina</h3>
                    <p className="mb-4 text-base">Estimado/a participante de <strong>{comuna || '[Comuna]'}</strong>,</p>
                    <p className="mb-6 text-base">Le recordamos que el retiro de su muestra de orina del Proyecto VPH está programado para el día <strong>{fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '[Fecha]'}</strong>.</p>
                    
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 text-pink-900 p-5 rounded-2xl border border-pink-200 font-medium flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                      <div className="flex-1 text-left">
                        <p className="mb-2 text-pink-700 text-lg flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          <strong>Instrucción de toma de muestra</strong>
                        </p>
                        <p className="mb-4 text-base opacity-90">Para la precisión del examen, es obligatorio que recolecte su <strong className="text-pink-900 bg-pink-200/50 px-1 rounded">PRIMERA ORINA DE LA MAÑANA</strong> ese día.</p>
                        <p className="text-sm bg-white/60 p-3 rounded-xl border border-pink-100/50 inline-block shadow-sm">
                          <strong>Volumen requerido:</strong> Llene el frasco hasta <strong>3/4 de su capacidad</strong>.
                        </p>
                      </div>
                      <div className="flex-shrink-0 bg-white p-3 rounded-2xl border border-pink-100 shadow-md rotate-2 hover:rotate-0 transition-transform duration-300">
                        <img src="/frasco.png" alt="Frasco 3/4" className="h-24 w-auto object-contain drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4 text-pink-500" />
                    Asegúrese de revisar la vista previa antes de enviar.
                  </div>
                  <button
                    onClick={handlePreSend}
                    disabled={isSending}
                    className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isSending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Preparar Envío</>
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
