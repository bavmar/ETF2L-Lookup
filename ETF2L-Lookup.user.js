// ==UserScript==
// @name			ETF2L Lookup
// @namespace		    https://github.com/bavmar/ETF2L-Lookup
// @author			bavmar
// @match			*://*.steamcommunity.com/id/*
// @match			*://*.steamcommunity.com/profiles/*
// @match			*://*.logs.tf/*
// @connect			etf2l.org
// @require			https://code.jquery.com/jquery-3.6.1.min.js
// @version			0.2
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_xmlhttpRequest
// @grant			GM.xmlHttpRequest
// @grant			GM.getValue
// @grant			GM.setValue

// @updateURL		https://github.com/bavmar/ETF2L-Lookup/raw/release/ETF2L-Lookup.user.js	   

// ==/UserScript==

// stop showing syntax errors for jquery
const $ = window.jQuery;

// greasemonkey compatibility
if (typeof GM_xmlhttpRequest === "undefined" && typeof GM !== "undefined") {
    self.GM_getValue = GM.getValue;
    self.GM_setValue = GM.setValue;
    self.GM_xmlhttpRequest = GM.xmlHttpRequest;
}
  
function toggleETF2LBox() {
    $("#tf2-ETF2L-lookup").toggle();
}
  
class Players {
    constructor() {
        this.data = {};
        this.selectedPlayer = null;
        this.displayETF2L = true;
    }

    selectPlayer(id64, number = 0) {
    if (this.data[id64] === undefined) {
        this.data[id64] = new Player();
    }
        addLogsLink(id64, number);
        lookupETF2L(id64, number);
    }
}
  
class Player {
    constructor() {
        this.timestamp = Date.now();

        this.etf2l = {
        id: "",
        name: "",

        peak6v6: {},
        current6v6: {},

        peakHL: {},
        currentHL: {},
        };
    }
}
  
class divInfo {
    constructor(div, team, season) {
        this.div = div;
        this.team = team;
        this.season = season;
    }
}
  
const players = new Players();
  
switch (document.location.hostname) {
    case "steamcommunity.com":
        steamCommunity();
    break;
    case "logs.tf":
        break;
    default:
    console.log("domain not in switch");
}
  
function steamCommunity() {
    makeBox(".profile_header_centered_persona > .persona_name");
    const regex = /(?:^.{4,5}\:\/\/steamcommunity.com\/)([a-z]*)(?:.*)/i;
    const pageType = document.URL.match(regex)[1];
    regex = new RegExp("(?:^.{4,5}://steamcommunity.com/" + pageType + "/)([^/?]+)","i");

    if (pageType == "id") {
        var apiKey = "7C65DC48D67139E16E83C0CE307E9CD0";
        var vanity = document.URL.match(regex)[1];

        GM_xmlhttpRequest({
            method: "GET",
            url:
            "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=" +
            apiKey +
            "&vanityurl=" +
            vanity +
            "&format=json",
            onload: function (response) {
                var data = JSON.parse(response.responseText);
                players.selectPlayer(data.response.steamid);
            },
        });
    }

    if (pageType == "profiles") {
        players.selectPlayer(document.URL.match(regex)[1]);
    }
}
  
function makeBox(location, number = 0) {
    const iconStyle = "max-height:12px;width:auto;verticle-align:bottom;";

    const boxCss =
    "display: block;" +
    "position: absolute;" +
    "top: 40px;" +
    "color:#FFFFFF;" +
    "background-color: #171a21;" +
    "border: none;" +
    "line-height: 10px;" +
    "font-size: 12px;" +
    "z-index: 201;" + 
    "box-shadow: 0 0 12px #000000;" +
    "padding: 6px;";


    const boxContent =
    '<div class="tf2-ETF2L-lookup box' +
    number +
    '" style="' +
    boxCss +
    '">' +
    '<p>' +
    '<img src="https://raw.githubusercontent.com/bavmar/ETF2L-Lookup/main/img/etf2l.ico" style="' +
    iconStyle +
    '" /> ' +
    '<span class="etf2lrow">' +
    "Loading..." +
    "</span>" +
    "</p>" +
    "<p>" +
    '<img src="https://raw.githubusercontent.com/bavmar/ETF2L-Lookup/main/img/logstf.png" style="' +
    iconStyle +
    '" /> ' +
    '<span class="logsrow">' +
    "Loading..." +
    "</span>" +
    '</p>' +
    "</div>";

    const linkCss = "font-size: 12px";

    const box =
    '<span class="tf2-ETF2L-link box' +
    number +
    '"' +
    'style="position: relative"' +
    ">" +
    "<a " +
    'href="#"' +
    'class="tf2-ETF2L-link"' +
    'style="' +
    linkCss +
    '"' +
    ">" +
    '<img src="https://raw.githubusercontent.com/bavmar/ETF2L-Lookup/main/img/medal.png" style="max-height:24px;width:auto;verticle-align:bottom;" />' +
    "</a>" +
    "</span>" +
    boxContent;

    $(location).append(box);
    $(".box" + number + ".tf2-ETF2L-lookup").css("left", $(".box" + number + ".tf2-ETF2L-link").position().left);

    $(".box" + number + " .tf2-ETF2L-link").on("click", function () {
        $(".box" + number + ".tf2-ETF2L-lookup").fadeToggle(200);
    });

    $(".box" + number + ".tf2-ETF2L-lookup").hide();
}

function addLogsLink(id, number) {
    $(".box" + number + " .logsrow").html('<a href="https://logs.tf/profile/' + id + '">logs.tf</a>');
    getLogsNumber(id, number);
}

function getLogsNumber(id, number) {
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://logs.tf/api/v1/log?player=" + id,
        onload: function (response) {
            let data = JSON.parse(response.responseText);
            $(".box" + number + " .logsrow").append(' <span style="opacity: 0.5">' + data.total + " logs</span>");
        },
    });
}

function lookupETF2L(id64, number) {
    GM_xmlhttpRequest({
        method: "GET",
        url: "http://api.etf2l.org/player/" + id64 + ".json",
        onload: function (response) {
        try {
            let data = JSON.parse(response.responseText);
            players.data[id64].etf2l.id = data.player.id;
            players.data[id64].etf2l.name = data.player.name;
            $(".box" + number + " .etf2lrow").html(
            '<a href="https://etf2l.org/forum/user/' +
            players.data[id64].etf2l.id +
            '">' +
            players.data[id64].etf2l.name +
            "</a>"
            );
        } catch (e) {
            $(".box" + number + " .etf2lrow").html("No profile");
        }
        },
        onerror: function (response) {
            $(".box" + number + " .etf2lrow").html("No profile");
        },
    });
}

function addETF2LLink(name, id, number) {
    $(".box" + number + " .etf2lrow").html(
        '<a href="https://etf2l.org/user/' + id + '">' + name + "</a>"
    );
}

