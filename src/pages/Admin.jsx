import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Admin - Formulário Corte e Costura';
    
    if (isLoggedIn) {
      fetchRegistrations();
    }
  }, [isLoggedIn]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
      setError('Erro ao carregar as inscrições. Por favor, recarregue a página.');
    }
  };

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
        const { error: deleteError } = await supabase
          .from('registrations')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        setRegistrations(prev => prev.filter(reg => reg.id !== id));
        setMessage('Inscrição excluída com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Erro ao excluir inscrição:', error);
        setError('Erro ao excluir a inscrição. Por favor, tente novamente.');
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        {error && <p className="error-message">{error}</p>}
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
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {error && <p className="error-message">{error}</p>}
      {message && (
        <div className="success-message" style={{
          padding: '10px 20px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '4px',
          margin: '10px 0',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      <h1>Painel Administrativo</h1>
      
      <div className="registrations-container">
        <h2>Lista de Inscrições</h2>
        <div className="table-container">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>Idade</th>
                <th>Telefone</th>
                <th>Bairro</th>
                <th>Experiência</th>
                <th>Motivo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(registration => (
                <tr key={registration.id}>
                  <td>{formatDate(registration.timestamp)}</td>
                  <td>{registration.fullName}</td>
                  <td>{registration.age}</td>
                  <td>{registration.phone}</td>
                  <td>{registration.neighborhood}</td>
                  <td>{registration.canSew}</td>
                  <td>{registration.reason || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteRegistration(registration.id)}
                      className="delete-button"
                      title="Excluir inscrição"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => setIsLoggedIn(false)}
        className="logout-button"
      >
        Sair
      </button>
    </div>
  );
}

export default Admin; 