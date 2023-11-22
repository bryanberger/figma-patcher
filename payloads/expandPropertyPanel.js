(function () {
    console.log('expandPropertyPanel');

    const levels = 5;
    const currentLevel = 0;
    const propertiesPanel = document.querySelector('[class*="properties_panel--drillDownContainer--"]');
    // const propertiesPanel = document.querySelector('[data-onboarding-key="properties-panel"]');
  
    const walk = function (node) {
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
  
    const runPatch = function () {
      try {
        const panelRows = propertiesPanel.querySelectorAll(
          '[class*="raw_components--singleRow--"]'
        );
  
        [].forEach.call(panelRows, function (node) {
          node.style.justifyContent = "space-between";
        });
  
        walk(propertiesPanel.firstChild);
      } catch (err) {}
    };
  
    const observer = new MutationObserver(runPatch);
  
    try {
      observer.observe(propertiesPanel, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });
    } catch (error) {
      console.error('Error during observe:', error);
    }
  
    runPatch();
  })();
  