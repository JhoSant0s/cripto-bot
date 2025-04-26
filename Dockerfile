# Use Node.js oficial
FROM node:18

# Cria o diretório app
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante
COPY . .

# Exponha a porta
EXPOSE 3000

# Comando padrão
CMD ["npm", "start"]