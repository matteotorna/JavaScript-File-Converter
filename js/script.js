// Selectors
const dropArea = document.querySelector(".drag-area");
const dragText = document.querySelector(".header");
const input = document.querySelector("input[type='file']");
const button = dropArea.querySelector(".button");
const progress = document.querySelector(".progress");
const progressPercent = document.querySelector(".progress-percent");
const resetButton = document.getElementById("resetButton");
const exampleButton = document.getElementById("exampleButton");
const activityItems = document.getElementById("activityItems");
const clearActivityButton = document.getElementById("clearActivityButton");
const sortSelect = document.getElementById("sort-select");
const sortDropdown = document.querySelector(".sort-dropdown");
const deleteAllButton = document.getElementById("deleteAllButton");
const progressContainer = document.querySelector(".progress-container");
const tooltip = deleteAllButton.querySelector(".tooltiptext");
const tooltipButtons = document.querySelectorAll(".tooltip-button");

let files = [];
let file;

// Load saved activities from localStorage
loadSavedActivities();

//Functions
function addFileToList(file) {
    file.extension = file.name.split('.').pop().toLowerCase();
    files.push(file);
    renderFileList();
    addToActivityList(`File uploaded: ${file.name}`);
}

function renderFileList() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "";

    files.forEach((file) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${file.name} - ${(file.size / 1024).toFixed(2)} KB`;

        const fileActionButtons = document.createElement("div");
        fileActionButtons.classList.add("file-action-buttons");

        const convertButtonXml = createConvertButton(file, "XML");
        const convertButtonJson = createConvertButton(file, "JSON");
        const convertButtonPdf = createConvertButton(file, "PDF");
        const convertButtonCsv = createConvertButton(file, "CSV");

        const removeButton = document.createElement("button");
        removeButton.innerHTML = '<i class="fas fa-trash-alt fa-lg"></i>';
        removeButton.classList.add("file-action-button", "remove-button");
        removeButton.addEventListener("click", () => {
            files = files.filter((f) => f !== file);
            renderFileList();
        });

        // tooltip alle icone
        convertButtonXml.title = "XML";
        convertButtonJson.title = "JSON";
        convertButtonPdf.title = "PDF";
        convertButtonCsv.title = "CSV";
        removeButton.title = "Delete";

        fileActionButtons.appendChild(convertButtonXml);
        fileActionButtons.appendChild(convertButtonJson);
        fileActionButtons.appendChild(convertButtonPdf);
        fileActionButtons.appendChild(convertButtonCsv);
        fileActionButtons.appendChild(removeButton);

        listItem.appendChild(fileActionButtons);
        fileList.appendChild(listItem);

        // Nascondi le icone in base all'estensione del file
        if (file.extension === "xml") {
            convertButtonXml.style.display = "none";
        } else if (file.extension === "json") {
            convertButtonJson.style.display = "none";
        } else if (file.extension === "csv") {
            convertButtonCsv.style.display = "none";
        }
    });
}

function displayFile() {
    if (file) {
        dropArea.classList.add("active");

        let fileType = file.type;
        let validExtensions = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/json",
            "text/csv",
            "application/xml",
            "text/xml"
        ];

        if (!validExtensions.includes(fileType)) {
            alert("Formato file non valido. Caricare solo file Excel, JSON, CSV o XML.");
            dropArea.classList.remove("active");
            resetProgressBar();
            return;
        }

        startProgressBar();
        showProgressBar();

        let fileReader = new FileReader();

        fileReader.onload = () => {
            let fileContent = fileReader.result;

            // Visualizza il contenuto del file nella console
            console.log("Contenuto del file:");
            console.log(fileContent);

            if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                // Gestisci i file Excel come prima
                console.log("Stai gestendo un file Excel:");
                console.log(fileContent); // Verifica il contenuto del file Excel
                let workbook = XLSX.read(fileContent, { type: "binary" });
                // Processa workbook secondo le necessità
                console.log(workbook);
            } else if (fileType === "application/json") {
                // Gestisci i file JSON come prima
                console.log("Stai gestendo un file JSON:");
                console.log(fileContent); // Verifica il contenuto del file JSON
                let jsonData = JSON.parse(fileContent);
                // Processa jsonData secondo le necessità
                console.log(jsonData);
            } else if (fileType === "text/csv") {
                // Gestisci i file CSV come prima
                console.log("Stai gestendo un file CSV:");
                console.log(fileContent); // Verifica il contenuto del file CSV
                Papa.parse(file, {
                    header: true,
                    dynamicTyping: true,
                    complete: function (results) {
                        // I dati del CSV sono disponibili in results.data
                        console.log(results.data);
                    },
                });
            } else if (fileType === "application/xml" || fileType === "text/xml") {
                // Gestisci i file XML
                console.log("Stai gestendo un file XML:");

                // Analizza il contenuto XML con il DOMParser
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(fileContent, "text/xml");

                // Puoi ora elaborare xmlDoc secondo le necessità
                console.log(xmlDoc);

                const root = xmlDoc.documentElement;
                console.log("Root element:", root);

                // Estrarre dati dall'XML
                const elements = root.getElementsByTagName("nome_elemento");
                for (let i = 0; i < elements.length; i++) {
                    console.log("Elemento " + i + ":", elements[i].textContent);
                }
            }
        };

        if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            fileReader.readAsArrayBuffer(file);
        } else {
            fileReader.readAsText(file);
        }

        addToActivityList(`File displayed: ${file.name}`);
    }
}

function sortFilesBy(property) {
    files.sort((a, b) => {
        if (property === 'name') {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        } else if (property === 'size') {
            return a.size - b.size;
        }
    });

    renderFileList();
}

function createConvertButton(file, type) {
    const convertButton = document.createElement("button");
    convertButton.classList.add("convert-button");
    convertButton.addEventListener("click", () => {
        if (type === "XML") {
            if (file.extension === "json") {
                const reader = new FileReader();
                reader.onload = () => {
                    const jsonData = JSON.parse(reader.result);
                    convertJsonToXml(jsonData, file.name.replace(".json", ".xml"));
                };
                reader.readAsText(file);
            } else {
                convertExcelToXml(file);
            }
        } else if (type === "JSON") {
            if (file.extension === "json") {
                // If it's already JSON, you can provide a download link
                downloadJsonFile(file, file.name);
            } else {
                convertExcelToJson(file);
            }
        } else if (type === "PDF") {
            if (file.extension === "json") {
                const reader = new FileReader();
                reader.onload = () => {
                    const jsonData = JSON.stringify(JSON.parse(reader.result), null, 2);
                    convertJsonToPdf(jsonData, file.name.replace(".json", ".pdf"));
                };
                reader.readAsText(file);
            } else {
                convertExcelToPdf(file);
            }
        } else if (type === "CSV") {
            convertExcelToCsv(file);
        }
    });

    if (type === "XML") {
        convertButton.innerHTML += '<i class="fas fa-file-code fa-lg xml-icon"></i>';
    } else if (type === "JSON") {
        convertButton.innerHTML += '<i class="fas fa-file-code fa-lg json-icon"></i>';
    } else if (type === "PDF") {
        convertButton.innerHTML += '<i class="far fa-file-pdf fa-lg"></i>';
    } else if (type === "CSV") {
        convertButton.innerHTML += '<i class="fas fa-file-csv fa-lg csv-icon-green"></i>';
    }

    return convertButton;
}


function convertExcelToPdf(file) {

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    try {
        const reader = new FileReader();
        reader.onload = function () {
            const data = new Uint8Array(reader.result);

            // Usa SheetJS per leggere il file Excel
            const workbook = XLSX.read(data, { type: "array" });

            // Seleziona il primo foglio del file Excel
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Crea una tabella HTML dal foglio Excel
            const htmlTable = XLSX.utils.sheet_to_html(worksheet);

            // Creazione di una pagina HTML completa con la tabella
            const htmlContent = `
        <html>
          <head>
            <style>
              table {
                border-collapse: collapse;
                width: 100%;
              }
              th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
              }
            </style>
          </head>
          <body>
            ${htmlTable}
          </body>
        </html>
      `;

            // Creazione di un iframe nascosto per la stampa
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            document.body.appendChild(iframe);

            // Caricamento del contenuto HTML nell'iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            // Stampa la pagina HTML in un file PDF
            iframe.focus();
            iframe.contentWindow.print();

            // Rimuovi l'iframe dopo la stampa
            setTimeout(() => {
                document.body.removeChild(iframe);

                loader.style.display = "none";

                // Aggiungi l'attività al registro delle attività
                addToActivityList(`File converted to PDF: ${file.name}`);
            }, 1000);
        };

        reader.readAsArrayBuffer(file);
    } catch (error) {
        alert(`Errore durante la conversione in PDF: ${error.message}`);

        loader.style.display = "none";
    }
}

function convertExcelToXml(file) {
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    try {
        const reader = new FileReader();
        reader.onload = function () {
            const data = new Uint8Array(reader.result);

            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // documento XML manualmente
            const xml = document.implementation.createDocument(null, "root");
            const root = xml.documentElement;
            root.setAttribute("xmlns", "http://www.example.com/xmlns");
            root.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
            root.setAttribute("xsi:schemaLocation", "http://www.example.com/xmlns schema.xsd");

            jsonData.forEach((item) => {
                const rowElement = xml.createElement("Row");
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        const columnName = getValidXmlName(key);
                        const cellElement = xml.createElement(columnName);
                        cellElement.textContent = item[key];
                        rowElement.appendChild(cellElement);
                    }
                }
                root.appendChild(rowElement);
            });

            const serializer = new XMLSerializer();
            const xmlString = serializer.serializeToString(xml);

            const xmlBlob = new Blob([xmlString], { type: "text/xml" });
            const xmlBlobURL = URL.createObjectURL(xmlBlob);

            const a = document.createElement("a");
            a.href = xmlBlobURL;
            a.download = "output.xml";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            loader.style.display = "none";

            addToActivityList(`File converted to XML: ${file.name}`);
        };

        reader.readAsArrayBuffer(file);
    } catch (error) {
        alert(`Errore durante la conversione in XML: ${error.message}`);

        loader.style.display = "none";
    }
}


// Funzione per ottenere un nome XML valido
function getValidXmlName(columnName) {
    return columnName.replace(/[^a-zA-Z0-9]/g, "");
}


function convertExcelToJson(file) {

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    const reader = new FileReader();

    reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const firstSheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

        console.log(jsonData);

        // Chiama la funzione downloadJsonFile per scaricare il JSON
        downloadJsonFile(jsonData, "output.json");

        loader.style.display = "none";
    };

    reader.readAsBinaryString(file);
}

function downloadJsonFile(jsonData, fileName) {
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    // Crea un oggetto Blob dal JSON
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });

    // Crea un URL per il Blob
    const jsonBlobURL = URL.createObjectURL(jsonBlob);

    // Crea un elemento "a" per il download
    const a = document.createElement("a");
    a.href = jsonBlobURL;
    a.download = fileName || "download.json";

    a.click();
    // Rilascia l'URL del Blob quando hai finito
    URL.revokeObjectURL(jsonBlobURL);

    loader.style.display = "none";
}

function convertExcelToCsv(file) {

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    const reader = new FileReader();

    reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });


        const firstSheetName = workbook.SheetNames[0];
        const csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);

        // Crea un oggetto Blob dal CSV
        const csvBlob = new Blob([csvData], { type: "text/csv" });

        // Crea un URL per il Blob
        const csvBlobURL = URL.createObjectURL(csvBlob);


        const a = document.createElement("a");
        a.href = csvBlobURL;
        a.download = file.name.replace(/\.[^.]+$/, ".csv"); // Cambia l'estensione del nome del file a .csv
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        loader.style.display = "none";

        addToActivityList(`File converted to CSV: ${file.name}`);
    };

    reader.readAsBinaryString(file);
}

function convertJsonToXml() {
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    const reader = new FileReader();
    reader.onload = function () {
        try {
            const jsonData = JSON.parse(reader.result);

            const xmlString = jsonToXml(jsonData);

            const xmlBlob = new Blob([xmlString], { type: "text/xml" });
            const xmlBlobURL = URL.createObjectURL(xmlBlob);

            const a = document.createElement("a");
            a.href = xmlBlobURL;
            a.download = "output.xml";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(xmlBlobURL);

            loader.style.display = "none";

            addToActivityList(`File converted to XML: ${file.name}`);
        } catch (error) {
            alert(`Error during XML conversion: ${error.message}`);
            loader.style.display = "none";
        }
    };

    reader.readAsText(file);
}

function jsonToXml(json) {
    const xmlItems = json.map((item, index) => {
        const keys = Object.keys(item);
        const itemXml = keys.map((key) => {
            const tagName = key.replace(/[^a-zA-Z_]/g, '_'); // Ensure valid XML tag name
            return `<${tagName}>${item[key]}</${tagName}>`;
        }).join('');
        return `<item_${index}>${itemXml}</item_${index}>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<root xmlns="http://www.example.com/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.example.com/xmlns schema.xsd">
    ${xmlItems}
