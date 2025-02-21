// script.js (Corrected - Minimal Changes)

// Store Your Spotify Access Token
async function logout() {
  // Clear local storage
  localStorage.removeItem('spotify_access_token');
  // Redirect to the home page, which should now prompt for login if no token
  window.location.href = 'login.html';
}


async function fetchSpotifyData(endpoint, params = {}) {
  // Fetch the access token from local storage
  const accessToken = localStorage.getItem('spotify_access_token');

  if (!accessToken) {
      console.error("Access token not found. Please log in.");
      // Handle the case where there's no access token, e.g., redirect to login
      window.location.href = 'login.html';
      return; // Important: Stop further execution
  }

  const url = `https://api.spotify.com/v1/${endpoint}?${new URLSearchParams(params)}`;

  const response = await fetch(url, {
      headers: {
          Authorization: `Bearer ${accessToken}`, // Corrected: Inject access token
      },
  });

  if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status} - ${response.url}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}


async function fetchTopTracks(time_range = "short_term") {
  try {
      const data = await fetchSpotifyData("me/top/tracks", {time_range, limit: 10});
      return data;
  } catch (error) {
      console.error("Error fetching top tracks:", error);
      throw error; // Re-throw to be caught by the updateReceipt function
  }
}

// Attach Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  updateReceipt(); // Initial call to updateReceipt

  // Re-fetch data whenever metric is changed
  document.getElementById("type-select-dropdown").addEventListener("change", updateReceipt);

  // Event listeners for time period buttons
  const timePeriodButtons = document.querySelectorAll('#time-period button');
  timePeriodButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Remove active class from all buttons
          timePeriodButtons.forEach(btn => btn.classList.remove('active'));
          // Add active class to the clicked button
          button.classList.add('active');
          // Update the receipt
          updateReceipt();
      });
  });


  document.getElementById('download').addEventListener('click', downloadImg);
});

// function to help generate log-in url for the website for spotify
function getLoginURL(scopes) {
const clientId = 'fc0b6630837144ecae9a0bf845ed2c0d';
const redirectUri = 'http://localhost:3000';
const state = generateRandomString(16);

let url = 'https://accounts.spotify.com/authorize';
url += '?response_type=token';
url += '&client_id=' + encodeURIComponent(clientId);
url += '&scope=' + encodeURIComponent(scopes.join(' '));
url += '&redirect_uri=' + encodeURIComponent(redirectUri);
url += '&state=' + encodeURIComponent(state);
return url;
}

// function to help generate random strings
function generateRandomString(length) {
let text = '';
const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for (let i = 0; i < length; i++) {
  text += possible.charAt(Math.floor(Math.random() * possible.length));
}
return text;
}

async function updateReceipt() {
  const metricType = document.getElementById("type-select-dropdown").value;
  let spotifyData;

  try {
      if (metricType === "tracks") {
          const accessToken = localStorage.getItem('spotify_access_token');
          if (accessToken) {
              // Get the selected time period
              const selectedTimeRange = document.querySelector('#time-period .active').getAttribute('data-time-range');
              spotifyData = await fetchTopTracks(selectedTimeRange);

              if (spotifyData && spotifyData.items) {
                  // Get top tracks successfully
                  displayReceipt(spotifyData, metricType);
              } else {
                  console.warn("Could not retrieve top tracks. Make sure you've listened to music recently.");
              }
          } else {
              console.warn("User not authenticated. Please log in.");
              // Handle no access token, e.g., redirect to login page
              window.location.href = 'login.html';
              return;
          }
      }
  } catch (error) {
      console.error("Error fetching data:", error);
      // Display an error message to the user
      alert("An error occurred while fetching data. Please try again later.");
  }
}

const requestAuthorization = () => {
const clientId = 'fc0b6630837144ecae9a0bf845ed2c0d';
const redirectUri = 'http://localhost:3000/index.html';
const scopes = ['user-read-email', 'user-top-read']; // Example scope
const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes.join(' '))}`;
window.location.href = authUrl;
};
const displayReceipt = (response, stats) => {
  const track= response.items
    let receiptHTML = '<h2>Your Top Tracks</h2>';

  for (let i = 0; i < track.length; i++) {
      receiptHTML += `<p>${i + 1}. ${track[i].name} - ${track[i].artists[0].name}</p>`;
  }
  document.getElementById('receipt').innerHTML = receiptHTML;
}
const hiddenClone = (element) => {
  // Create clone of element
  var clone = element.cloneNode(true);

  // Position element relatively within the
  // body but still out of the viewport
  var style = clone.style;
  style.position = 'relative';
  style.top = window.innerHeight + 'px';
  style.left = 0;
  // Append clone to body and return the clone
  document.body.appendChild(clone);
  return clone;
};

const downloadImage = () => {
        window.scrollTo(0, 0);
        const element = document.getElementById('track-list'); // Target the track list

        domtoimage.toPng(element)
            .then(function (dataUrl) {
                var link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'receipt.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(function (error) {
                console.error('oops, something went wrong!', error);
            });
    }
const getHashParams = () => {
  var hashParams = {};
  var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
};

let params = getHashParams();

let access_token = params.access_token
const loadAccessTokenFromUrl = () => {
const accessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
console.log(accessToken)
return accessToken
}
const accessToken = loadAccessTokenFromUrl()
localStorage.setItem('spotify_access_token', accessToken);