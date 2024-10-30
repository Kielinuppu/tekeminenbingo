const kuvat = Array.from({length: 25}, (_, i) => `${i + 1}.avif`);
const aanet = Array.from({length: 25}, (_, i) => `${i + 1}.mp3`);
let arvotut = [];

const arvottuKuva = document.getElementById('arvottuKuva');
const aloitusNappi = document.getElementById('aloitusNappiContainer').querySelector('button');
const seuraavaNappi = document.getElementById('seuraavaNappi');
const pelialue = document.getElementById('pelialue');
const aloitusNappiContainer = document.getElementById('aloitusNappiContainer');
const arvotutKuvatContainer = document.getElementById('arvotutKuvatContainer');
const latausEfekti = document.getElementById('latausEfekti');

let nykyinenAudio = null;
const arvontaAudio = new Audio('arvonta.mp3');
const kysymysAudio = new Audio('kysymys.mp3');

aloitusNappi.addEventListener('click', aloitaPeli);
seuraavaNappi.addEventListener('click', aloitaArvonta);

function aloitaPeli() {
    aloitusNappiContainer.classList.add('hidden');
    pelialue.classList.remove('hidden');
    arvotut = [];
    arvotutKuvatContainer.innerHTML = '';
    seuraavaNappi.textContent = 'SEURAAVA';
    seuraavaNappi.disabled = false;
    aloitaArvonta();
}

function aloitaArvonta() {
    if (seuraavaNappi.textContent === 'VALMIS!') {
        return;
    }

    seuraavaNappi.disabled = true;
    arvottuKuva.classList.add('hidden');
    latausEfekti.classList.remove('hidden');
    
    kysymysAudio.play();

    let seuraavaKuva, arvottuIndeksi;

    
    setTimeout(() => {
        [seuraavaKuva, arvottuIndeksi] = arvoSeuraava();
        if (seuraavaKuva) {
            const imgLoader = new Image();
            imgLoader.src = seuraavaKuva;
        }
    }, 2000);

    setTimeout(() => {
        kysymysAudio.pause();
        kysymysAudio.currentTime = 0;
        arvontaAudio.play();
        
        if (seuraavaKuva) {
            arvottuKuva.src = seuraavaKuva;
            arvottuKuva.alt = `Kuva ${arvotut.length}`;
            
            // Lisätään pikkukuva vasta tässä vaiheessa
            lisaaArvottuKuvake(seuraavaKuva, arvottuIndeksi + 1);
        }
        
        latausEfekti.classList.add('hidden');
        arvottuKuva.classList.remove('hidden');
        
        enlargeImage();
        startStarBurst();
        soitaAudio(nykyinenAudio);
        
        setTimeout(() => {
            shrinkImage();
            if (seuraavaNappi.textContent !== 'VALMIS!') {
                seuraavaNappi.disabled = false;
            }
        }, 5000);
    }, 3000);
}

function arvoSeuraava() {
    if (arvotut.length === kuvat.length - 1) {
        seuraavaNappi.textContent = 'VALMIS!';
        seuraavaNappi.disabled = true;
    }

    if (arvotut.length === kuvat.length) {
        return [null, null];
    }

    let arvottuIndeksi;
    do {
        arvottuIndeksi = Math.floor(Math.random() * kuvat.length);
    } while (arvotut.includes(arvottuIndeksi));

    arvotut.push(arvottuIndeksi);
    const arvottuKohde = kuvat[arvottuIndeksi];

    nykyinenAudio = aanet[arvottuIndeksi];

    return [arvottuKohde, arvottuIndeksi];
}

function lisaaArvottuKuvake(kuvaUrl, numero) {
    const kuvake = document.createElement('img');
    kuvake.src = kuvaUrl;
    kuvake.alt = `Arvottu kuva ${numero}`;
    kuvake.className = 'arvottuKuvake';
    kuvake.title = `Kuva ${numero}`;
    arvotutKuvatContainer.appendChild(kuvake);
}

function soitaAudio(audioTiedosto) {
    if (audioTiedosto) {
        const audio = new Audio(audioTiedosto);
        audio.play();
    }
}

function enlargeImage() {
    arvottuKuva.classList.add('active');
    document.body.insertAdjacentHTML('beforeend', '<div class="overlay"></div><div class="star-container"></div>');
    document.querySelector('.overlay').style.display = 'block';
}

function shrinkImage() {
    arvottuKuva.classList.remove('active');
    const overlay = document.querySelector('.overlay');
    const starContainer = document.querySelector('.star-container');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.remove();
    }
    if (starContainer) {
        starContainer.remove();
    }
}

function startStarBurst() {
    createStarBurst();
    const starInterval = setInterval(createStarBurst, 500);
    
    setTimeout(() => {
        clearInterval(starInterval);
    }, 4500);
}

function createStarBurst() {
    const starCount = 20;
    const container = document.querySelector('.star-container');
    const imgRect = arvottuKuva.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const side = Math.floor(Math.random() * 4);
        let startX, startY;

        switch(side) {
            case 0:
                startX = imgRect.left + Math.random() * imgRect.width;
                startY = imgRect.top;
                break;
            case 1:
                startX = imgRect.right;
                startY = imgRect.top + Math.random() * imgRect.height;
                break;
            case 2:
                startX = imgRect.left + Math.random() * imgRect.width;
                startY = imgRect.bottom;
                break;
            case 3:
                startX = imgRect.left;
                startY = imgRect.top + Math.random() * imgRect.height;
                break;
        }

        star.style.left = `${startX - containerRect.left}px`;
        star.style.top = `${startY - containerRect.top}px`;
        
        const angle = Math.atan2(startY - (imgRect.top + imgRect.height/2), 
                                 startX - (imgRect.left + imgRect.width/2));
        const distance = Math.max(containerRect.width, containerRect.height);
        
        star.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        star.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        
        container.appendChild(star);
    }
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('overlay')) {
        shrinkImage();
        if (nykyinenAudio) {
            const audio = new Audio(nykyinenAudio);
            audio.pause();
            audio.currentTime = 0;
        }
    }
});