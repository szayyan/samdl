function handleMessage(response) {
  if (response.error) {
    alert(response.error);
    return;
  }

  const cookies = response.result;
}

const observer = new MutationObserver((mutations) => {
  let actionButtonCount = 0;
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.tagName === "DIV" &&
          node.getAttribute("data-testid") === "button-action" &&
          actionButtonCount++ === 0
        ) {
          const container = node.parentElement;
          container.style.display = "flex";
          container.style.columnGap = "10px";

          const downloadButton = document.createElement("button");
          downloadButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>Download`;
          downloadButton.style = `border-radius: 6px;padding: 0px 12px;background-color: var(--keyColorBG);min-width: 127px;font-weight: 700;display: inline-flex;align-items: center;justify-content: center;column-gap: 4px;`;
          downloadButton.onclick = () => {
            chrome.runtime.sendMessage(
              {
                action: "download-playlist",
                data: {
                  href: window.location.href,
                  origin: window.location.origin,
                },
              },
              handleMessage,
            );
          };
          container.appendChild(downloadButton);
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