</root>`;

    return xml;
}

function convertJsonToPdf(file) {
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    try {
        const jsonData = JSON.parse(file);

        const pdfContent = `
            <html>
              <head>
                <style>
                  table {
                    border-collapse: collapse;
                    width: 100%;
                  }
                  th, td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: left;
                  }
                </style>
              </head>
              <body>
                <table>
                  <thead>
                    <tr>
                      ${Object.keys(jsonData[0]).map(key => `<th>${key}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${jsonData.map(item => `<tr>${Object.values(item).map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}
                  </tbody>
                </table>
              </body>
            </html>`;

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(pdfContent);
        iframeDoc.close();

        iframe.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
            document.body.removeChild(iframe);

            loader.style.display = "none";

            addToActivityList(`File converted to PDF: ${file.name}`);
        }, 1000);
    } catch (error) {
        alert(`Error during PDF conversion: ${error.message}`);

        loader.style.display = "none";
    }
}


function startProgressBar() {
    let width = 0;

    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);

            setTimeout(() => {
                activateTab(document.querySelector('.tab-item[data-target="#tab2"]'));
            }, 800);
        } else {
            width++;
            progress.style.width = width + "%";
            progressPercent.textContent = width + "%";
        }
    }, 10);
}

function resetProgressBar() {
    progress.style.width = "0%";
    progressPercent.textContent = "0%";
}

function showProgressBar() {
    const progressContainer = document.querySelector(".progress-container");
    progressContainer.style.display = "flex";
}

function resetTool() {
    // Reset file
    file = null;
    // Reset input
    input.value = null;
    resetProgressBar();
    document.querySelector(".progress-container").style.display = "none";
    // Reset drop area
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop";
    // Remove all files from the file list
    const fileList = document.getElementById("fileList");
    while (fileList.firstChild) {
        fileList.firstChild.remove();
    }
    // Reset files array
    files = [];

    const container = document.querySelector(".container");
    container.style.backgroundColor = "";
}
resetButton.addEventListener("click", resetTool);


function activateTab(tab) {
    const target = tab.dataset.target;
    const tabContent = document.querySelector(target);

    // Disattiva tutte le altre schede e contenuti delle schede
    const allTabs = document.querySelectorAll('.tab-item');
    const allTabContents = document.querySelectorAll('.tab-content');

    for (let i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove('active');
        allTabContents[i].classList.remove('active');
    }

    // Attiva la scheda corrente e il suo contenuto
    tab.classList.add('active');
    tabContent.classList.add('active');
}

const tabs = document.querySelectorAll('.tab-item');
for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () {
        activateTab(tabs[i]);
    });
}

function downloadFile() {
    if (!file) {
        document.getElementById("error-message").innerHTML =
            "Nessun file da scaricare.";
        return;
    }

    if (
        file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
        let fileURL = URL.createObjectURL(file);
        let a = document.createElement("a");
        a.href = fileURL;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        addToActivityList(`File downloaded: ${file.name}`);

    } else {
        const errorMessage = document.getElementById("error-message");
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

function downloadExampleFile() {
    const exampleFileUrl = "https://mega.nz/file/bQ0FzILT#JA7TGe8asPQk3T9-n0FSWoEU7dJHB7TnWwFjpa6hdlg";

    fetch(exampleFileUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Errore durante il download del file di esempio.");
            }
            return response.blob();
        })
        .then((blob) => {
            const fileName = "Example.xlsx";
            downloadXmlFile(blob, fileName);
        })
        .catch((error) => {
            console.error("Errore durante il download del file di esempio: " + error.message);
        });
}
exampleButton.addEventListener('click', downloadExampleFile);

function downloadXmlFile(xmlData, fileName) {
    const blob = new Blob([xmlData], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}

// Events
button.onclick = () => {
    input.click();
};

input.addEventListener("change", function () {
    file = this.files[0];
    dropArea.classList.add("active");
    displayFile();
});

// Funzione per gestire il "drag and drop" dei file
function handleDragAndDrop() {
    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropArea.classList.add("active");
        dragText.textContent = "Release to Upload";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("active");
        dragText.textContent = "Drag & Drop";
    });

    dropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            addFileToList(droppedFile);
            file = droppedFile;  // Imposta il file globale su quello appena trascinato
            displayFile();  
        }
        dropArea.classList.remove("active");
        dragText.textContent = "Drag & Drop";
    });
    
}

handleDragAndDrop();


function toggleTheme() {
    // Controlla lo stato del checkbox per il tema del container
    var containerToggle = document.getElementById("container-toggle");
    var container = document.querySelector(".container");

    if (containerToggle.checked) {
        container.classList.add("dark-mode");
    } else {
        container.classList.remove("dark-mode");
    }
}

function changeContainerColor() {
    var container = document.querySelector('.container');
    var colorInput = document.querySelector('#container-color');
    var color = colorInput.value;
    container.style.backgroundColor = color;
}

// Carica le impostazioni salvate dal Local Storage, se presenti
window.addEventListener('DOMContentLoaded', () => {
    const containerToggle = document.getElementById('container-toggle');
    const containerColor = document.getElementById('container-color');

    // Controlla se esistono impostazioni salvate
    if (localStorage.getItem('darkMode')) {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        containerToggle.checked = darkMode;
        toggleTheme();
    }

    if (localStorage.getItem('containerColor')) {
        const color = localStorage.getItem('containerColor');
        containerColor.value = color;
        changeContainerColor();
    }
    loadSavedActivities();
});

// Salva le impostazioni nel Local Storage al click del bottone "Save Settings"
function saveSettings() {
    const containerToggle = document.getElementById('container-toggle');
    const containerColor = document.getElementById('container-color');

    const darkMode = containerToggle.checked;
    const color = containerColor.value;

    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('containerColor', color);

    // Save activities to localStorage
    const activityRows = document.querySelectorAll("#activityItems tr");
    const savedActivities = Array.from(activityRows).map(row => row.textContent.trim());
    localStorage.setItem("activities", JSON.stringify(savedActivities));
}

function loadSavedActivities() {
    const savedActivities = JSON.parse(localStorage.getItem("activities")) || [];

    savedActivities.forEach((activity) => {
        addToActivityList(activity);
    });
}

function addToActivityList(activity) {
    const activityRow = document.createElement("tr");
    const activityData = document.createElement("td");
    activityData.textContent = activity;
    activityRow.appendChild(activityData);
    activityItems.appendChild(activityRow);
}

clearActivityButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the activity log?")) {
        // Clear the activity log
        activityItems.innerHTML = "";

        // Clear activities from localStorage
        localStorage.removeItem("activities");
    }
});


sortSelect.addEventListener('change', (event) => {
    const selectedProperty = event.target.value;
    sortFilesBy(selectedProperty);
});

sortSelect.addEventListener('click', () => {
    sortDropdown.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    const targetElement = event.target;
    if (!sortDropdown.contains(targetElement)) {
        sortDropdown.classList.remove('open');
    }
});

deleteAllButton.addEventListener("click", () => {
    files = [];
    renderFileList();
});

input.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        addFileToList(file);
        displayFile();
    }
});

deleteAllButton.addEventListener("click", function () {
    tooltip.style.visibility = "hidden";
});

deleteAllButton.addEventListener("mouseover", function () {
    tooltip.style.visibility = "visible";
});
