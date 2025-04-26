# Usa imagem Node
FROM node:18

# Define a pasta de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala apenas produção
RUN npm install --production

# Copia os arquivos do projeto
COPY . .

# Expõe a porta do servidor (se usar painel Express)
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
