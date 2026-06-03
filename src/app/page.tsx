'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

export default function GeradorConvite() {
  const [nome, setNome] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const gerarConvite = async () => {
    if (!nome) return alert('Digite o nome do convidado!');
    setLoading(true);

    // Criamos um ID único ou usamos o próprio nome limpo + um token aleatório
    const idUnico = btoa(encodeURIComponent(`${nome}-${Math.floor(1000 + Math.random() * 9000)}`));

    // URL que o segurança vai acessar ao escanear o QR Code
    const urlValidacao = `${window.location.origin}/validar?id=${idUnico}&nome=${encodeURIComponent(nome)}`;

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
      <h1 className='text-2xl font-bold text-center'>Gerador de Convites 🎂</h1>

      <input
        type='text'
        placeholder='Nome do Convidado'
        className='border p-2 rounded text-black'
        value={nome}
        onChange={e => setNome(e.target.value)}
      />

      <button
        onClick={gerarConvite}
        className='bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700'
        disabled={loading}
      >
        {loading ? 'Gerando...' : 'Gerar QR Code'}
      </button>

      {qrImageUrl && (
        <div className='mt-4 flex flex-col items-center gap-4 bg-white p-4 rounded-lg shadow'>
          <p className='text-black font-medium text-center'>Convite de: {nome}</p>
          <img src={qrImageUrl} alt='QR Code Convite' className='w-48 h-48' />

          <div className='flex gap-2 w-full mt-2'>
            <button className='flex-1 bg-green-500 cursor-pointer text-white p-2 rounded text-sm font-semibold'>
              <a href={qrImageUrl} download={`convite-${nome}.png`}>
                Baixar Imagem do QR Code
              </a>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
