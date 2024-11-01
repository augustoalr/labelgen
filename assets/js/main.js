let rotulos = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('labelForm');
    const fondoSelect = document.getElementById('fondo');
    const personalizadoOptions = document.getElementById('personalizadoOptions');
    const generarPDFButton = document.getElementById('generarPDF');

    fondoSelect.addEventListener('change', (e) => {
        personalizadoOptions.style.display = e.target.value === 'personalizado' ? 'block' : 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generarRotulo();
    });

    generarPDFButton.addEventListener('click', generarPDF);
});

function generarRotulo() {
    const rotulo = {
        nroBien: document.getElementById('nroBien').value,
        autor: document.getElementById('autor').value,
        titulo: document.getElementById('titulo').value,
        fecha: document.getElementById('fecha').value,
        tecnica: document.getElementById('tecnica').value,
        medidas: document.getElementById('medidas').value,
        fondo: document.getElementById('fondo').value
    };

    function dividirTextoConPalabrasCompletas(texto, limite) {
        if (texto.length <= limite) return texto; // Si el texto ya es menor al límite, no lo divide.

        // Encuentra el último espacio antes del límite
        let indexEspacio = texto.lastIndexOf(' ', limite);

        // Si no encuentra un espacio, corta en el límite exacto (pero esto es raro)
        if (indexEspacio === -1) indexEspacio = limite;

        // Divide el texto manteniendo las palabras completas
        return texto.slice(0, indexEspacio) + '\n' + texto.slice(indexEspacio + 1);
    }

    // Aplicar la función a tu lógica
    if (rotulo.titulo.length > 38) {
        rotulo.titulo = dividirTextoConPalabrasCompletas(rotulo.titulo, 38);
        rotulo.fecha = '\n' + rotulo.fecha;
        rotulo.tecnica = '\n' + rotulo.tecnica;
        rotulo.medidas = '\n' + rotulo.medidas;
    }


    if (rotulo.fondo === 'personalizado') {
        rotulo.fondoSuperior = document.getElementById('fondoSuperior').files[0];
        rotulo.fondoInferior = document.getElementById('fondoInferior').files[0];
    }

    rotulos.push(rotulo);
    mostrarRotulos();
    document.getElementById('labelForm').reset();
    document.getElementById('personalizadoOptions').style.display = 'none';
    document.querySelectorAll('.remove-file').forEach(btn => btn.style.display = 'none');
}

function mostrarRotulos() {
    const container = document.getElementById('rotulosContainer');
    container.innerHTML = '';

    rotulos.forEach((rotulo, index) => {
        const div = document.createElement('div');
        div.className = 'rotulo';
        div.innerHTML = `
            <p>${rotulo.nroBien}</p>
            <p class="autor">${rotulo.autor}</p>
            <p class="titulo">${rotulo.titulo}</p>
            <p>${rotulo.fecha}</p>
            <p>${rotulo.tecnica}</p>
            <p>${rotulo.medidas}</p>
            <button class="editButton" onclick="editarRotulo(${index})">Editar</button>
            <button class="deleteButton" onclick="eliminarRotulo(${index})">Eliminar</button>
        `;

        aplicarFondo(div, rotulo.fondo, rotulo.fondoSuperior, rotulo.fondoInferior);
        container.appendChild(div);
    });
}

function aplicarFondo(div, fondo, fondoSuperior, fondoInferior) {
    const supDiv = document.createElement('div');
    const infDiv = document.createElement('div');
    supDiv.className = 'fondoSuperior';
    infDiv.className = 'fondoInferior';

    switch (fondo) {
        case 'casaAmarilla':
            supDiv.style.backgroundImage = 'url("")';
            infDiv.style.backgroundImage = 'url("")';
            break;
        case 'torreMRE':
            supDiv.style.backgroundColor = 'url("")';
            infDiv.style.backgroundColor = 'url("")';
            break;
        case 'personalizado':
            if (fondoSuperior) {
                const readerSup = new FileReader();
                readerSup.onload = (e) => supDiv.style.backgroundImage = `url(${e.target.result})`;
                readerSup.readAsDataURL(fondoSuperior);
            }
            if (fondoInferior) {
                const readerInf = new FileReader();
                readerInf.onload = (e) => infDiv.style.backgroundImage = `url(${e.target.result})`;
                readerInf.readAsDataURL(fondoInferior);
            }
            break;
    }

    div.appendChild(supDiv);
    div.appendChild(infDiv);
}

