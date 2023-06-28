import Navigation from './modules/navigation'

Navigation.init();

async function getData(offset, data = []) {
    const response = await fetch('http://192.168.0.118:3000/items', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            offset: offset,
        })
    });

    let items = await response.json();
    if(items.length == 0) {
        return data;
    }

    items.forEach(item => {
        data.push(item);
    });

    return getData(offset + 2, data);
}
    getData(0).then((items) => {
        console.log(items);

    });


