var tabTitle;
var tabUrl;

function currentTab(tab){
    tabTitle = tab[0].title;
    tabFavICon = tab[0].favIconUrl;
    tabUrl = tab[0].url;

    titleInput = $("#title");
    titleInput.val(tabTitle);
    titleInput.select();
    titleInput.focus();
    titleInput.keydown(function (e) {
        if (e.keyCode === 13) {
            addUrl(tabUrl, $("#title").val(), tabFavICon, $("#sectionSelect").val(), $("#blockSelect").val());
            window.close();
            return false;
        }
    });

    $("#addLink").off();
    $("#addLink").click(function () {
        addUrl(tabUrl, $("#title").val(), tabFavICon, $("#sectionSelect").val(), $("#blockSelect").val());
        window.close();
    });

    $("#sectionSelect").change(function (e) {
        console.log("change section");
        sectionId = $(this).val();
        createDropDownBlocks(sectionId);
    });

    $("#blockSelect").change(function (e) {
        console.log("change block");
    });

    function addUrl(url, title, icon, sectionId, blockId){
        console.log(sectionId);
        console.log(blockId);
        if (sectionId!==null && blockId!==null){
            section = getSection(sectionId);
            added=false;
            for(var i=0;i<section.blocks.length;i++){
                if (section.blocks[i].id==blockId){
                    section.blocks[i].links.push({
                        "name": title,
                        "url": url,
                        "ico": icon
                    })
                    added=true;
                    saveSection(sectionId, section);
                    break;
                }
            }
            if (!added){
                section.unsortedLinks.push({
                    "name": title,
                    "url": url,
                    "ico": icon
                })
                saveSection(sectionId, section);
            }
        }else{
            datosBase = getSelectedSection();
            datosBase.unsortedLinks.push({
                "name": title,
                "url": url,
                "ico": icon
            });
            saveCurrentSection(datosBase);
        }
        chrome.runtime.sendMessage({comando: "forceRefresh"});
    }
}

function createDropDownBlocks(sectionId){
    console.log(sectionId);
    section = getSection(sectionId);
    console.log(section);
    $('#blockSelect').empty();

    mainSectionBlocks = [];

    for (var t = 0; t < section.blocks.length; t++) {
        if (section.blocks[t].id === undefined) {
            return null;
        }
        mainSectionBlocks.push({
            "id": section.blocks[t].id,
            "title": section.blocks[t].name,
            "contexts": ['page', 'link'],
            "parentId": parent
        });

    }
    //chrome.contextMenus.create({"id": sections.sections[i].id+"Unsorted", "title": "Unsorted", "contexts": ['page', 'link'], "parentId": parent});

    $('#blockSelect').append($('<option>', {
        value: 'Unsorted',
        text: 'Unsorted'
    }));

    if (mainSectionBlocks) {
        mainSectionBlocks.sort((a, b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? 1 : ((b.title.toUpperCase() > a.title.toUpperCase()) ? -1 : 0));
        mainSectionBlocks.forEach(value => {
            $('#blockSelect').append($('<option>', {
                value: value.id,
                text: value.title
            }));
        });
    }
}

function createDropDowns(){
    selSection = getSelectedSectionId();

    $('#sectionSelect').empty();

    sections = getSectionsList();

    if (sections!=null) {
        unactiveSections = [];
        for (var i = 0; i < sections.sections.length; i++) {
            if (sections.sections[i].id === selSection) {
                $('#sectionSelect').append($('<option>', {
                    value: sections.sections[i].id,
                    text: sections.sections[i].name
                }));
                createDropDownBlocks(sections.sections[i].id);
            } else {
                unactiveSections.push({
                    "id": sections.sections[i].id,
                    "title": sections.sections[i].name,
                    "contexts": ['page', 'link']
                });
            }
        }
        if (unactiveSections) {
            unactiveSections.sort((a, b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? 1 : ((b.title.toUpperCase() > a.title.toUpperCase()) ? -1 : 0));
            unactiveSections.forEach(value => {
                console.log(value);
                $('#sectionSelect').append($('<option>', {
                    value: value.id,
                    text: value.title
                }));
            });
        }
    }
}

$(document).ready(function () {
    var query = { active: true, currentWindow: true };
    if (chrome.tabs !==undefined){
        chrome.tabs.query(query, currentTab);

        createDropDowns();
    }
});