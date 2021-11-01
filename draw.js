/* ------ Build Menus ---- */
function addBlock(id, name, column, collapsed) {
    if (id === undefined){
        return null;
    }
    classCollapse = collapsed === true ? " collapsed" : "";
    $("#column" + column).append(
        '<div id="' +
        id +
        '" class="block"><div class="block-title"><div class="block-icon">◾️</div><div class="block-options context-menu-block">➖</div><div class="block-name">' +
        name +
        '</div></div><div id="' +
        id +
        'Content" class="block-content' +
        classCollapse +
        '"></div></div>'
    );
    new Sortable($("#" + id + "Content")[0], {
        group: "links",
        animation: 150,
        ghostClass: "blue-background-class",
        handle: ".bookmark-icon",
        onUpdate: function (event) {
            serializeData();
        },
        onAdd: function (event) {
            serializeData();
            createContextMenus();
        }
    });
    $("#" + id)
        .find(".block-options")
        .click(function () {
            $(this).parent().next().toggleClass("collapsed");
            collapsed = $(this).parent().next().hasClass("collapsed");
            blockId = $(this).parent().parent()[0].id
            minimizeBlockData(blockId, collapsed);
        });
}

function addElement(block, name, url, icon) {
    iconImg = "https://www.google.com/s2/favicons?domain=" + url;
    if (icon != null) {
        iconImg = icon;
    }
    $("#" + block + "Content").append(
        '<div class="bookmark-line"><div class="bookmark-icon context-menu-link"><img src = "' +
        iconImg +
        '"></div><a href="' +
        url +
        '"><div class="bookmark-name">' +
        name +
        "</div></a></div>"
    );
}

function changeSection() {
    setSelectedSection(this.firstChild.id);
    createContextMenus();
    repinta();
}

function repinta() {
    limpia();
    recreateNav();
    recreate();
}

function limpia() {
    $("#addedLinkContent").empty();
    $(".column-block").empty();
}

function recreateNav() {
    selectedSection = getSelectedSectionId();
    //Clear existing
    $(".nav-item").remove();

    sections = getSectionsList();
    if (sections != null) {
        sections.sections.forEach(function (section) {
            active = ''
            if (selectedSection === section.id) {
                active = ' active'
            }
            var prefixName = "";
            if (section.imported) {
                prefixName = "👥 ";
            }
            navItem = $('<li class="nav-item context-menu-section"><a id= ' + section.id + ' class="nav-link nav-sortable' + active + '" href="#">' + prefixName + section.name + '</a></li>');
            $(".nav").append(navItem);
            navItem.click(changeSection);
        });
    }
}

function recreate() {
    selSection = getSelectedSectionId();
    datosBase = getSection(selSection);
    if (datosBase == null) {
        datosBase = {"blocks": []};
    }

    datosBase.blocks.forEach(function (block) {
        addBlock(block.id, block.name, block.position.column, block.collapsed);
        block.links.forEach(function (link) {
            addElement(block.id, link.name, link.url, link.ico);
        });
    });
    if (datosBase.unsortedLinks !== undefined) {
        datosBase.unsortedLinks.forEach(function (link) {
            addElement("addedLink", link.name, link.url, link.ico);
        });
    }
}

