import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Home() {
  const navigate = useNavigate();
  const [vagasRestantes, setVagasRestantes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkVagas = async () => {
      try {
        const { data: registrations, error: regError } = await supabase
          .from('registrations')
          .select('id');

        if (regError) throw regError;

        const totalVagas = 20;
        const vagasOcupadas = registrations?.length || 0;
        setVagasRestantes(totalVagas - vagasOcupadas);
      } catch (error) {
        console.error('Erro ao verificar vagas:', error);
        setError('Não foi possível verificar as vagas disponíveis');
      } finally {
        setLoading(false);
      }
    };

    checkVagas();
  }, []);

  return (
    <div className="container">
      <h1>Curso de Modelista, Corte e Costura 2.0</h1>
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

      <div className="registration-section">
        {loading ? (
          <p className="vagas-info loading">Verificando vagas disponíveis...</p>
        ) : error ? (
          <p className="vagas-info error">{error}</p>
        ) : vagasRestantes <= 0 ? (
          <p className="vagas-info full">Desculpe, todas as vagas já foram preenchidas!</p>
        ) : (
          <>
            <p className="vagas-info">
              <span className="vagas-numero">{vagasRestantes}</span>
              {vagasRestantes === 1 ? '  vaga disponível' : '  vagas disponíveis'}
            </p>
            <div className="registration-button-container">
              <button 
                onClick={() => navigate('/inscricao')} 
                className="registration-button"
              >
                Fazer Inscrição
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home; 
