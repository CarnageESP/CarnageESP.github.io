function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function createSortableBlock(column, group, ghostClass, handler) {
  sortable = new Sortable(column, {
    group: group,
    animation: 150,
    ghostClass: ghostClass,
    handle: handler,
    filter: ".ignore-sort",
    onAdd: function(event) {
      serializeData();
      createContextMenus();
    },
    onUpdate: function(event) {
      serializeData();
    }
  });
}

function createSortableSection(column, group, ghostClass, handler) {
  sortable = new Sortable(column, {
    group: group,
    animation: 150,
    ghostClass: ghostClass,
    handle: handler,
    filter: ".ignore-sort",
    onUpdate: function(event) {
      serializeSections();
    }
  });
}

function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
}

function generateCode(size){
  var consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']
  var vowels = ['a', 'e', 'i', 'o', 'u']
  var word = "";
  var consonant_toggle = true;
  while(word.length<size){
    if (consonant_toggle){
      letter = consonants[Math.floor(Math.random() * consonants.length)];
    }else{
      letter = vowels[Math.floor(Math.random() * vowels.length)];
    }
    word=word+letter;
    consonant_toggle = !consonant_toggle;
  }
  return word;
}