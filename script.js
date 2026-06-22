const input = document.getElementById('chat-input');
const renderBox = document.getElementById('render-box');
let charCounter = 0;
let characters = []; // Array of { id, name, color }
let currentAlignment = 'left';

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    if (characters.length === 0) {
        addCharacter('Jordan Ortiz', '#e87777');
    }
    applyStyles();
    updatePreview();
});

// --- LOCAL STORAGE & PROJECT MANAGEMENT ---
function getProjectState() {
    return {
        text: input.value,
        characters: characters,
        styles: {
            fontSize: document.getElementById('range-font').value,
            width: document.getElementById('range-width').value,
            padding: document.getElementById('range-padding').value,
            bgActive: document.getElementById('check-bg').checked,
            bgColor: document.getElementById('color-bg').value,
            bgOp: document.getElementById('range-bg-op').value,
            textOp: document.getElementById('range-text-op').value,
            shadow: document.getElementById('range-shadow').value,
            alignment: currentAlignment
        }
    };
}

function saveState() {
    localStorage.setItem('chatlogState', JSON.stringify(getProjectState()));
}

function loadStateFromObject(state) {
    if (!state) return;
    try {
        input.value = state.text || '';
        
        characters = [];
        document.querySelectorAll('.character-setup').forEach(el => el.remove());
        
        if (state.characters && state.characters.length > 0) {
            state.characters.forEach(c => addCharacter(c.name, c.color));
        } else {
            addCharacter('Jordan Ortiz', '#e87777');
        }
        
        if (state.styles) {
            document.getElementById('range-font').value = state.styles.fontSize;
            document.getElementById('range-width').value = state.styles.width;
            if(state.styles.padding !== undefined) document.getElementById('range-padding').value = state.styles.padding;
            document.getElementById('check-bg').checked = state.styles.bgActive;
            document.getElementById('color-bg').value = state.styles.bgColor;
            document.getElementById('range-bg-op').value = state.styles.bgOp;
            document.getElementById('range-text-op').value = state.styles.textOp;
            document.getElementById('range-shadow').value = state.styles.shadow;
            if(state.styles.alignment) setAlignment(state.styles.alignment);
        }
        applyStyles();
        updatePreview();
    } catch (e) {
        console.error("Error loading state", e);
    }
}

function loadState() {
    const saved = localStorage.getItem('chatlogState');
    if (saved) {
        loadStateFromObject(JSON.parse(saved));
    }
}



function clearAll() {
    if (confirm("Tem certeza que deseja apagar tudo?")) {
        localStorage.removeItem('chatlogState');
        input.value = '';
        characters = [];
        document.querySelectorAll('.character-setup').forEach(el => el.remove());
        addCharacter('Jordan Ortiz', '#e87777');
        updatePreview();
    }
}

input.addEventListener('input', () => {
    updatePreview();
    saveState();
});

// --- STYLES ---
function setAlignment(align) {
    currentAlignment = align;
    document.querySelectorAll('.align-btn').forEach(btn => btn.style.backgroundColor = 'var(--bg-card)');
    document.getElementById(`btn-align-${align}`).style.backgroundColor = 'var(--border-hard)';
    document.documentElement.style.setProperty('--chat-align', align);
    saveState();
}

function adjustSlider(id, amount) {
    const slider = document.getElementById(id);
    slider.value = parseInt(slider.value) + amount;
    applyStyles();
}

function hexToRgba(hex, opacity) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

function applyStyles() {
    const fontSize = document.getElementById('range-font').value;
    document.getElementById('lbl-font').innerText = fontSize + 'px';
    document.documentElement.style.setProperty('--chat-font-size', fontSize + 'px');

    const width = document.getElementById('range-width').value;
    document.getElementById('lbl-width').innerText = width + '%';
    document.documentElement.style.setProperty('--chat-width', width + '%');

    const padding = document.getElementById('range-padding').value;
    document.getElementById('lbl-padding').innerText = padding + 'px';
    document.documentElement.style.setProperty('--chat-padding', padding + 'px');

    const bgActive = document.getElementById('check-bg').checked;
    const bgColor = document.getElementById('color-bg').value;
    const bgOp = document.getElementById('range-bg-op').value;
    document.getElementById('lbl-bg-op').innerText = bgOp + '%';
    
    if (bgActive) {
        document.documentElement.style.setProperty('--chat-bg', hexToRgba(bgColor, bgOp));
    } else {
        document.documentElement.style.setProperty('--chat-bg', 'transparent');
    }

    const textOp = document.getElementById('range-text-op').value;
    document.getElementById('lbl-text-op').innerText = textOp + '%';
    document.documentElement.style.setProperty('--chat-text-opacity', textOp / 100);

    const shadowStr = document.getElementById('range-shadow').value;
    if (shadowStr == 0) {
        document.documentElement.style.setProperty('--chat-shadow', 'none');
    } else {
        const s = shadowStr + 'px';
        const shadowVal = `
            -${s} -${s} 0 #000,  ${s} -${s} 0 #000,
            -${s}  ${s} 0 #000,  ${s}  ${s} 0 #000,
             0px -${s} 0 #000,  0px  ${s} 0 #000,
            -${s}  0px 0 #000,  ${s}  0px 0 #000
        `;
        document.documentElement.style.setProperty('--chat-shadow', shadowVal);
    }
    
    saveState();
}

