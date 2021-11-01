self.onmessage = function(event) {
    console.log(event);
};

chrome.runtime.onInstalled.addListener(function() {
   console.log("Installed");
    chrome.storage.local.set({"installed": true}, function() {
        console.log('Value is set to true');
    });
});

function processResponse(message, sender) {
    if (message.command === "respuesta"){
        console.log(message);
    }
}

chrome.runtime.onMessage.addListener(processResponse);


// A generic onclick callback function.
function genericOnClick(info, tab) {

    if (info !== undefined){
        titulo=tab.title;
        url=tab.url;
        favicon=tab.favIconUrl;
        if (info.linkUrl!==undefined){
            titulo=info.linkUrl;
            url=info.linkUrl;
            favicon=undefined;
        }

        chrome.storage.local.get(['contextAdded'], function(result) {
            var contextAdded = [];
            if (result != null && result.contextAdded!=null){
                contextAdded = result.contextAdded;
            }
            if (info.parentMenuItemId == null && !info.menuItemId.startsWith('default')) {
                contextAdded.push({"id": "unsortedLinks", "section": info.menuItemId, "url": url, "ico": favicon, "name": titulo});
            } else {
                contextAdded.push({"id": info.menuItemId, "section": info.parentMenuItemId, "url": url, "ico": favicon, "name": titulo});
            }

            chrome.storage.local.set({"contextAdded": contextAdded}, function() {
                //Save added Links and try to notify new tab to processPending
                chrome.runtime.sendMessage({"command":"processPending"});
            });
        });

    }
}


//Create default contextMenu
chrome.contextMenus.remove("defaultPage");
chrome.contextMenus.remove("defaultLink");
chrome.contextMenus.create({"id": "defaultPage", "title": "Add page to casita", "contexts": ['page']});
chrome.contextMenus.create({"id": "defaultLink", "title": "Add Link to casita", "contexts": ['link']});
chrome.contextMenus.onClicked.addListener(genericOnClick);


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

});

/*EXPERIMENTAL*/

/*chrome.identity.getProfileUserInfo(function (info) {
    console.log(info.email + " " + info.id);
});*/

/*chrome.bookmarks.getTree(function callback(data) {
    console.log('Booksmarks' + data);
    exploreBookmarkChild(data, 1)
})*/

/*function exploreBookmarkChild(element, level) {
    for (d in element) {
        if (element[d].children === undefined) {
            console.log(element[d].title + ' ' + element[d].url);
        } else {
            console.log('Level ' + level + '---------------------------' + element[d].title);
            exploreBookmarkChild(element[d].children, level + 1);
        }
    }

}*/