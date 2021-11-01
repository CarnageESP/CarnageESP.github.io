var host = "http://carnage.sytes.net:60003";
//var host = "http://localhost:5000";
/**
 * Change the state of collapsed block info
 */
function minimizeBlockData(blockId, state) {
    section = getSelectedSection();
    section.blocks.forEach(function (block) {
        if (block.id === blockId) {
            block.collapsed = state;
        }
    });
    saveSection(selSection, section)
}

/**
 * Get the requested section object
 */
function getSection(sectionId) {
    return JSON.parse(localStorage.getItem("section-" + sectionId));
}

/**
 * Get the active sectionId
 */
function getSelectedSectionId() {
    return localStorage.getItem("selectedSection");
}

/**
 * Get the active sectionId
 */
function getSelectedSection() {
    return getSection(getSelectedSectionId());
}

function saveSection(sectionId, section) {
    localStorage.setItem("section-" + sectionId, JSON.stringify(section));
}

function saveSectionAsModified(sectionId, section) {
    markSectionAsModified(sectionId, true);
    saveSection(sectionId, section);
}

function saveCurrentSection(section) {
    saveSectionAsModified(getSelectedSectionId(), section);
}

function setSelectedSection(sectionId) {
    localStorage.setItem("selectedSection", sectionId);
}

function getSectionsList() {
    return JSON.parse(localStorage.getItem("sections"));
}

function saveSectionsList(sections) {
    localStorage.setItem("sections", JSON.stringify(sections));
    syncUserInfo();
}

function addSection(section, imported) {
    //Set Selected
    setSelectedSection(section['id']);
    //Add section
    saveSection(section['id'], section);
    //Add SectionList
    sections = getSectionsList();

    sectionName = "-";
    if (section['name'] != null) {
        sectionName = section['name'];
    }

    if (sections == null) {
        sections = {"sections": [{"id": section['id'], "name": sectionName, "imported": imported}]};
        setSelectedSection(section['id']);
    } else {
        sections.sections.push({"id": section['id'], "name": sectionName, "imported": imported});
        setSelectedSection(section['id']);
    }
    saveSectionsList(sections);
}

function serverLoadData(sectionId, onLoadCallBack){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', host + '/get/' + sectionId, true);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status !== 200) {
                showToast("Error al cargar/importar", "danger");
            }
        }
    }
    xhr.onload = onLoadCallBack;
    xhr.send();
}

function importCloudData(importId) {
    sections = getSectionsList();

    if (sections!==undefined && sections.sections!==undefined){
        for(var i = 0;i<sections.sections.length;i++){
            if (sections.sections[i].id===importId){
                console.log("Cant reimport existing section");
                return;
            }
        }
    }

    serverLoadData(importId, function (e) {
        reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            text = e.target.result;
            response = JSON.parse(text);

            if (response['name'] == null) {
                response['name'] = 'IMPORTED';
            }

            addSection(response, true);

            saveSection(response['id'], response);
            showToast("Import Correcto", "success");
            $("#addedLinkContent").empty();
            $(".column-block").empty();
            repinta();
        });
        reader.readAsText(this.response);
    });
}

function loadCloudData(section) {

    //Check Si modificado desde ultima sincronizacion
    if (isSectionModified(selSection)) {
        if (confirm("MOfigicado quieres guardar igualmente")) {
            console.log("sigo");
        } else {
            return;
        }
    }

    serverLoadData(section.id, function (e) {
        reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            text = e.target.result;
            showToast("Carga OK", "success");
            selSection = getSelectedSectionId();
            //Maintain previous key
            sectionLoaded = JSON.parse(text);
            if (section.key != null) {
                sectionLoaded.key = section.key;
            }
            saveSection(selSection, sectionLoaded);
            $("#addedLinkContent").empty();
            $(".column-block").empty();
            recreate();
        });
        reader.readAsText(this.response);
    });
}

