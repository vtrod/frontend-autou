#!/bin/bash

# Script para iniciar frontend e backend em desenvolvimento
# AutoU Email Classifier

echo "🚀 Iniciando AutoU Email Classifier em modo desenvolvimento..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
echo -e "${BLUE}📋 Verificando dependências...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 não encontrado. Instale Python 3.8+ primeiro.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm não encontrado. Instale npm primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências OK${NC}"

# Navegar para o diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "${BLUE}📁 Diretório do projeto: $PROJECT_DIR${NC}"

# Instalar dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências do frontend${NC}"
        exit 1
    fi
fi

# Instalar dependências do backend se necessário
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}🐍 Criando ambiente virtual Python...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    
    echo -e "${BLUE}📦 Instalando dependências básicas...${NC}"
    pip install -r requirements-basic.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências básicas${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔬 Tentando instalar dependências completas de IA...${NC}"
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Algumas dependências de IA falharam, continuando com versão básica${NC}"
    fi
    
    cd ..
fi

# Função para cleanup ao receber SIGINT
cleanup() {
    echo -e "\n${YELLOW}🛑 Encerrando serviços...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Serviços encerrados${NC}"
    exit 0
}

trap cleanup SIGINT

# Iniciar backend
echo -e "${BLUE}🐍 Iniciando backend (Python FastAPI)...${NC}"
cd backend
source venv/bin/activate
python3 run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
echo -e "${YELLOW}⏳ Aguardando backend inicializar...${NC}"
sleep 3

# Verificar se backend está rodando
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar backend. Verifique os logs em logs/backend.log${NC}"
    exit 1
fi

# Testar conexão com backend
echo -e "${BLUE}🔍 Testando conexão com backend...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:8000/api/v1/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend rodando em http://localhost:8000${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Timeout na conexão com backend${NC}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

# Iniciar frontend
echo -e "${BLUE}⚛️  Iniciando frontend (Next.js)...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguardar frontend inicializar
echo -e "${YELLOW}⏳ Aguardando frontend inicializar...${NC}"
sleep 5

# Verificar se frontend está rodando
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Erro ao iniciar frontend. Verifique os logs em logs/frontend.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Testar conexão com frontend
echo -e "${BLUE}🔍 Testando conexão com frontend...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend rodando em http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Timeout na conexão com frontend${NC}"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    sleep 1
done

echo ""
echo -e "${GREEN}🎉 AutoU Email Classifier iniciado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:8000"
echo -e "${BLUE}📚 Documentação:${NC} http://localhost:8000/docs"
echo -e "${BLUE}📊 Redoc:${NC} http://localhost:8000/redoc"
echo ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo "   • Pressione Ctrl+C para parar ambos os serviços"
echo "   • Logs do backend: logs/backend.log"
echo "   • Logs do frontend: logs/frontend.log"
echo ""
echo -e "${BLUE}🔄 Aguardando... (Ctrl+C para parar)${NC}"

# Aguardar indefinidamente
wait $BACKEND_PID $FRONTEND_PID
