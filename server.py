from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import numpy as np
import logging

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/data/{ticker}")
def get_market_data(ticker: str, period: str = "6mo"):
    try:
        # Map period to yfinance format if needed, but 6mo/1y are standard
        pf_period = period.lower()
        if pf_period == "6m": pf_period = "6mo"
        if pf_period == "1y": pf_period = "1y"

        stock = yf.Ticker(ticker)
        df = stock.history(period=pf_period)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="Ticker not found or no data available")

        # Calculate log returns
        df['Returns'] = np.log(df['Close'] / df['Close'].shift(1))
        df = df.dropna()
        
        returns = df['Returns'].tolist()
        
        if not returns:
             raise HTTPException(status_code=404, detail="Not enough data to calculate returns")

        return {
            "ticker": ticker.upper(),
            "period": period,
            "returns": returns,
            "count": len(returns)
        }
    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
