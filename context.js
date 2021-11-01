/* ------ Context Menu ---- */
function selectElementContents(el) {
    let range = document.createRange();
    range.selectNodeContents(el);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

/**
 * Block menu
 */
$(function () {
    $.contextMenu({
        selector: ".context-menu-block",
        callback: function (key, options) {
            if (key === "edit") {
                $(this).next().attr("contentEditable", "true");
                $(this).next().focus();
                let el = $(this).next()[0];
                requestAnimationFrame(function () {
                    selectElementContents(el);
                });
                $(this)
                    .next()
                    .keydown(function (e) {
                        if (e.keyCode === 13) {
                            $(this).attr("contentEditable", "false");
                            serializeData();
                            createContextMenus();
                            return false;
                        }
                    });
            }
            if (key === "delete") {
                $(this).parent().parent().remove();
                serializeData();
                createContextMenus();
            }
            if (key === "openall") {
                $(this).parent().parent().find(".block-content").children().each(function () {
                    window.open($(this).children()[1].getAttribute("href"),"_blank");
                });
            }
        },
        items: {
            edit: { name: "Rename", icon: "edit" },
            openall: { name: "Open All"},
            delete: { name: "Delete", icon: "delete" },
            sep1: "---------",
            quit: {
                name: "Close",
                icon: function () {
                    return "context-menu-icon context-menu-icon-quit";
                },
            },
        },
    });
});

/**
 * Link menu
 */
$(function () {
    $.contextMenu({
        selector: ".context-menu-link",
        callback: function (key, options) {
            if (key === "edit") {
                $(this).next().attr("contentEditable", "true");
                $(this).next().focus();
                let el = $(this).next()[0];
                requestAnimationFrame(function () {
                    selectElementContents(el);
                });
                $(this)
                    .next()
                    .keydown(function (e) {
                        if (e.keyCode === 13) {
                            $(this).attr("contentEditable", "false");
                            serializeData();
                            return false;
                        }
                    });
            }
            if (key === "delete") {
                $(this).parent().remove();
                serializeData();
            }
            if (key === "icon") {
                ezBSAlert({
                    type: "prompt",
                    messageText: "Type url of icon to use",
                    headerText: "Icon change",
                    alertType: "primary"
                }).done(function (e) {
                    $(this).find("img").attr("src", e);
                    serializeData();
                });
            }
        },
        items: {
            edit: { name: "Rename", icon: "edit" },
            icon: { name: "Icon", icon: "icon" },
            delete: { name: "Delete", icon: "delete" },
            sep1: "---------",
            quit: {
                name: "Close",
                icon: function () {
                    return "context-menu-icon context-menu-icon-quit";
                },
            },
        },
    });
});

/**
 * Section menu
 */
$(function () {
    $.contextMenu({
        selector: ".context-menu-section",
        callback: function (key, options) {
            if (key === "edit") {
                $(this).attr("contentEditable", "true");
                $(this).focus();
                var el = $(this)[0];
                requestAnimationFrame(function () {
                    selectElementContents(el);
                });
                $(this)
                    .keydown(function (e) {
                        if (e.keyCode === 13) {
                            $(this).attr("contentEditable", "false");
                            serializeSections();
                            return false;
                        }
                    });
            }
            if (key === "delete") {
                selSection = getSelectedSectionId();
                if (selSection === $(this)[0].firstChild.id){
                    cleanSelectedSection();
                }
                removeSection($(this)[0].firstChild.id);
                $(this).remove();
                serializeSections();
                createContextMenus();
            }
            if (key === "key") {
                blockId = $(this)[0].firstChild.id;
                ezBSAlert({
                    type: "prompt",
                    messageText: "Type new key",
                    headerText: "Change key",
                    alertType: "primary"
                }).done(function (e) {
                    changeKeyOfSection(blockId, e);
                });
            }
            if (key === "share") {
                var text = "http://casita.add/"+$(this)[0].firstChild.id;
                navigator.clipboard.writeText(text).then(function() {
                    showToast("Copying to clipboard was successful!\n"+text, "info");
                }, function(err) {
                    console.error('Async: Could not copy text: ', err);
                });
            }
        },
        items: {
            edit: { name: "Rename", icon: "edit" },
            key: { name: "ChangeKey" },
            share: { name: "Share"},
            delete: { name: "Delete", icon: "delete" },
            sep1: "---------",
            quit: {
                name: "Close",
                icon: function () {
                    return "context-menu-icon context-menu-icon-quit";
                },
            },
        },
    });
});

/**
 * Create Chrome context menu to add links
 */
function createContextMenus(){
    if (chrome.contextMenus!=null){
        chrome.contextMenus.removeAll();
        selSection = getSelectedSectionId();

        sections = getSectionsList();

        if (sections!=null) {
            unactiveSections = [];
            for (var i = 0; i < sections.sections.length; i++) {
                if (sections.sections[i].id === selSection){
                    if (chrome.contextMenus!==undefined){
                        mainSectionBlocks = [];
                        blocks = getSection(selSection);
                        var parent = chrome.contextMenus.create({"id": sections.sections[i].id, "title": sections.sections[i].name, "contexts": ['page', 'link']});
                        for (var t = 0; t < blocks.blocks.length; t++) {
                            if (blocks.blocks[t].id === undefined){
                                return null;
                            }
                            mainSectionBlocks.push({"id": blocks.blocks[t].id, "title": blocks.blocks[t].name, "contexts": ['page', 'link'], "parentId": parent});

                        }
                        chrome.contextMenus.create({"id": sections.sections[i].id+"Unsorted", "title": "Unsorted", "contexts": ['page', 'link'], "parentId": parent});
                        if (mainSectionBlocks){
                            mainSectionBlocks.sort((a,b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? 1 : ((b.title.toUpperCase() > a.title.toUpperCase()) ? -1 : 0));
                            mainSectionBlocks.forEach(value => chrome.contextMenus.create(value));
                        }
                    }
                } else {
                    if (chrome.contextMenus!==undefined){
                        unactiveSections.push({"id": sections.sections[i].id, "title": sections.sections[i].name, "contexts": ['page', 'link']});
                    }
                }
            }
            if (unactiveSections){
                unactiveSections.sort((a,b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? 1 : ((b.title.toUpperCase() > a.title.toUpperCase()) ? -1 : 0));
                unactiveSections.forEach(value => chrome.contextMenus.create(value));
            }
        }
    }
}