function saveCloudData() {
    selSection = getSelectedSectionId();

    datosBase = getSelectedSection();

    //Update - create key
    sectionKey = undefined;
    sectionsList = getSectionsList();
    for(var i=0;i<sectionsList.sections.length;i++){
        if (sectionsList.sections[i].id===selSection){
            if (sectionsList.sections[i].key == null) {
                if (sectionsList.sections[i].newKey != null) {
                    sectionsList.sections[i].key = sectionsList.sections[i].newKey;
                } else {
                    //Generamos nueva key
                    showToast("AUTOGENKEY", "info");
                    sectionsList.sections[i].key = generateCode(6);
                    sectionKey = sectionsList.sections[i].key;
                }
            }
            sectionKey=sectionsList.sections[i].key;
            break;
        }
    }
    saveSectionsList(sectionsList);

    data = {"id": selectedSection, "key": sectionKey, "data": datosBase}
    $.ajax(host + "/save", {
        data: JSON.stringify(data),
        method: "POST",
        contentType: "application/json",
        success: function () {
            showToast("Guardado Correcto", "success");
            if (datosBase.newKey != null) {
                alert("CAMBIO PASS");
                datosBase.key = datosBase.newKey;
                delete datosBase.newKey;
            }
            saveSection(selectedSection, datosBase);
            markSectionAsModified(selectedSection, false);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //On error try log
            if (errorThrown === 'UNAUTHORIZED') {
                //Limpiamos key
                showToast("Error de autorizacion", "danger");
                delete datosBase.key;
                delete datosBase.newKey;
                saveSection(selectedSection, datosBase);
            } else {
                showToast("Error al guardar", "danger");
            }
            console.log(errorThrown);
        }
    });
}

function removeSection(id) {
    sections = getSectionsList();
    if (sections != null) {
        for (var i = 0; i < sections.sections.length; i++) {
            if (sections.sections[i].id === id) {
                sections.sections.splice(i, 1);
                saveSectionsList(sections);
                break;
            }
        }
    }
    cleanLocalStorage();
}

function cleanLocalStorage() {
    listToRemove = [];
    for (var i = 0, len = localStorage.length; i < len; i++) {
        var key = localStorage.key(i);
        if (key.startsWith("section-")) {
            sections = getSectionsList();
            if (sections != null) {
                found = false;
                for (var x = 0, len2 = sections.sections.length; x < len2; x++) {
                    if (sections.sections[x].id === key.split("section-")[1]) {
                        found = true;
                    }
                }
                if (found === false) {
                    listToRemove.push(key);
                }
            }
        }
    }
    listToRemove.forEach(function (value, index) {
        localStorage.removeItem(value);
    });
}

function serializeSections() {
    sections = {"sections": []};
    $(".nav").each(function (index, data) {
        $(this)
            .children()
            .each(function (index, data) {
                uid = $(this)[0].firstChild.id;
                secName = $(this)[0].firstChild.text;
                sections.sections.push({"id": uid, "name": secName});
            });
    });

    saveSectionsList(sections);
    repinta();
}

function serializeLink(index, data) {
    block = {};
    block.id = $(this).attr("id");
    block.name = $(this).find(".block-name").text();
    element = $(this).next().parent();
    block.position = {column: column};
    block.collapsed = $(this).find(".collapsed").length > 0;
    block.links = [];
    $(this)
        .find(".bookmark-line")
        .each(function (index, data) {
            link = {
                name: $(this).find(".bookmark-name").text(),
                url: $(this).find("a").attr("href"),
            };
            ico = $(this).find("img").attr("src");
            if (!ico.includes("www.google.com/s2/favicons")) {
                link.ico = ico;
            }
            block.links.push(link);
        });
    datos.blocks.push(block);
}

