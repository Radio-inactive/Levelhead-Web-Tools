const bookmarkUrl =
  "https://www.bscotch.net/api/levelhead/bookmarks?limit=32&beforeId=";

const bookmaklevelFetchUrl =
  "https://www.bscotch.net/api/levelhead/levels?includeMyInteractions=true&includeAliases=true&includeStats=true&levelIds=";

function splitArray(array, chunkSize = 16) {
  var fetchableArray = [];
  for (let i = 0; i < array.length; i += chunkSize)
    fetchableArray.push(array.slice(i, i + chunkSize));
  return fetchableArray;
}

function createSpecificLevelCard(level) {
  return createLevelCard(
    level,
    template.levelLink(level),
    template.profileLink(level),
    template.likeFavoriteDifficulty(level),
    template.tags(level),
    template.playerPlaysCount(level),
    template.copyCodeButton(level)
  );
}

function checkFilters(level) {
  if (!filterMultiplayer(level)) return false;

  if (!filterTags(level)) return false;

  if (!filterInteractions(level)) return false;

  return true;
}

async function reloadBookmarks() {
  var button = document.getElementById("bookmarkReload");
  button.disabled = true;

  try {
    if (!delegationKeyValid) {
      document.getElementById("levelCards").innerHTML =
        "<p>!! No Delegation key or expired delegation key !!</p>";
      return;
    }
    let lastBookmarkId = "";
    var levelIds = [];
    while (true) {
      let levels = await fetch(
        bookmarkUrl + lastBookmarkId,
        getExtendedRequestBody()
      ).then((r) => r.json());

      console.log(levels);

      levelIds.push(...levels.data);
      console.log(levels.data);
      if (levels.data.length < 32) break;
      else lastBookmarkId = levels.meta.lastId;
    }
    var splitIds = splitArray(levelIds);

    var levelRequests = splitIds.map((ids) =>
      fetch(bookmaklevelFetchUrl + ids.join(","), getExtendedRequestBody())
        .then((r) => r.json())
        .then((r) => r.data)
    );

    levelList = await Promise.all(levelRequests);
    reloadLevels();
  } finally {
    button.disabled = false;
  }
}
