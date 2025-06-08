# dcyde

A modern, intuitive priority matrix application built with React and TypeScript. Organize your tasks using the Eisenhower Matrix (Urgent/Important) methodology with a beautiful, responsive interface.

## ✨ Features

- **🎯 Priority Matrix**: Organize tasks using the proven Eisenhower Matrix methodology
- **📊 Multiple Matrices**: Create and manage multiple matrices for different projects or contexts
- **🔄 Cross-Matrix Movement**: Move tasks between different matrices seamlessly
- **💾 Local Storage**: All data persists locally in your browser
- **📱 Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **🚀 URL Routing**: Each matrix gets its own URL for easy bookmarking and sharing
- **⚡ Real-time Updates**: Instant UI updates with smooth animations
- **🎨 Modern UI**: Clean, intuitive interface with hover effects and visual feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Clarru/dcyde.git
cd dcyde
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Built With

- **React 18** - UI framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Smooth animations

## 📋 Usage

### Creating Your First Matrix

1. Click "New Matrix" on the home page
2. Give your matrix a name (e.g., "Work Tasks", "Personal Goals")
3. Start adding tasks to the appropriate quadrants

### The Four Quadrants

- **🔴 Do First** (Urgent & Important): Critical tasks requiring immediate attention
- **🔵 Schedule** (Important, Not Urgent): Important tasks to plan and schedule
- **🟡 Delegate** (Urgent, Not Important): Tasks that can be delegated to others
- **⚫ Eliminate** (Neither Urgent nor Important): Tasks to minimize or eliminate

### Managing Tasks

- **Add Tasks**: Click the "+" button in any quadrant
- **Edit Tasks**: Right-click on any task and select "Edit Task"
- **Move Tasks**: Drag and drop between quadrants or use the context menu
- **Cross-Matrix Movement**: Right-click → "Move to Matrix" to move tasks between matrices
- **Bulk Operations**: Use the three-dots menu in quadrant headers for bulk actions

### Navigation

- **Home**: `/` - View all your matrices
- **Matrix View**: `/matrix-name` - Each matrix gets its own URL
- **Browser Navigation**: Use back/forward buttons to navigate between matrices

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared components (Header, Toast, etc.)
│   ├── matrix/         # Matrix-specific components
│   ├── pages/          # Page components
│   └── task/           # Task-related components
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Components

- **AllMatricesPage**: Homepage showing all matrices
- **MatrixPage**: Individual matrix view with quadrants
- **TaskCard**: Individual task component with drag & drop
- **Quadrant**: Container for tasks in each priority level
- **Header**: Navigation and matrix title management

### State Management

The app uses Zustand for state management with two main stores:

- **useTaskStore**: Manages tasks within the current matrix
- **useMatrixStore**: Manages multiple matrices and cross-matrix operations

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (Prettier configuration included)
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Eisenhower Matrix productivity methodology
- Built with modern React patterns and best practices
- Icons provided by [Lucide](https://lucide.dev/)

## 📞 Support

If you have any questions or need help:

- 🐛 [Report a Bug](https://github.com/Clarru/dcyde/issues)
- 💡 [Request a Feature](https://github.com/Clarru/dcyde/issues)
- 💬 [Join Discussions](https://github.com/Clarru/dcyde/discussions)

---

Made with ❤️ by [Clarru](https://github.com/Clarru)

**⭐ Star this repo if you find it helpful!** 