function serializeLinkUnSorted(index, data) {
    $(this)
        .each(function (index, data) {
            link = {
                name: $(this).find(".bookmark-name").text(),
                url: $(this).find("a").attr("href"),
            };
            ico = $(this).find("img").attr("src");
            if (!ico.includes("www.google.com/s2/favicons")) {
                link.ico = ico;
            }
            datos.unsortedLinks.push(link);
        });
}

function serializeData() {
    datos = {blocks: []};
    column = 1;
    let colums = $(".column-block");
    colums.each(function (index, data) {
        $(this)
            .children()
            .each(serializeLink);
        column++;
    });
    //Unsorted links
    datos.unsortedLinks = [];
    let addedLinkContent = $("#addedLinkContent");
    addedLinkContent.find(".bookmark-line")
        .each(serializeLinkUnSorted);

    selSection = getSelectedSectionId();
    if (selSection == null) {
        datos['id'] = uuidv4();
        //TODO
        datos['name'] = "NEW";
        datos['key'] = "KEYNUEVA";
        addSection(datos);
    } else {
        storedData = getSection(selSection);
        storedData['blocks'] = datos['blocks'];
        storedData['unsortedLinks'] = datos['unsortedLinks'];
        markSectionAsModified(selSection, true);
        saveSection(selSection, storedData);
    }

    addedLinkContent.empty();
    colums.empty();
    repinta();
}

function changeKeyOfSection(sectionId, newKey) {
    sectionsList = getSectionsList();
    sectionInfo = undefined;
    for(var i = 0 ;i < sectionsList.sections.length;i++){
        if (sectionsList.sections[i].id === sectionId){
            sectionInfo = sectionsList.sections[i];
            break;
        }
    }

    data = {"id": sectionId, "key": sectionKey, "newkey": newKey}
    $.ajax(host + "/changekey", {
        data: JSON.stringify(data),
        method: "POST",
        contentType: "application/json",
        success: function () {
            showToast("ChangeKey correcto", "success");
            sectionInfo.key=newKey;
            saveSectionsList(sectionsList);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (errorThrown === 'UNAUTHORIZED') {
                //Limpiamos key
                showToast("Error de autorizacion", "danger");

            } else {
                showToast("Error al changekey", "danger");
            }
            console.log(errorThrown);
        }
    });
}

function isSectionModified(sectionId) {
    sections = getSectionsList();
    if (sections != null) {
        for (var i = 0; i < sections.sections.length; i++) {
            if (sections.sections[i].id === sectionId) {
                return sections.sections[i].changed === true;
            }
        }
    }
    return false;
}

function markSectionAsModified(sectionId, isChanged) {
    sections = getSectionsList();
    if (sections != null) {
        for (var i = 0; i < sections.sections.length; i++) {
            if (sections.sections[i].id === sectionId) {
                sections.sections[i].changed = isChanged;
                saveSectionsList(sections);
                break;
            }
        }
    }
}

function cleanSelectedSection() {
    localStorage.removeItem("selectedSection");
}

function restoreUserInfo(){
    if (chrome.storage!==undefined){
        chrome.storage.local.get(["installed"], function(result) {
            //console.log(result);
            if (result.installed===true) {
                chrome.storage.sync.get(["sections"], function (result) {
                    if (result!==undefined && result.sections!==undefined){
                        ezBSAlert({
                            type: "confirm",
                            messageText: "Quieres importar todas las secciones",
                            headerText: "Import all sections",
                            alertType: "primary"
                        }).done(function (e) {
                            if (e){
                                result.sections.sections.forEach(sec => {
                                    console.log(sec.id);
                                    importCloudData(sec.id);
                                });
                            }
                            chrome.storage.local.set({"installed": false}, function () {
                                //console.log("deleted installed");
                            });
                        });
                    }
                });
            }
        });
    }
}

function syncUserInfo(){
    console.log("sync...");
    value = getSectionsList();
    if (chrome.storage!==undefined){
        chrome.storage.sync.set({"sections": value}, function() {
            console.log('Value is set to ' + value);
        });
    }
}




