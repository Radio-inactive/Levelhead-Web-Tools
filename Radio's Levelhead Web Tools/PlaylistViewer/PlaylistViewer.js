function splitArray(array, chunkSize = 16) {
  var fetchableArray = [];
  for (let i = 0; i < array.length; i += chunkSize)
    fetchableArray.push(array.slice(i, i + chunkSize));
  return fetchableArray;
}

async function load_playlist() {
  document.getElementById("levelCards").innerHTML = "LOADING...";
  document.getElementById("playlist_name").innerHTML = "";
  var playlist_code = document.getElementById("playlist_code").value;
  console.log(playlist_code);
  playlist_code = getPlaylistCode(playlist_code);

  if (playlist_code) {
    try {
      var playlist_response = await fetch(
        "https://www.bscotch.net/api/levelhead/playlists/" + playlist_code
      ).then((r) => r.json());

      var playlist_name = playlist_response.data.name;
      var playlist_level_codes = splitArray(playlist_response.data.levelIds);
      var level_responses = [];
    } catch (e) {
      document.getElementById("levelCards").innerHTML = "PLAYLIST NOT FOUND";
      return;
    }
    for (const level_codes of playlist_level_codes) {
      var level_response = await fetch(
        "https://www.bscotch.net/api/levelhead/levels?includeStats=true&includeAliases=true&levelIds=" +
          level_codes
      )
        .then((r) => r.json())
        .then((r) => r.data);
      level_responses.push(level_response);
    }

    levelList = await Promise.all(level_responses);

    console.log(levelList);

    document.getElementById("playlist_name").innerHTML = playlist_name;

    reloadLevels();
  } else {
    document.getElementById("levelCards").innerHTML = "INVALID PLAYLIST CODE";
  }
}

function checkFilters() {
  return true;
}

function createSpecificLevelCard(level) {
  console.log(level);
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
