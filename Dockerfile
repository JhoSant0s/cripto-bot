# Usa uma imagem Node.js oficial
FROM node:18-slim

# Cria diretório de trabalho
WORKDIR /app

# Copia os arquivos de package para instalar dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante dos arquivos para dentro do container
COPY . .

# Expõe a porta (importante para a web rodar)
EXPOSE 3000

# Comando para iniciar o bot
CMD ["npm", "start"]