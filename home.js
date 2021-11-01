/*function getFavicon(url){
  var favicon = undefined;
  var nodeList = document.getElementsByTagName("link");
  for (var i = 0; i < nodeList.length; i++)
  {
      if((nodeList[i].getAttribute("rel") == "icon")||(nodeList[i].getAttribute("rel") == "shortcut icon"))
      {
          favicon = nodeList[i].getAttribute("href");
      }
  }
  return favicon;        
}*/

function addUrlLink(url) {
  domain = url
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "")
    .split(/[/?#]/)[0];

  //favicon = getFavicon(url);
  addElement("addedLink", domain, url, null);
}

function processResponse(message, sender) {
  if (message.command === "sections"){
    chrome.runtime.sendMessage({"command":"respuesta", "data": "data"});
  } else if (message.command === "processPending"){
    processPendingAdded();
  }
}

function processPendingAdded() {
  if (chrome.storage!=null){
    chrome.storage.local.get(['contextAdded'], function(result) {
      if (result.contextAdded!=null){
        result.contextAdded.forEach(function (link){
          l = {
            name: link.name,
            url: link.url,
            ico: link.ico
          };
          if (link.section!=null){
            section = getSection(link.section);
            added = false;
            for (var i = 0;i<section.blocks.length;i++){
              if (section.blocks[i].id === link.id){
                section.blocks[i].links.push(l);
                added=true;
                break;
              }
            }
            if (!added){
              section.unsortedLinks.push(l);
            }
            saveSectionAsModified(link.section, section);
          }else{
            section = getSelectedSection();
            section.unsortedLinks.push(l);
            saveCurrentSection(section);
          }
        });
        chrome.storage.local.remove(['contextAdded']);
      }
      doAfterPending();
    });
  } else {
    doAfterPending();
  }

}

function doAfterPending(){
  createContextMenus();
  repinta();
  createSortableBlock(
      $("#addedLinkContent")[0],
      "links",
      "blue-background-class",
      ".bookmark-icon",
  );

  createSortableBlock(column1, "blocks", "blue-background-class", ".block-icon");
  createSortableBlock(column2, "blocks", "blue-background-class", ".block-icon");
  createSortableBlock(column3, "blocks", "blue-background-class", ".block-icon");
  createSortableBlock(column4, "blocks", "blue-background-class", ".block-icon");
  createSortableBlock(column5, "blocks", "blue-background-class", ".block-icon");
  createSortableBlock(column6, "blocks", "blue-background-class", ".block-icon");

  createSortableSection(sectionsBar, "sections", "blue-background-class", ".nav-sortable");
}

function addSectionBtn(){
  ezBSAlert({
    type: "prompt",
    messageText: "type section name to add",
    headerText: "Add Section",
    alertType: "primary"
  }).done(function (secName) {
    sections = getSectionsList();
    if (sections == null){
      uid = uuidv4()
      sections = {"sections": [{"id": uid, "name": secName}]};
      setSelectedSection(uid);
      saveSection(uid, {"id": uid, "name": secName, "blocks": [], "unsortedLinks": []});
    }else{
      uid = uuidv4()
      sections.sections.push({"id": uid, "name": secName});
      setSelectedSection(uid);
      saveSection(uid, {"id": uid, "name": secName, "blocks": [], "unsortedLinks": []});
    }
    saveSectionsList(sections);
    createContextMenus();
    repinta();
  });
}

if (window.document.URL.startsWith("chrome-extension")){
  document.title = "🏠 " + document.title;
}

/* ------ Document Ready ---- */
$(document).ready(function () {
  restoreUserInfo();

  //Check if has pending links to add from worker
  processPendingAdded();

  //Add listener for refresh
  /*if (chrome.runtime!=null){
    chrome.runtime.onMessage.addListener(processResponse);
  }*/

  $("#saveData").click(function () {
    serializeData();
  });

  $("#optionMenuClose").click(function () {
    closeNav()
  });

  $("#options").click(function () {
    sideNavHeight = document.getElementById("optionMenu").style.height
    if (sideNavHeight==="0px" || sideNavHeight===""){
      openNav();
    }else{
      closeNav()
    }
  });

  $("#addLink").click(function () {
    ezBSAlert({
      type: "prompt",
      messageText: "Type Webpage to add",
      headerText: "Add link",
      alertType: "primary"
    }).done(function (e) {
      addUrlLink(e);
      serializeData();
    });
  });

  $("#addBlock").click(function () {

    ezBSAlert({
      type: "prompt",
      messageText: "Type blockName to add",
      headerText: "Add block",
      alertType: "primary"
    }).done(function (e) {
      addBlock(uuidv4(), e, 1, false);
      serializeData();
      createContextMenus();
    });
  });

  $("#saveCloudData").click(function () {
    saveCloudData();
  });

  $("#importCloudData").click(function () {

    ezBSAlert({
      type: "prompt",
      messageText: "type id of section to add",
      headerText: "Import section",
      alertType: "primary"
    }).done(function (e) {
      importCloudData(e);
    });
  });

  $("#addSection").click(function () {
    addSectionBtn();
  });

  $("#restoreCloudData").click(function () {
    loadCloudData(getSelectedSection());
  });

  //COmprobar parametro importar
  toImport = getUrlParameter('import');
  if (toImport !== false){
    importCloudData(toImport);
  }

  $("#themes").change(function (a) {
    loadStylesheet(this.value+".css")
  });

  theme = localStorage.getItem("theme");
  if (theme!==null && theme!=="default"){
    loadStylesheet(theme);
  }
});

function openNav() {
  document.getElementById("optionMenu").style.height = "190px";
}

function closeNav() {
  document.getElementById("optionMenu").style.height = "0";
}

/*if (chrome.runtime !== undefined){
  chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        if (request.comando === "forceRefresh") {
          $(".column-block").empty();
          $("#addedLinkContent").empty();
          showToast("recreate","info");
          recreate();
          sendResponse({comando: "forceRefreshRecibed"});
        } else if (request.comando === "save"){
          console.log("toca guardar");
        }
      });
}*/
