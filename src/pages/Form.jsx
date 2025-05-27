import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { maskPhone } from '../lib/masks';

function Form() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    neighborhood: '',
    canSew: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const init = async () => {
      const connected = await checkSupabaseConnection();
      console.log('Status da conexão:', connected);
      setIsConnected(connected);

      if (!connected) {
        setError('Erro de conexão com o servidor. Por favor, tente novamente mais tarde.');
        return;
      }

      try {
        const { data: registrations, error: regError } = await supabase
          .from('registrations')
          .select('id');

        if (regError) {
          console.error('Erro ao verificar vagas:', regError);
          throw regError;
        }
        
        console.log('Total de registros:', registrations?.length);
        setIsFull((registrations?.length || 0) >= 20);
      } catch (error) {
        console.error('Erro ao verificar vagas:', error);
        setError('Erro ao verificar vagas disponíveis. Por favor, recarregue a página.');
      }
    };

    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: maskPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isConnected) {
      setError('Sem conexão com o servidor. Por favor, tente novamente mais tarde.');
      setIsLoading(false);
      return;
    }

    try {
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('id');

      if (regError) {
        console.error('Erro ao verificar vagas:', regError);
        throw regError;
      }
      
      if ((registrations?.length || 0) >= 20) {
        setError('Desculpe, todas as vagas já foram preenchidas.');
        setIsLoading(false);
        return;
      }

      const cleanedPhone = formData.phone.replace(/[^\d]/g, '');
      
      const newRegistration = {
        "fullName": formData.name.trim(),
        "phone": cleanedPhone,
        "age": parseInt(formData.age),
        "neighborhood": formData.neighborhood.trim(),
        "canSew": formData.canSew.trim(),
        "reason": (formData.reason || '').trim(),
        "timestamp": new Date().toISOString()
      };

      console.log('Enviando registro:', newRegistration);

      const { data, error: submitError } = await supabase
        .from('registrations')
        .insert([newRegistration])
        .select();

      if (submitError) {
        console.error('Erro do Supabase:', submitError);
        throw submitError;
      }

      console.log('Registro criado com sucesso:', data);

      setSuccess(true);
      setFormData({
        name: '',
        phone: '',
        age: '',
        neighborhood: '',
        canSew: '',
        reason: ''
      });
    } catch (error) {
      console.error('Erro detalhado:', error);
      if (error.message) {
        setError(`Erro ao enviar o formulário: ${error.message}`);
      } else {
        setError('Erro ao enviar o formulário. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="success-container">
          <h1>Inscrição Realizada com Sucesso!</h1>
          <p>Parabéns! Sua inscrição foi registrada.</p>
          <p>Em breve entraremos em contato através do número de telefone/WhatsApp fornecido com mais informações sobre o início das aulas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Formulário de Inscrição</h1>
      <p className="container-info">Preencha seus dados para se inscrever no curso</p>

      {!isFull && isConnected ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Conte-nos um pouco sobre sua motivação"
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Inscrição'}
          </button>

          <button onClick={() => navigate('/')} className="back-button">
            ←
          </button>
        </form>
      ) : (
        <p className="error-message">
          {isFull 
            ? 'Desculpe, todas as vagas já foram preenchidas.' 
            : 'Erro de conexão com o servidor. Por favor, tente novamente mais tarde.'}
        </p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Form; 