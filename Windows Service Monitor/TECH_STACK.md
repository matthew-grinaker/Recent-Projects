# Technology Stack 🛠️

## Backend Technologies

### **.NET 8 Ecosystem**
- **Runtime**: .NET 8 LTS - Latest long-term support version
- **Framework**: ASP.NET Core - High-performance web framework
- **Language**: C# 12 - Modern object-oriented programming with latest features
- **Hosting**: Kestrel web server with reverse proxy support

```csharp
// Modern C# features utilized
public required string InterfaceName { get; set; }  // Required properties
public string Name => !string.IsNullOrWhiteSpace(DisplayName) ? DisplayName : InterfaceName;  // Expression-bodied members
var (serverId, success) = await ConnectToServerAsync(config);  // Tuple deconstruction
```

### **Dependency Injection & IoC**
```csharp
// Built-in DI container configuration
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IIconBridgeService, IconBridgeService>();
builder.Services.AddHostedService<IconBridgeService>();
```

**Advanced DI Features:**
- **Scoped Services**: Per-request service instances
- **Singleton Services**: Application-lifetime services
- **Factory Pattern**: Complex object creation
- **Options Pattern**: Strongly-typed configuration

### **Background Services & Hosting**
```csharp
public class IconBridgeService : BackgroundService, IIconBridgeService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Long-running background tasks
        while (!stoppingToken.IsCancellationRequested)
        {
            await PollServersAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(_config.PollingInterval), stoppingToken);
        }
    }
}
```

**Service Features:**
- **Hosted Services**: Background task execution
- **Graceful Shutdown**: Proper cancellation token handling
- **Service Lifetime Management**: Automatic service lifecycle
- **Windows Service Support**: Production deployment as Windows service

## Frontend Technologies

### **React Ecosystem**
- **React 18+**: Latest version with concurrent features
- **Create React App**: Standard React development setup
- **TypeScript Integration**: Type-safe JavaScript development
- **Modern JavaScript (ES2022+)**: Latest ECMAScript features

### **SPA Configuration**
```xml
<!-- ASP.NET Core SPA integration -->
<PropertyGroup>
    <SpaRoot>ClientApp\</SpaRoot>
    <SpaProxyServerUrl>https://localhost:44414</SpaProxyServerUrl>
    <SpaProxyLaunchCommand>npm start</SpaProxyLaunchCommand>
</PropertyGroup>
```

**Development Features:**
- **Hot Module Replacement**: Fast development iteration
- **Proxy Configuration**: Backend API integration during development
- **Build Optimization**: Production-ready bundling and minification
- **Progressive Web App**: PWA capabilities for offline functionality

### **UI/UX Technologies**
- **CSS3 Grid & Flexbox**: Modern layout techniques
- **Responsive Design**: Mobile-first approach
- **CSS Custom Properties**: Dynamic styling capabilities
- **Modern Browser APIs**: WebSocket, Web Workers, Service Workers

## Data & Storage Technologies

### **Configuration Management**
```csharp
// JSON-based configuration with strong typing
public class SystemConfig
{
    [JsonPropertyName("applicationName")]
    public string ApplicationName { get; set; } = "Icon Web Monitor";
    
    [Range(5, 3600)]
    [JsonPropertyName("pollingIntervalSeconds")]
    public int PollingIntervalSeconds { get; set; } = 60;
}
```

**Storage Strategy:**
- **File-Based Configuration**: JSON configuration files
- **In-Memory Caching**: High-performance data access
- **Data Validation**: Comprehensive validation attributes
- **Configuration Hot-Reload**: Runtime configuration updates

### **Serialization & Data Transfer**
```csharp
private readonly JsonSerializerOptions _jsonOptions = new()
{
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
```

**Serialization Features:**
- **System.Text.Json**: High-performance JSON serialization
- **Custom Converters**: Specialized data type handling
- **Camel Case Naming**: JavaScript-friendly JSON format
- **Validation Integration**: Data annotation validation

## Communication Technologies

### **Real-time Communication**
```csharp
// SignalR for real-time updates
builder.Services.AddSignalR();
app.MapHub<MonitoringHub>("/monitoringHub");

// Real-time event broadcasting
public async Task BroadcastServerStatus(ServerStatusChangedEventArgs args)
{
    await Clients.All.SendAsync("ServerStatusChanged", args);
}
```

