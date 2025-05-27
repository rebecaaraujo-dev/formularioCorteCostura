import { useState, useEffect } from 'react';

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
    if (isLoggedIn) {
      const savedRegistrations = localStorage.getItem('registrations');
      setRegistrations(savedRegistrations ? JSON.parse(savedRegistrations) : []);
    }
  }, [isLoggedIn]);

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

  const handleDeleteRegistration = (index) => {
    if (window.confirm('Tem certeza que deseja excluir esta inscrição?')) {
      const newRegistrations = registrations.filter((_, i) => i !== index);
      setRegistrations(newRegistrations);
      localStorage.setItem('registrations', JSON.stringify(newRegistrations));
    }
  };

  const handleToggleCategories = () => {
    if (useMemberCategories) {
      // Se está ativado e vai desativar, pede confirmação
      if (window.confirm('Tem certeza que quer remover a classificação dos grupos?')) {
        setUseMemberCategories(false);
        // Desativando categorias - todas as vagas vão para não-membros
        localStorage.setItem('vacancies', JSON.stringify({ member: 0, nonMember: 20 }));
      }
    } else {
      // Se está desativado e vai ativar, não precisa de confirmação
      setUseMemberCategories(true);
      // Reativando categorias
      localStorage.setItem('vacancies', JSON.stringify({ member: 5, nonMember: 15 }));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
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
                {registrations.map((registration, index) => (
                  <tr key={index}>
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
                        onClick={() => handleDeleteRegistration(index)}
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