const venom = require('venom-bot');
const express = require('express');
const axios = require('axios');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let totalAnalises = 0;
let ultimaMoeda = 'Nenhuma ainda';

// Correções de nome de criptos
const correcoes = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  doge: 'dogecoin',
  usdt: 'tether',
  bnb: 'binancecoin'
};

function corrigirNomeMoeda(nome) {
  return correcoes[nome.toLowerCase()] || nome.toLowerCase();
}

async function buscarCriptomoeda(nome) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${nome}`);
    const data = response.data;

    const precoBRL = data.market_data.current_price.brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const variacao24h = data.market_data.price_change_percentage_24h.toFixed(2);

    const resposta = `
📈 *Análise rápida de ${data.name} (${data.symbol.toUpperCase()})*

💵 *Preço atual:* ${precoBRL}
📉 *Variação 24h:* ${variacao24h}%

🚀 _Envie outra moeda para continuar a análise!_
    `;

    return resposta;
  } catch (error) {
    console.error('Erro ao buscar dados:', error.message);
    return '❌ Não encontrei informações sobre essa criptomoeda. Tente outro nome ou verifique a grafia!';
  }
}

// <<< Venom-Bot Configurado para headless true e sem chrome externo
venom
  .create(
    {
      session: 'cripto-bot',
      headless: true, // navegador invisível
      useChrome: false, // não usar Chrome do sistema
      devtools: false,
      disableSpins: true,
      logQR: true,
      autoClose: 0,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    (base64Qr, asciiQR) => {
      console.log('📱 Escaneie o QR Code para conectar:\n', asciiQR);
    },
    (statusSession, session) => {
      console.log(`🛰 Status da sessão ${session}: ${statusSession}`);
    }
  )
  .then((client) => start(client))
  .catch((error) => console.error('Erro ao iniciar o bot:', error));

function start(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg || message.fromMe) return;

    const texto = message.body.trim().toLowerCase();

    if (texto.startsWith('analise') || texto.startsWith('análise') || texto.startsWith('resumo') || texto.startsWith('preço')) {
      const partes = texto.split(' ');
      if (partes.length >= 2) {
        const nomeCorrigido = corrigirNomeMoeda(partes[1]);
        const resposta = await buscarCriptomoeda(nomeCorrigido);

        await client.sendText(message.from, resposta);

        totalAnalises++;
        ultimaMoeda = nomeCorrigido.toUpperCase();
        io.emit('update', { totalAnalises, ultimaMoeda });
      } else {
        await client.sendText(message.from, '⚡ Informe o nome da moeda! Exemplo: *Análise BTC*');
      }
    }
  });
}

// Painel Web para acompanhar
app.get('/', (req, res) => {
  res.send(`
    <h1>🦉 Painel de Análises CriptoBot</h1>
    <p><strong>Total de análises feitas:</strong> <span id="totalAnalises">${totalAnalises}</span></p>
    <p><strong>Última moeda analisada:</strong> <span id="ultimaMoeda">${ultimaMoeda}</span></p>
    <script src="/socket.io/socket.io.js"></script>
    <script>
      const socket = io();
      socket.on('update', ({ totalAnalises, ultimaMoeda }) => {
        document.getElementById('totalAnalises').innerText = totalAnalises;
        document.getElementById('ultimaMoeda').innerText = ultimaMoeda;
      });
    </script>
  `);
});

// Iniciar servidor Web
server.listen(PORT, () => {
  console.log(`🚀 Painel disponível em: http://localhost:${PORT}`);
});
