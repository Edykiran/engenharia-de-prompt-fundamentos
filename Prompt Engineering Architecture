foi utilizado o modelo copilot no modo Think deeper

"Crie um execício de python para praticar"

### Exercício: Gerenciador de Tarefas

#### Visão geral  
Crie um programa em Python que permita ao usuário gerenciar uma lista de tarefas pela linha de comando. O programa deve suportar **adicionar**, **listar**, **marcar como concluída** e **remover** tarefas, usando funções e uma lista para armazenar as tarefas durante a execução.

---

#### Requisitos mínimos  
- **Adicionar tarefa** com descrição e prioridade (inteiro 1-5).  
- **Listar tarefas** mostrando índice, descrição, prioridade e status (Pendente/Concluída).  
- **Marcar tarefa como concluída** pelo índice.  
- **Remover tarefa** pelo índice.  
- **Interface simples** em loop que aceita comandos: `add`, `list`, `done`, `remove`, `exit`.  
- **Validação** de entradas (índices e prioridade).

---

#### Código inicial sugerido

```python
# gerenciador_tarefas.py

def adicionar(tarefas, descricao, prioridade):
    tarefa = {"descricao": descricao, "prioridade": prioridade, "concluida": False}
    tarefas.append(tarefa)

def listar(tarefas):
    if not tarefas:
        print("Nenhuma tarefa cadastrada.")
        return
    for i, t in enumerate(tarefas, start=1):
        status = "Concluída" if t["concluida"] else "Pendente"
        print(f"{i}. [{status}] (P{t['prioridade']}) {t['descricao']}")

def marcar_concluida(tarefas, indice):
    try:
        tarefas[indice - 1]["concluida"] = True
    except IndexError:
        print("Índice inválido.")

def remover(tarefas, indice):
    try:
        tarefas.pop(indice - 1)
    except IndexError:
        print("Índice inválido.")

def main():
    tarefas = []
    while True:
        comando = input("Comando (add/list/done/remove/exit): ").strip().lower()
        if comando == "add":
            desc = input("Descrição: ").strip()
            try:
                prio = int(input("Prioridade (1-5): ").strip())
                if prio < 1 or prio > 5:
                    raise ValueError
            except ValueError:
                print("Prioridade inválida. Use um número entre 1 e 5.")
                continue
            adicionar(tarefas, desc, prio)
        elif comando == "list":
            listar(tarefas)
        elif comando == "done":
            try:
                idx = int(input("Índice da tarefa a marcar: ").strip())
                marcar_concluida(tarefas, idx)
            except ValueError:
                print("Índice inválido.")
        elif comando == "remove":
            try:
                idx = int(input("Índice da tarefa a remover: ").strip())
                remover(tarefas, idx)
            except ValueError:
                print("Índice inválido.")
        elif comando == "exit":
            print("Saindo.")
            break
        else:
            print("Comando desconhecido.")

if __name__ == "__main__":
    main()
```

---

#### Como testar  
- **Adicionar** três tarefas com prioridades diferentes.  
- **Listar** e verificar se aparecem corretamente.  
- **Marcar** a segunda como concluída e listar novamente.  
- **Remover** a primeira e listar para confirmar remoção.  
- Teste entradas inválidas (prioridade fora do intervalo, índices não numéricos, índices fora do alcance).

---

#### Desafios extras  
- **Salvar e carregar** tarefas em um arquivo JSON para persistência entre execuções.  
- **Ordenar** a lista por prioridade ao listar (maior prioridade primeiro).  
- **Pesquisar** tarefas por palavra-chave.  
- **Adicionar datas** de vencimento e mostrar tarefas vencidas.  
- **Interface por menu numérico** em vez de comandos de texto.

---

#### Dicas de aprendizado  
- Separe responsabilidades em funções pequenas e testáveis.  
- Use `try/except` para tratar entradas inválidas.  
- Para persistência, use o módulo `json` com `open(..., "w")` e `open(..., "r")`.  
- Escreva testes simples (funções que chamam `adicionar`, `remover`, `marcar_concluida`) para validar a lógica antes de integrar a interface.

