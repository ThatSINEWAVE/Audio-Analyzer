document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const visualizationMode = document.getElementById('visualizationMode');
    const inputDevice = document.getElementById('inputDevice');
    const outputDevice = document.getElementById('outputDevice');
    const sensitivity = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivityValue');
    const fftSize = document.getElementById('fftSize');
    const colorScheme = document.getElementById('colorScheme');
    const smoothing = document.getElementById('smoothing');
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    const visualizationOverlay = document.getElementById('visualizationOverlay');
    const themeSwitch = document.getElementById('themeSwitch');

    // Audio context and variables
    let audioContext;
    let analyser;
    let microphone;
    let dataArray;
    let animationId;
    let isAnalyzing = false;

    // Visualization settings
    let settings = {
        mode: 'bars',
        colorScheme: 'rainbow',
        sensitivity: 0.5,
        smoothing: true,
        fftSize: 256
    };

    // Color schemes
    const colorSchemes = {
        rainbow: (value, index, length) => {
            const hue = Math.floor((index / length) * 360);
            return `hsl(${hue}, 100%, 50%)`;
        },
        fire: (value) => {
            const red = Math.floor(value * 255);
            const green = Math.floor(value * 128);
            return `rgb(${red}, ${green}, 0)`;
        },
        ocean: (value) => {
            const blue = Math.floor(100 + (value * 155));
            const green = Math.floor(50 + (value * 100));
            return `rgb(0, ${green}, ${blue})`;
        },
        forest: (value) => {
            const green = Math.floor(50 + (value * 205));
            return `rgb(0, ${green}, 0)`;
        },
        monochrome: (value) => {
            const intensity = Math.floor(value * 255);
            return `rgb(${intensity}, ${intensity}, ${intensity})`;
        }
    };

    // Initialize canvas size
    function initCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    // Update settings from UI
    function updateSettings() {
        settings.mode = visualizationMode.value;
        settings.colorScheme = colorScheme.value;
        settings.sensitivity = sensitivity.value / 100;
        settings.smoothing = smoothing.checked;
        settings.fftSize = parseInt(fftSize.value);

        sensitivityValue.textContent = `${sensitivity.value}%`;

        if (analyser) {
            analyser.fftSize = settings.fftSize;
            analyser.smoothingTimeConstant = settings.smoothing ? 0.8 : 0;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
    }

    // Get available audio devices
    async function getAudioDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.warn('enumerateDevices() not supported.');
            return;
        }

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

            // Update input devices dropdown
            inputDevice.innerHTML = '<option value="">-- Select Microphone --</option>';
            audioInputs.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Microphone ${inputDevice.length}`;
                inputDevice.appendChild(option);
            });

            // Update output devices dropdown
            outputDevice.innerHTML = '<option value="">Default Output</option>';
            audioOutputs.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Output ${outputDevice.length}`;
                outputDevice.appendChild(option);
            });

            inputDevice.disabled = false;
        } catch (err) {
            console.error('Error enumerating devices:', err);
        }
    }

    // Start audio analysis
    async function startAnalysis() {
        if (isAnalyzing) return;

        try {
            audioContext = new(window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = settings.fftSize;
            analyser.smoothingTimeConstant = settings.smoothing ? 0.8 : 0;
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            const constraints = {
                audio: {
                    deviceId: inputDevice.value ? {
                        exact: inputDevice.value
                    } : undefined,
                    noiseSuppression: true,
                    echoCancellation: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            isAnalyzing = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            visualizationOverlay.classList.add('hidden');

            visualize();
        } catch (error) {
            console.error('Error starting analysis:', error);
            showError('Could not access microphone. Please ensure you have granted permission.');
        }
    }

    // Show error message
    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(errorElement);

        setTimeout(() => {
            errorElement.classList.add('show');
        }, 10);

        setTimeout(() => {
            errorElement.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(errorElement);
            }, 300);
        }, 5000);
    }

    // Stop audio analysis
    function stopAnalysis() {
        if (!isAnalyzing) return;

        cancelAnimationFrame(animationId);

        if (microphone) {
            microphone.disconnect();
            microphone.mediaStream.getTracks().forEach(track => track.stop());
        }

        if (audioContext) {
            audioContext.close();
        }

        isAnalyzing = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        visualizationOverlay.classList.remove('hidden');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Visualization functions
    function visualize() {
        if (!isAnalyzing) return;

        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (settings.mode) {
            case 'bars':
                drawBars();
                break;
            case 'wave':
                drawWave();
                break;
            case 'circle':
                drawCircle();
                break;
            case 'particles':
                drawParticles();
                break;
            case 'spectrum':
                drawSpectrum();
                break;
        }

        animationId = requestAnimationFrame(visualize);
    }

    function drawBars() {
        const barWidth = canvas.width / dataArray.length;
        const getColor = colorSchemes[settings.colorScheme];

        for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i] / 255 * settings.sensitivity;
            const barHeight = value * canvas.height;
            const x = i * barWidth;
            const y = canvas.height - barHeight;

            ctx.fillStyle = getColor(value, i, dataArray.length);
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
    }

    function drawWave() {
        ctx.beginPath();
        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;
        const getColor = colorSchemes[settings.colorScheme];

        for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i] / 255 * settings.sensitivity;
            const y = canvas.height - (value * canvas.height);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.strokeStyle = getColor(0.7, 0, 1);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawCircle() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.4;
        const angleStep = (Math.PI * 2) / dataArray.length;
        const getColor = colorSchemes[settings.colorScheme];

        ctx.beginPath();

        for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i] / 255 * settings.sensitivity;
            const lineLength = value * radius * 0.5;
            const angle = i * angleStep;

            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + lineLength);
            const y2 = centerY + Math.sin(angle) * (radius + lineLength);

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            ctx.strokeStyle = getColor(value, i, dataArray.length);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function drawParticles() {
        const particleCount = dataArray.length;
        const getColor = colorSchemes[settings.colorScheme];

        for (let i = 0; i < particleCount; i++) {
            const value = dataArray[i] / 255 * settings.sensitivity;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = value * 10 + 2;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = getColor(value, i, particleCount);
            ctx.fill();
        }
    }

    function drawSpectrum() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;
        const getColor = colorSchemes[settings.colorScheme];

        for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i] / 255 * settings.sensitivity;
            const radius = value * maxRadius;
            const angle = (i / dataArray.length) * Math.PI * 2;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fillStyle = getColor(value, i, dataArray.length);
            ctx.fill();
        }
    }

    // Toggle theme
    function toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'light';
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        themeSwitch.checked = savedTheme === 'light';
    }

    // Event Listeners
    startBtn.addEventListener('click', startAnalysis);
    stopBtn.addEventListener('click', stopAnalysis);
    window.addEventListener('resize', initCanvas);
    themeSwitch.addEventListener('change', toggleTheme);

    // Settings change listeners
    visualizationMode.addEventListener('change', updateSettings);
    sensitivity.addEventListener('input', updateSettings);
    fftSize.addEventListener('change', updateSettings);
    colorScheme.addEventListener('change', updateSettings);
    smoothing.addEventListener('change', updateSettings);
    inputDevice.addEventListener('change', () => {
        if (isAnalyzing) {
            stopAnalysis();
            startAnalysis();
        }
    });

    // Initialize
    initCanvas();
    initTheme();
    updateSettings();
    getAudioDevices();

    // Handle permission changes
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
});