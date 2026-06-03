'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';

export default function ScannerPortaria() {
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [statusCheckin, setStatusCheckin] = useState<{ sucesso: boolean; mensagem: string } | null>(null);

  const processarCheckin = (url: string) => {
    try {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get('id');
      const nome = urlObj.searchParams.get('nome') || 'Convidado Desconhecido';

      if (!id) {
        setStatusCheckin({ sucesso: false, mensagem: 'QR Code inválido para esta festa!' });
        return;
      }

      const jaEntraram = JSON.parse(localStorage.getItem('convidados_checkin') || '[]');

      if (jaEntraram.includes(id)) {
        setStatusCheckin({ sucesso: false, mensagem: `⚠️ ALERTA: ${nome} JÁ ENTROU na festa!` });
      } else {
        jaEntraram.push(id);
        localStorage.setItem('convidados_checkin', JSON.stringify(jaEntraram));
        setStatusCheckin({ sucesso: true, mensagem: `✅ Confirmado! Bem-vindo(a), ${nome}!` });
      }
    } catch (e) {
      setStatusCheckin({ sucesso: false, mensagem: 'Código ilegível ou formato incorreto.' });
      console.log(e);
    }
  };

  useEffect(() => {
    // Só liga o scanner se o usuário clicou no botão para ativar a câmera
    if (!cameraAtiva) return;

    const element = document.getElementById('reader');
    if (element) {
      element.innerHTML = '';
    }

    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false,
    );

    scanner.render(
      decodedText => {
        // Desliga a câmera após ler com sucesso
        scanner.clear().catch(err => console.error('Erro ao pausar', err));
        setCameraAtiva(false);
        processarCheckin(decodedText);
      },
      error => {
        // Ignora erros de frame vazio
      },
    );

    return () => {
      scanner.clear().catch(err => console.error('Erro ao limpar scanner', err));
    };
  }, [cameraAtiva]); // Executa o efeito toda vez que o estado da câmera mudar

  const reiniciarScanner = () => {
    setStatusCheckin(null);
    setCameraAtiva(true); // Reativa a câmera para o próximo convidado
  };

  return (
    <main className='p-6 max-w-md mx-auto text-center flex flex-col gap-4'>
      <div className='flex justify-between items-center border-b pb-4 mb-2'>
        <h1 className='text-2xl font-bold'>Portaria: Ler QR Code 🎟️</h1>
        <Link
          href='/'
          className='bg-gray-200 text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-300 transition-colors'
        >
          Voltar pro Início
        </Link>
      </div>

      {/* Se a câmera não estiver ativa e não houver resultado, mostra o botão de ligar */}
      {!cameraAtiva && !statusCheckin && (
        <div className='py-8 bg-neutral-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center gap-4'>
          <p className='text-sm text-gray-500'>A câmera está desligada</p>
          <button
            onClick={() => setCameraAtiva(true)}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-transform active:scale-95 cursor-pointer'
          >
            📷 Abrir Câmera / Escanear
          </button>
        </div>
      )}

      {/* Container onde a câmera será injetada (só aparece se a câmera estiver ativa) */}
      <div
        id='reader'
        className={`w-full bg-gray-100 text-black rounded-lg overflow-hidden shadow-inner p-4 ${cameraAtiva ? 'block' : 'hidden'}`}
      ></div>

      {statusCheckin && (
        <div
          className={`p-4 rounded-lg mt-4 font-bold text-white shadow-md ${statusCheckin.sucesso ? 'bg-green-600' : 'bg-red-600'}`}
        >
          <p>{statusCheckin.mensagem}</p>
          <button
            onClick={reiniciarScanner}
            className='mt-4 bg-white text-black px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100 transition-transform active:scale-95 cursor-pointer'
          >
            Escanear Próximo
          </button>
        </div>
      )}
    </main>
  );
}