Quer que eu gere a versão com **salvamento em JSON** pronta para executar?

"Como um programador de python há mais de 15 anos, você é expert em todos os tipos de referências na linguagem, com uma excelente metodologia de ensino devido à graduação avançada na área de tecnologia e experiências de ensino além de pedagogia. Sabendo disso, crie uma atividade de criação de código em python para praticar."

### Atividade Avançada de Python Objetivos e contexto
**Objetivo:** praticar design de funções, tipos, tratamento de erros, testes automatizados e organização de código.  
**Contexto:** você vai implementar um gerenciador de contatos com operações CRUD, busca e importação/exportação simples (JSON). O exercício foca em boas práticas: funções pequenas, tipagem, docstrings e testes.

---

### Enunciado e requisitos
**Descrição:** implemente um módulo `contacts.py` que gerencie uma lista de contatos em memória e ofereça uma interface programática (funções) para: criar, ler, atualizar, remover, buscar por nome/email e importar/exportar para JSON.

**Requisitos mínimos**
- Representação de contato: **nome** (str), **email** (str), **telefone** (opcional str), **id** (UUID gerado automaticamente).
- Funções obrigatórias:
  - `create_contact(name: str, email: str, phone: Optional[str] = None) -> dict`
  - `get_contact(contact_id: str) -> dict`
  - `update_contact(contact_id: str, **fields) -> dict`
  - `delete_contact(contact_id: str) -> None`
  - `search_contacts(query: str) -> list[dict]` — busca por substring em nome ou email, case-insensitive.
  - `export_contacts(path: str) -> None` — salva lista atual em JSON.
  - `import_contacts(path: str) -> None` — carrega contatos de JSON, evitando duplicatas por email.
- Validações:
  - **email** deve ter formato básico válido (contém `@` e `.` após `@`).
  - `create_contact` deve lançar `ValueError` em dados inválidos.
  - `get_contact`, `update_contact`, `delete_contact` devem lançar `KeyError` se `id` não existir.
- **Estado**: mantenha os contatos em uma estrutura interna (lista ou dict) dentro do módulo; não use banco de dados.

---

### Implementação sugerida
```python
# contacts.py
from __future__ import annotations
import json
import re
import uuid
from typing import Optional, List, Dict

_contacts: Dict[str, Dict] = {}

_EMAIL_RE = re.compile(r"^[^@]+@[^@]+\.[^@]+$")

def _validate_email(email: str) -> bool:
    return bool(_EMAIL_RE.match(email))

def create_contact(name: str, email: str, phone: Optional[str] = None) -> Dict:
    if not name or not isinstance(name, str):
        raise ValueError("Nome inválido.")
    if not email or not isinstance(email, str) or not _validate_email(email):
        raise ValueError("Email inválido.")
    # evita duplicata por email
    if any(c["email"].lower() == email.lower() for c in _contacts.values()):
        raise ValueError("Já existe um contato com esse email.")
    contact_id = str(uuid.uuid4())
    contact = {"id": contact_id, "name": name.strip(), "email": email.strip(), "phone": phone}
    _contacts[contact_id] = contact
    return contact

def get_contact(contact_id: str) -> Dict:
    try:
        return _contacts[contact_id]
    except KeyError:
        raise KeyError("Contato não encontrado.")

def update_contact(contact_id: str, **fields) -> Dict:
    if contact_id not in _contacts:
        raise KeyError("Contato não encontrado.")
    contact = _contacts[contact_id].copy()
    if "email" in fields:
        email = fields["email"]
        if not _validate_email(email):
            raise ValueError("Email inválido.")
        # verifica duplicata em outros contatos
        if any(c["email"].lower() == email.lower() and c["id"] != contact_id for c in _contacts.values()):
            raise ValueError("Outro contato já usa esse email.")
        contact["email"] = email.strip()
    if "name" in fields:
        name = fields["name"]
        if not name:
            raise ValueError("Nome inválido.")
        contact["name"] = name.strip()
    if "phone" in fields:
        contact["phone"] = fields["phone"]
    _contacts[contact_id] = contact
    return contact

def delete_contact(contact_id: str) -> None:
    try:
        del _contacts[contact_id]
    except KeyError:
        raise KeyError("Contato não encontrado.")

def search_contacts(query: str) -> List[Dict]:
    q = query.strip().lower()
    if not q:
        return []
    results = []
    for c in _contacts.values():
        if q in c["name"].lower() or q in c["email"].lower():
            results.append(c)
    return results

def export_contacts(path: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(list(_contacts.values()), f, ensure_ascii=False, indent=2)

def import_contacts(path: str) -> None:
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError("Arquivo não encontrado.")
    if not isinstance(data, list):
        raise ValueError("Formato de arquivo inválido.")
    for item in data:
        email = item.get("email")
        name = item.get("name")
        phone = item.get("phone")
        if not email or not name:
            continue
        # evita duplicatas por email
        if any(c["email"].lower() == email.lower() for c in _contacts.values()):
            continue
        # preserva id se válido, caso contrário gera novo
        cid = item.get("id")
        try:
            uuid.UUID(cid)
            contact_id = cid
        except Exception:
            contact_id = str(uuid.uuid4())
        contact = {"id": contact_id, "name": name.strip(), "email": email.strip(), "phone": phone}
        _contacts[contact_id] = contact

def _clear_all_for_tests() -> None:
    """Função auxiliar para testes; limpa o estado interno."""
    _contacts.clear()
```