function showToast(toastBody, color) {
    /**
     * Color
     * primary azul
     * secondary gris
     * success verde
     * danger rojo
     * warning amarillo
     * info azul
     */
    var delay = 5000;

    var html =
        `<div class="toast align-items-center text-white bg-${color} border-0" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="d-flex">
    <div class="toast-body">
      ${toastBody}
    </div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
</div>`;
    var toastElement = htmlToElement(html);
    var toastConainerElement = document.getElementById("toast-container");
    toastConainerElement.appendChild(toastElement);
    var toast = new bootstrap.Toast(toastElement, {delay:delay, animation:true});
    toast.show();

    setTimeout(() => toastElement.remove(), delay+3000); // let a certain margin to allow the "hiding toast animation"
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function loadStylesheet(name){
    $("link[id='override']").remove();
    if (name!=="default.css"){
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.id   = "override";
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = "css/"+name;
        link.media = 'all';
        head.appendChild(link);
    }
    localStorage.setItem("theme", name);
}

function ezBSAlert (options) {
    var deferredObject = $.Deferred();
    var defaults = {
        type: "alert", //alert, prompt,confirm
        modalSize: 'modal-sm', //modal-sm, modal-lg
        okButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        yesButtonText: 'Yes',
        noButtonText: 'No',
        headerText: 'Attention',
        messageText: 'Message',
        alertType: 'default', //default, primary, success, info, warning, danger
        inputFieldType: 'text', //could ask for number,email,etc
    }
    $.extend(defaults, options);

    var _show = function(){
        var headClass = "navbar-default";
        switch (defaults.alertType) {
            case "primary":
                headClass = "alert-primary";
                break;
            case "success":
                headClass = "alert-success";
                break;
            case "info":
                headClass = "alert-info";
                break;
            case "warning":
                headClass = "alert-warning";
                break;
            case "danger":
                headClass = "alert-danger";
                break;
        }
        $('BODY').append(
            '<div id="ezAlerts" class="modal fade">' +
            '<div class="modal-dialog" class="' + defaults.modalSize + '">' +
            '<div class="modal-content">' +
            '<div id="ezAlerts-header" class="modal-header ' + headClass + '">' +
            '<h4 id="ezAlerts-title" class="modal-title">Modal title</h4>' +
            '<button id="close-button" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
            '</div>' +
            '<div id="ezAlerts-body" class="modal-body">' +
            '<div id="ezAlerts-message" ></div>' +
            '</div>' +
            '<div id="ezAlerts-footer" class="modal-footer">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        );

        $('.modal-header').css({
            'padding': '15px 15px',
            '-webkit-border-top-left-radius': '5px',
            '-webkit-border-top-right-radius': '5px',
            '-moz-border-radius-topleft': '5px',
            '-moz-border-radius-topright': '5px',
            'border-top-left-radius': '5px',
            'border-top-right-radius': '5px'
        });

        $('#ezAlerts-title').text(defaults.headerText);
        $('#ezAlerts-message').html(defaults.messageText);

        var keyb = false, backd = "static";
        var calbackParam = "";
        switch (defaults.type) {
            case 'alert':
                keyb = true;
                backd = "true";
                $('#ezAlerts-footer').html('<button class="btn btn-' + defaults.alertType + '">' + defaults.okButtonText + '</button>').on('click', ".btn", function () {
                    calbackParam = true;
                    $('#ezAlerts').modal('hide');
                });
                break;
            case 'confirm':
                var btnhtml = '<button id="ezok-btn" class="btn btn-primary">' + defaults.yesButtonText + '</button>';
                if (defaults.noButtonText && defaults.noButtonText.length > 0) {
                    btnhtml += '<button id="ezclose-btn" class="btn btn-default">' + defaults.noButtonText + '</button>';
                }
                $('#ezAlerts-footer').html(btnhtml).on('click', 'button', function (e) {
                    if (e.target.id === 'ezok-btn') {
                        calbackParam = true;
                        $('#ezAlerts').modal('hide');
                    } else if (e.target.id === 'ezclose-btn') {
                        calbackParam = false;
                        $('#ezAlerts').modal('hide');
                    }
                });
                break;
            case 'prompt':
                $('#ezAlerts-message').html(defaults.messageText + '<br /><br /><div class="form-group"><input type="' + defaults.inputFieldType + '" class="form-control" id="prompt" /></div>');

                $('#ezAlerts-message .form-control').keydown(function (e) {
                    if (e.keyCode === 13) {
                        calbackParam = $('#prompt').val();
                        $('#ezAlerts').modal('hide');
                        return false;
                    }
                });

                $('#ezAlerts-footer').html('<button class="btn btn-primary">' + defaults.okButtonText + '</button>').on('click', ".btn", function () {
                    calbackParam = $('#prompt').val();
                    $('#ezAlerts').modal('hide');
                });
                break;
        }

        $('#ezAlerts').modal({
            show: false,
            backdrop: backd,
            keyboard: keyb
        }).on('hidden.bs.modal', function (e) {
            $('#ezAlerts').remove();
            if (calbackParam!==null && calbackParam!==''){
                deferredObject.resolve(calbackParam);
            }
            deferredObject.reject(calbackParam);
        }).on('shown.bs.modal', function (e) {
            if ($('#prompt').length > 0) {
                $('#prompt').focus();
            }
        }).modal('show');
    }

    _show();
    return deferredObject.promise();
}