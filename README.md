# Archify MCP Server 🏗️

> MCP Server chuyên phân tích dự án và đề xuất công nghệ phù hợp

## 🎯 Features

| Tool | Description |
|------|-------------|
| `analyze_project` | Phân tích chuyên sâu ý tưởng dự án |
| `recommend_stack` | Đề xuất tech stack phù hợp (40+ technologies) |
| `suggest_features` | Đề xuất tính năng theo MoSCoW priority |
| `compare_tech` | So sánh công nghệ side-by-side |
| `design_architecture` | Thiết kế kiến trúc với Mermaid diagrams |
| `estimate_project` | Ước lượng timeline, team, và chi phí |
| `generate_roadmap` | Tạo roadmap với Gantt chart |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## ⚙️ Configuration

Add to your MCP client config (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "archify": {
      "command": "node",
      "args": ["/Users/tai/Desktop/Archify/dist/index.js"]
    }
  }
}
```

Or for development:

```json
{
  "mcpServers": {
    "archify": {
      "command": "npx",
      "args": ["tsx", "/Users/tai/Desktop/Archify/src/index.ts"]
    }
  }
}
```

## 📊 Supported Project Types

`ecommerce` • `saas` • `social_network` • `marketplace` • `content_platform` • `fintech` • `healthtech` • `edtech` • `iot` • `ai_ml` • `gaming` • `enterprise` • `mobile_app` • `api_service` • `devtool`

## 🛠️ Technology Knowledge Base

40+ technologies scored across 8 criteria:
- Performance, Scalability, Developer Experience
- Ecosystem, Security, Cost Efficiency
- Documentation, Community Support

## 📐 Architecture Patterns

8 patterns: Monolith, Modular Monolith, Microservices, Serverless, Event-Driven, JAMstack, Clean Architecture, BFF