---

### Testes unitários
```python
# test_contacts.py
import os
import json
import tempfile
import pytest
from contacts import (
    create_contact, get_contact, update_contact, delete_contact,
    search_contacts, export_contacts, import_contacts, _clear_all_for_tests
)

def setup_function():
    _clear_all_for_tests()

def test_create_and_get_contact():
    c = create_contact("Ana Silva", "ana@example.com", "1234")
    assert "id" in c
    fetched = get_contact(c["id"])
    assert fetched["email"] == "ana@example.com"

def test_create_duplicate_email():
    create_contact("A", "dup@example.com")
    with pytest.raises(ValueError):
        create_contact("B", "dup@example.com")

def test_update_contact():
    c = create_contact("Joao", "joao@example.com")
    updated = update_contact(c["id"], name="João Silva", phone="9999")
    assert updated["name"] == "João Silva"
    assert updated["phone"] == "9999"

def test_delete_contact():
    c = create_contact("X", "x@example.com")
    delete_contact(c["id"])
    with pytest.raises(KeyError):
        get_contact(c["id"])

def test_search_contacts():
    create_contact("Maria", "maria@example.com")
    create_contact("Mario", "mario@ex.com")
    res = search_contacts("mari")
    assert len(res) == 2

def test_export_import(tmp_path):
    c1 = create_contact("T1", "t1@example.com")
    c2 = create_contact("T2", "t2@example.com")
    path = tmp_path / "contacts.json"
    export_contacts(str(path))
    # clear and import
    _clear_all_for_tests()
    import_contacts(str(path))
    # after import there should be 2 contacts
    res = search_contacts("t")
    assert len(res) == 2
```

**Como executar os testes**
- Instale `pytest` se necessário: `pip install pytest`
- Execute: `pytest -q`

---

### Dicas pedagógicas e pontos de aprendizagem
- **Separação de responsabilidades:** cada função faz uma única tarefa testável.  
- **Estado interno:** usar variáveis de módulo (`_contacts`) facilita testes; forneça funções auxiliares para limpar estado em testes.  
- **Validação e erros explícitos:** prefira lançar `ValueError` ou `KeyError` com mensagens claras.  
- **Testes automatizados:** escreva testes que cubram caminhos felizes e erros esperados.  
- **Persistência simples:** JSON é suficiente para exercícios; pense em formatos e compatibilidade.

