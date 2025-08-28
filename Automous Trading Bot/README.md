# Trading Bot

An automated trading bot that executes trades based on TradingView webhooks. This system allows you to create strategies in TradingView and have them automatically executed in your trading account.

## Features

- **Webhook Integration**: Receives signals from TradingView alerts
- **Multiple Strategies**: Support for RSI-based strategies with more to come
- **Position Management**: Supports position pyramiding (adding to positions)
- **Multiple Brokers**: Extendable architecture with Mock and Herenya implementations
- **Database Tracking**: Tracks all positions, trades, and configurations
- **Notifications**: Telegram notifications for trades, errors, and system events
- **API**: RESTful API for monitoring and management

## Project Structure

```
trading_bot/
├── api/                  # FastAPI endpoints and API models
├── brokers/              # Broker integrations 
├── core/                 # Core trading logic
├── models/               # Pydantic data models
├── notifications/        # Notification systems
├── scripts/              # Utility scripts
├── tests/                # Test suite
├── config.py             # Configuration handling
├── database.py           # Database models and connection
├── exceptions.py         # Custom exceptions
└── logging_config.py     # Logging configuration
```

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trading-bot.git
   cd trading-bot
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp env-example.txt .env
   # Edit .env with your configuration
   ```

5. Create the database:
   ```bash
   # In PostgreSQL
   CREATE DATABASE trading_bot;
   ```

6. Set up the database schema:
   ```bash
   python scripts/setup_db.py
   ```

7. Generate initial configuration:
   ```bash
   python scripts/generate_config.py --output initial_config.json
   ```

## Running the Bot

1. Start the API server:
   ```bash
   python run.py
   # or
   uvicorn trading_bot.api.routes:app --host 0.0.0.0 --port 8000 --reload
   ```

2. The server will be available at:
   ```
   http://localhost:8000
   ```

3. Access the API documentation at:
   ```
   http://localhost:8000/docs
   ```

## Setting Up TradingView Alerts

1. In TradingView, create a new alert with a webhook URL:
   ```
   http://your-server:8000/webhook/your-webhook-key
   ```

2. Set the webhook payload to JSON format with the following structure:
   ```json
   {
     "action": "RSI_LONG_ENTRY",
     "price": {{close}},
     "time": "{{time}}"
   }
   ```

3. See detailed instructions in [docs/tradingview_setup.md](docs/tradingview_setup.md)

## Available Webhook Actions

- `RSI_LONG_ENTRY`: Signal to enter a long position
- `RSI_SHORT_ENTRY`: Signal to enter a short position
- `RSI_CLOSE_LONG`: Signal to close long positions
- `RSI_CLOSE_SHORT`: Signal to close short positions

## API Endpoints

- `GET /health`: Health check endpoint
- `GET /bots`: List all active trading bots
- `GET /positions`: List all open positions
- `GET /trades`: List recent trades
- `POST /webhook/{webhook_key}`: Webhook endpoint for TradingView alerts

## Setting Up Telegram Notifications

See detailed instructions in [docs/telegram_setup.md](docs/telegram_setup.md)

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black trading_bot
flake8 trading_bot
```

### Adding a New Broker

1. Create a new broker class in `trading_bot/brokers/` that implements `BaseBroker`
2. Update `trading_bot/brokers/factory.py` to support the new broker
3. Add appropriate configuration options in `trading_bot/config.py`

### Adding a New Strategy

1. Create a new strategy module in `trading_bot/strategies/`
2. Update `trading_bot/core/trading.py` to handle the new strategy actions
3. Create PineScript for TradingView in `pinescript/` directory

## Deployment

### Docker Deployment

A Dockerfile is provided for containerization:

```bash
docker build -t trading-bot .
docker run -d -p 8000:8000 --name trading-bot trading-bot
```

### Production Considerations

- Use a proper web server (nginx, etc.) in front of the application
- Set up SSL for secure webhook communication
- Use environment variables for all sensitive information
- Implement more robust authentication for the API
- Set up database backups

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [TradingView](https://www.tradingview.com/)
