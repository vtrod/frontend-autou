#!/bin/bash

# Script para build de produção
# AutoU Email Classifier

echo "🔨 Construindo AutoU Email Classifier para produção..."

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

# Limpar builds anteriores
echo -e "${YELLOW}🧹 Limpando builds anteriores...${NC}"
rm -rf .next/
rm -rf dist/
rm -rf build/

# Instalar dependências do frontend
echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
npm ci
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do frontend${NC}"
    exit 1
fi

# Build do frontend
echo -e "${BLUE}⚛️  Construindo frontend (Next.js)...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build do frontend${NC}"
    exit 1
fi

# Verificar dependências do backend
echo -e "${YELLOW}🐍 Verificando backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}🐍 Criando ambiente virtual Python...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do backend${NC}"
    exit 1
fi

cd ..

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📁 Arquivos de produção:${NC}"
echo "   • Frontend: .next/"
echo "   • Backend: backend/"
echo ""
echo -e "${YELLOW}💡 Para executar em produção:${NC}"
echo "   • Frontend: npm start"
echo "   • Backend: cd backend && source venv/bin/activate && python run.py"
