'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function ScannerPortaria() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [statusCheckin, setStatusCheckin] = useState<{sucesso: boolean; mensagem: string} | null>(null)

  // 1. Declaramos a função primeiro para que o useEffect consiga enxergá-la
  const processarCheckin = (url: string) => {
    try {
      const urlObj = new URL(url)
      const id = urlObj.searchParams.get('id')
      const nome = urlObj.searchParams.get('nome') || 'Convidado Desconhecido'

      if (!id) {
        setStatusCheckin({ sucesso: false, mensagem: "QR Code inválido para esta festa!" })
        return
      }

      // Buscar a lista de quem já entrou salva no navegador local
      const jaEntraram = JSON.parse(localStorage.getItem('convidados_checkin') || '[]')

      if (jaEntraram.includes(id)) {
        setStatusCheckin({ sucesso: false, mensagem: `⚠️ ALERTA: ${nome} JÁ ENTROU na festa!` })
      } else {
        // Adiciona à lista de confirmados na portaria
        jaEntraram.push(id)
        localStorage.setItem('convidados_checkin', JSON.stringify(jaEntraram))
        setStatusCheckin({ sucesso: true, mensagem: `✅ Confirmado! Bem-vindo(a), ${nome}!` })
      }
    } catch (e) {
      setStatusCheckin({ sucesso: false, mensagem: "Código ilegível ou formato incorreto." })
      console.log(e);
      
    }
  }

  // 2. Agora o useEffect pode usar a função sem problemas de escopo
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    )

    scanner.render(
      (decodedText) => {
        // Quando lê com sucesso:
        scanner.clear() // Para o scanner temporariamente
        setScanResult(decodedText)
        processarCheckin(decodedText)
      },
      (error) => {
        console.log(error);
      }
    )

    return () => {
      scanner.clear().catch(err => console.error("Erro ao limpar scanner", err))
    }
  }, []) // Como essa lista local não muda, o array de dependências vazio continua correto

  const reiniciarScanner = () => {
    setScanResult(null)
    setStatusCheckin(null)
    window.location.reload() // Abordagem direta para reiniciar o hardware da câmera de forma limpa
  }

  return (
    <main className="p-6 max-w-md mx-auto text-center flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Portaria: Ler QR Code 🎟️</h1>
      
      <div id="reader" className="w-full bg-wwhite rounded-lg overflow-hidden"></div>

      {statusCheckin && (
        <div className={`p-4 rounded-lg mt-4 font-bold text-white ${statusCheckin.sucesso ? 'bg-green-600' : 'bg-red-600'}`}>
          <p>{statusCheckin.mensagem}</p>
          <button 
            onClick={reiniciarScanner}
            className="mt-4 bg-white text-black px-4 py-2 rounded text-sm hover:bg-gray-100"
          >
            Escanear Próximo
          </button>
        </div>
      )}
    </main>
  )
}