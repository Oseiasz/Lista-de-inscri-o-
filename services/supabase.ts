
import { createClient } from '@supabase/supabase-js';

// URL definitiva do projeto: ewszcuycvtofbqtpzbqd
const supabaseUrl = 'https://ewszcuycvtofbqtpzbqd.supabase.co';

// Chave Anon (Public) fornecida para integração direta
const supabaseAnonKey = 'sb_publishable_LPIS-uuCUJZR0b6m996Dtw_qFQgUrg3';

/**
 * Cliente Supabase configurado para o projeto Fé & Terapia.
 * Esta instância permite a persistência das inscrições em tempo real.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
