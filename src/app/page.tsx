'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';

export default function GeradorConvite() {
  const [nome, setNome] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const gerarConvite = async () => {
    if (!nome) return alert('Digite o nome do convidado!');
    setLoading(true);

    // Criamos um ID único baseado no nome + um token aleatório
    const idUnico = btoa(encodeURIComponent(`${nome}-${Math.floor(1000 + Math.random() * 9000)}`));

    // Ajustado para apontar para /scanner (casando com a tela da portaria)
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
            {/* Corrigido: Removido o <button> de fora e estilizado o <a> diretamente */}
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
        href='/scanner'
        className='block text-center bg-black hover:bg-gray-800 text-white p-2 rounded text-sm font-semibold transition-colors'
      >
        Ir para Portaria
      </Link>
    </main>
  );
}