**SignalR Features:**
- **WebSocket Transport**: Primary real-time communication
- **Fallback Transports**: Server-Sent Events, Long Polling
- **Automatic Reconnection**: Client-side reconnection logic
- **Group Management**: Targeted message broadcasting

### **TCP Socket Communication**
```csharp
public class IconClient : IDisposable
{
    private TcpClient _tcpClient;
    private NetworkStream _stream;
    
    public async Task<IconMessage> SendCommandAsync(string command, 
                                                   CancellationToken cancellationToken)
    {
        // Custom protocol implementation
        var formattedCommand = command.Length.ToString("D10") + command;
        var data = Encoding.UTF8.GetBytes(formattedCommand);
        
        await _stream.WriteAsync(data, 0, data.Length, cancellationToken);
        return await WaitForResponseAsync(cancellationToken);
    }
}
```

**Socket Features:**
- **Async Socket Programming**: Non-blocking I/O operations
- **Custom Protocol**: I-Con legacy protocol implementation
- **Connection Pooling**: Efficient resource management
- **Error Recovery**: Automatic reconnection and retry logic

## Concurrency & Async Programming

### **Advanced Async Patterns**
```csharp
// Concurrent collections for thread safety
private readonly ConcurrentDictionary<string, IconClient> _clients = new();
private readonly ConcurrentDictionary<string, TaskCompletionSource<IconMessage>> _pendingCommands = new();

// Async enumerable for streaming data
public async IAsyncEnumerable<ServerStatus> GetServerStatusStream(
    [EnumeratorCancellation] CancellationToken cancellationToken)
{
    while (!cancellationToken.IsCancellationRequested)
    {
        yield return await GetCurrentServerStatus();
        await Task.Delay(1000, cancellationToken);
    }
}
```

**Concurrency Features:**
- **Task-Based Asynchronous Pattern (TAP)**: Modern async programming
- **CancellationToken**: Cooperative cancellation throughout
- **ConfigureAwait(false)**: Deadlock prevention in libraries
- **Concurrent Collections**: Thread-safe data structures

### **Performance Optimization**
```csharp
// Memory-efficient bounded collections
public void UpdatePerformanceHistory(PerformanceDataPoint dataPoint)
{
    PerformanceHistory.Add(dataPoint);
    
    // Maintain 24-hour window (288 points at 5-minute intervals)
    if (PerformanceHistory.Count > 288)
    {
        PerformanceHistory.RemoveRange(0, PerformanceHistory.Count - 288);
    }
}
```

## Architecture Patterns & Design

### **Domain-Driven Design (DDD)**
```csharp
// Rich domain models with business logic
public class InterfaceStatus
{
    public InterfaceHealthStatus HealthStatus
    {
        get
        {
            if (!IsEnabled) return InterfaceHealthStatus.Disabled;
            if (State == InterfaceState.Error || ConsecutiveErrorCount > 5)
                return InterfaceHealthStatus.Critical;
            if (State == InterfaceState.Running && ErrorRate < 1)
                return InterfaceHealthStatus.Healthy;
            return InterfaceHealthStatus.Unknown;
        }
    }
}
```

**DDD Implementation:**
- **Aggregate Roots**: Core business entities
- **Value Objects**: Immutable data structures
- **Domain Services**: Business logic coordination
- **Repository Pattern**: Data access abstraction

### **Event-Driven Architecture**
```csharp
// Comprehensive event system
public event EventHandler<ServerStatusChangedEventArgs> ServerStatusChanged;
public event EventHandler<InterfaceStatusChangedEventArgs> InterfaceStatusChanged;
public event EventHandler<MessageProcessedEventArgs> MessageProcessed;

// Rich event arguments with business context
public class ServerStatusChangedEventArgs : EventArgs
{
    public bool IsErrorCondition { get; }
    public bool RequiresNotification { get; }
    public double TimeInPreviousStatus { get; }
}
```

**Event Features:**
- **Strongly-Typed Events**: Type-safe event handling
- **Event Aggregation**: Centralized event coordination
- **Async Event Handlers**: Non-blocking event processing
- **Event Sourcing**: Complete audit trail capability

