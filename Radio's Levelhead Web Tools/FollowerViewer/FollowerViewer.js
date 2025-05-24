/**
 * @type {string | null}
 */
let playerCode = null;

/**
 * @type {"0" | "1"}
 */
let loadType = "0"; // 0 = followers, 1 = following

/**
 * @type {string}
 */
let lastPlayerIdbuffer = null;

const loadTypeMap = {
  0: "followers",
  1: "following",
};

function buildFollowerUrl() {
  return `https://www.bscotch.net/api/levelhead/players/${playerCode}/${loadTypeMap[loadType]}?limit=32&includeAliases=true`;
}

function getProfileUrl() {
  return `https://www.bscotch.net/api/levelhead/players?userIds=${playerCode}&includeAliases=true`;
}

/**
 *
 * @param {{_id:string, userId:string, alias:{alias:string, avatarId:string}}} apiData
 */
function buildPlayerRow(apiData) {
  return `
    <tr class="player-row">
            <td><img src="${getAvatarURL(apiData.alias.avatarId, 32)}" alt="${
    apiData.alias.avatarId
  }"></td>

        <td><a href="https://www.bscotch.net/games/levelhead/players/${
          apiData.userId
        }">${apiData.alias?.alias || "DELETED USER"}</a></td>
    </tr>
    `;
}

async function loadFollowers() {
  document.getElementById("headline").innerText = "";
  document.getElementById("loadBtn").disabled = true;
  document.getElementById("usersTable").innerHTML = ""; // Clear previous results
  try {
    const playerCodeInput = getProfileCode(
      document.getElementById("playerCodeInput").value
    );

    if (!playerCodeInput) {
      document.getElementById("headline").innerText =
        "Please enter a valid player code.";
      return;
    }

    playerCode = playerCodeInput;

    /**
     * @type {{userId:string, alias:{alias:string, avatarId:string}, stats:{Subscribers:number, NumFollowing:number}}[]}
     */
    const playerProfile = (
      await fetch(getProfileUrl()).then((res) => res.json())
    )?.data;

    if (playerProfile?.length !== 1) {
      document.getElementById("headline").innerText = "Player not found.";
      return;
    }

    loadType = document.getElementById("loadTypeSelect").value;

    document.getElementById("headline").innerText =
      loadType == "0"
        ? `Loading followers for ${playerCode} (${playerProfile[0].stats.Subscribers})...`
        : `Loading players ${playerCode} follows (${playerProfile[0].stats.NumFollowing})...`;

    await buildTable();
  } catch (e) {
    document.getElementById("headline").innerText =
      "Somnething went wrong while trying to load the player profile.";
    console.error(e);
    return;
  } finally {
    document.getElementById("loadBtn").disabled = false;
  }
}

async function buildTable(lastPlayer = null) {
  document.getElementById("loadmore").style.display = "none";

  let followers = [];

  try {
    while (true) {
      const url =
        buildFollowerUrl() + (lastPlayer ? `&beforeId=${lastPlayer}` : "");
      const response = (await fetch(url).then((res) => res.json()))?.data;
      //console.log(response, url); // for debugging purposes
      if (!response) throw new Error("No data received from API.");
      followers.push(...response);
      if (response.length < 32) {
        lastPlayer = null;
        break; // No more followers to load
      }
      lastPlayer = response[response.length - 1]._id; // Get the last player's ID for pagination
    }
    document.getElementById("headline").innerText =
      "Players loaded successfully!";
  } catch (e) {
    if (lastPlayer == null) {
      document.getElementById("headline").innerText =
        "An error happened while loading followers. Try again later.";
      return;
    }
    document.getElementById("headline").innerText =
      "An error happened while loading followers.<br>Api limit may have been reachd. Press the load more button at the bottom of the list in around 30-60minutes.";
    document.getElementById("loadmore").style.display = "block";
  } finally {
    document.getElementById("usersTable").innerHTML += followers
      .map(buildPlayerRow)
      .join("");
  }
}
