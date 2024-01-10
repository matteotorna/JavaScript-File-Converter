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

const maxFileNameLength = 20;

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
        listItem.textContent = `${file.name.substring(0, maxFileNameLength)}${file.name.length > maxFileNameLength ? '...' : ''} - ${(file.size / 1024).toFixed(2)} KB`;

        const fileActionButtons = document.createElement("div");
        fileActionButtons.classList.add("file-action-buttons");

        const convertButtonXml = createConvertButton(file, "XML");
        const convertButtonJson = createConvertButton(file, "JSON");
        const convertButtonPdf = createConvertButton(file, "PDF");
        const convertButtonCsv = createConvertButton(file, "CSV");
        const convertButtonXlsx = createConvertButton(file, "XLSX");

        const removeButton = document.createElement("button");
        removeButton.innerHTML = '<i class="fas fa-trash-alt fa-lg trash-icon"></i>';
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
        convertButtonXlsx.title = "XLSX"
        removeButton.title = "Delete";

        fileActionButtons.appendChild(convertButtonXml);
        fileActionButtons.appendChild(convertButtonXlsx);
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
        } else if (file.extension === "pdf") {
            convertButtonPdf.style.display = "none";
        } else if (file.extension === "xlsx") {
            convertButtonXlsx.style.display = "none";
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
            "text/xml",
            "application/pdf"
        ];

        if (!validExtensions.includes(fileType)) {
            alert("Formato file non valido. Caricare solo file Excel, JSON, CSV o XML.");
            dropArea.classList.remove("active");
            resetProgressBar();
            return;
        }

        startProgressBar();
        showProgressBar();

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
            } else if (file.extension === "xlsx") {
                convertExcelToXml(file);
            } else if (file.extension === "csv") {
                convertCsvToXml(file);
            } else if (file.extension === "pdf") {
                convertPdfToXml(file);
            }

        } else if (type === "PDF") {

            if (file.extension === "json") {
                const reader = new FileReader();
                reader.onload = () => {
                    const jsonData = JSON.stringify(JSON.parse(reader.result), null, 2);
                    convertJsonToPdf(jsonData, file.name.replace(".json", ".pdf"));
                };
                reader.readAsText(file);
            } else if (file.extension === "xlsx") {
                convertExcelToPdf(file);
            } else if (file.extension === "xml") {
                convertXmlToPdf(file);
            } else if (file.extension === "csv") {
                convertCsvToPdf(file);
            }

        } else if (type === "CSV") {

            if (file.extension === "json") {
                const reader = new FileReader();
                reader.onload = () => {
                    const jsonData = JSON.parse(reader.result);
                    convertJsonToCsv(jsonData);
                };
                reader.readAsText(file);
            } else if (file.extension === "xlsx") {
                convertExcelToCsv(file);
            } else if (file.extension === "xml") {
                convertXmlToCsv(file);
            } else if (file.extension === "pdf") {
                convertPdfToCsv(file);
            }

        } else if (type === "XLSX") {

            if (file.extension === "json") {
                const reader = new FileReader();
                reader.onload = () => {
                    const jsonData = JSON.parse(reader.result);
                    convertJsonToExcel(jsonData);
                };
                reader.readAsText(file);
            } else if (file.extension === "xml") {
                convertXmlToExcel(file);
            } else if (file.extension === "csv") {
                convertCsvToExcel(file);
            } else if (file.extension === "xlsx") {
                convertPdfToExcel(file);
            }

        } else if (type === "JSON") {

            if (file.extension === "xlsx") {
                convertExcelToJson(file);
            } else if (file.extension === "xml") {
                convertXmlToJson(file);
            } else if (file.extension === "csv") {
                convertCsvToJson(file);
            } else if (file.extension === "pdf") {
                convertPdfToJson(file);
            }
        }
    });

    if (type === "XML") {
        convertButton.innerHTML += '<i class="fas fa-file-code fa-lg xml-icon"></i>';
    } else if (type === "JSON") {
        convertButton.innerHTML += '<i class="fas fa-file-code fa-lg json-icon"></i>';
    } else if (type === "PDF") {
        convertButton.innerHTML += '<i class="far fa-file-pdf fa-lg"></i>';
    } else if (type === "CSV") {
        convertButton.innerHTML += '<i class="fas fa-file-csv fa-lg csv-icon"></i>';
    } else if (type === "XLSX") {
        convertButton.innerHTML += '<i class="fas fa-file-excel fa-lg excel-icon"></i>';
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

            // Estrai dati dalla worksheet
            const dataJson = XLSX.utils.sheet_to_json(worksheet);

            // Creazione di una pagina HTML ben strutturata
            const htmlContent = `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                p {
                  color: #black;
                }
              </style>
            </head>
            <body>
              
              ${generateHtmlFromData(dataJson)}
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

function generateHtmlFromData(data) {
    let html = "";
    for (const row of data) {
        html += "<p>";
        for (const key in row) {
            html += `<strong>${key}:</strong> ${row[key]}<br>`;
        }
        html += "</p>";
    }
    return html;
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
            const xml = document.implementation.createDocument(null, "root");
            const root = xml.documentElement;
            root.setAttribute("xmlns", "http://www.example.com/xmlns");
            root.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");

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
        a.download = file.name.replace(/\.[^.]+$/, ".csv");
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
            const tagName = key.replace(/[^a-zA-Z_]/g, '_');
            return `<${tagName}>${item[key]}</${tagName}>`;
        }).join('');
        return `<item_${index}>${itemXml}</item_${index}>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<root xmlns="http://www.example.com/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
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
                  body {
                    font-family: Arial, sans-serif;
                  }
                  .item {
                    margin-bottom: 10px;
                  }
                  .key {
                    font-weight: bold;
                    display: inline-block;
                    width: 100px;
                  }
                </style>
              </head>
              <body>
                ${jsonData.map(item => `
                  <div class="item">
                    ${Object.entries(item).map(([key, value]) => `
                      <div class="key">${key}:</div>
                      <div class="value">${value}</div>
                    `).join('')}
                  </div>
                `).join('')}
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

function convertJsonToExcel(jsonData) {

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Foglio1");

    XLSX.writeFile(workbook, "output.xlsx");

    loader.style.display = "none";

    addToActivityList(`File converted to Excel: ${file.name}`);

}

function convertJsonToCsv(jsonData) {

    const loader = document.getElementById("loader");
    loader.style.display = "block";

    const csvData = json2csv.parse(jsonData);

    const csvBlob = new Blob([csvData], { type: "text/csv" });

    const csvUrl = URL.createObjectURL(csvBlob);

    const link = document.createElement("a");
    link.href = csvUrl;
    link.download = "output.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    loader.style.display = "none";

    addToActivityList(`File converted to CSV: ${file.name}`);
}

function convertXmlToPdf(xml) {
    const html = xmlToHtml(xml);

    const pdfContent = `
      <html>
        <body> 
          ${html}
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
    iframeDoc.write(pdfContent);
    iframeDoc.close();

    // Stampa la pagina HTML in un file PDF
    iframe.focus();
    iframe.contentWindow.print();

    // Rimuovi l'iframe dopo la stampa
    setTimeout(() => {
        document.body.removeChild(iframe);

        loader.style.display = "none";

        addToActivityList("File XML convertito in PDF");
    }, 1000);
}

function convertXmlToExcel(xml) {
    const json = convertXmlToJson(xml);

    convertJsonToExcel(json);

    addToActivityList("File XML convertito in Excel");
}

function convertXmlToCsv(xml) {
    const json = convertXmlToJson(xml);

    convertJsonToCsv(json);

    addToActivityList("File XML convertito in CSV");
}

function convertXmlToJson(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");

    const jsonObj = xmlToJsonRecurse(xmlDoc);

    return JSON.stringify(jsonObj);
}

function xmlToJsonRecurse(xmlNode) {
    const jsonNode = {};

    if (xmlNode.nodeName === "#text") {
        jsonNode.value = xmlNode.textContent;
        return jsonNode;
    }

    jsonNode.name = xmlNode.nodeName;

    xmlNode.childNodes.forEach(childNode => {
        if (jsonNode[childNode.nodeName] === undefined) {
            jsonNode[childNode.nodeName] = [];
        }
        jsonNode[childNode.nodeName].push(xmlToJsonRecurse(childNode));
    });

    return jsonNode;
}

function xmlToHtml(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");

    let html = `<table>`;

    for (let node of xmlDoc.documentElement.childNodes) {
        html += `<tr>`;
        for (let childNode of node.childNodes) {
            html += `<td>${childNode.nodeName}</td><td>${childNode.textContent}</td>`
        }
        html += `</tr>`;
    }

    html += `</table>`;

    return html;
}

function convertCsvToJson(csvFile) {

    const reader = new FileReader();

    reader.onload = (event) => {
        const csvData = event.target.result;

        const lines = csvData.split("\n");

        lines.shift();

        const jsonData = [];

        lines.forEach(line => {
            const values = line.split(",");

            const obj = {};
            values.forEach((value, index) => {
                obj[getJsonKey(index)] = value;
            });

            jsonData.push(obj);

        });

        downloadJsonFile(jsonData, csvFile.name.replace(/\.[^/.]+$/, ".json"));
    };

    reader.readAsText(csvFile);
}

function getJsonKey(index) {
    return "col_" + index;
}

function convertCsvToXml(csvFile) {

    const reader = new FileReader();

    reader.onload = (event) => {
        const csvData = event.target.result;

        const lines = csvData.split("\n");

        // Rimuovi intestazione
        lines.shift();

        let xmlData = `<?xml version="1.0" encoding="UTF-8"?>
                    <root>`;

        lines.forEach(line => {
            xmlData += csvLineToXml(line);
        });

        xmlData += `</root>`;

        downloadXmlFile(xmlData, csvFile.name.replace(/\.[^/.]+$/, ".xml"));
    };

    reader.readAsText(csvFile);
}

function csvLineToXml(csvLine) {
    const values = csvLine.split(",");

    let lineXml = `<row>`;

    values.forEach((value, index) => {
        lineXml += `\n <col_${index}>${value}</col_${index}>`;
    });

    lineXml += `\n</row>`;

    return lineXml;
}

function convertCsvToExcel(csvFile) {

    const reader = new FileReader();

    reader.onload = (event) => {
        const csvData = event.target.result;

        const lines = csvData.split("\n");

        // Rimuovi intestazione
        lines.shift();

        const jsonData = [];

        lines.forEach(line => {
            jsonData.push(csvLineToJson(line));
        });

        convertJsonToExcel(jsonData);
    };

    reader.readAsText(csvFile);
}

function csvLineToJson(csvLine) {
    const values = csvLine.split(",");

    const obj = {};

    values.forEach((value, index) => {
        obj[getJsonKey(index)] = value;
    });

    return obj;
}

function getJsonKey(index) {
    return "col_" + index;
}

function convertCsvToPdf(csvFile) {

    const reader = new FileReader();

    reader.onload = (event) => {
        const csvData = event.target.result;

        const html = csvToHtmlTable(csvData);

        // Genera PDF da HTML
        const pdfDoc = htmlToPdf(html);
        downloadPdfFile(pdfDoc, csvFile.name.replace(/\.[^/.]+$/, ".pdf"));

    };

    reader.readAsText(csvFile);

}

function htmlToPdf(html) {
    const iframe = document.createElement('iframe');
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    iframe.contentDocument.write(html);

    iframe.focus();
    iframe.contentWindow.print();

    return iframe.contentDocument.body.firstElementChild;

}

function downloadPdfFile(pdfDoc, fileName) {
    const pdfBlob = new Blob([pdfDoc], { type: "application/pdf" });

    const pdfUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function csvToHtmlTable(csvData) {

    const lines = csvData.split("\n");

    // Rimuovi intestazione
    lines.shift();

    let html = `<table>`;

    lines.forEach(line => {
        html += `\n<tr>` + csvLineToHtml(line) + `</tr>`;
    });

    html += `\n</table>`;

    return html;
}

function csvLineToHtml(csvLine) {
    const values = csvLine.split(",");

    let html = "";
    values.forEach((value, index) => {
        html += `<td>${value}</td>`;
    });

    return html;
}

async function extractTextFromPdf(pdfFile) {

    const reader = new FileReader();
    const pdfData = await new Promise(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(pdfFile);
    });

    const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;

    let pdfText = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {

        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        pdfText += textContent.items.map(item => item.str).join(' ');

    }

    return pdfText;

}

async function convertPdfToXml(pdfFile) {

    const pdfText = await extractTextFromPdf(pdfFile);
    const xml = `<pdf>${pdfText}</pdf>`;
    downloadXml(xml);

}

async function convertPdfToXlsx(pdfFile) {

    const pdfText = await extractTextFromPdf(pdfFile);
    const worksheet = XLSX.utils.aoa_to_sheet([[pdfText]]);
    XLSX.writeFile(worksheet, 'pdfData.xlsx');

}

async function convertPdfToCsv(pdfFile) {

    const pdfText = await extractTextFromPdf(pdfFile);
    const csv = `"${pdfText}"`;
    downloadCsv(csv);

}

async function convertPdfToJson(pdfFile) {

    const pdfText = await extractTextFromPdf(pdfFile);
    const json = { text: pdfText };
    downloadJson(json);

}

function downloadXml(data, filename = 'pdfdata.xml') {
    const blob = new Blob([data], { type: 'text/xml' });

    const a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/xml', a.download, a.href].join(':');

    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: false,
        view: window
    });

    a.dispatchEvent(clickEvent);
}

function downloadXlsx(data, filename = 'pdfdata.xlsx') {

    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

}

function downloadCsv(data, filename = 'pdfdata.csv') {

    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

}

function downloadJson(data, filename = 'pdfdata.json') {

    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

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
            const validExtensions = ["xml", "json", "xlsx", "csv", "pdf"];
            const fileExtension = droppedFile.name.split('.').pop().toLowerCase();
            if (!validExtensions.includes(fileExtension)) {
                alert("Formato file non valido!");
                return;
            }

            addFileToList(droppedFile);
            file = droppedFile;
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