// --- BACKGROUND TESTER ---
function loadTestBackground(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const bgContainer = document.getElementById('preview-container');
        bgContainer.style.backgroundImage = `url(${e.target.result})`;
        bgContainer.classList.add('has-custom-bg');
        
        document.getElementById('btn-clear-bg').style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function clearTestBackground() {
    const bgContainer = document.getElementById('preview-container');
    bgContainer.style.backgroundImage = ''; // Remove inline background
    bgContainer.classList.remove('has-custom-bg'); // Remove specific classes
    document.getElementById('btn-clear-bg').style.display = 'none';
}

// --- PERSONAGENS ---
function addCharacter(defaultName = 'Nome_Sobrenome', defaultColor = '#e87777') {
    charCounter++;
    const id = charCounter;
    
    characters.push({ id: id, name: defaultName, color: defaultColor });

    const container = document.getElementById('characters-container');
    const actionButtons = document.getElementById('action-buttons-char');
    
    const newCharDiv = document.createElement('div');
    newCharDiv.className = 'character-setup';
    newCharDiv.id = 'char-' + id;
    newCharDiv.style.cursor = 'pointer';
    newCharDiv.title = 'Clique para inserir fala do personagem';
    newCharDiv.onclick = function() { insertSpecificCharacter(id); };
    
    newCharDiv.innerHTML = `
        <span style="color: #8b949e; font-size: 14px; pointer-events: none;">Ativo:</span>
        <input type="text" class="char-name-input" value="${defaultName}" oninput="updateCharName(${id}, this.value)" onclick="event.stopPropagation()">
        <input type="color" class="color-picker char-color-input" value="${defaultColor}" oninput="updateCharColor(${id}, this.value)" onclick="event.stopPropagation()" title="Escolha a cor do nome no chat">
    `;
    container.insertBefore(newCharDiv, actionButtons);
    saveState();
}

function updateCharName(id, newName) {
    const char = characters.find(c => c.id === id);
    if (char) {
        char.name = newName;
        updatePreview();
        saveState();
    }
}

function updateCharColor(id, newColor) {
    const char = characters.find(c => c.id === id);
    if (char) {
        char.color = newColor;
        updatePreview();
        saveState();
    }
}

function insertSpecificCharacter(id) {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    
    const textToAdd = `${char.name} diz: `;
    if (input.value.length > 0 && !input.value.endsWith('\n')) input.value += '\n';
    input.value += textToAdd;
    input.focus();
    updatePreview();
    saveState();
}

function openManagerModal() {
    const modalList = document.getElementById('modal-char-list');
    modalList.innerHTML = ''; 
    
    if (characters.length === 0) {
        modalList.innerHTML = '<span style="color: #8b949e;">Nenhum personagem ativo.</span>';
    }

    characters.forEach(char => {
        const row = document.createElement('div');
        row.className = 'manage-row';
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = char.name;
        editInput.oninput = function(e) {
            char.name = e.target.value;
            document.querySelector(`#char-${char.id} .char-name-input`).value = char.name;
            updatePreview();
            saveState();
        };

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'color-picker';
        colorInput.value = char.color;
        colorInput.oninput = function(e) {
            char.color = e.target.value;
            document.querySelector(`#char-${char.id} .char-color-input`).value = char.color;
            updatePreview();
            saveState();
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-char';
        deleteBtn.innerText = 'Excluir';
        deleteBtn.onclick = function() {
            characters = characters.filter(c => c.id !== char.id);
            document.getElementById(`char-${char.id}`).remove();
            row.remove();
            if (characters.length === 0) {
                modalList.innerHTML = '<span style="color: #8b949e;">Nenhum personagem ativo.</span>';
            }
            updatePreview();
            saveState();
        };
        
        row.appendChild(editInput);
        row.appendChild(colorInput);
        row.appendChild(deleteBtn);
        modalList.appendChild(row);
    });
    document.getElementById('manager-modal').style.display = 'flex';
}

function closeManagerModal() { document.getElementById('manager-modal').style.display = 'none'; }

// --- TAGS E TIMESTAMP ---
function insertTag(tag) {
    let insertText = tag;
    if (tag === 'fala') {
        const char = characters.length > 0 ? characters[0] : null;
        const name = char ? char.name : 'Nome_Sobrenome';
        insertText = `${name} diz: `;
    }
    input.value += (input.value.length > 0 && !input.value.endsWith('\n') ? '\n' : '') + insertText;
    input.focus();
    updatePreview(); 
    saveState();
}

function insertTimestamp() {
    let timeInput = prompt("Digite o horário (ex: 20:30) ou deixe em branco para o horário atual:");
    
    let timeStr = "";
    if (timeInput !== null && timeInput.trim() !== "") {
        timeStr = `[${timeInput.trim()}] `;
    } else if (timeInput !== null) {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        timeStr = `[${hh}:${mm}] `;
    } else {
        return; 
    }

    const val = input.value;
    if (val.length === 0 || val.endsWith('\n')) {
        input.value += timeStr;
    } else {
        const lines = val.split('\n');
        const lastLine = lines[lines.length - 1];
        if (lastLine.trim() === '') {
            input.value += timeStr;
        } else {
            input.value += '\n' + timeStr;
        }
    }
    input.focus();
    updatePreview();
    saveState();
}

// --- PREVIEW (REFATORADO) ---
const chatRules = [
    { 
        matcher: (line) => line.startsWith('*') || line.startsWith('/me ') || line.startsWith('/do '),
        render: (line, div) => {
            let text = line;
            if (line.startsWith('/me ') || line.startsWith('/do ')) text = '*' + line.substring(4);
            else if (!line.startsWith('* ')) text = '* ' + line.substring(1).trim();
            div.textContent = text;
            div.classList.add('color-action');
        }
    },
    { 
        matcher: (line) => line.startsWith('$') || line.startsWith('/item '),
        render: (line, div) => {
            div.textContent = line.startsWith('$') ? line.substring(1).trim() : line.substring(6);
            div.classList.add('color-item');
        }
    },
    { 
        matcher: (line) => line.startsWith('#') || line.startsWith('/cel '),
        render: (line, div) => {
            div.textContent = line.startsWith('#') ? line.substring(1).trim() : line.substring(5);
            div.classList.add('color-cel');
        }
    },
    { 
        matcher: (line) => line.startsWith('!') || line.startsWith('/sis '),
        render: (line, div) => {
            div.textContent = line.startsWith('!') ? line.substring(1).trim() : line.substring(5);
            div.classList.add('color-sis');
        }
    },
    { 
        matcher: (line) => line.startsWith('(( ') || line.startsWith('((') || line.startsWith('/ooc '),
        render: (line, div) => {
            let text = line;
            if (line.startsWith('/ooc ')) text = '(( ' + line.substring(5) + ' ))';
            else if (!text.endsWith('))')) text += ' ))';
            div.textContent = text;
            div.classList.add('color-ooc');
        }
    },
    {
        matcher: (line) => line.startsWith('[INFO] '),
        render: (line, div) => {
            const spanBr1 = document.createElement('span'); spanBr1.textContent = '['; spanBr1.className = 'color-normal';
            const spanInfo = document.createElement('span'); spanInfo.textContent = 'INFO'; spanInfo.className = 'color-info-tag';
            const spanBr2 = document.createElement('span'); spanBr2.textContent = '] '; spanBr2.className = 'color-normal';
            const spanText = document.createElement('span'); spanText.textContent = line.substring(7); spanText.className = 'color-normal';
            div.append(spanBr1, spanInfo, spanBr2, spanText);
        }
    }
];

function updatePreview() {
    const lines = input.value.split('\n');
    renderBox.innerHTML = '';

    lines.forEach(line => {
        if (line.trim() === '') return;

        const div = document.createElement('div');
        div.className = 'chat-line';

        let ruleMatched = false;
        
        // Verifica as regras fixas de formatação (acoes, itens, ooc)
        for (const rule of chatRules) {
            if (rule.matcher(line)) {
                rule.render(line, div);
                ruleMatched = true;
                break;
            }
        }

        // Se nenhuma regra bater, cai na lógica de fala normal com checagem de nome customizado
        if (!ruleMatched) {
            let isCustomColor = false;
            const dizIndex = line.indexOf(' diz: ');
            
            if (dizIndex !== -1) {
                const prefixPart = line.substring(0, dizIndex); 
                
                // Procurar o personagem cadastrado no prefixo da frase
                for (let char of characters) {
                    if (prefixPart.includes(char.name) && char.color) {
                        isCustomColor = true;
                        const nameIndex = prefixPart.lastIndexOf(char.name);
                        
                        const beforeName = prefixPart.substring(0, nameIndex);
                        const afterName = line.substring(nameIndex + char.name.length);
                        
                        const spanBefore = document.createElement('span');
                        spanBefore.textContent = beforeName;
                        spanBefore.className = 'color-normal';
                        
                        const spanName = document.createElement('span');
                        spanName.textContent = char.name;
                        spanName.style.color = char.color; 
                        
                        const spanAfter = document.createElement('span');
                        spanAfter.textContent = afterName;
                        spanAfter.className = 'color-normal';
                        
                        div.append(spanBefore, spanName, spanAfter);
                        break;
                    }
                }
            }
            
            if (!isCustomColor) {
                div.textContent = line; 
                div.classList.add('color-normal');
            }
        }
        
        renderBox.appendChild(div);
    });
}

// --- DOWNLOAD ---
function downloadImage() {
    if (renderBox.innerHTML.trim() === '') {
        alert('O chatlog está vazio! Adicione algum texto primeiro.');
        return;
    }
    
    // O html2canvas vai renderizar apenas o renderBox (que é o que queremos).
    // O preview-bg com a imagem de fundo enviada NÃO afeta o png, o que é o esperado!
    html2canvas(renderBox, {
        backgroundColor: null,
        scale: 2 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'chatlog-lore.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
