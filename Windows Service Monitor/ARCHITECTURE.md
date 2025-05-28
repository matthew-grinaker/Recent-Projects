# Technical Architecture 🏗️

## System Architecture Overview

The I-Con Web Monitor follows a **microservices architecture** with clear separation of concerns, enabling scalability, maintainability, and independent deployment of components.

## 🎯 Architecture Principles

### **Domain-Driven Design (DDD)**
- **Bounded Contexts**: Clear separation between monitoring, configuration, and communication domains
- **Aggregate Roots**: ServerConfig, InterfaceStatus, and SystemConfig as primary aggregates
- **Value Objects**: Performance metrics, connection info, and configuration settings
- **Domain Events**: Status changes, errors, and system notifications

### **SOLID Principles Implementation**
- **Single Responsibility**: Each service handles one core concern
- **Open/Closed**: Extensible through interfaces and dependency injection
- **Liskov Substitution**: Polymorphic message handling and protocol abstraction
- **Interface Segregation**: Focused interfaces like `IIconBridgeService`
- **Dependency Inversion**: IoC container and interface-based programming

## 🏛️ System Components

### **1. Web Application Layer (IconWebMonitor)**

```csharp
// Modern ASP.NET Core architecture
public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        // Service registration
        builder.Services.AddControllersWithViews();
        builder.Services.AddSignalR(); // Real-time communication
        
        var app = builder.Build();
        
        // Modern middleware pipeline
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();
        app.MapHub<MonitoringHub>("/monitoringHub");
        
        app.Run();
    }
}
```

**Key Features:**
- **SPA Hosting**: Integrated React development with hot reload
- **API Controllers**: RESTful endpoints for all CRUD operations
- **SignalR Hub**: Real-time push notifications to clients
- **Middleware Pipeline**: Authentication, CORS, and error handling

### **2. Background Service Layer (IconBridge)**

```csharp
public class IconBridgeService : BackgroundService, IIconBridgeService
{
    // Hosted service implementing monitoring loop
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await PollServersAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(_systemConfig.PollingIntervalSeconds), 
                           stoppingToken);
        }
    }
}
```

**Architecture Patterns:**
- **Background Service**: Long-running monitoring tasks
- **Event-Driven**: Pub/Sub pattern for status changes
- **Circuit Breaker**: Fault tolerance for external connections
- **Retry Pattern**: Exponential backoff for failed operations

### **3. Connection Management (IconConnectionManager)**

```csharp
public class IconConnectionManager : IDisposable
{
    private readonly ConcurrentDictionary<string, IconClient> _clients = new();
    private readonly ConcurrentDictionary<string, ServerStatus> _serverStatuses = new();
    
    // Thread-safe connection pool management
    public async Task<bool> AddServerAsync(ServerConfig serverConfig, 
                                         CancellationToken cancellationToken = default)
    {
        // Implements connection pooling and lifecycle management
    }
}
```

**Concurrency Patterns:**
- **Thread-Safe Collections**: ConcurrentDictionary for high-performance access
- **Async/Await**: Non-blocking I/O operations throughout
- **Connection Pooling**: Efficient resource utilization
- **Graceful Shutdown**: Proper resource cleanup and disposal

## 🗄️ Data Architecture

### **Domain Models**

#### **ServerConfig - Configuration Aggregate**
```csharp
public class ServerConfig
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string HostName { get; set; }
    public string ServerName { get; set; }
    public string HostPort { get; set; } = "12001";
    public bool MonitoringEnabled { get; set; } = true;
    
    // Rich domain methods
    public bool IsValid => !string.IsNullOrWhiteSpace(HostName) && 
                          !string.IsNullOrWhiteSpace(ServerName);
    
    public void UpdateLastContact() { /* ... */ }
    public void RecordFailure(string errorMessage = "") { /* ... */ }
}
```

#### **InterfaceStatus - Runtime State Aggregate**
```csharp
public class InterfaceStatus
{
    public InterfaceState State { get; set; }
    public float MessagesPerMinute { get; set; }
    public float ErrorRate { get; set; }
    public List<InterfacePerformanceDataPoint> PerformanceHistory { get; set; }
    
    // Complex business logic encapsulation
    public InterfaceHealthStatus HealthStatus { get; }
    public bool RequiresImmediateAttention(this InterfaceStatus status) { /* ... */ }
    public PerformanceTrend GetPerformanceTrend(TimeSpan period) { /* ... */ }
}
```

### **Event-Driven Architecture**

```csharp
// Comprehensive event system
public event EventHandler<ServerStatusChangedEventArgs> ServerStatusChanged;
public event EventHandler<InterfaceStatusChangedEventArgs> InterfaceStatusChanged;
public event EventHandler<MessageProcessedEventArgs> MessageProcessed;

// Rich event arguments with business context
public class ServerStatusChangedEventArgs : EventArgs
{
    public string ServerId { get; }
    public ServerStatusType PreviousStatus { get; }
    public ServerStatusType CurrentStatus { get; }
    public bool IsErrorCondition { get; }
    public bool RequiresNotification { get; }
}
```

## 🔌 Integration Layer

### **Legacy System Integration**

