
import { createClient } from '@supabase/supabase-js';

// URL do projeto no Supabase
const supabaseUrl = 'https://ewszcuycvtofbqtpzbqd.supabase.co';

/**
 * ATENÇÃO: A chave abaixo 'sb_publishable_...' parece ser do STRIPE e não do SUPABASE.
 * Uma chave do Supabase (anon key) geralmente começa com 'eyJ...'.
 * Se a inscrição continuar falhando, verifique a 'anon public key' no painel do seu projeto Supabase.
 */
const supabaseAnonKey = 'sb_publishable_LPIS-uuCUJZR0b6m996Dtw_qFQgUrg3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
