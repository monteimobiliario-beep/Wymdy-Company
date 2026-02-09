
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tesnfgtsifwivbmmvfhr.supabase.co';
const supabaseAnonKey = 'sb_publishable_jGYzM2fAVmb6RujHp3H8PA_Q3eAcAGF';

// Inicializa o cliente Supabase para uso em todo o sistema
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Exemplo de uso para persistência de logs de auditoria
 */
export async function logActionToSupabase(log: any) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([log]);
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Erro ao persistir log no Supabase:', err);
  }
}