#### **IconClient - TCP Socket Communication**
```csharp
public class IconClient : IDisposable
{
    private TcpClient _tcpClient;
    private NetworkStream _stream;
    
    // Async socket communication with I-Con protocol
    public async Task<IconMessage> SendCommandAsync(string command, 
                                                   int timeoutMs = 0, 
                                                   CancellationToken cancellationToken = default)
    {
        // Protocol: 10-digit length prefix + command
        var formattedCommand = command.Length.ToString("D10") + command;
        var data = Encoding.UTF8.GetBytes(formattedCommand);
        
        await _stream.WriteAsync(data, 0, data.Length, cancellationToken);
        return await WaitForResponseAsync(cancellationToken);
    }
}
```

#### **Message Protocol Handling**
```csharp
// Custom protocol parser for I-Con messages
private async Task ProcessCompleteMessagesAsync()
{
    while (bufferContent.Length > 10)
    {
        // Parse 10-digit length prefix
        if (!int.TryParse(bufferContent.Substring(0, 10), out var messageLength))
            break;
            
        var totalLength = 10 + messageLength;
        if (bufferContent.Length >= totalLength)
        {
            var messageContent = bufferContent.Substring(10, messageLength);
            await ProcessMessageAsync(messageContent);
        }
    }
}
```

## 🚀 Performance Architecture

### **High-Performance Patterns**

#### **Concurrent Processing**
```csharp
// Non-blocking concurrent operations
private readonly ConcurrentDictionary<string, TaskCompletionSource<IconMessage>> _pendingCommands 
    = new ConcurrentDictionary<string, TaskCompletionSource<IconMessage>>();

// Efficient message correlation
public async Task<IconMessage> SendCommandAsync(string command)
{
    var commandId = Guid.NewGuid().ToString();
    var tcs = new TaskCompletionSource<IconMessage>();
    _pendingCommands[commandId] = tcs;
    
    // Send command and await response
    return await tcs.Task;
}
```

#### **Memory-Efficient Data Structures**
```csharp
// Bounded collections for memory management
public void AddPerformanceData(PerformanceDataPoint dataPoint)
{
    PerformanceHistory.Add(dataPoint);
    
    // Keep only last 24 hours (288 points at 5-minute intervals)
    if (PerformanceHistory.Count > 288)
    {
        PerformanceHistory.RemoveRange(0, PerformanceHistory.Count - 288);
    }
}
```

### **Scalability Considerations**

- **Connection Pooling**: Efficient resource utilization for multiple servers
- **Message Queuing**: Buffered processing to handle traffic bursts
- **Lazy Loading**: On-demand data retrieval for UI components
- **Caching Strategy**: In-memory caching with TTL for frequently accessed data

## 🔒 Security Architecture

### **Configuration Security**
```csharp
public class InterfaceSecuritySettings
{
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty; // Encrypted storage
    
    [JsonPropertyName("apiKey")]
    public string ApiKey { get; set; } = string.Empty; // Encrypted storage
    
    public bool RequiresAuthentication { get; set; }
    public AuthenticationType AuthenticationType { get; set; }
}
```

### **Connection Security**
- **Encrypted Credentials**: Sensitive data encryption at rest
- **Secure Communication**: TLS support for production deployments
- **Authentication Providers**: Multiple auth mechanism support
- **Certificate Management**: X.509 certificate handling

## 📊 Monitoring & Observability

### **Comprehensive Logging**
```csharp
// Structured logging throughout the application
_logger.LogInformation("Server {ServerName} status changed from {PreviousStatus} to {CurrentStatus}",
    serverConfig.ServerName, previousStatus, currentStatus);

// Performance metrics logging
_logger.LogDebug("Processing message from {Hostname}: {MessageType} - {ProcessingTimeMs}ms",
    hostname, messageType, processingTime);
```

### **Health Checks & Metrics**
- **Custom Health Checks**: Server connectivity and performance validation
- **Performance Counters**: CPU, memory, and throughput metrics
- **Error Tracking**: Comprehensive error categorization and trending
- **Alerting Integration**: Multi-channel notification system

## 🔄 Deployment Architecture

### **Container-Ready Design**
```dockerfile
# Optimized for containerized deployment
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM base AS final
COPY . .
ENTRYPOINT ["dotnet", "IconWebMonitor.dll"]
```

### **Configuration Management**
- **Environment-Specific**: Separate configs for dev/staging/production
- **External Configuration**: Support for Azure Key Vault, AWS Secrets Manager
- **Hot Reload**: Runtime configuration updates without service restart
- **Validation**: Comprehensive configuration validation on startup

## 🎯 Quality Attributes

### **Reliability**
- **Circuit Breaker Pattern**: Prevents cascade failures
- **Retry Logic**: Exponential backoff for transient failures
- **Graceful Degradation**: Continues operation with reduced functionality
- **Comprehensive Error Handling**: Try-catch blocks with proper logging

### **Performance**
- **Async/Await**: Non-blocking operations throughout
- **Connection Pooling**: Efficient resource utilization
- **Memory Management**: Bounded collections and proper disposal
- **Optimized Queries**: Efficient data access patterns

### **Maintainability**
- **Clean Architecture**: Clear separation of concerns
- **Dependency Injection**: Loose coupling and testability
- **Configuration-Driven**: Behavior modification without code changes
- **Comprehensive Documentation**: Inline comments and XML documentation

---

*This architecture demonstrates advanced software engineering practices including microservices design, event-driven architecture, high-performance concurrent programming, and enterprise-grade reliability patterns.*