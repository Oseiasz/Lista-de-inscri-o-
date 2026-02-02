
import React, { useState, useEffect, useCallback } from 'react';
import { Registration } from './types';
import { EVENT_DATA } from './constants';
import { supabase } from './services/supabase';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  Wallet, 
  ClipboardCheck, 
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  X,
  FileText,
  ShieldCheck,
  QrCode,
  Copy,
  Info,
  ChevronRight,
  Check,
  Loader2
} from 'lucide-react';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRegistration, setLastRegistration] = useState<Registration | null>(null);
  const [paymentStep, setPaymentStep] = useState<'info' | 'receipt'>('info');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('registrations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (sbError) throw sbError;
      
      // Mapear de volta de snake_case para camelCase se necessário
      const mappedData = (data || []).map((reg: any) => ({
        id: reg.id,
        enrollmentNumber: reg.enrollment_number || reg.enrollmentNumber,
        name: reg.name,
        phone: reg.phone,
        timestamp: reg.timestamp,
        transactionId: reg.transaction_id || reg.transactionId,
        paymentStatus: reg.payment_status || reg.paymentStatus
      }));
      
      setRegistrations(mappedData);
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      // Não bloqueia o app se falhar a busca inicial, apenas loga
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => fetchRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRegistrations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const nextNum = (registrations.length + 1).toString().padStart(3, '0');
      const transactionId = `FT-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
      
      // Payload usando snake_case que é o padrão do Supabase/Postgres
      const payload = {
        enrollment_number: nextNum,
        name: formData.name,
        phone: formData.phone,
        timestamp: Date.now(),
        transaction_id: transactionId,
        payment_status: 'pending'
      };

      const { data, error: insertError } = await supabase
        .from('registrations')
        .insert([payload])
        .select();

      if (insertError) {
        console.error('Erro detalhado do Supabase:', insertError);
        throw new Error(insertError.message);
      }

      const savedData = data?.[0];
      const savedReg: Registration = {
        id: savedData.id,
        enrollmentNumber: savedData.enrollment_number,
        name: savedData.name,
        phone: savedData.phone,
        timestamp: savedData.timestamp,
        transactionId: savedData.transaction_id,
        paymentStatus: savedData.payment_status
      };

      setLastRegistration(savedReg);
      setPaymentStep('info');
      setFormData({ name: '', phone: '' });
      await fetchRegistrations();
    } catch (err: any) {
      console.error('Falha na inscrição:', err);
      setError(`Erro: ${err.message || 'Verifique sua conexão e tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPixKey = () => {
    if (EVENT_DATA.pixKey) {
      navigator.clipboard.writeText(EVENT_DATA.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const simulatePaymentVerification = async () => {
    if (!lastRegistration?.id) return;
    try {
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ payment_status: 'confirmed' })
        .eq('id', lastRegistration.id);
      
      if (updateError) throw updateError;
      setPaymentStep('receipt');
      await fetchRegistrations();
    } catch (err) {
      console.error('Erro ao simular:', err);
    }
  };

  const filteredRegistrations = registrations.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.enrollmentNumber.includes(searchTerm)
  );

  const getQrData = (reg: Registration) => {
    return `Evento: Fé e Terapia\nParticipante: ${reg.name}\nInscrição: #${reg.enrollmentNumber}\nID: ${reg.transactionId}`;
  };

  return (
    <div className="min-h-screen bg-pattern pb-20 selection:bg-rose-100 selection:text-rose-900">
      <header className="relative bg-white border-b border-pink-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60"></div>
        <div className="max-w-5xl mx-auto px-6 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-semibold mb-8 border border-rose-100 shadow-sm animate-pulse">
            <Sparkles size={16} />
            <span>Inscrições Abertas • Exclusivo para Mulheres</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
            {EVENT_DATA.theme}
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-light italic leading-relaxed">
            "Um encontro entre a espiritualidade e a psicologia para fortalecer sua jornada feminina."
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 -mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl shadow-pink-100/40 border border-white/50">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-rose-900">
              <Calendar className="text-rose-500" size={28} />
              Detalhes
            </h2>
            <div className="space-y-8">
              <DetailItem icon={<Users size={20} />} label="Público" value={EVENT_DATA.audienceRules} color="text-pink-600" />
              <DetailItem icon={<Clock size={20} />} label="Data e Horário" value={EVENT_DATA.time} color="text-amber-600" />
              <DetailItem icon={<Wallet size={20} />} label="Valor da Inscrição" value={EVENT_DATA.price} color="text-emerald-600" />
              <DetailItem icon={<MapPin size={20} />} label="Localização" value={EVENT_DATA.address} color="text-blue-600" />
              <DetailItem icon={<Phone size={20} />} label="WhatsApp Suporte" value={EVENT_DATA.phone} color="text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-pink-100/40 border border-white relative">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-8">
              <ClipboardCheck className="text-rose-500" size={32} />
              Inscrição Online
            </h2>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-rose-500 mt-1 flex-shrink-0" size={20} />
                <div className="text-sm">
                  <p className="font-bold">Não foi possível completar a inscrição</p>
                  <p className="opacity-80">{error}</p>
                  <p className="mt-2 text-[10px] font-mono bg-white/50 p-2 rounded">Dica: Verifique se as tabelas foram criadas no Supabase e se a chave API é válida.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome da participante"
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-rose-100 focus:border-rose-300 focus:bg-white transition-all text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input 
                    type="tel" required value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-rose-100 focus:border-rose-300 focus:bg-white transition-all text-lg"
                  />
                </div>
              </div>
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xl py-6 rounded-[1.25rem] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <>QUERO ME INSCREVER <Sparkles size={24} /></>}
              </button>
            </form>
          </section>

          <section className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-xl border border-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Users className="text-rose-500" size={28} />
                  Lista de Confirmadas
                </h2>
                <p className="text-sm text-gray-400 mt-1">{registrations.length} mulheres inscritas.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-12 pr-6 py-3 bg-white border border-rose-100 rounded-full text-sm w-full md:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="pb-6 px-4">Inscrição</th>
                    <th className="pb-6 px-4">Participante</th>
                    <th className="pb-6 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id || reg.enrollmentNumber} className="group hover:bg-white transition-all">
                      <td className="py-5 px-4 text-xs font-black text-rose-500">#{reg.enrollmentNumber}</td>
                      <td className="py-5 px-4 font-semibold text-gray-700">{reg.name}</td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          reg.paymentStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {reg.paymentStatus === 'confirmed' ? <CheckCircle2 size={12} /> : <Loader2 size={12} className="animate-spin" />}
                          {reg.paymentStatus === 'confirmed' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {lastRegistration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden relative p-8">
            <button onClick={() => setLastRegistration(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-rose-500"><X size={24} /></button>
            
            {paymentStep === 'info' ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><Wallet size={32} /></div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Pague via Pix</h2>
                
                <div className="bg-white border border-rose-100 rounded-xl p-4 mb-6 flex items-center justify-between group">
                  <code className="text-sm font-black text-rose-600">{EVENT_DATA.pixKey}</code>
                  <button onClick={copyPixKey} className="text-rose-400 hover:text-rose-600">
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 mb-8 flex flex-col items-center gap-3">
                  <Loader2 className="text-rose-500 animate-spin" size={24} />
                  <p className="text-xs font-black text-rose-600 uppercase">Aguardando Pagamento</p>
                </div>

                <button onClick={simulatePaymentVerification} className="w-full text-[10px] text-gray-300 hover:text-rose-400 uppercase font-black tracking-widest mt-2 py-2">
                  (Simular Confirmação para teste)
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
                <h3 className="text-2xl font-black text-gray-900">Inscrição Confirmada!</h3>
                <p className="text-gray-500 text-sm mt-2 mb-8">Sua vaga está garantida. Nos vemos em breve!</p>
                
                <div className="bg-rose-50/30 rounded-2xl p-6 text-left space-y-4 mb-8">
                  <div className="flex justify-between border-b border-rose-100 pb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Participante</span>
                    <span className="font-bold text-gray-700">{lastRegistration.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Nº Inscrição</span>
                    <span className="font-black text-rose-600">#{lastRegistration.enrollmentNumber}</span>
                  </div>
                </div>

                <button onClick={() => window.print()} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                  <Download size={18} /> Baixar Comprovante
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AIAssistant />
    </div>
  );
};

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="flex gap-5 group">
    <div className={`mt-1 flex-shrink-0 ${color} p-3 rounded-2xl bg-white shadow-sm`}>{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-gray-800 text-sm font-semibold">{value}</p>
    </div>
  </div>
);

export default App;
