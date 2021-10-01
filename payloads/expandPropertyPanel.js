(function () {
    var levels = 5;
    var currentLevel = 0;
    var propertiesPanel = document.querySelector(
      '[name="propertiesPanelContainer"]'
    );
  
    var walk = function (node) {
      if (typeof node.style !== "undefined") {
        node.style.width = "100%";
      }
  
      node = node.firstChild;
      currentLevel++;
  
      while (node && currentLevel < levels) {
        walk(node);
        node = node.nextSibling;
      }
    };
  
    var runPatch = function () {
      try {
        var panelRows = propertiesPanel.querySelectorAll(
          '[class*="raw_components--singleRow--"]'
        );
  
        [].forEach.call(panelRows, function (node) {
          node.style.justifyContent = "space-between";
        });
  
        walk(propertiesPanel.firstChild);
      } catch (err) {}
    };
  
    var observer = new MutationObserver(runPatch);
  
    observer.observe(propertiesPanel, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  
    runPatch();
  })();
  