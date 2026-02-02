
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
      setRegistrations(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError('Não foi possível carregar a lista de inscritas.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Monitoramento em tempo real do banco de dados para atualizações de status
  useEffect(() => {
    fetchRegistrations();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
        },
        (payload) => {
          // Se houver uma atualização, recarregamos a lista
          fetchRegistrations();

          // Se a atualização for para o registro atual da usuária
          if (
            lastRegistration && 
            payload.new && 
            (payload.new as Registration).id === lastRegistration.id &&
            (payload.new as Registration).paymentStatus === 'confirmed'
          ) {
            setLastRegistration(payload.new as Registration);
            setPaymentStep('receipt');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRegistrations, lastRegistration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const nextNum = (registrations.length + 1).toString().padStart(3, '0');
      const transactionId = `FT-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
      
      const newReg: Registration = {
        enrollmentNumber: nextNum,
        name: formData.name,
        phone: formData.phone,
        timestamp: Date.now(),
        transactionId: transactionId,
        paymentStatus: 'pending'
      };

      const { data, error: insertError } = await supabase
        .from('registrations')
        .insert([newReg])
        .select();

      if (insertError) throw insertError;

      const savedReg = data?.[0] as Registration;
      setLastRegistration(savedReg || newReg);
      setPaymentStep('info');
      setFormData({ name: '', phone: '' });
      await fetchRegistrations();
    } catch (err: any) {
      console.error('Erro ao salvar inscrição:', err);
      setError('Erro ao processar sua inscrição. Tente novamente.');
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

  // Simulação para testes (apenas local/demo)
  // Em produção, o sistema de conciliamento bancário atualizaria o Supabase
  const simulatePaymentVerification = async () => {
    if (!lastRegistration?.id) return;
    
    try {
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ paymentStatus: 'confirmed' })
        .eq('id', lastRegistration.id);
      
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Erro ao simular pagamento:', err);
    }
  };

  const filteredRegistrations = registrations.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.enrollmentNumber.includes(searchTerm)
  );

  const getQrData = (reg: Registration) => {
    return `Evento: Fé e Terapia\nParticipante: ${reg.name}\nInscrição: #${reg.enrollmentNumber}\nValor: ${EVENT_DATA.price}\nTransação: ${reg.transactionId}`;
  };

  return (
    <div className="min-h-screen bg-pattern pb-20 selection:bg-rose-100 selection:text-rose-900">
      {/* Hero Section */}
      <header className="relative bg-white border-b border-pink-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-50 rounded-full blur-[80px] -ml-36 -mb-36 opacity-60"></div>
        
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
        
        {/* Event Details Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl shadow-pink-100/40 border border-white/50 transition-all duration-500 hover:shadow-rose-200/40">
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

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[2rem] p-8 text-white shadow-xl shadow-rose-200/50 relative overflow-hidden group">
            <Heart size={40} className="mb-6 text-rose-200 animate-pulse" />
            <h3 className="text-2xl font-bold mb-3">Sua saúde mental importa</h3>
            <p className="text-rose-50/90 text-sm leading-relaxed">
              O investimento em si mesma é o único que traz retornos para toda a vida. Esperamos por você!
            </p>
          </div>
        </div>

        {/* Registration Form & List */}
        <div className="lg:col-span-8 space-y-8">
          
          <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-pink-100/40 border border-white transition-all duration-500 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <ClipboardCheck className="text-rose-500" size={32} />
                Inscrição Online
              </h2>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3">
                <AlertCircle className="text-rose-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Como deseja no comprovante?"
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-300 focus:bg-white transition-all duration-300 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-300 focus:bg-white transition-all duration-300 text-lg"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xl py-6 rounded-[1.25rem] shadow-2xl shadow-rose-200 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 group"
              >
                {isSubmitting ? (
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>QUERO ME INSCREVER <Sparkles size={24} /></>
                )}
              </button>
            </form>
          </section>

          <section className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-xl shadow-pink-100/20 border border-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Users className="text-rose-500" size={28} />
                  Lista de Confirmadas
                </h2>
                <p className="text-sm text-gray-400 mt-1">{registrations.length} mulheres confirmadas.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar inscrita..."
                  className="pl-12 pr-6 py-3 bg-white border border-rose-100 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-rose-50 w-full md:w-72 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-6 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] px-4">Inscrição</th>
                    <th className="pb-6 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] px-4">Participante</th>
                    <th className="pb-6 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="group hover:bg-white transition-all duration-300">
                      <td className="py-5 px-4 text-xs font-black text-rose-500">#{reg.enrollmentNumber}</td>
                      <td className="py-5 px-4 font-semibold text-gray-700">{reg.name}</td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          reg.paymentStatus === 'confirmed' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-amber-50 text-amber-600'
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

      {/* Ticket/Receipt Modal */}
      {lastRegistration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setLastRegistration(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full z-10"
            >
              <X size={24} />
            </button>

            {paymentStep === 'info' ? (
              <div className="p-8 text-center max-h-[90vh] overflow-y-auto">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Pague via Pix</h2>
                <p className="text-gray-500 mb-6 text-sm">Siga os passos abaixo para confirmar sua vaga:</p>
                
                {/* Pix Flow Steps */}
                <div className="text-left space-y-4 mb-8">
                   <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-gray-800">Copie a Chave Pix abaixo</p>
                         <div className="flex items-center justify-between bg-white border border-rose-100 rounded-xl p-3 mt-2 group">
                            <code className="text-sm font-black text-rose-600 tracking-wider">{EVENT_DATA.pixKey}</code>
                            <button 
                              onClick={copyPixKey}
                              className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                            >
                              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
                      <div>
                         <p className="text-xs font-bold text-gray-800">Abra seu App do Banco</p>
                         <p className="text-[10px] text-gray-500 mt-1">Vá em Pix > Pagar e cole a chave copiada.</p>
                      </div>
                   </div>

                   <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</div>
                      <div>
                         <p className="text-xs font-bold text-gray-800">Confirme o Valor</p>
                         <p className="text-[10px] text-gray-500 mt-1">Certifique-se que o valor é de <span className="font-bold text-gray-700">{EVENT_DATA.price}</span>.</p>
                      </div>
                   </div>
                </div>

                {/* Verification Loading Area */}
                <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 mb-8">
                   <div className="flex flex-col items-center gap-3">
                      <Loader2 className="text-rose-500 animate-spin" size={24} />
                      <div className="text-center">
                        <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Aguardando Pagamento</p>
                        <p className="text-[10px] text-gray-500 mt-1">O sistema está verificando o Pix automaticamente...</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4 text-left">
                   <Info size={18} className="text-amber-500 flex-shrink-0" />
                   <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                     O comprovante será gerado <strong>automaticamente</strong> assim que o banco confirmar o Pix.
                   </p>
                </div>

                {/* Botão de simulação visível apenas para fins de demonstração da funcionalidade automática */}
                <button 
                  onClick={simulatePaymentVerification}
                  className="w-full text-[10px] text-gray-400 hover:text-rose-500 transition-colors uppercase font-black tracking-widest mt-2 py-2"
                >
                  (Demo: Clique aqui para simular confirmação do banco)
                </button>
              </div>
            ) : (
              <div className="p-0 animate-in fade-in slide-in-from-bottom-4 duration-700 max-h-[90vh] overflow-y-auto">
                <div className="bg-emerald-600 p-8 text-center text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <FileText size={100} />
                   </div>
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                      <CheckCircle2 size={32} />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Inscrição Confirmada!</h3>
                   <p className="text-emerald-100 text-xs font-bold tracking-[0.2em] uppercase mt-1">Pagamento Recebido</p>
                </div>

                <div className="p-8 bg-white space-y-8">
                  {/* Container centralizado para detalhes do comprovante */}
                  <div className="mx-auto max-w-sm w-full bg-rose-50/30 rounded-[2rem] p-8 border border-rose-100/50 shadow-sm space-y-8">
                    <div className="flex justify-between items-start border-b border-rose-100 pb-6">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Participante</p>
                        <p className="text-lg font-bold text-gray-800">{lastRegistration.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscrição</p>
                        <p className="text-lg font-black text-rose-600">#{lastRegistration.enrollmentNumber}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor Pago</p>
                            <p className="font-bold text-gray-700">{EVENT_DATA.price}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data/Hora</p>
                            <p className="font-bold text-gray-700">{new Date(lastRegistration.timestamp).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Transação</p>
                            <p className="font-mono text-[11px] font-bold text-gray-500 truncate">{lastRegistration.transactionId}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Método</p>
                            <p className="font-bold text-gray-700">PIX Digital</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-rose-100 space-y-3">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getQrData(lastRegistration))}`} 
                      alt="QR Code do Comprovante"
                      className="w-32 h-32 mix-blend-multiply"
                    />
                    <div className="text-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Validar Autenticidade</p>
                      <p className="text-[8px] text-gray-300 font-medium">Digitalize para conferir os dados da inscrição</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-full"><ShieldCheck size={14} /></div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Documento Válido e Autenticado</span>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg text-sm"
                    >
                      <Download size={18} /> Baixar PDF
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4 border-2 border-rose-100 text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 py-4 text-center border-t border-gray-100">
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{EVENT_DATA.theme} © 2024</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="mt-20 py-16 bg-white border-t border-rose-50 text-center">
        <div className="flex flex-col items-center gap-4">
          <Heart size={24} className="text-rose-500 fill-rose-500" />
          <p className="text-gray-400 text-sm max-w-sm font-light">
            Sua jornada de autocuidado começa aqui. Fé e psicologia caminhando juntas.
          </p>
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
};

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="flex gap-5 group">
    <div className={`mt-1 flex-shrink-0 ${color} p-3 rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-1">{label}</p>
      <p className="text-gray-800 text-sm font-semibold leading-relaxed">{value}</p>
    </div>
  </div>
);

export default App;
