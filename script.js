const listaEl = document.getElementById('listaTarefas');
const novaTarefaInput = document.getElementById('novaTarefaInput');
const btnAdicionar = document.getElementById('btnAdicionar');
const contadorSpan = document.getElementById('contadorTarefas');
const btnLimparConcluidas = document.getElementById('btnLimparConcluidas');
const filtroBtns = document.querySelectorAll('.filtro-btn');
const temaCheckbox = document.getElementById('temaCheckbox');


let tarefas = [];         
let filtroAtual = 'todas'; 
let draggingItem = null;


const STORAGE_KEY = 'todo_list_app';

function salvarTarefas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

function carregarTarefas() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (dados) {
    tarefas = JSON.parse(dados);
  } else {

    tarefas = [
      { id: Date.now() + 1, texto: 'Arrastar para reordenar', concluida: false },
      { id: Date.now() + 2, texto: 'Clique no texto para editar', concluida: false },
      { id: Date.now() + 3, texto: 'Marcar como concluída', concluida: true },
    ];
  }
}


function renderizarTarefas() {

  let tarefasFiltradas = tarefas;
  if (filtroAtual === 'ativas') {
    tarefasFiltradas = tarefas.filter(t => !t.concluida);
  } else if (filtroAtual === 'concluidas') {
    tarefasFiltradas = tarefas.filter(t => t.concluida);
  }


  if (tarefasFiltradas.length === 0) {
    listaEl.innerHTML = '<li style="text-align:center; padding:20px;">✨ Nenhuma tarefa aqui ✨</li>';
    contadorSpan.innerText = `${tarefas.filter(t => !t.concluida).length} tarefas restantes`;
    return;
  }

  listaEl.innerHTML = '';
  tarefasFiltradas.forEach(tarefa => {
    const li = document.createElement('li');
    li.className = `tarefa-item ${tarefa.concluida ? 'concluida' : ''}`;
    li.setAttribute('data-id', tarefa.id);
    li.setAttribute('draggable', 'true');


    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'tarefa-check';
    checkbox.checked = tarefa.concluida;
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleConcluir(tarefa.id);
    });


    const spanTexto = document.createElement('span');
    spanTexto.className = 'tarefa-texto';
    spanTexto.innerText = tarefa.texto;
    spanTexto.addEventListener('click', () => editarTarefa(tarefa.id));

   
    const btnEdit = document.createElement('button');
    btnEdit.innerHTML = '✏️';
    btnEdit.className = 'btn-editar';
    btnEdit.title = 'Editar tarefa';
    btnEdit.addEventListener('click', (e) => {
      e.stopPropagation();
      editarTarefa(tarefa.id);
    });

    const btnDel = document.createElement('button');
    btnDel.innerHTML = '🗑️';
    btnDel.className = 'btn-excluir';
    btnDel.title = 'Excluir tarefa';
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      excluirTarefa(tarefa.id);
    });

    li.appendChild(checkbox);
    li.appendChild(spanTexto);
    li.appendChild(btnEdit);
    li.appendChild(btnDel);

 
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragend', handleDragEnd);

    listaEl.appendChild(li);
  });


  const tarefasRestantes = tarefas.filter(t => !t.concluida).length;
  contadorSpan.innerText = `${tarefasRestantes} tarefa${tarefasRestantes !== 1 ? 's' : ''} restante${tarefasRestantes !== 1 ? 's' : ''}`;
}


function adicionarTarefa() {
  const texto = novaTarefaInput.value.trim();
  if (texto === '') {
    alert('Digite uma tarefa válida');
    return;
  }
  const novaTarefa = {
    id: Date.now(),
    texto: texto,
    concluida: false
  };
  tarefas.push(novaTarefa);
  salvarTarefas();
  novaTarefaInput.value = '';
  renderizarTarefas();
}

function excluirTarefa(id) {
  tarefas = tarefas.filter(t => t.id !== id);
  salvarTarefas();
  renderizarTarefas();
}

function toggleConcluir(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (tarefa) {
    tarefa.concluida = !tarefa.concluida;
    salvarTarefas();
    renderizarTarefas();
  }
}

function editarTarefa(id) {
  const tarefa = tarefas.find(t => t.id === id);
  if (!tarefa) return;
  const novoTexto = prompt('Editar tarefa:', tarefa.texto);
  if (novoTexto !== null && novoTexto.trim() !== '') {
    tarefa.texto = novoTexto.trim();
    salvarTarefas();
    renderizarTarefas();
  }
}

function limparConcluidas() {
  tarefas = tarefas.filter(t => !t.concluida);
  salvarTarefas();
  renderizarTarefas();
}


let dragStartIndex = null;

function handleDragStart(e) {
  const li = e.target.closest('.tarefa-item');
  if (!li) return;
  draggingItem = li;
  li.classList.add('dragging');

  const id = parseInt(li.getAttribute('data-id'));
  dragStartIndex = tarefas.findIndex(t => t.id === id);
  e.dataTransfer.setData('text/plain', '');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  const targetLi = e.target.closest('.tarefa-item');
  if (!targetLi || !draggingItem || draggingItem === targetLi) return;
  
  const targetId = parseInt(targetLi.getAttribute('data-id'));
  const targetIndex = tarefas.findIndex(t => t.id === targetId);

  if (dragStartIndex !== undefined && dragStartIndex !== null && targetIndex !== -1) {
    const [movedItem] = tarefas.splice(dragStartIndex, 1); 
    tarefas.splice(targetIndex, 0);
    salvarTarefas();
    renderizarTarefas();
  }
}  

function handleDragEnd(e) {
  if (draggingItem) {
    draggingItem.classList.remove('dragging');
    draggingItem = null;
  }
  dragStartIndex = null;
}

function mudarFiltro(filtro) {
  filtroAtual = filtro;
  filtroBtns.forEach(btn => {
    if (btn.getAttribute('data-filtro') === filtro) {
      btn.classList.add('ativo');
    } else {
      btn.classList.remove('ativo');
    }
  });
  renderizarTarefas();
}

function alternarTema() {
  const isChecked = temaCheckbox.checked;
  if (isChecked) {
    document.body.classList.remove('tema-claro');
    document.body.classList.add('tema-escuro');
    localStorage.setItem('tema_app', 'escuro');
  } else {
    document.body.classList.remove('tema-escuro');
    document.body.classList.add('tema-claro');
    localStorage.setItem('tema_app', 'claro');
  }
}

function carregarTema() {
  const temaSalvo = localStorage.getItem('tema_app');
  if (temaSalvo === 'escuro') {
    document.body.classList.add('tema-escuro');
    document.body.classList.remove('tema-claro');
    temaCheckbox.checked = true;
  } else {
    document.body.classList.add('tema-claro');
    document.body.classList.remove('tema-escuro');
    temaCheckbox.checked = false;
  }
}

btnAdicionar.addEventListener('click', adicionarTarefa);
novaTarefaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter')
  adicionarTarefa();
});
btnLimparConcluidas.addEventListener('click', limparConcluidas);

filtroBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    mudarFiltro(btn.getAttribute('data-filtro'));
  });
});

temaCheckbox.addEventListener('change', alternarTema);

carregarTarefas();
carregarTema();
renderizarTarefas();