## Development & Build Tools

### **Project Structure & Build System**
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
        <TargetFramework>net8.0</TargetFramework>
        <Nullable>enable</Nullable>
        <ImplicitUsings>enable</ImplicitUsings>
    </PropertyGroup>
    
    <PackageReference Include="Microsoft.AspNetCore.SpaProxy" Version="7.0.20"/>
    <PackageReference Include="Microsoft.AspNetCore.SignalR" Version="1.2.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="8.1.2" />
</Project>
```

**Build Features:**
- **SDK-Style Projects**: Modern project format
- **Nullable Reference Types**: Enhanced null safety
- **Implicit Usings**: Reduced boilerplate code
- **Multi-targeting**: Support multiple framework versions

### **Development Environment**
```json
// Launch configuration
{
  "profiles": {
    "IconWebMonitor": {
      "commandName": "Project",
      "launchBrowser": true,
      "applicationUrl": "https://localhost:7286;http://localhost:5056",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ASPNETCORE_HOSTINGSTARTUPASSEMBLIES": "Microsoft.AspNetCore.SpaProxy"
      }
    }
  }
}
```

## Quality & Testing Technologies

### **Code Quality Tools**
- **Nullable Reference Types**: Compile-time null safety
- **Code Analysis**: Static code analysis rules
- **EditorConfig**: Consistent code formatting
- **XML Documentation**: Comprehensive API documentation

### **Validation & Error Handling**
```csharp
// Comprehensive validation with data annotations
public class ServerConfig
{
    [Required(ErrorMessage = "Hostname is required")]
    [StringLength(255, ErrorMessage = "Hostname cannot exceed 255 characters")]
    public string HostName { get; set; }
    
    [Range(1, 65535, ErrorMessage = "Port must be between 1 and 65535")]
    public int Port { get; set; }
    
    public List<string> Validate()
    {
        var errors = new List<string>();
        // Custom validation logic
        return errors;
    }
}
```

## Deployment & DevOps Technologies

### **Container Support**
```dockerfile
# Multi-stage Docker build
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["IconWebMonitor.csproj", "."]
RUN dotnet restore
```

### **Configuration Management**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "IconSettings": {
    "Separator": "|",
    "DefaultPort": 12001,
    "ConnectionTimeout": 30000
  }
}
```

**Deployment Features:**
- **Environment-Specific Configuration**: Dev/staging/production configs
- **Health Checks**: Application health monitoring endpoints
- **Logging Integration**: Structured logging with providers
- **Windows Service**: Production deployment as Windows service

## Security Technologies

### **Authentication & Authorization**
```csharp
// Security configuration support
public class InterfaceSecuritySettings
{
    public AuthenticationType AuthenticationType { get; set; }
    public bool EncryptMessages { get; set; }
    public bool ValidateSignatures { get; set; }
    public string CertificatePath { get; set; }
}

public enum AuthenticationType
{
    None, Basic, OAuth2, ApiKey, Certificate, WindowsAuthentication, Custom
}
```

**Security Features:**
- **HTTPS Enforcement**: Secure communication by default
- **Data Encryption**: Sensitive data protection
- **Certificate Management**: X.509 certificate support
- **Authentication Providers**: Multiple auth mechanism support

## Monitoring & Observability

### **Comprehensive Logging**
```csharp
// Structured logging with Microsoft.Extensions.Logging
_logger.LogInformation("Server {ServerName} ({ServerHost}:{ServerPort}) status changed from {PreviousStatus} to {CurrentStatus}",
    serverConfig.ServerName, serverConfig.HostName, serverConfig.HostPort, previousStatus, currentStatus);

// Performance tracking
using var activity = ActivitySource.StartActivity("ProcessMessage");
activity?.SetTag("messageType", message.Type);
activity?.SetTag("serverId", serverId);
```

**Observability Features:**
- **Structured Logging**: JSON-formatted log output
- **Distributed Tracing**: Request correlation across services
- **Performance Counters**: Custom metrics collection
- **Health Checks**: Application health monitoring

---

*This comprehensive technology stack demonstrates modern software development practices, enterprise-grade architecture patterns, and cutting-edge technologies for building scalable, maintainable, and high-performance applications.*