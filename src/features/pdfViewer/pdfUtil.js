window.OPENED_PDF_WINDOWS = {};

window.addEventListener("message", (evt) => {
  let data = evt.data;
  console.log("message", data);
  data = JSON.parse(data);
  openWindow(data.url, data.fileId);
});

const openWindow = (url, fileID, title) => {
  let existingWindow = window.OPENED_PDF_WINDOWS[fileID];
  if (!existingWindow) {
    const openedWindow = window.open(url, fileID);
    window.OPENED_PDF_WINDOWS[fileID] = openedWindow;
    openedWindow.onbeforeunload = function() {
      window.OPENED_PDF_WINDOWS[fileID] = null;
    };
    openedWindow.addEventListener("load", function() {
      openedWindow.document.title = title || "";
    });
  } else {
    // existingWindow.focus();
    window.OPENED_PDF_WINDOWS[fileID] = window.open(url, fileID);
  }
  
};
window._openPdf = openWindow;

const openFileInWindow = (fileHref, fileID, title) => {
  let type = "";
  let url = "";
  if (fileHref) {
    type = fileHref.substring(fileHref.lastIndexOf(".") + 1);
  }
  if (type.includes("pdf") && fileID) {
    url = `${process.env.PUBLIC_URL}/viewer/pdf/${fileID}`;
  } else {
    if (fileID) {
      url = `${process.env.PUBLIC_URL}/viewer/${type}/${fileID}`;
    }
  }

  openWindow(url, fileID, title);
};

export default openFileInWindow;
