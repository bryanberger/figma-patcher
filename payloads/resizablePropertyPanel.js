(function () {
  var propertiesPanel = document.querySelector(
    '[name="propertiesPanelContainer"]'
  );

  var runPatch = function () {
    try {
      interact(propertiesPanel)
        .resizable({
          // resize from left only
          edges: { left: true, right: false, bottom: false, top: false },

          listeners: {
            move(event) {
              var target = event.target;
              var x = parseFloat(target.getAttribute("data-x")) || 0;

              target.style.width = event.rect.width + "px";
            },
          },
          modifiers: [
            // keep the edges inside the parent
            interact.modifiers.restrictEdges({
              outer: "parent",
            }),

            // minimum size
            interact.modifiers.restrictSize({
              min: { width: 246 },
            }),
          ],

          inertia: true,
        })
        .draggable({
          listeners: { move: window.dragMoveListener },
          inertia: true,
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: "parent",
              endOnly: true,
            }),
          ],
        });
    } catch (err) {}
  };

  runPatch();
})();
