import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://nodzpgrqtgypdefmxwkg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZHpwZ3JxdGd5cGRlZm14d2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIyNjIsImV4cCI6MjA2Mzk1ODI2Mn0.bp-Iwk3z3t91FqtwLkQ18SKIA8OmE7P4BvNBPTwsZ1U'

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para verificar a conexão
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('registrations').select('count')
    if (error) {
      console.error('Erro na conexão com Supabase:', error.message)
      return false
    }
    console.log('✅ Conexão com Supabase estabelecida!')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error.message)
    return false
  }
}

// Teste completo da tabela
const testTable = async () => {
  try {
    // Testa inserção
    const testData = {
      fullName: 'Teste',
      age: 25,
      phone: '(00) 00000-0000',
      neighborhood: 'Teste',
      canSew: 'Não, nunca costurei',
      reason: 'Teste',
      isMember: false,
      timestamp: new Date().toISOString()
    }

    const { data: insertData, error: insertError } = await supabase
      .from('registrations')
      .insert([testData])
      .select()

    if (insertError) {
      throw new Error(`Erro na inserção: ${insertError.message}`)
    }

    console.log('✅ Inserção funcionando!')

    // Testa leitura
    const { data: readData, error: readError } = await supabase
      .from('registrations')
      .select('*')
      .limit(1)

    if (readError) {
      throw new Error(`Erro na leitura: ${readError.message}`)
    }

    console.log('✅ Leitura funcionando!')

    // Testa exclusão do registro de teste
    if (insertData && insertData[0]?.id) {
      const { error: deleteError } = await supabase
        .from('registrations')
        .delete()
        .eq('id', insertData[0].id)

      if (deleteError) {
        throw new Error(`Erro na exclusão: ${deleteError.message}`)
      }

      console.log('✅ Exclusão funcionando!')
    }

    console.log('✅ Todos os testes passaram! A tabela está configurada corretamente.')
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message)
  }
}

testTable() 



        