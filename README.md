<div align="center">

# [Audio Analyzer](https://thatsinewave.github.io/Audio-Analyzer)

A real-time audio frequency visualization tool that transforms your microphone input into beautiful visual representations. This web application uses the Web Audio API to analyze and display audio frequencies in various visualization modes.

![Audio-Analyzer](https://raw.githubusercontent.com/ThatSINEWAVE/Audio-Analyzer/refs/heads/main/.github/SCREENSHOTS/Audio-Analyzer.png)

</div>

## Features

- **Multiple Visualization Modes**:
  - Bars: Classic frequency bar visualization
  - Waveform: Smooth wave representation
  - Circular: Radial frequency display
  - Particles: Dynamic particle system
  - Spectrum: Circular spectrum analyzer

- **Customizable Settings**:
  - Adjustable sensitivity
  - Multiple color schemes (Rainbow, Fire, Ocean, Forest, Monochrome)
  - FFT size configuration (32 to 2048)
  - Smoothing toggle

- **Device Selection**:
  - Choose between different input (microphone) devices
  - Select output devices (for future features)

- **Responsive Design**:
  - Works on desktop and mobile devices
  - Adapts to different screen sizes

- **Theme Support**:
  - Light and dark modes
  - Remembers user preference

<div align="center">

## ☕ [Support my work on Ko-Fi](https://ko-fi.com/thatsinewave)

</div>

## How to Use

1. Click "Start Analyzer" to begin (you'll need to grant microphone permissions)
2. Select your preferred visualization mode from the dropdown
3. Adjust settings to customize your experience:
   - Change sensitivity to control visualization intensity
   - Select different color schemes
   - Toggle smoothing for smoother transitions
4. Click "Stop" when finished

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses the Web Audio API for audio analysis
- RequestAnimationFrame for smooth animations
- Responsive design with CSS Grid and Flexbox
- Theme system using CSS variables

## Installation

This project is hosted on GitHub Pages and requires no installation. Simply visit the [live demo](https://your-username.github.io/audio-analyzer/).

To run locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/ThatSINEWAVE/Audio-Analyzer.git
   ```
2. Open `index.html` in a modern web browser

<div align="center">

## [Join my discord server](https://discord.gg/2nHHHBWNDw)

</div>

## Browser Support

The Audio Analyzer works best in modern browsers that support:
- Web Audio API
- MediaDevices API
- CSS Variables

Recommended browsers:
- Chrome
- Firefox
- Edge
- Safari

## Contributing

Contributions are welcome! If you want to contribute, feel free to fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
