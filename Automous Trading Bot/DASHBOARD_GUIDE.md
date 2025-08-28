# Trading Bot Dashboard - Implementation Guide

This guide explains how to set up and use your new trading dashboard.

## Installation Steps

1. First, make sure you have Node.js installed (v14+ recommended)

2. Install the Python dependencies if you haven't already:
   ```bash
   pip install fastapi uvicorn sqlalchemy psycopg2-binary
   ```

3. Run the setup script to create necessary files:
   ```bash
   ./setup_dashboard.sh
   ```

4. Build the React frontend:
   ```bash
   ./build_dashboard.sh
   ```

5. Start your trading bot server:
   ```bash
   python run.py
   ```

6. Access your dashboard at:
   ```
   http://localhost:8000/dashboard
   ```

## Development

### Frontend Development

For frontend development, you can run the React dev server:

```bash
cd trading_bot/frontend
npm start
```

This will start a development server on port 3000 with hot reloading. The React app is configured to proxy API requests to your FastAPI backend on port 8000.

### Adding API Endpoints

If you need to add more data to the dashboard:

1. Add new endpoints in `trading_bot/api/dashboard_routes.py`
2. Fetch the data in the React components in `Dashboard.jsx`

## Customization

- Modify `Dashboard.jsx` to change the layout or add new components
- Update the color scheme in `tailwind.config.js`
- Add new charts or visualizations using Recharts

## Troubleshooting

- If you see API errors, check that your FastAPI server is running
- For React build issues, check the Node.js console output
- For data integration issues, verify your database queries
