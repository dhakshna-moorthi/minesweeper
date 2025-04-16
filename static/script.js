const grid = document.getElementById('minesweeper-grid');
resultElement = document.getElementById('result')
const revealed = new Set();
let click_count = 0;

function handleClick(name) {

    const flag = document.getElementById("flag");
    buttonElement = document.getElementsByName(name)[0]

    if (flag.checked) {
        buttonElement.innerHTML = "🚩";
    } else if(buttonElement.innerHTML=="🚩") {
        buttonElement.innerHTML = "";
    } else {
        if (revealed.has(name)) return; 
        revealed.add(name);

        click_count += 1
        console.log("click count: ",click_count)

        fetch('/handle_click', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ button: name })
        })
        .then(response => response.json())
        .then(data => {
        buttonElement = document.getElementsByName(name)[0]
        buttonElement.innerHTML = data.message;
        if(data.message==0){
            buttonElement.style.backgroundColor = '#2ECC71';
            const i = parseInt(name[0]);
            const j = parseInt(name[1]);

            const neighbors = [
            [i - 1, j - 1], [i - 1, j], [i - 1, j + 1],
            [i,     j - 1],             [i,     j + 1],
            [i + 1, j - 1], [i + 1, j], [i + 1, j + 1]
            ];

            neighbors.forEach(([ni, nj]) => {
            if (ni >= 0 && ni < 9 && nj >= 0 && nj < 9) {
                const neighborName = `${ni}${nj}`;
                const neighborButton = document.getElementsByName(neighborName)[0];
                if (!revealed.has(neighborName) && neighborButton && !neighborButton.disabled) {
                handleClick(neighborName); 
                }
            }
            });
        } else if(data.message=='M') {
            buttonElement.innerHTML = '💣'
            buttonElement.style.backgroundColor = '#FF0000';
            resultElement.innerHTML = 'Game Over'
            resultElement.style.color = '#FF0000';
            const allButtons = document.querySelectorAll('button');
            allButtons.forEach(btn => {
            btn.disabled = true;
            });
        } else {
            buttonElement.style.backgroundColor = '#F1C40F';
        }
        buttonElement.disabled = true;
        });
        if(click_count==72){
            const allButtons = document.querySelectorAll('button');
            allButtons.forEach(btn => {
            btn.disabled = true;
            });
            resultElement.innerHTML = 'Congrats, you won!'
            resultElement.style.color = '#2ECC71';
        }
    }
}

for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
    const name = `${i}${j}`;
    const button = document.createElement('button');
    button.classList.add('cell');
    button.type = 'button';
    button.name = name;
    button.onclick = function () {handleClick(this.name, this);};
    grid.appendChild(button);
    }
}