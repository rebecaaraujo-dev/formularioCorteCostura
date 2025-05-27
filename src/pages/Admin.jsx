import { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [useMemberCategories, setUseMemberCategories] = useState(() => {
    const saved = localStorage.getItem('useMemberCategories');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    document.title = 'Admin - Formulário Corte e Costura';
    
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        setError('Erro ao conectar com o banco de dados. Por favor, recarregue a página.');
        return;
      }
      
      if (isLoggedIn) {
        fetchRegistrations();
      }
    };
    
    checkConnection();
  }, [isLoggedIn]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      setRegistrations(data || []);
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
      setError('Erro ao carregar as inscrições. Por favor, recarregue a página.');
    }
  };

  useEffect(() => {
    localStorage.setItem('useMemberCategories', JSON.stringify(useMemberCategories));
  }, [useMemberCategories]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === 'icnvurucania' && loginData.password === 'liresa09') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleDeleteRegistration = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta inscrição?')) {
      try {
        const { error } = await supabase
          .from('registrations')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        // Atualiza a lista de inscrições
        await fetchRegistrations();
      } catch (error) {
        console.error('Erro ao excluir inscrição:', error);
        setError('Erro ao excluir a inscrição. Por favor, tente novamente.');
      }
    }
  };

  const handleToggleCategories = async () => {
    if (useMemberCategories) {
      if (window.confirm('Tem certeza que quer remover a classificação dos grupos?')) {
        try {
          const { data: registrationsData } = await supabase
            .from('registrations')
            .select('count')
            .eq('isMember', true);

          if (registrationsData && registrationsData.length > 0) {
            alert('Existem inscrições de membros registradas. Por favor, revise as inscrições antes de desativar as categorias.');
            return;
          }

          setUseMemberCategories(false);
          localStorage.setItem('vacancies', JSON.stringify({ member: 0, nonMember: 20 }));
        } catch (error) {
          console.error('Erro ao verificar inscrições:', error);
          setError('Erro ao alterar as categorias. Por favor, tente novamente.');
        }
      }
    } else {
      setUseMemberCategories(true);
      localStorage.setItem('vacancies', JSON.stringify({ member: 5, nonMember: 15 }));
    }
  };

  // Adiciona mensagem de erro no topo do componente
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="error-container" style={{ 
        padding: '20px', 
        backgroundColor: '#ffebee', 
        color: '#c62828',
        borderRadius: '4px',
        margin: '20px auto',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h2>Erro</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '10px 20px',
            backgroundColor: '#c62828',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        {renderError()}
        <h1>Área Administrativa</h1>
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {renderError()}
      <h1>Painel Administrativo</h1>
      
      <div className="admin-controls">
        <div className="member-categories-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useMemberCategories}
              onChange={handleToggleCategories}
            />
            <span className="toggle-text">
              {useMemberCategories ? ' Restrição por membros ativa' : ' Restrição por membros desativada'}
            </span>
          </label>
          <p className="toggle-description">
            {useMemberCategories 
              ? 'Vagas divididas entre membros (5) e não-membros (15)' 
              : 'Todas as 20 vagas disponíveis para qualquer pessoa'}
          </p>
        </div>
      </div>
      
      <div className="registrations-container">
        <h2>Inscrições ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <p className="no-data">Nenhuma inscrição realizada ainda.</p>
        ) : (
          <div className="table-container">
            <table className="registrations-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Idade</th>
                  <th>Telefone</th>
                  {useMemberCategories && <th>Membro</th>}
                  <th>Bairro</th>
                  <th>Experiência</th>
                  <th>Motivação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{formatDate(registration.timestamp)}</td>
                    <td>{registration.fullName}</td>
                    <td>{registration.age}</td>
                    <td>{registration.phone}</td>
                    {useMemberCategories && <td>{registration.isMember ? 'Sim' : 'Não'}</td>}
                    <td>{registration.neighborhood}</td>
                    <td>{registration.canSew}</td>
                    <td>{registration.reason}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteRegistration(registration.id)}
                        className="delete-button"
                        title="Excluir inscrição"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button onClick={() => setIsLoggedIn(false)} className="logout-button">
        Sair
      </button>
    </div>
  );
}

export default Admin; 