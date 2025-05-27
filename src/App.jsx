import { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from './lib/supabase';

function App() {
  const [step, setStep] = useState('memberSelection');
  const [isMember, setIsMember] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phone: '',
    neighborhood: '',
    canSew: '',
    reason: ''
  });
  const [vacancies, setVacancies] = useState(() => {
    const savedVacancies = localStorage.getItem('vacancies');
    return savedVacancies ? JSON.parse(savedVacancies) : {
      member: 5,
      nonMember: 15
    };
  });
  const [registrations, setRegistrations] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [useMemberCategories, setUseMemberCategories] = useState(() => {
    const saved = localStorage.getItem('useMemberCategories');
    return saved ? JSON.parse(saved) : true;
  });

  // Verifica a conexão com o Supabase ao iniciar
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        setError('Erro ao conectar com o banco de dados. Por favor, recarregue a página.');
      }
    };
    checkConnection();
  }, []);

  // Carrega as inscrições do Supabase ao iniciar
  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Função para buscar inscrições do Supabase
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
      
      // Atualiza as vagas com base nas inscrições
      const memberCount = data.filter(reg => reg.isMember).length;
      const nonMemberCount = data.filter(reg => !reg.isMember).length;
      
      setVacancies({
        member: 5 - memberCount,
        nonMember: 15 - nonMemberCount
      });
    } catch (error) {
      console.error('Erro ao buscar inscrições:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('vacancies', JSON.stringify(vacancies));
  }, [vacancies]);

  useEffect(() => {
    localStorage.setItem('useMemberCategories', JSON.stringify(useMemberCategories));
  }, []);

  const handleMemberSelection = (selection) => {
    setIsMember(selection);
    const availableVacancies = selection ? vacancies.member : vacancies.nonMember;
    if (availableVacancies > 0) {
      setStep('registrationForm');
    } else {
      setMessage('Infelizmente as vagas para este grupo já foram preenchidas');
    }
  };

  const handleDirectRegistration = () => {
    setIsMember(false);
    if (vacancies.nonMember > 0) {
      setStep('registrationForm');
    } else {
      setMessage('Infelizmente todas as vagas já foram preenchidas');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newRegistration = {
        fullName: formData.fullName.trim(),
        age: parseInt(formData.age),
        phone: formData.phone.trim(),
        neighborhood: formData.neighborhood,
        canSew: formData.canSew,
        reason: formData.reason.trim(),
        isMember,
        timestamp: new Date().toISOString()
      };

      // Validações adicionais
      if (newRegistration.age <= 0) {
        setMessage('A idade deve ser maior que 0');
        return;
      }

      if (!newRegistration.neighborhood) {
        setMessage('Por favor, selecione um bairro');
        return;
      }

      // Envia para o Supabase
      const { data, error } = await supabase
        .from('registrations')
        .insert([newRegistration])
        .select();

      if (error) {
        console.error('Erro ao salvar inscrição:', error);
        setMessage('Ocorreu um erro ao salvar sua inscrição. Por favor, tente novamente.');
        return;
      }

      // Atualiza o estado local apenas se o envio for bem-sucedido
      setRegistrations(prev => [data[0], ...prev]);
      
      // Atualiza as vagas disponíveis
      setVacancies(prev => ({
        ...prev,
        [isMember ? 'member' : 'nonMember']: prev[isMember ? 'member' : 'nonMember'] - 1
      }));

      // Limpa o formulário
      setFormData({
        fullName: '',
        age: '',
        phone: '',
        neighborhood: '',
        canSew: '',
        reason: ''
      });

      // Mostra mensagem de sucesso
      setStep('success');
      setMessage('');

    } catch (error) {
      console.error('Erro ao processar inscrição:', error);
      setMessage('Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente.');
    }
  };

  // Adiciona mensagem de erro no topo do componente
  if (error) {
    return (
      <div className="container">
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
      </div>
    );
  }

  if (step === 'memberSelection') {
    return (
      <div className="container">
        <h1>Curso de Corte e Costura 2.0</h1>
        <p className="container-info">Seja bem-vinda ao nosso Curso de Iniciação à Costura!</p>
        <div className="course-info">
          <p>Uma iniciativa da ICNV de Urucânia para abençoar o conjunto Urucânia e regiões vizinhas, este curso foi criado com muito carinho para quem sempre sonhou em aprender a costurar, mas não sabia por onde começar.</p>
          <p>Ministrado pela Professora Maristela Lopes, costureira com mais de 15 anos de experiência, o curso oferece um ambiente leve, acolhedor e cheio de inspiração. Não se preocupe com equipamentos — você só precisa trazer uma tesoura e um tecido. Aqui, vamos aprender juntos, com o que temos em mãos, e dar os primeiros pontos dessa jornada criativa.</p>
          <p>Venha fazer parte desse momento especial. As vagas são limitadas!</p>
        </div>

        <div className="info-container">
          <h2>Informações</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>Horário</h3>
              <p>Quintas-feiras, 14h às 17h</p>
            </div>
            <div className="info-item">
              <h3>Local</h3>
              <p>Igreja Cristã Nova Vida em Urucânia</p>
              <div className="address">
                <p>R. José Silton Pinheiro, 141 - CASA 01</p>
                <p>Paciência, Rio de Janeiro - RJ</p>
              </div>
              <a 
                href="https://maps.google.com/?q=R. José Silton Pinheiro, 141 - CASA 01 - Paciência, Rio de Janeiro - RJ, 23573-340" 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-link"
              >
                Ver no Google Maps
              </a>
            </div>
          </div>
        </div>

        <div className="vacancies-info">
          <p>✨ Vagas Disponíveis ✨</p>
          {useMemberCategories ? (
            <>
              <p>Membros da igreja ICNV em Urucânia: {vacancies.member}</p>
              <p>Não membros: {vacancies.nonMember}</p>
            </>
          ) : (
            <p>Total de vagas: {vacancies.nonMember}</p>
          )}
        </div>

        {useMemberCategories ? (
          <>
            <h2>Você é membro da nossa igreja?</h2>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="member-yes"
                  name="isMember"
                  onChange={() => handleMemberSelection(true)}
                />
                <label htmlFor="member-yes">Sim</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="member-no"
                  name="isMember"
                  onChange={() => handleMemberSelection(false)}
                />
                <label htmlFor="member-no">Não</label>
              </div>
            </div>
          </>
        ) : (
          <div className="registration-button-container">
            <button onClick={handleDirectRegistration} className="registration-button">
              Fazer Inscrição
            </button>
          </div>
        )}
        {message && <p className="error-message">{message}</p>}
      </div>
    );
  }

  if (step === 'registrationForm') {
    return (
      <div className="container">
        <button 
          type="button" 
          className="back-button" 
          onClick={() => setStep('memberSelection')}
          aria-label="Voltar"
        >
          ←
        </button>
        <h1>Formulário de Inscrição</h1>
        <div className="vacancies-info">
          <p>✨ Vagas Restantes: {isMember ? vacancies.member : vacancies.nonMember} ✨</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Nome completo</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Idade</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Digite sua idade"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone/WhatsApp</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="neighborhood">Bairro</label>
            <select
              id="neighborhood"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione seu bairro</option>
              <option value="Conjunto Urucânia">Conjunto Urucânia</option>
              <option value="Barro Vermelho">Barro Vermelho</option>
              <option value="Saquaçu">Saquaçu</option>
              <option value="Coqueiral">Coqueiral</option>
              <option value="Paciência">Paciência</option>
              <option value="Santa Cruz">Santa Cruz</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="canSew">Você já tem alguma experiência com costura?</label>
            <select
              id="canSew"
              name="canSew"
              value={formData.canSew}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione uma opção</option>
              <option value="Não, nunca costurei">Não, nunca costurei</option>
              <option value="Sim, um pouco">Sim, um pouco</option>
              <option value="Sim, costumo regularmente">Sim, costuro regularmente</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reason">
              Por que você quer participar do curso?
              <span style={{ 
                marginLeft: '5px', 
                color: '#999', 
                fontSize: '0.9em' 
              }}>
                (opcional)
              </span>
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Conte-nos um pouco sobre sua motivação"
            />
          </div>

          <button type="submit">Enviar Inscrição</button>
        </form>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="container">
        <h1>Inscrição Realizada com Sucesso!</h1>
        <p>Parabéns! Sua inscrição foi registrada.</p>
        <p>Em breve entraremos em contato através do número de telefone/WhatsApp fornecido com mais informações sobre o início das aulas.</p>
        <button onClick={() => setStep('memberSelection')} className="back-to-home">
          Voltar para a Página Inicial
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ... resto do JSX permanece igual ... */}
    </>
  );
}

export default App; 