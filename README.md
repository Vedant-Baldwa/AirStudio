# AirStudio

AirStudio is a web-based, AI-powered musical performance application that allows users to play virtual instruments in thin air. By leveraging advanced hand tracking through your webcam, it translates your gestures into expressive musical notes and overlays augmented reality (AR) graphics to provide rich visual feedback.

## Features

- **Real-Time Hand Tracking:** Integrates MediaPipe and TensorFlow.js to accurately capture hand movements and gestures directly from your browser.
- **Interactive Virtual Instruments:** Includes modular instrument engines for:
  - 🥁 **Drums**
  - 🎸 **Guitar**
  - 🎹 **Piano**
  - 🎻 **Violin**
- **Dynamic Audio Generation:** Built on Tone.js to synthesize and playback high-quality audio reactively.
- **AR Visual Overlays:** Renders virtual instruments over your webcam feed, providing an immersive, augmented reality playing experience.
- **Gesture Classification System:** Custom rules and machine learning modules to detect strums, chord shapes, striking velocities, and other musical interactions.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Machine Learning / Computer Vision:** MediaPipe Hands, TensorFlow.js Models
- **Audio Engine:** Tone.js

## Project Structure

- `src/audio/`: Tone.js audio engine, samplers, and playback utilities.
- `src/cv/`: Computer vision logic, hand tracking integration, velocity estimation, and landmark processing.
- `src/gestures/`: Gesture classification, chord detection, and strumming rules.
- `src/instruments/`: Core musical instrument modules mapping gestures to sound.
- `src/ar/`: Augmented reality rendering components for visual feedback of the instruments.
- `src/hooks/`: Custom React hooks for managing state and lifecycles (audio, webcam, tracking).

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Vedant-Baldwa/AirStudio.git
   cd AirStudio
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server:
```bash
npm run dev
```

Navigate to `http://localhost:5173/` in your browser. Ensure you grant webcam permissions when prompted!

### Building for Production

To create an optimized production build:
```bash
npm run build
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the [MIT License](LICENSE). See `LICENSE` for more information.
