'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';

// 1. Criamos a interface para mapear exatamente o comportamento do evento nativo
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function GeradorConvite() {
  const [nome, setNome] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2. Substituímos o 'any' pela nossa nova interface (ou null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mostrarBotaoInstalar, setMostrarBotaoInstalar] = useState(false);

  useEffect(() => {
    // 3. Tipamos o parâmetro 'e' da função com a nossa interface
    const capturarPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent); // Fazemos o "type casting" seguro aqui
      setMostrarBotaoInstalar(true);
    };

    window.addEventListener('beforeinstallprompt', capturarPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', capturarPrompt);
    };
  }, []);

  const lidarComInstalacao = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuário escolheu: ${outcome}`);
    
    setDeferredPrompt(null);
    setMostrarBotaoInstalar(false);
  };

  // ... O restante do código (gerarConvite e return) continua exatamente igual

  const gerarConvite = async () => {
    if (!nome) return alert('Digite o nome do convidado!');
    setLoading(true);

    const idUnico = btoa(encodeURIComponent(`${nome}-${Math.floor(1000 + Math.random() * 9000)}`));
    const urlValidacao = `${window.location.origin}/scanner?id=${idUnico}&nome=${encodeURIComponent(nome)}`;

    try {
      const urlImage = await QRCode.toDataURL(urlValidacao, { width: 400, margin: 2 });
      setQrImageUrl(urlImage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='p-6 max-w-md mx-auto flex flex-col gap-4'>
      
      {/* Banner de Instalação Prática do PWA */}
      {mostrarBotaoInstalar && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex flex-col gap-2 items-center text-center animate-bounce">
          <p className="text-sm text-blue-900 font-medium">Instale este app no seu celular para acessar mais rápido!</p>
          <button 
            onClick={lidarComInstalacao}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors cursor-pointer w-full"
          >
            📲 Instalar Aplicativo de Convites
          </button>
        </div>
      )}

      <div className='flex justify-between items-center border-b pb-4 mb-2'>
        <h1 className='text-2xl font-bold'>Gerador de Convites 🎂</h1>
      </div>

      <input
        type='text'
        placeholder='Nome do Convidado'
        className='border p-2 rounded text-black w-full'
        value={nome}
        onChange={e => setNome(e.target.value)}
      />

      <button
        onClick={gerarConvite}
        className='bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50'
        disabled={loading}
      >
        {loading ? 'Gerando...' : 'Gerar QR Code'}
      </button>

      {qrImageUrl && (
        <div className='mt-4 flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow'>
          <p className='text-black font-medium text-center'>Convite de: {nome}</p>
          <img src={qrImageUrl} alt='QR Code Convite' className='w-48 h-48' />

          <div className='w-full mt-2'>
            <a 
              href={qrImageUrl} 
              download={`convite-${nome}.png`}
              className='block text-center bg-green-500 hover:bg-green-600 text-white p-2 rounded text-sm font-semibold transition-colors'
            >
              Baixar Imagem do QR Code
            </a>
          </div>
        </div>
      )}
      
        <Link 
          href="/scanner" 
          className='block text-center bg-black hover:bg-gray-700 text-white p-2 rounded text-sm font-semibold transition-colors'
        >
          Ir para Portaria 🎟️
        </Link>
    </main>
  );
}