const MAX_TT_FETCHES = 100;

async function loadMatchingTT(TT) {
  console.log("TRIAL FOUND! ", TT);
  var htmlout = "";

  htmlout += `<tr><th>Date: ${dateFormat(TT.createdAt)}</th></tr>`;
  htmlout += `<tr><th>Time Trophy: ${timeFormat(TT.timeTrophyGoal)}</th><tr>`;
  htmlout += `<tr><th>Levels</th></tr>`;

  var levels = await (
    await fetch(levelFetchUrl() + "&levelIds=" + TT.levelIds)
  ).json();

  for (const level of levels.data) {
    htmlout += `<tr>
                        <td>
                            <img src="${getAvatarURL(level.avatarId, 20)}">
                            <a href="https://levelhead.io/+${
                              level.levelId
                            }" target="_blank">${level.title}</a> by 
                            <a href="https://levelhead.io/@${
                              level.userId
                            }" target="_blank">${level.alias.alias}</a>
                        </td>
                    </tr>`;
  }

  document.getElementById("MatchingTT").innerHTML = htmlout;
}

async function findLevelTT() {
  document.getElementById("MatchingTT").innerHTML = "Loading Level...";
  document.getElementById("TTStatus").innerHTML = "";
  document.getElementById("LevelPreviewCard").innerHTML = "";

  var levelCode = getLevelCode(document.getElementById("TTLevelCode").value);

  if (levelCode) {
    var level = await (
      await fetch(levelFetchUrl() + "&levelIds=" + levelCode)
    ).json();

    if (level.data.length == 0) {
      document.getElementById("MatchingTT").innerHTML = "";
      document.getElementById("TTStatus").innerHTML = "Level not found!";
      return;
    }

    level = level.data[0];
    document.getElementById("LevelPreviewCard").innerHTML = createLevelCard(
      level,
      template.levelLink(level),
      template.likeFavoriteDifficulty(level),
      template.tags(level),
      template.playerPlaysCount(level),
      template.creationDate(level)
    );

    if (!level.towerTrial) {
      document.getElementById("MatchingTT").innerHTML = "";
      document.getElementById("TTStatus").innerHTML =
        "Level has not been in a TT!";
      return;
    }

    document.getElementById("MatchingTT").innerHTML =
      "Searching Tower Trial...";

    var TTs;
    var dateOfPrev = level.createdAt;

    var today = new Date(Date.now());

    for (var count = 0; count < MAX_TT_FETCHES; count++) {
      var startDate = new Date(dateOfPrev);
      console.log("start date: ", startDate);
      console.log("date of prev: ", dateOfPrev);
      var diff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      console.log("difference: ", diff);

      TTs = await (
        await fetch(
          "https://www.bscotch.net/api/levelhead/tower-trials?limit=10&sort=-createdAt&maxDaysAgo=" +
            (diff + 1)
        )
      ).json();

      for (const trial of TTs.data) {
        if (trial.levelIds.includes(levelCode)) {
          await loadMatchingTT(trial);
          return;
        }
      }

      dateOfPrev = TTs.data[TTs.data.length - 1].createdAt;
    }

    document.getElementById("MatchingTT").innerHTML = "";
    document.getElementById("TTStatus").innerHTML = "TT was not found :(";
  }
}
