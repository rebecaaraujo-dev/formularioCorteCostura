import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nodzpgrqtgypdefmxwkg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZHpwZ3JxdGd5cGRlZm14d2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIyNjIsImV4cCI6MjA2Mzk1ODI2Mn0.bp-Iwk3z3t91FqtwLkQ18SKIA8OmE7P4BvNBPTwsZ1U'

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Função para verificar a conexão
export const checkSupabaseConnection = async () => {
  try {
    // Primeiro verifica se consegue conectar
    const { data, error } = await supabase.from('registrations').select('count')
    if (error) throw error

    // Agora verifica a estrutura da tabela
    const { data: tableInfo, error: tableError } = await supabase
      .from('registrations')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('Erro ao verificar estrutura da tabela:', tableError)
      return false
    }

    // Log da estrutura para debug
    console.log('Estrutura da tabela:', tableInfo)
    return true
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return false
  }
} 



        