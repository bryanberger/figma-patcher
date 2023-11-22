(function () {
    console.log('pinnedPlugins');
    const plugins = [
        {
            name: 'Figlet',
            imageUrl: 'https://www.figma.com/community/icon?resource_id=1215620774867583125&resource_type=plugin'
        },
        {
            name: 'WIP',
            imageUrl: 'https://www.figma.com/community/icon?resource_id=1136745882239085583&resource_type=plugin'
        },
        {
            name: 'Randomize Avatar',
            imageUrl: 'https://www.figma.com/community/icon?resource_id=1225256730843786287&resource_type=plugin'
        }

    ]

    const runPatch = function () {
        try {
            console.log("pinned plugin init");

            let ws; // Declare the WebSocket variable outside the try-catch block

            const connectWebSocket = () => {
                ws = new WebSocket('ws://localhost:3000');
        
                ws.addEventListener('open', () => {
                    console.log('WebSocket connection opened');
                });
        
                ws.addEventListener('message', (event) => {
                    const data = JSON.parse(event.data);
                    console.log(data.status);
                });
        
                ws.addEventListener('close', (event) => {
                    console.log('WebSocket connection closed. Reconnecting...');
                    setTimeout(connectWebSocket, 2000); // Adjust the delay as needed
                });
        
                ws.addEventListener('error', (error) => {
                    console.error('WebSocket error:', error);
                });
            };

            // ws.addEventListener('open', () => {
            //     ws.send(JSON.stringify({ command: 'navigate', url: 'https://example.com' }));
            // });

            // ws.addEventListener('message', (event) => {
            //     const data = JSON.parse(event.data);
            //     console.log(data.status);
            // });

            //
            connectWebSocket(); // Initial connection attempt

            let toolbar = null;
            const anExistingToolDiv = document.querySelector('[data-testid="set-tool-comments"]');

            // Check if the div element exists
            if (anExistingToolDiv) {
                toolbar = anExistingToolDiv.parentNode;
            } else {
                // Handle the case where the div element with the specified data-testid doesn't exist
                throw new Error('Element not found.')
            }

            console.log('found toolbar')

            plugins.forEach(plugin => {
                const div = document.createElement('div');
                // div.style.width = '40px';
                div.style.height = '26px';
                div.style.display = 'flex';
                div.style.alignItems = 'center';
                div.style.padding = '10px';
                div.style.backgroundColor = 'initial'; // Set the initial background color

                // Add a hover event listener
                div.addEventListener('mouseover', function () {
                    div.style.backgroundColor = 'var(--color-bg-toolbar-hover)'; // Change the background color on hover
                });

                // Remove the hover effect when the mouse leaves the div
                div.addEventListener('mouseout', function () {
                    div.style.backgroundColor = 'initial'; // Reset to the initial background color
                });

                div.addEventListener('click', function() {
                    ws.send(JSON.stringify({ command: 'plugin', name: plugin.name }));
                })

                const img = document.createElement('img');
                img.src = plugin.imageUrl;
                img.style.width = '20px';
                img.style.borderRadius = '4px';
                div.appendChild(img);

                // Append the div to the toolbar
                toolbar.appendChild(div);
            });

        } catch (err) { }
    };

    runPatch();
})();
