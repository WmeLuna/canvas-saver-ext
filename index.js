(async () => {
	let src = chrome.runtime.getURL("quiz_saver.js")
	if (window.location.href.includes('/take')) src = chrome.runtime.getURL("quiz_loader.js");
  const contentScript = await import(src);
})();
