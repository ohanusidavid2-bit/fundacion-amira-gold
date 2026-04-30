import React, { useState, useMemo } from 'react';

const UNITS = {
  G: { label: 'Grams (g)', factor: 1 },
  KG: { label: 'Kilograms (kg)', factor: 1000 },
  OZ: { label: 'Troy Ounces (oz t)', factor: 31.1035 }
};

export default function App() {
  const [view, setView] = useState('gold'); 
  const [cart, setCart] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  // Logistics State
  const [logistics, setLogistics] = useState({ name: '', address: '', city: '' });

  const [goldPricePerGram] = useState(78.54); 
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('G');

  // YOUR WALLET ADDRESS
  const btcAddress = "bc1qxy2kgdypjrsqz7adhmsu9hxwhc6asdf72nc3dq";

  const currentPrice = useMemo(() => {
    const numQty = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    if (isNaN(numQty) || numQty <= 0) return 0;
    return numQty * UNITS[unit].factor * goldPricePerGram;
  }, [quantity, unit, goldPricePerGram]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  // --- REAL BLOCKCHAIN VERIFICATION ---
  const verifyRealPayment = async () => {
    setIsVerifying(true);
    setError('');
    
    try {
      // Calling the Mempool Explorer API
      const response = await fetch(`https://mempool.space/api/address/${btcAddress}`);
      const data = await response.json();

      // funded_txo_sum is the total amount ever received by the address (in Satoshis)
      const totalSatsReceived = data.chain_stats.funded_txo_sum + data.mempool_stats.funded_txo_sum;

      if (totalSatsReceived > 0) {
        setView('success');
      } else {
        setError('No transaction detected on the blockchain for this address yet.');
      }
    } catch (err) {
      setError('Network error. Could not connect to the blockchain.');
    } finally {
      setIsVerifying(false);
    }
  };

  const addToCart = () => {
    const numQty = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    if (numQty > 0) {
      setCart([{ id: Date.now(), name: `${numQty}${unit} .999 Fine Gold`, price: currentPrice }]);
      setView('cart');
    }
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#d4d4d8', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0 }}>
      
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid #18181b', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'black' }}>
        <h1 onClick={() => setView('gold')} style={{ color: '#D4AF37', letterSpacing: '0.4em', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'serif' }}>FUNDACIÓN AMIRA</h1>
        <button onClick={() => setView('cart')} style={{ background: '#18181b', border: '1px solid #27272a', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>
          🛒 HOLDINGS ({cart.length})
        </button>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1rem' }}>
        
        {/* MARKET VIEW */}
        {view === 'gold' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem', fontFamily: 'serif' }}>Gold Procurement</h2>
            <div style={{ background: '#09090b', padding: '3rem', border: '1px solid #18181b' }}>
               <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ backgroundColor: 'black', border: '1px solid #27272a', padding: '1rem', fontSize: '1.5rem', color: 'white', width: '150px' }} />
              <select onChange={(e) => setUnit(e.target.value)} style={{ padding: '1rem', background: '#18181b', color: 'white', border: '1px solid #27272a' }}>
                {Object.entries(UNITS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <p style={{ color: '#D4AF37', fontSize: '1.5rem', margin: '2rem 0' }}>Total: ${currentPrice.toLocaleString()}</p>
              <button onClick={addToCart} style={{ background: '#D4AF37', color: 'black', padding: '1rem 3rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>LOCK PRICE</button>
            </div>
          </div>
        )}

        {/* CART & LOGISTICS VIEW */}
        {view === 'cart' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', fontFamily: 'serif' }}>Secure Logistics</h2>
            <div style={{ border: '1px solid #18181b', padding: '2rem', background: '#09090b' }}>
              <p style={{ fontSize: '0.8rem', color: '#D4AF37', marginBottom: '1rem' }}>SHIPPING INFORMATION</p>
              <input placeholder="Full Name" value={logistics.name} onChange={(e) => setLogistics({...logistics, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', marginBottom: '0.5rem', background: 'black', border: '1px solid #27272a', color: 'white' }} />
              <input placeholder="Address" value={logistics.address} onChange={(e) => setLogistics({...logistics, address: e.target.value})} style={{ width: '100%', padding: '0.8rem', marginBottom: '0.5rem', background: 'black', border: '1px solid #27272a', color: 'white' }} />
              <input placeholder="City" value={logistics.city} onChange={(e) => setLogistics({...logistics, city: e.target.value})} style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: 'black', border: '1px solid #27272a', color: 'white' }} />
              
              <hr style={{ borderColor: '#18181b' }}/>
              <div style={{ margin: '1rem 0' }}>
                {cart.map(i => <p key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{i.name}</span> <span>${i.price.toLocaleString()}</span></p>)}
              </div>
              <button 
                onClick={() => setView('checkout')} 
                disabled={!logistics.name || !logistics.address}
                style={{ width: '100%', background: '#D4AF37', color: 'black', padding: '1rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', opacity: (!logistics.name || !logistics.address) ? 0.5 : 1 }}
              >
                PROCEED TO PAYMENT
              </button>
            </div>
          </div>
        )}

        {/* BTC SETTLEMENT VIEW */}
        {view === 'checkout' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontFamily: 'serif' }}>BTC Settlement Protocol</h2>
            <div style={{ background: '#09090b', border: '1px solid #D4AF37', padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${btcAddress}`} 
                alt="BTC QR Code"
                style={{ marginBottom: '1.5rem', border: '8px solid white' }}
              />
              <p style={{ fontSize: '11px', color: '#D4AF37', wordBreak: 'break-all', fontFamily: 'monospace', background: 'black', padding: '1rem' }}>{btcAddress}</p>
              
              {error && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '1rem' }}>{error}</p>}

              <button 
                onClick={verifyRealPayment}
                disabled={isVerifying}
                style={{ marginTop: '1.5rem', width: '100%', backgroundColor: 'white', color: 'black', padding: '1rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isVerifying ? "CHECKING BLOCKCHAIN..." : "I HAVE SENT PAYMENT"}
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {view === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', color: '#D4AF37', fontFamily: 'serif' }}>Payment Verified</h2>
            <p>Order confirmed for {logistics.name}. Physical delivery initiated to {logistics.city}.</p>
            <button onClick={() => window.location.reload()} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '1rem 2rem', marginTop: '2rem', cursor: 'pointer' }}>Finish</button>
          </div>
        )}

      </main>
    </div>
  );
}