#!/bin/bash

# Script simplificado para iniciar com dependências básicas
# AutoU Email Classifier

echo "🚀 Iniciando AutoU Email Classifier (versão básica)..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navegar para o diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "${BLUE}📁 Diretório do projeto: $PROJECT_DIR${NC}"

# Função para cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Encerrando serviços...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Serviços encerrados${NC}"
    exit 0
}

trap cleanup SIGINT

# Criar ambiente virtual se não existe
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}🐍 Criando ambiente virtual...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements-basic.txt
    cd ..
fi

# Instalar dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    npm install
fi

# Iniciar backend
echo -e "${BLUE}🐍 Iniciando backend...${NC}"
cd backend
source venv/bin/activate
python3 run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend
echo -e "${YELLOW}⏳ Aguardando backend...${NC}"
sleep 5

# Verificar backend
echo -e "${BLUE}🔍 Testando backend...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:8000/api/v1/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend OK: http://localhost:8000${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Backend não respondeu${NC}"
        echo -e "${YELLOW}📋 Logs do backend:${NC}"
        tail -10 logs/backend.log
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

# Iniciar frontend
echo -e "${BLUE}⚛️  Iniciando frontend...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}🎉 Sistema iniciado!${NC}"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend: http://localhost:8000" 
echo "   • Docs: http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}💡 Pressione Ctrl+C para parar${NC}"
echo ""

# Aguardar
wait $BACKEND_PID $FRONTEND_PID
