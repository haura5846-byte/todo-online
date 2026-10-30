const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=15';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = [];
let currentFilter = 'all';

// Fungsi untuk mengambil data awal dari API
async function fetchTodos() {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data dari server.');
        
        const data = await response.json();
        todos = data;
        renderTodos();
    } catch (error) {
        errorEl.textContent = `Terjadi kesalahan: ${error.message}`;
        errorEl.style.display = 'block';
    } finally {
        loadingEl.style.display = 'none';
    }
}

// Fungsi untuk merender daftar tugas ke HTML berdasarkan filter
function renderTodos() {
    todoList.innerHTML = '';

    // Filter data
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'completed') return todo.completed;
        if (currentFilter === 'uncompleted') return !todo.completed;
        return true; // 'all'
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li style="text-align: center; color: #6b7280; padding: 15px;">Tidak ada tugas.</li>`;
        return;
    }

    // Buat elemen HTML untuk setiap tugas
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        const statusClass = todo.completed ? 'completed' : 'uncompleted';
        const statusText = todo.completed ? 'Selesai' : 'Belum Selesai';

        li.className = `todo-item ${statusClass}`;
        li.innerHTML = `
            <span>${escapeHTML(todo.title)}</span>
            <span class="badge">${statusText}</span>
        `;
        todoList.appendChild(li);
    });
}

// Fungsi untuk menambah tugas baru (POST ke API + tampil di atas)
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleText = todoInput.value.trim();
    if (!titleText) return;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = 'Menambahkan...';
    submitBtn.disabled = true;

    try {
        // Simulasi POST ke JSONPlaceholder
        const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST',
            body: JSON.stringify({
                title: titleText,
                completed: false,
                userId: 1
            }),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
        });

        if (!response.ok) throw new Error('Gagal menambahkan tugas.');

        const newTodo = await response.json();
        
        // Karena JSONPlaceholder selalu mengembalikan ID 200 untuk data baru, 
        // kita beri ID unik buatan lokal agar tampil dengan benar
        newTodo.id = Date.now(); 

        // Masukkan ke urutan paling atas array
        todos.unshift(newTodo);
        
        // Reset input & render ulang
        todoInput.value = '';
        renderTodos();
    } catch (error) {
        alert(`Gagal: ${error.message}`);
    } finally {
        submitBtn.textContent = 'Tambah';
        submitBtn.disabled = false;
    }
});

// Event listener untuk tombol filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

// Fungsi keamanan kecil untuk mencegah XSS sederhana
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Jalankan saat halaman dimuat
fetchTodos();