function editarRotulo(index) {
    const rotulo = rotulos[index];
    document.getElementById('nroBien').value = rotulo.nroBien;
    document.getElementById('autor').value = rotulo.autor;
    document.getElementById('titulo').value = rotulo.titulo;
    document.getElementById('fecha').value = rotulo.fecha;
    document.getElementById('tecnica').value = rotulo.tecnica;
    document.getElementById('medidas').value = rotulo.medidas;
    document.getElementById('fondo').value = rotulo.fondo;

    rotulos.splice(index, 1);
    mostrarRotulos();
}

function eliminarRotulo(index) {
    rotulos.splice(index, 1);
    mostrarRotulos();
}

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const rotuloWidth = 80; // 8cm en puntos
    const rotuloHeight = 40; // 6cm en puntos
    const margin = 10;
    let x = margin;
    let y = margin;
    let count = 0;
    

    const verticalOffset = 6; // Ajusta este valor: negativo = arriba, positivo = abajo

    // Cargar el logo MRE
    const logoMRE = document.getElementById('logoMRE');
    const logoWidthTorre = 7; // Ajusta según sea necesario
    const logoHeightTorre = 7; // Ajusta según sea necesario

    // Cargar el logo Casa
    const logoCasa = document.getElementById('logoCasa');
    const logoWidthCasa = 7; // Ajusta según sea necesario
    const logoHeightCasa = 7; // Ajusta según sea necesario

    const logoCasaUnder = document.getElementById('logoCasaUnder');
    const logoWidthCasaUnder = 7; // Ajusta según sea necesario
    const logoHeightCasaUnder = 7; // Ajusta según sea necesario



    // Configuración de posiciones para las cruces
    const crossConfig = {
        left: {
            x: margin - 1 // Cruces izquierdas fijas
        },
        middle: {
            x: margin + 91 // Puedes ajustar este valor para mover las cruces del medio
        },
        right: {
            x: margin + 183.1 // Puedes ajustar este valor para mover las cruces de la derecha
        }
    };

    // Función auxiliar para dibujar una cruz
    function dibujarCruz(x, y) {
        doc.setFontSize(20);
        doc.text('+', x, y);
    }

    // Función modificada para dibujar cruces con posiciones configurables
    function dibujarCrucesPagina() {
        // Dibuja las columnas de cruces
        for (let j = 0; j <= 4; j++) {
            const yPos = margin + j * (rotuloHeight + margin) - 3;

            // Dibuja cruces izquierdas (fijas)
            dibujarCruz(crossConfig.left.x, yPos);

            // Dibuja cruces del medio
            dibujarCruz(crossConfig.middle.x, yPos);

            // Dibuja cruces derechas
            dibujarCruz(crossConfig.right.x, yPos);
        }
    }

    rotulos.forEach((rotulo, index) => {
        if (count % 8 === 0) {
            if (count > 0) {
                doc.addPage();
            }
            x = margin;
            y = margin;
            dibujarCrucesPagina();
        }



        // Aplicar fondo si es necesario
        if (rotulo.fondo === 'casaAmarilla') {
            // Agregar el logo Casa como marca de agua
            const enlargedLogoWidthCasa = logoWidthCasa * 10; // Ajusta el tamaño del logo según sea necesario
            const enlargedLogoHeightCasa = logoHeightCasa * 0; // Ajusta el tamaño del logo según sea necesario
            const logoXCasa = x + (rotuloWidth - enlargedLogoWidthCasa) / 2; // Centrar horizontalmente
            const logoYCasa = y - 4; // Ajusta la posición vertical según sea necesario
            doc.addImage(logoCasa, 'PNG', logoXCasa, logoYCasa, enlargedLogoWidthCasa, enlargedLogoHeightCasa);

            const additionalImageWidth = logoWidthCasaUnder * 10; // Ajusta el tamaño del logo según sea necesario    
            const additionalImageHeight = logoHeightCasaUnder * 0; // Ajusta el tamaño del logo según sea necesario    
            const additionalImageX = x + (rotuloWidth - additionalImageWidth) / 2; // Centrar horizontalmente
            const additionalImageY = y + 38; // Ajusta la posición vertical según sea necesario
            doc.addImage(logoCasaUnder, 'PNG', additionalImageX, additionalImageY, additionalImageWidth, additionalImageHeight);

        } else if (rotulo.fondo === 'torreMRE') {
            // Agregar el logo MRE como marca de agua
            const enlargedLogoWidthTorre = logoWidthTorre * 2.2; // Duplicar el ancho del logo
            const enlargedLogoHeightTorre = logoHeightTorre * 3; // Duplicar la altura del logo
            const logoXTorre = x + (rotuloWidth - enlargedLogoWidthTorre) / 1; // Centrar horizontalmente
            const logoYTorre = y + 15; // Ajusta la posición vertical según sea necesario
            doc.addImage(logoMRE, 'PNG', logoXTorre, logoYTorre, enlargedLogoWidthTorre, enlargedLogoHeightTorre);
            // doc.addImage(logoMRE, 'PNG', x + rotuloWidth - enlargedLogoWidth - 5, y + rotuloHeight - enlargedLogoHeight - 8, enlargedLogoWidth, enlargedLogoHeight);
        } else if (rotulo.fondo === 'neutro') {
            //No agregar ningun logo


        } else if (rotulo.fondo === 'personalizado') {
            // Aquí necesitarías convertir las imágenes a base64 y luego agregarlas al PDF
            // Esta parte requiere un manejo más complejo que no se puede resolver completamente aquí
        }

        doc.setFontSize(12);
        doc.setFont("helvetica");

        // Calcular la altura total del texto
        const lines = [
            rotulo.nroBien,
            rotulo.autor,
            rotulo.titulo,
            rotulo.fecha,
            rotulo.tecnica,
            rotulo.medidas,
            rotulo.firma
        ];
        const lineHeight = 5;
        const totalTextHeight = lines.length * lineHeight;

        // Calcular la posición inicial para centrar verticalmente
        let textY = y + (rotuloHeight - totalTextHeight) / 2 + verticalOffset;


        // Dibujar el texto
        // Agregar el número de bien en la esquina inferior derecha
        doc.text(rotulo.nroBien, x + rotuloWidth - 16, y + rotuloHeight + 2.4);

        doc.setFont("helvetica", "bold");
        doc.text(rotulo.autor, x + 5, textY);
        textY += lineHeight;

        doc.setFont("helvetica", "italic");
        doc.text(rotulo.titulo, x + 5, textY);
        textY += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.text(rotulo.fecha, x + 5, textY);
        textY += lineHeight;

        doc.text(rotulo.tecnica, x + 5, textY);
        textY += lineHeight;
        doc.text(rotulo.medidas, x + 5, textY);




        x += rotuloWidth + margin;
        if (x + rotuloWidth > pageWidth) {
            x = margin;
            y += rotuloHeight + margin;
        }
        count++;
    });

    doc.output('dataurlnewwindow');




}

function abrirPDFEnNuevaPestana(doc) {
    doc.save("rotulo.pdf", { returnPromise: true }).then((data) => {
        const pdfBlob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, "_blank"); // Abre el PDF en una nueva pestaña
    });
}
