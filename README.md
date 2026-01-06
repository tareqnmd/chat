# Internal GPT - Minimalist AI Chat Interface

A modern, privacy-focused AI chat application built with **Angular (v21)** and **Tailwind CSS (v4)**. Designed for simplicity, aesthetics, and flexibility, allowing you to connect with any OpenAI-compatible API (like OpenAI, DeepSeek, Groq, or LocalAI).

![Internal GPT Interface](file:///home/tareq/.gemini/antigravity/brain/09af3a2a-a6a8-4b59-8f39-f27903fbe5c0/app_hero_welcome_1767517894251.png)
_(Welcome Screen)_

![Chat Interface](file:///home/tareq/.gemini/antigravity/brain/09af3a2a-a6a8-4b59-8f39-f27903fbe5c0/app_main_interface_1767517911338.png)
_(Active Chat Interface)_

## ✨ Features

- **Minimalist Design**: Clean, distraction-free UI inspired by modern chat interfaces.
- **Offline Support (PWA)**: Full Progressive Web App support ensures the app works offline and is installable.
- **Scalable Storage**: Uses **IndexedDB** for high-performance, asynchronous storage of large chat histories.
- **Multi-Session History**: Navigate through past conversations with a dedicated history view.
- **Real-time Search**: Quickly find past chats by title or message content.
- **Code Optimization**: Rich code block rendering with "Copy Code" functionality.
- **Dynamic AI Provider**: Switch seamlessly between OpenAI and custom/compatible providers (e.g., DeepSeek, Groq) by configuring the Base URL.
- **Private & Secure**: API keys are stored locally in your browser. No backend tracking.
- **Customizable**: Toggle between Light and Dark modes.
- **Responsive**: Fully optimized for desktop and mobile with standardized Flex/Grid layouts.

## 🛠️ Technology Stack

- **Framework**: Angular 21 (Standalone Components, Signals/RxJS)
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Persistence**: IndexedDB (Native API) + `localStorage` (Settings only)
- **Offline**: `@angular/service-worker` (PWA)
- **Notifications**: `ngx-sonner`
- **Linting/Formatting**: Prettier + Husky + lint-staged
- **Build Tool**: Angular CLI (esbuild)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/tareqnmd/chat.git
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

4.  **Format Code (Optional)**

    ```bash
    npm run format
    ```

5.  **Open in Browser**
    Navigate to `http://localhost:4200`.

## ⚙️ Configuration

Click the **Settings** (gear icon) in the header to configure your AI connection:

| Setting        | Description                                                                      |
| :------------- | :------------------------------------------------------------------------------- |
| **Provider**   | Choose "OpenAI" (default) or "Custom".                                           |
| **Base URL**   | The API endpoint (e.g., `https://api.openai.com/v1` or your local endpoint).     |
| **Model Name** | Specify the model handling the request (e.g., `gpt-3.5-turbo`, `deepseek-chat`). |
| **API Key**    | Your provider's API key. Stored locally.                                         |

## 📐 Architecture

For a deep dive into the system design, core services, and component structure, please refer to the [Architecture Documentation](./ARCHITECTURE.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
