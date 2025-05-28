# I-Con Web Monitor 🖥️

> **Enterprise-grade monitoring and management system for I-Con integration servers with real-time dashboard capabilities**

[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![SignalR](https://img.shields.io/badge/SignalR-Real--time-green.svg)](https://docs.microsoft.com/en-us/aspnet/signalr/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Project Overview

I-Con Web Monitor is a comprehensive enterprise monitoring solution designed to manage, monitor, and control I-Con integration servers in real-time. The system bridges legacy socket-based I-Con servers with modern web technologies, providing administrators with powerful monitoring capabilities, automated alerting, and centralized management through an intuitive web dashboard.

Screenshot of the dashboard using dummy data:

![I-Con Dashboard Screenshot](https://raw.githubusercontent.com/matthew-grinaker/projects/348a788eefebb79cda860eedbfb27facf7ec32c5/icon-monitoring-ui.svg)

### 🎯 Key Value Propositions

- **Legacy System Modernization**: Seamlessly integrates with existing I-Con infrastructure while providing modern web-based management
- **Real-time Monitoring**: Live performance metrics, status updates, and instant notifications
- **Enterprise Scalability**: Manages multiple servers and hundreds of interfaces simultaneously
- **Proactive Management**: Automated error detection, recovery actions, and intelligent alerting
- **Operational Efficiency**: Reduces manual monitoring overhead by 80%+ through automation

## ✨ Core Features

### 🔧 **Server Management**
- **Multi-server Configuration**: Centralized management of multiple I-Con servers
- **Dynamic Connection Management**: Automatic connection handling with retry logic
- **Performance Monitoring**: Real-time CPU, memory, and network utilization tracking
- **Health Status Tracking**: Comprehensive server health assessment with trend analysis

### 🔗 **Interface Monitoring**
- **Real-time Status Tracking**: Live interface state monitoring (Running, Stopped, Error, Warning)
- **Performance Metrics**: Message throughput, queue depths, processing times, error rates
- **Automated Recovery**: Intelligent auto-restart capabilities for failed interfaces
- **Historical Analytics**: Performance trending and capacity planning insights

### 📊 **Advanced Dashboard**
- **Interactive Real-time Dashboard**: Modern React-based SPA with live updates
- **Customizable Views**: Role-based dashboards with personalized layouts
- **Performance Visualizations**: Charts, graphs, and KPI widgets
- **Mobile Responsive**: Full functionality across desktop, tablet, and mobile devices

### 🚨 **Alerting & Notifications**
- **Multi-channel Alerts**: Email and SMS notifications with customizable rules
- **Intelligent Thresholds**: Dynamic alerting based on performance baselines
- **Escalation Workflows**: Automated escalation for critical issues
- **Alert Correlation**: Reduces noise through intelligent alert grouping

### 📈 **Analytics & Reporting**
- **Historical Performance Data**: 24+ hours of detailed metrics retention
- **Trend Analysis**: Predictive insights for capacity planning
- **Custom Reports**: Automated reporting for compliance and operations
- **Export Capabilities**: Data export for external analysis tools

## 🏗️ Architecture Overview

### **System Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Dashboard │    │   IconBridge     │    │   I-Con Servers │
│   (React SPA)   │◄──►│   Service        │◄──►│   (Legacy TCP)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SignalR Hub   │    │ Connection Mgr   │    │   Interface     │
│  (Real-time)    │    │ (Multi-server)   │    │   Endpoints     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Technology Stack**

#### **Backend Services**
- **.NET 8**: Modern, high-performance runtime
- **ASP.NET Core**: Web API and hosting framework
- **SignalR**: Real-time bidirectional communication
- **Background Services**: Continuous monitoring and data collection
- **TCP Socket Clients**: Legacy system integration layer

#### **Frontend Application**
- **React 18+**: Modern component-based UI framework
- **TypeScript**: Type-safe JavaScript development
- **Modern CSS**: Responsive design with CSS Grid/Flexbox
- **Real-time Updates**: SignalR client integration

#### **Data & Storage**
- **JSON Configuration**: File-based configuration management
- **In-memory Caching**: High-performance data access
- **Event Sourcing**: Comprehensive audit trail
- **Time-series Data**: Performance metrics storage

#### **Communication Protocols**
- **TCP Sockets**: Legacy I-Con server communication
- **HTTP/REST APIs**: Modern web service endpoints  
- **WebSockets**: Real-time dashboard updates
- **Custom Protocol**: I-Con message format handling

## 📋 Project Structure

```
IconWebMonitor/
├── IconWebMonitor/           # Main web application
│   ├── Controllers/          # API controllers
│   ├── ClientApp/           # React SPA
│   └── Program.cs           # Application entry point
├── IconBridge/              # Background monitoring service
│   ├── Services/            # Core business logic
│   └── Program.cs           # Service entry point
└── IconBridge.Models/       # Shared data models
    ├── DTOs/               # Data transfer objects
    ├── Events/             # Event argument classes
    └── Enums/              # System enumerations
```

## 🔧 Key Components

### **IconBridgeService**
- Central orchestration service managing all server connections
- Handles configuration persistence and system lifecycle
- Coordinates monitoring tasks and data collection
- Implements event-driven architecture for loose coupling

### **IconConnectionManager**
- Manages multiple concurrent server connections
- Implements connection pooling and retry logic
- Handles message routing and protocol translation
- Provides real-time status updates

### **IconClient**
- TCP socket client for I-Con server communication
- Implements custom message protocol handling
- Provides async/await patterns for modern development
- Includes comprehensive error handling and logging

## 🎯 Business Impact

- **Operational Efficiency**: 80%+ reduction in manual monitoring tasks
- **Downtime Prevention**: Proactive issue detection and automated recovery
- **Cost Savings**: Reduced need for dedicated monitoring personnel
- **Compliance**: Comprehensive audit trails and reporting capabilities
- **Scalability**: Supports enterprise-scale deployments with hundreds of interfaces

## 🛣️ Roadmap

- [ ] **Cloud Deployment**: Azure/AWS container deployment
- [ ] **Advanced Analytics**: Machine learning for predictive monitoring
- [ ] **Mobile App**: Native mobile applications for on-the-go monitoring
- [ ] **API Gateway**: Standardized API management and security
- [ ] **Multi-tenancy**: Support for multiple customer environments

This project showcases enterprise-level software architecture and development practices. It demonstrates proficiency in:

- **Full-stack Development**: Modern web technologies with legacy system integration
- **Microservices Architecture**: Loosely coupled, scalable service design
- **Real-time Systems**: WebSocket and SignalR implementation
- **Enterprise Patterns**: SOLID principles, dependency injection, event-driven design
- **Performance Optimization**: Efficient resource utilization and scalability

## 📞 Contact

**Professional Inquiries**: https://linkedin.com/in/mk-grinaker
**Technical Discussion**: matt@g-techsystems.com 