---

### Desafios extras para aprofundar
- Adicionar paginação e ordenação por nome ou email na listagem.  
- Implementar uma camada de armazenamento alternativa (SQLite) com mesma API.  
- Criar uma CLI com `argparse` ou uma pequena API HTTP com `FastAPI`.  
- Adicionar validação de telefone por regex e normalização de formatos.  
- Implementar versionamento de contatos (histórico de alterações) e endpoint para desfazer última alteração.

---

"Como um programador de python há mais de 15 anos, você é expert em todos os tipos de referências na linguagem, com uma excelente metodologia de ensino devido à graduação avançada na área de tecnologia, experiências de ensino e pedagogia. Você vai criar uma atividade para um aluno iniciante na programação em python com fundamentos e conceitos mais fáceis de entender e evoluir. Trabalhe bem na resposta em formato de Markdown, e a atividade que criar não deve conter códigos da linguagem, o aluno deve trabalhar com a interpretação para programar o quê for necessário."

### Atividade para iniciante em Python

#### Visão geral  
**Objetivo:** praticar lógica, estruturas de dados básicas (listas e dicionários), entrada e saída, validação de dados e decomposição do problema em funções.  
**Contexto:** você vai projetar e implementar um pequeno sistema de cadastro de tarefas (to‑do list) que roda no terminal. O aluno deve interpretar o enunciado e escrever o programa por conta própria sem receber código pronto.

---

### Objetivos de aprendizagem
- **Entender** como decompor um problema em passos menores.  
- **Praticar** leitura de entrada do usuário e exibição de saída formatada.  
- **Usar** listas e dicionários para representar coleções e registros.  
- **Implementar** validações simples e tratamento de erros de entrada.  
- **Organizar** o código em funções com responsabilidades claras.  
- **Testar** manualmente o programa com casos variados.

---

### Enunciado da atividade
Implemente um programa de linha de comando chamado **Gerenciador de Tarefas** com as seguintes funcionalidades:

- **Adicionar tarefa**: o usuário informa uma descrição (texto) e uma prioridade (inteiro de 1 a 5). Cada tarefa recebe um identificador único (pode ser um número incremental).
- **Listar tarefas**: mostra todas as tarefas com **id**, **descrição**, **prioridade** e **status** (Pendente ou Concluída). A listagem deve permitir ordenar por prioridade (maior para menor) ou por id.
- **Marcar como concluída**: o usuário informa o id da tarefa e o programa marca essa tarefa como concluída.
- **Remover tarefa**: o usuário informa o id e a tarefa é removida da lista.
- **Pesquisar tarefas**: o usuário fornece uma palavra ou trecho e o programa retorna tarefas cuja descrição contenha essa substring (busca case‑insensitive).
- **Salvar e carregar**: ao iniciar, o programa tenta carregar tarefas de um arquivo simples (formato à sua escolha, por exemplo texto estruturado ou JSON). Ao sair, salva o estado atual para que as tarefas persistam entre execuções.

**Interface**: o programa deve rodar em loop até o usuário escolher sair. Use comandos simples como `add`, `list`, `done`, `remove`, `search`, `exit` (ou equivalente em português).

---

### Requisitos e especificações detalhadas
- **Representação de tarefa**: cada tarefa deve ter pelo menos os campos **id** (inteiro), **description** (string), **priority** (inteiro 1–5), **completed** (booleano).
- **Validações**:
  - Descrição não pode ser vazia.
  - Prioridade deve ser um inteiro entre 1 e 5; entradas inválidas devem ser tratadas com mensagem amigável e nova solicitação.
  - Operações que usam id devem verificar se o id existe e informar caso contrário.
- **Persistência**:
  - Ao iniciar, se o arquivo de dados existir, carregar tarefas; caso contrário, começar com lista vazia.
  - Ao sair, gravar tarefas no arquivo.
