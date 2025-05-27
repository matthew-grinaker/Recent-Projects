# I-Con Dashboard

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)](https://dotnet.microsoft.com/en-us/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

I-Con Dashboard is a modern, responsive monitoring system for managing and visualizing I-Con interface servers and their connections. This full-stack application provides real-time monitoring, alerting, and management capabilities for enterprise integration environments.

![I-Con Dashboard Screenshot](https://placehold.co/800x450?text=I-Con+Dashboard+Screenshot)

## Features

- **Real-time server monitoring** - Track CPU, memory usage, and server health metrics with live updates
- **Interface management** - Start, stop, and restart integration interfaces with a simple UI
- **Error tracking and alerts** - Detect, analyze, and resolve integration errors quickly
- **Performance metrics** - Visualize message throughput, queue depths, and processing times
- **Responsive dashboard** - Modern React-based UI that works on desktop and mobile devices
- **Secure authentication** - Role-based access control for different user types

## Architecture

The application consists of three main components:

1. **IconBridge** - Core .NET 8 backend service that communicates with I-Con servers using a TCP socket protocol
2. **IconBridge.Models** - Shared model library for cross-service data structures
3. **IconWebMonitor** - ASP.NET Core web application with React frontend for the monitoring dashboard

### Technology Stack

- **Backend**: 
  - .NET 8.0
  - ASP.NET Core
  - SignalR for real-time updates
  - Socket communication for legacy I-Con integration
  
- **Frontend**:
  - React 18
  - Modern JavaScript/TypeScript
  - Responsive UI components
  - Real-time charts and visualizations

## Key Components

### Server Monitoring

The system monitors I-Con servers in real-time, collecting performance metrics such as:
- CPU and memory utilization
- Connection status and response times
- Message queue depths
- System resource availability

### Interface Management

Operators can monitor and control integration interfaces through the dashboard:
- View current interface status and health
- Start, stop, and reset interfaces
- Track message processing metrics
- Analyze error logs and diagnostics

### Alerting System

The dashboard provides comprehensive alerting for integration issues:
- Configurable thresholds for CPU, memory, and queue depths
- Email and SMS notifications for critical events
- Historical alert tracking and acknowledgment
- Trend analysis for recurring problems

## Acknowledgments

- The I-Con integration framework team
- Modern .NET and React communities for excellent tools and libraries

