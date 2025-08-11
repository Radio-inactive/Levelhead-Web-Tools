// sorting options: "Subscribers, PlayTime, Plays, Trophies, Shoes, Crowns, Published, HiddenGem, updatedAt, createdAt, TipsGotten, BucksTipped, TipsPerLevel, TipsPerDay, TippedPerLevelPlayed, TippedPerDay"

const sort_values = {
  Subscribers: "Followers",
  PlayTime: "Playtime",
  Plays: "Plays",
  Trophies: "Total records",
  Shoes: "Shoes",
  Crowns: "Ribbons",
  Published: "Levels published",
  HiddenGem: "Featured",
  updatedAt: "Last updated",
  createdAt: "Account created",
  TipsGotten: "EB tips received",
  BucksTipped: "EB tipped",
  TipsPerLevel: "EB tips received per level",
  TipsPerDay: "EB tips received per day",
  TippedPerLevelPlayed: "EB tipped per level",
  TippedPerDay: "EB tipped per day",
};

/**
 * @type {(keyof sort_values)[]}
 */
const banned_columns = [
  "BucksTipped",
  "TippedPerLevelPlayed",
  "TipsPerDay",
  "TipsPerLevel",
  "TippedPerDay",
  "TipsGotten",
];

function get_url() {
  const asc = document.getElementById("sort_asc").checked;

  const baseUrl =
    "https://www.bscotch.net/api/levelhead/players?limit=128&includeAliases=true&sort=" +
    (asc ? "-" : "") +
    document.getElementById("sort_select").value +
    addInteractionDetails();

  /**
   * @type {[string, string][]}
   */
  const filters = [];

  for (const key in sort_values) {
    const min = document.getElementById("filter_min_" + key).value;
    const max = document.getElementById("filter_max_" + key).value;

    if (min && max && min > max) {
      continue;
    }

    if (min) {
      filters.push(["min" + key, min]);
    }
    if (max) {
      filters.push(["max" + key, max]);
    }
  }

  return (
    baseUrl +
    "&" +
    filters.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
  );
}

async function fetch_creators() {
  try {
    document.getElementById("error_msg").innerText = "";
    document.getElementById("result").innerText = "Loading...";
    const url = get_url();
    const response = await fetch(url)
      .then((r) => r.json())
      .then((r) => r.data);
    if (!response) {
      throw new Error("No data returned from API");
    }

    document.getElementById("result").innerHTML = response
      .map(build_row)
      .join("");
  } catch (e) {
    console.error("Error fetching creators:", e);
    document.getElementById("error_msg").innerText = "Error: " + e.message;
    document.getElementById("result").innerText = "";
  }
}

/**
 * Builds html for one row in the creator browser table.
 * @param {{userId:string,alias:{alias:string, avatarId:string}, stats:Record<string,string>}} data data row
 */
function build_row(data) {
  return `
    <div class="column">
        <div class="card">
            <div class="cardPictures">
                <img src="${getAvatarURL(
                  data.alias.avatarId,
                  100
                )}" id="cardAvatar">
            </div>
            <p class="cardText">
                <b>
                    <a href="https://www.bscotch.net/games/levelhead/players/${
                      data.userId
                    }" target="_blank">
                        ${data.alias?.alias || "DELETED USER"}
                    </a>
                </b><br>
                <b>Followers:</b> ${data.stats.Subscribers}<br>
                <b>Playtime:</b> ${timeFormat(data.stats.PlayTime)}<br>
                <b>Levels:</b> ${
                  data.stats.Published || 0
                } | <img src="../PicturesCommon/CardIcons/TOWER.png" style="width:10px">${
    data.stats.Graduated || 0
  } (${((data.stats.Graduated * 100) / data.stats.Published || 0).toFixed(
    2
  )}%)<br>
                Time Trophies: ${data.stats.ChalWins || 0}<br>
                Shoes: ${data.stats.Shoes}, Ribbons: ${data.stats.Crowns}<br>
            </p>
            <div class="cardDelegation">
                
            </div>
        </div>
    </div>`;
}

function load_content() {
  document.getElementById("sort_select").innerHTML = Object.entries(sort_values)
    .map(([key, value]) =>
      banned_columns.includes(key)
        ? ""
        : `<option value="${key}">${value}</option>`
    )
    .join("");

  document.getElementById("sort_select").value = "Subscribers";

  document.getElementById("filter").innerHTML = Object.entries(sort_values)
    .map(([key, value]) => {
      var input_type = key.endsWith("At") ? "date" : "number";
      return `
        <b>${value}</b><br>
        <label for="filter_min_${key}">Min</label><input type="${input_type}" id="filter_min_${key}">
        <label for="filter_max_${key}">Max</label><input type="${input_type}" id="filter_max_${key}"><br>`;
    })
    .join("<br>");
}
