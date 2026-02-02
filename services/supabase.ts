
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ewszcuycvtofbqtpzbqd.supabase.co';

/**
 * Chave de API pública (anon key) do Supabase configurada.
 */
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3c3pjdXljdnRvZmJxdHB6YnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDI5NTIsImV4cCI6MjA4NTU3ODk1Mn0.0vVN50wL1wswaNrpKwfwwcCBzZBjSswSe-OrfBHAJ_g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
