# TODO LIST

Aplicação web de lista de tarefas desenvolvida para organização e gerenciamento de atividades.

O projeto permite cadastrar, editar, concluir, excluir e reorganizar tarefas, além de armazenar os dados diretamente no navegador utilizando `localStorage`.

---

##  Sobre o projeto

O **TODO LIST** é uma aplicação simples e responsiva para gerenciamento de tarefas.

Cada tarefa possui:

- Título;
- Prioridade;
- Status de conclusão;
- Posição na lista.

A aplicação funciona totalmente no lado do cliente (**client-side**), não dependendo de servidor, banco de dados ou instalação de dependências.

---

##  Funcionalidades

###  Adicionar tarefas

É possível cadastrar uma nova tarefa informando:

- Nome da tarefa;
- Prioridade.

As prioridades disponíveis são:

- 🔴 Alta
- 🟡 Média
- 🟢 Baixa

Existe um limite de **10 tarefas cadastradas simultaneamente**.

---

###  Editar tarefas

As tarefas cadastradas podem ser editadas diretamente pela interface.

Ao selecionar **Editar**, o título da tarefa pode ser alterado e salvo.

Também existe a opção de **Cancelar** a edição.

---

###  Concluir tarefas

Cada tarefa possui um botão de conclusão.

Ao marcar uma tarefa como concluída:

- O status da tarefa é alterado;
- O título recebe um efeito de texto riscado;
- A aparência da tarefa é modificada para indicar que ela foi concluída.

Também é possível desmarcar uma tarefa posteriormente.

---

###  Excluir tarefas

As tarefas podem ser removidas através do botão **Excluir**.

Após a remoção, a aplicação apresenta uma mensagem de confirmação com a opção:

**↶ Desfazer**

Essa opção permite restaurar a tarefa removida antes que a mensagem desapareça.

A ação de desfazer permanece disponível por alguns segundos.

---

###  Reorganizar tarefas

As tarefas podem ser reorganizadas utilizando **Drag and Drop**.

Ao arrastar uma tarefa para outra posição, a nova ordem é armazenada no navegador.

A aplicação também mantém a organização das tarefas de acordo com suas prioridades.

---

###  Ordenação por prioridade

As tarefas são organizadas automaticamente seguindo a seguinte ordem:

1. Alta
2. Média
3. Baixa

Dentro de cada nível de prioridade, a posição definida pelo usuário é preservada.

---

###  Persistência dos dados

As tarefas são armazenadas utilizando a API:

```javascript
localStorage
