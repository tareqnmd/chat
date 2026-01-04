# Internal GPT - Minimalist AI Chat Interface

A modern, privacy-focused AI chat application built with **Angular (v21)** and **Tailwind CSS (v4)**. Designed for simplicity, aesthetics, and flexibility, allowing you to connect with any OpenAI-compatible API (like OpenAI, DeepSeek, Groq, or LocalAI).

![Internal GPT Interface](file:///home/tareq/.gemini/antigravity/brain/09af3a2a-a6a8-4b59-8f39-f27903fbe5c0/app_hero_welcome_1767517894251.png)
_(Welcome Screen)_

![Chat Interface](file:///home/tareq/.gemini/antigravity/brain/09af3a2a-a6a8-4b59-8f39-f27903fbe5c0/app_main_interface_1767517911338.png)
_(Active Chat Interface)_

## ✨ Features

- **Minimalist Design**: Clean, distraction-free UI inspired by modern chat interfaces.
- **Dynamic AI Provider**: Switch seamlessly between OpenAI and custom/compatible providers (e.g., DeepSeek, LocalAI) by configuring the Base URL.
- **Private & Secure**: API keys and settings are stored locally in your browser (`localStorage`). No backend tracking.
- **Customizable**: Toggle between Light and Dark modes.
- **Responsive**: Fully optimized for desktop and mobile.
- **Toast Notifications**: Interactive feedback for actions like clearing chat or errors.

## 🛠️ Technology Stack

- **Framework**: Angular 21 (Standalone Components, Signals/RxJS)
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **State Management**: RxJS BehaviorSubject
- **Notifications**: `ngx-sonner`
- **Build Tool**: Angular CLI (esbuild)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/internal-gpt.git
    cd internal-gpt
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the development server**

    ```bash
    npm start
    ```

4.  **Open in Browser**
    Navigate to `http://localhost:4200`.

## ⚙️ Configuration

Click the **Settings** (gear icon) in the header to configure your AI connection:

| Setting        | Description                                                                  |
| :------------- | :--------------------------------------------------------------------------- |
| **Provider**   | Choose "OpenAI" (default) or "Custom".                                       |
| **Base URL**   | The API endpoint (e.g., `https://api.openai.com/v1` or your local endpoint). |
| **Model Name** | Specify the model handling the request (e.g., `gpt-4`, `deepseek-chat`).     |
| **API Key**    | Your provider's API key. Stored locally.                                     |

## 📐 Architecture

For a deep dive into the system design, core services, and component structure, please refer to the [Architecture Documentation](./ARCHITECTURE.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
