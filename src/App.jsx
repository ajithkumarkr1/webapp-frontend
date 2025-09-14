import { useState, useEffect  } from 'react';
import ConnectBroker from './components/ConnectBroker';
import SelectStock from './components/SelectStock';
import TradeResults from './components/TradeResults';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('connect');

    // State for ConnectBroker tab
    const [brokerCount, setBrokerCount] = useState(1);
    const [selectedBrokers, setSelectedBrokers] = useState([{ name: 'u', credentials: {}, profileData: null }]);

    // State for SelectStock tab
    const [stockCount, setStockCount] = useState(1);
    const [tradingParameters, setTradingParameters] = useState({});

    // New state to hold trade logs and trading status
    const [tradeLogs, setTradeLogs] = useState([]);
    const [tradingStatus, setTradingStatus] = useState({});

    // ✅ Real-time log streaming
    useEffect(() => {
    let eventSource;
    try {
        eventSource = new EventSource("https://webapp-backend-y4cv.onrender.com/api/stream-logs");

        eventSource.onmessage = (event) => {
            if (event.data) {
                    setTradeLogs(prev => [...prev, event.data]);
            }
        };

        eventSource.onerror = (err) => {
            console.error("EventSource failed:", err);
            eventSource.close();
            reconnectTimer = setTimeout(connect, 2000);
        };
    } catch (err) {
        console.error("EventSource init failed:", err);
    }

    return () => {
        if (eventSource) eventSource.close();
    };
}, []);


    // Handlers for ConnectBroker tab state
    const handleBrokerCountChange = (e) => {
        const newCount = parseInt(e.target.value, 10);
        if (newCount >= 1 && newCount <= 5) {
            setBrokerCount(newCount);
            setSelectedBrokers(prevBrokers => {
                const newBrokers = prevBrokers.slice(0, newCount);
                while (newBrokers.length < newCount) {
                    newBrokers.push({ name: 'u', credentials: {}, profileData: null });
                }
                return newBrokers;
            });
        }
    };
    const handleBrokerChange = (e, index) => {
        const newSelectedBrokers = [...selectedBrokers];
        newSelectedBrokers[index] = { ...newSelectedBrokers[index], name: e.target.value, profileData: null };
        setSelectedBrokers(newSelectedBrokers);
    };
    const handleCredentialChange = (e, index, credentialName) => {
        const newSelectedBrokers = [...selectedBrokers];
        newSelectedBrokers[index].credentials[credentialName] = e.target.value;
        setSelectedBrokers(newSelectedBrokers);
    };

    // Updated handler to only connect brokers
    const handleConnectBroker = async (e) => {
        e.preventDefault();
        setTradeLogs([]); // Clear previous logs

        console.log("Attempting to connect with brokers:", selectedBrokers);

        try {
            const response = await fetch('https://webapp-backend-y4cv.onrender.com/api/connect-broker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brokers: selectedBrokers })
            });
            const data = await response.json();

            setSelectedBrokers(prevBrokers => {
                const newBrokers = prevBrokers.map((broker, index) => {
                    const fetchedData = data.find(item => item.broker_key === broker.name);
                    if (fetchedData && fetchedData.status === 'success') {
                        return { ...broker, profileData: fetchedData.profileData };
                    }
                    return { ...broker, profileData: { status: 'failed', message: fetchedData?.message || 'Connection failed.' } };
                });
                return newBrokers;
            });

        } catch (error) {
            console.error('Error connecting to broker:', error);
            setTradeLogs(['❌ An error occurred while connecting to the broker.']);
        }
    };

    const stock_map = {
        "RELIANCE INDUSTRIES LTD": "RELIANCE",
        "HDFC BANK LTD": "HDFCBANK",
        "ICICI BANK LTD.": "ICICIBANK",
        "INFOSYS LIMITED": "INFY",
        "TATA CONSULTANCY SERV LT": "TCS",
        "STATE BANK OF INDIA": "SBIN",
        "AXIS BANK LTD": "AXISBANK",
        "KOTAK MAHINDRA BANK LTD": "KOTAKBANK",
        "ITC LTD": "ITC",
        "LARSEN & TOUBRO LTD.": "LT",
        "BAJAJ FINANCE LIMITED": "BAJFINANCE",
        "HINDUSTAN UNILEVER LTD": "HINDUNILVR",
        "SUN PHARMACEUTICAL IND L": "SUNPHARMA",
        "MARUTI SUZUKI INDIA LTD": "MARUTI",
        "NTPC LTD": "NTPC",
        "HCL TECHNOLOGIES LTD": "HCLTECH",
        "ULTRATECH CEMENT LIMITED": "ULTRACEMCO",
        "TATA MOTORS LIMITED": "TATAMOTORS",
        "TITAN COMPANY LIMITED": "TITAN",
        "BHARAT ELECTRONICS LTD": "BEL",
        "POWER GRID CORP. LTD": "POWERGRID",
        "TATA STEEL LIMITED": "TATASTEEL",
        "TRENT LTD": "TRENT",
        "ASIAN PAINTS LIMITED": "ASIANPAINT",
        "JIO FIN SERVICES LTD": "JIOFIN",
        "BAJAJ FINSERV LTD": "BAJAJFINSV",
        "GRASIM INDUSTRIES LTD": "GRASIM",
        "ADANI PORT & SEZ LTD": "ADANIPORTS",
        "JSW STEEL LIMITED": "JSWSTEEL",
        "HINDALCO INDUSTRIES LTD": "HINDALCO",
        "OIL AND NATURAL GAS CORP": "ONGC",
        "TECH MAHINDRA LIMITED": "TECHM",
        "BAJAJ AUTO LIMITED": "BAJAJ-AUTO",
        "SHRIRAM FINANCE LIMITED": "SHRIRAMFIN",
        "CIPLA LTD": "CIPLA",
        "COAL INDIA LTD": "COALINDIA",
        "SBI LIFE INSURANCE CO LTD": "SBILIFE",
        "HDFC LIFE INS CO LTD": "HDFCLIFE",
        "NESTLE INDIA LIMITED": "NESTLEIND",
        "DR. REDDY S LABORATORIES": "DRREDDY",
        "APOLLO HOSPITALS ENTER. L": "APOLLOHOSP",
        "EICHER MOTORS LTD": "EICHERMOT",
        "WIPRO LTD": "WIPRO",
        "TATA CONSUMER PRODUCT LTD": "TATACONSUM",
        "ADANI ENTERPRISES LIMITED": "ADANIENT",
        "HERO MOTOCORP LIMITED": "HEROMOTOCO",
        "INDUSIND BANK LIMITED": "INDUSINDBK",
        "Nifty 50": "NIFTY","Nifty Bank": "BANKNIFTY", "Nifty Fin Service": "FINNIFTY", "NIFTY MID SELECT": "MIDCPNIFTY",
    };

    // New handler for the "Start Trade" button
