document.querySelectorAll('.randomize-case').forEach(element => {
    setInterval(() => {
        element.textContent = element.textContent.split('').map(c => Math.random() > 0.5 ? c.toLocaleLowerCase() : c.toUpperCase()).join('');
    }, 1000)
});
