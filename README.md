# PixelLab MCP Server

A Model Context Protocol (MCP) server that provides advanced pixel art and game asset creation tools powered by the PixelLab AI API.

## 🚀 Features

- **21+ MCP Tools** - Complete PixelLab API integration
- **Character Generation** - 4D and 8D pixel art characters
- **Animation Support** - Template-based and text-driven animations
- **Terrain Creation** - Wang tilesets for seamless 2D environments
- **Image Generation** - Pixflux and Bitforge AI models
- **Asset Rotation** - Character viewpoint modifications
- **Skeleton Animation** - Advanced pose-based animation
- **API Documentation** - Complete LLM-optimized API reference

## 📋 Prerequisites

- Node.js 16+
- PixelLab API key (get from [pixellab.ai](https://pixellab.ai))
- MCP-compatible client (Cursor, VSCode with MCP extension, etc.)

## 🛠️ Installation

```bash
npm install
npm run build
```

## ⚙️ Configuration

Set your PixelLab API credentials:

```bash
export PIXELLAB_API_KEY="your_api_key_here"
export PIXELLAB_API_BASE_URL="https://api.pixellab.ai/v2"
```

## 🎮 Usage

### Available MCP Tools:

#### Character Creation
- `create_character` - Generate pixel art characters with directional sprites
- `get_8direction_character` - Full 360° rotation support

#### Animation
- `animate_character` - Template-based animations (walking, running, etc.)
- `animate_with_text` - Creative text-driven animation
- `animate_with_skeleton` - Professional skeleton-based animation

#### World Building
- `create_topdown_tileset` - Wang tilesets for 2D levels
- `create_isometric_tile` - Isometric assets

#### Image Generation
- `create_image_pixflux` - Advanced pixel art image generation
- `create_image_bitforge` - Alternative artistic style generation

#### Utilities
- `get_api_documentation` - Complete API reference for LLMs
- `get_balance` - Account credit and usage monitoring

## 📁 Project Structure

```
src/
├── index.ts          # Main MCP server implementation
├── pixelLab.ts       # PixelLab API wrapper
└── types.ts         # TypeScript definitions

build/               # Compiled JavaScript output
docs/                # Additional documentation
```

## 🤝 Contributing

This MCP server was developed as part of a comprehensive pixel art workflow project. Key milestones:

- ✅ **Complete PixelLab API Integration** - All 21 endpoints implemented
- ✅ **Production-Ready Code** - Error handling, validation, TypeScript
- ✅ **Testing & Validation** - Successful end-to-end functionality tests
- ✅ **Game Development Workflow** - 27 character sprites downloaded and organized

### Architecture Highlights:
- **Robust Error Handling** - Comprehensive validation and user feedback
- **TypeScript Implementation** - Full type safety and IDE support
- **MCP Compliance** - Standard Model Context Protocol implementation
- **Extensible Design** - Easy to add new PixelLab API endpoints

## 📞 Support

Created as a comprehensive AI-powered pixel art game development solution. Combines:
- **Professional Asset Creation** - High-quality AI-generated pixel art
- **Developer-Friendly Tools** - Intuitive MCP interface integration
- **Game Asset Workflow** - Complete pipeline from creation to download

**Empowering indie game developers with advanced AI pixel art creation tools!** 🎮✨