- **Formato de entrada e saída**:
  - Mensagens claras para o usuário em cada passo.
  - Exemplo de linha de listagem: `1. [Pendente] (P3) Comprar leite`
- **Organização do código**:
  - Separe responsabilidades em funções: por exemplo, `add_task`, `list_tasks`, `mark_done`, `remove_task`, `search_tasks`, `load`, `save`.
  - Evite funções muito longas; cada função deve fazer uma única coisa.

---

### Casos de teste e cenários para validar o programa

| Cenário | Ação | Resultado esperado |
|---|---:|---|
| Adição básica | Adicionar tarefa com descrição "Estudar" e prioridade 4 | Nova tarefa aparece com id 1, prioridade 4, status Pendente |
| Validação de prioridade | Tentar adicionar com prioridade "10" ou "abc" | Mensagem de erro e pedido de nova prioridade |
| Marcar concluída | Marcar id 1 como concluída | Status muda para Concluída na listagem |
| Remover | Remover id inexistente | Mensagem informando id inválido |
| Pesquisa | Pesquisar por "estud" | Retorna tarefas cuja descrição contenha "estud" (case‑insensitive) |
| Persistência | Adicionar tarefas, sair e reiniciar | Tarefas previamente adicionadas são carregadas |
| Ordenação | Listar ordenando por prioridade | Tarefas aparecem do maior para o menor prioridade |

Use esses cenários para testar manualmente o programa e anotar se o comportamento está correto.

---

### Dicas passo a passo sem código
1. **Planeje**: escreva no papel as funções que precisará e quais parâmetros cada uma recebe e retorna.  
2. **Estrutura de dados**: escolha entre usar uma lista de dicionários ou um dicionário de dicionários (chave = id). Pense em como gerar ids únicos (contador simples).  
3. **Loop principal**: implemente um laço que lê o comando do usuário, faz `strip()` e `lower()` para normalizar, e chama a função correspondente.  
4. **Entrada segura**: sempre envolva conversões (para inteiro) em tratamento de erro; se a conversão falhar, peça a entrada novamente.  
5. **Listagem formatada**: crie uma função que recebe a lista de tarefas e imprime linhas bem formatadas; permita parâmetro opcional para ordenar.  
6. **Persistência**: para salvar, transforme sua estrutura em texto serializável; para carregar, reconstrua a estrutura em memória. Teste com arquivos pequenos.  
7. **Testes manuais**: siga os casos de teste acima; anote bugs e corrija iterativamente.  
8. **Refatoração**: quando tudo funcionar, revise o código para extrair trechos repetidos em funções auxiliares (por exemplo, validação de id).

---

### Critérios de avaliação
- **Funcionalidade**: todas as operações básicas funcionam conforme o enunciado.  
- **Robustez**: entradas inválidas são tratadas sem travar o programa.  
- **Organização**: uso de funções com responsabilidades claras.  
- **Legibilidade**: nomes de variáveis e mensagens claras; código comentado quando necessário.  
- **Persistência**: tarefas são salvas e carregadas corretamente.  
- **Testes**: o aluno executou os casos de teste e documentou resultados.

---

### Desafios extras para evoluir
- Implementar **prioridade por texto** (ex.: alta, média, baixa) mapeada para números.  
- Adicionar **data de vencimento** e mostrar tarefas vencidas.  
- Implementar **filtros** na listagem (apenas pendentes, apenas concluídas).  
- Criar uma **interface por menu numérico** (1: adicionar, 2: listar, etc.) em vez de comandos de texto.  
- Implementar **undo** para desfazer a última remoção.  
- Transformar o programa em uma **pequena API** usando um microframework quando já dominar o básico.

---

**Observação final**  
Siga a ordem: planejar → implementar funções pequenas → testar cada função isoladamente → integrar → refatorar. Anote dúvidas e erros encontrados; isso faz parte do aprendizado. Boa prática e aproveite o exercício.

OBS:Achei a Terceira etapa muito parecido com pseudocódigo
