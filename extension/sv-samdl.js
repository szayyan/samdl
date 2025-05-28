chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  switch (req.action) {
    case "download-playlist":
      (async () => {
        try {
          const cookies = await getNetscapeCookies(req.data);
          sendResponse({ result: cookies });
        } catch (error) {
          sendResponse({ error: `ERROR: ${error.message}` });
        }
      })();
      return true;
    default:
      sendResponse({ error: `ERROR: uncrecognised action ${req.action}` });
  }
});

async function getNetscapeCookies(data) {
  const cookies = await getAllCookies({
    url: data.href,
    partitionKey: { topLevelSite: data.origin },
  });
  const text = getCookieText(cookies);
  return text;
}

function getCookieText(cookies) {
  const netscapeTable = jsonToNetscapeMapper(cookies);
  const text = [
    "# Netscape HTTP Cookie File",
    "# http://curl.haxx.se/rfc/cookie_spec.html",
    "# This is a generated file!  Do not edit.",
    "",
    ...netscapeTable.map((row) => row.join("\t")),
    "", // Add a new line at the end
  ].join("\n");
  return text;
}

function jsonToNetscapeMapper(cookies) {
  return cookies.map(
    ({ domain, expirationDate, path, secure, name, value }) => {
      const includeSubDomain = !!domain?.startsWith(".");
      const expiry = expirationDate?.toFixed() ?? "0";
      const arr = [domain, includeSubDomain, path, secure, expiry, name, value];
      return arr.map((v) =>
        typeof v === "boolean" ? v.toString().toUpperCase() : v,
      );
    },
  );
}

async function getAllCookies(details) {
  details.storeId ??= await getCurrentCookieStoreId();
  const { partitionKey, ...detailsWithoutPartitionKey } = details;

  const cookiesWithPartitionKey = partitionKey
    ? await Promise.resolve()
        .then(() => chrome.cookies.getAll(details))
        .catch(() => [])
    : [];
  const cookies = await chrome.cookies.getAll(detailsWithoutPartitionKey);
  return [...cookies, ...cookiesWithPartitionKey];
}

const getCurrentCookieStoreId = async () => {
  if (chrome.runtime.getManifest().incognito === "split") return undefined;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.cookieStoreId) return tab.cookieStoreId;

  const stores = await chrome.cookies.getAllCookieStores();
  return stores.find((store) => store.tabIds.includes(tab.id))?.id;
};