const handleTradeToggle = async (index) => {
    const key = `stock_${index}`;
    const currentStatus = tradingStatus[key];
    const symbol = tradingParameters[key].symbol;

    if (currentStatus === 'active') {
        try {
            // 🔗 Call backend to disconnect
            const response = await fetch("https://webapp-backend-y4cv.onrender.com/api/disconnect-stock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ symbol })
            });

            const result = await response.json();

            setTradingStatus(prev => ({ ...prev, [key]: 'inactive' }));
            setTradeLogs(prev => [...prev, `🛑 ${result.message}`]);
        } catch (err) {
            console.error("Disconnect failed:", err);
            setTradeLogs(prev => [...prev, `❌ Error disconnecting ${symbol}`]);
        }
        return;
    }

    // ✅ Start Trade logic
    if (!tradingParameters[key].broker) {
        setTradeLogs(prev => [...prev, `❌ Please select a broker for ${tradingParameters[key].symbol}.`]);
        return;
    }

    setTradingStatus(prev => ({ ...prev, [key]: 'active' }));
    setTradeLogs(prev => [...prev, `🟢 Initiating trade for ${tradingParameters[key].symbol}...`]);
    setActiveTab('results');
};


    // Start ALL trades (send one combined request)
    const handleStartAllTrades = async () => {
        setActiveTab('results');

        // Collect parameters for all stocks
        let allParams = [];
        for (let i = 0; i < stockCount; i++) {
            const key = `stock_${i}`;
            const params = tradingParameters[key];

            if (params?.broker) {
                allParams.push(params);
            } else {
                setTradeLogs(prev => [...prev, `❌ Please select a broker for Stock ${i + 1}.`]);
            }
        }

        if (allParams.length === 0) {
            setTradeLogs(prev => [...prev, "⚠️ No valid stock parameters to start trades."]);
            return;
        }

        try {
            setTradeLogs(prev => [...prev, "🟢 Starting all trades together..."]);

            const tradeResponse = await fetch('https://webapp-backend-y4cv.onrender.com/api/start-all-trading', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tradingParameters: allParams,       // 🔹 multiple stocks at once
                    selectedBrokers: selectedBrokers    // 🔹 sent only once
                })
            });

            const tradeData = await tradeResponse.json();
            setTradeLogs(prev => [...prev, ...tradeData.logs]);

            // Mark all stocks as active
            let newStatus = {};
            allParams.forEach((p, i) => {
                const key = `stock_${i}`;
                newStatus[key] = 'active';
            });
            setTradingStatus(prev => ({ ...prev, ...newStatus }));

        } catch (error) {
            console.error('Error starting trades:', error);
            setTradeLogs(prev => [...prev, `❌ Error starting trades: ${error.message}`]);
        }
    };

    // Close individual position
    const handleClosePosition = async (index) => {
        const key = `stock_${index}`;
        const symbol = tradingParameters[key]?.symbol;

        try {
            const response = await fetch("https://webapp-backend-y4cv.onrender.com/api/close-position", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symbol })
            });

            const result = await response.json();
            setTradeLogs(prev => [...prev, `🔵 ${result.message}`]);
        } catch (err) {
            console.error("Close position failed:", err);
            setTradeLogs(prev => [...prev, `❌ Error closing position for ${symbol}`]);
        }
    };

    // Close ALL positions
    const handleCloseAllPositions = async () => {
        try {
            const response = await fetch("https://webapp-backend-y4cv.onrender.com/api/close-all-positions", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            const result = await response.json();
            setTradeLogs(prev => [...prev, `🔵 ${result.message}`]);
        } catch (err) {
            console.error("Close all positions failed:", err);
            setTradeLogs(prev => [...prev, "❌ Error closing all positions"]);
        }
    };

    const handleStockCountChange = (e) => {
        const newCount = parseInt(e.target.value, 10);
        if (newCount >= 1 && newCount <= 10) {
            setStockCount(newCount);
            const newParameters = {};
            const newTradingStatus = {};
            for (let i = 0; i < newCount; i++) {
                const key = `stock_${i}`;
                newParameters[key] = tradingParameters[key] || {
                    symbol: 'RELIANCE',
                    broker: '',
                    strategy: 'ADX_MACD_WillR_Supertrend',
                    interval: 0, // Default to 0
                    lots: 0, // Default to 0
                    lot_size: 0,
                    total_shares: 0,
                    target_percentage: 0 // Default to 0
                };
                newTradingStatus[key] = tradingStatus[key] || 'inactive';
            }
            setTradingParameters(newParameters);
            setTradingStatus(newTradingStatus);
        }
    };

    // inside App function
    const handleClearLogs = () => {
        setTradeLogs([]);  // ✅ Clear logs but EventSource continues streaming
    };

    const handleStockSymbolChange = async (e, index) => {
        const newStockName = e.target.value;
        const newSymbol = stock_map[newStockName];
        const key = `stock_${index}`;

        setTradingParameters(prev => ({
            ...prev,
            [key]: { ...prev[key], symbol: newSymbol }
        }));

        try {
            const response = await fetch("https://webapp-backend-y4cv.onrender.com/api/get-lot-size?symbol=${encodeURIComponent(newStockName)}");
            const data = await response.json();

            if (data.lot_size) {
                const fetchedLotSize = data.lot_size;
                const currentLots = tradingParameters[key]?.lots || 0; // Use 0 as default
                const newTotalShares = currentLots * fetchedLotSize;

                setTradingParameters(prev => ({
                    ...prev,
                    [key]: {
                        ...prev[key],
                        lot_size: fetchedLotSize,
                        total_shares: newTotalShares
                    }
                }));
            } else {
                console.error("Lot size not found for this stock.");
            }
        } catch (error) {
            console.error('Error fetching lot size:', error);
        }
    };

    const handleParameterChange = (e, index, paramName) => {
        const key = `stock_${index}`;
        const newValue = e.target.value;

        setTradingParameters(prev => {
            const updatedParams = {
                ...prev,
                [key]: { ...prev[key], [paramName]: newValue }
            };

            if (paramName === 'lots' || paramName === 'lot_size') {
                const lots = parseInt(updatedParams[key].lots, 10);
                const lotSize = parseInt(updatedParams[key].lot_size, 10);
                updatedParams[key].total_shares = (lots > 0 && lotSize > 0) ? lots * lotSize : 0;
            }

            return updatedParams;
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'connect':
                return (
                    <ConnectBroker
                        brokerCount={brokerCount}
                        selectedBrokers={selectedBrokers}
                        onBrokerCountChange={handleBrokerCountChange}
                        onBrokerChange={handleBrokerChange}
                        onCredentialChange={handleCredentialChange}
                        onConnect={handleConnectBroker}
                    />
                );
            case 'select':
                return (
                    <SelectStock
                        stockCount={stockCount}
                        tradingParameters={tradingParameters}
                        selectedBrokers={selectedBrokers}
                        tradingStatus={tradingStatus}
                        onStockCountChange={handleStockCountChange}
                        onStockSymbolChange={handleStockSymbolChange}
                        onParameterChange={handleParameterChange}
                        onTradeToggle={handleTradeToggle}
                        onStartAllTrades={handleStartAllTrades}
                        onClosePosition={handleClosePosition}
                        onCloseAllPositions={handleCloseAllPositions}
                    />
                );
            case 'results':
                return <TradeResults tradeLogs={tradeLogs} onClearLogs={handleClearLogs} />;
            default:
                return <div>Please select a tab.</div>;
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <img src="/astya_vyuha_logo.png" alt="Logo" className="app-logo" />
                <h1>ASTA VYUHA</h1>
            </header>
            <div className="main-content">
                <div className="tab-buttons">
                    <button
                        onClick={() => setActiveTab('connect')}
                        className={activeTab === 'connect' ? 'active' : ''}
                    >
                        Connect Broker
                    </button>
                    <button
                        onClick={() => setActiveTab('select')}
                        className={activeTab === 'select' ? 'active' : ''}
                    >
                        Select Stock
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={activeTab === 'results' ? 'active' : ''}
                    >
                        Trade Results
                    </button>
                </div>
                <div className="tab-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default App;