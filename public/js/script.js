let button = document.getElementById('fetch');
let content = document.getElementById('content');

const queryString = window.location.search;
const urlParms = new URLSearchParams(queryString);

let page = urlParms.get('page')
if (page == null) page = 1;

let counter = page * 4;

let totalPages = content.dataset.pages;

button.addEventListener('click', () => {
    fetch('/items', {
        method: 'POST',
        headers: {
            'Content-type': "application/json",
        },
        body: JSON.stringify({
            offset: counter,
        })

    }).then(
        (response) => {
            return response.json();
        }
    ).then(
        (result) => {            
            counter += 4;
            for (let i = 0; i < result.length; i++) {
                renderItem(result[i]);
            }
            
            if (counter >= totalPages * 4) {
                button.style.display = 'none';
            }
        }
    )
});

function renderItem(item) {
    let div = document.createElement('div');
    div.classList.add('section');

    let a = document.createElement('a');
    a.href = '/items/' + item.id;

    let h2 = document.createElement('h2');
    h2.classList.add('section__title');
    h2.innerText = item.title;

    let img = document.createElement('img');
    img.src = 'img/' + item.image;
    img.classList.add('section__image')

    a.appendChild(h2);
    a.appendChild(img);

    let form = document.createElement('form');
    form.method = 'post'
    form.action = '/delete'

    let inputId = document.createElement('input');
    inputId.type = 'hidden';
    inputId.name = 'id';
    inputId.value = item.id;

    let inputSubmit = document.createElement('input');
    inputSubmit.type = 'submit'
    inputSubmit.classList.add('form-button')
    inputSubmit.value = 'Удалить';

    form.appendChild(inputId);
    form.appendChild(inputSubmit);

    div.appendChild(a);
    div.appendChild(form)

    content.appendChild(div);
}