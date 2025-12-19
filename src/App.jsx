import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, ShieldCheck, RefreshCw, Send, ExternalLink, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState(null);

  const tryDemo = () => {
    setAccount("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    setBalance("12.4500");
    setNetwork("Ethereum Mainnet (Demo Mode)");
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      setLoading(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const networkInfo = await provider.getNetwork();

        setAccount(accounts[0]);
        setNetwork(networkInfo.name === 'unknown' ? 'Testnet/Custom' : networkInfo.name);

        const bal = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(bal));
      } catch (err) {
        console.error("Connection failed", err);
      } finally {
        setLoading(false);
      }
    } else {
      const confirmDemo = window.confirm("MetaMask not found! Would you like to enter 'Demo Mode' to see the premium dashboard?");
      if (confirmDemo) tryDemo();
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setNetwork(null);
  };

  const refreshBalance = async () => {
    if (!account) return;
    setLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bal = await provider.getBalance(account);
    setBalance(ethers.formatEther(bal));
    setLoading(false);
  };

  const sendTransaction = async () => {
    if (network.includes("Demo Mode")) {
      setLoading(true);
      setTimeout(() => {
        alert("Transaction Simulated!\n\nHash: 0x" + Math.random().toString(16).slice(2));
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const recipient = prompt("Enter recipient address:");
      if (!recipient) return;
      const amount = prompt("Enter amount in ETH:");
      if (!amount) return;

      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      });

      alert(`Transaction Sent! \nHash: ${tx.hash}`);
      await tx.wait();
      alert("Transaction Confirmed!");
      refreshBalance();
    } catch (err) {
      console.error(err);
      alert("Transaction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-card"
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="floating" style={{ background: 'var(--accent)', padding: '1rem', borderRadius: '20px', boxShadow: '0 0 20px var(--accent-glow)' }}>
            <Cpu size={40} color="white" />
          </div>
        </div>

        <h1>Nexus Web3</h1>
        <p className="subtitle">Your gateway to the decentralized future.</p>

        <AnimatePresence mode="wait">
          {!account ? (
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button className="btn-primary" onClick={connectWallet} disabled={loading}>
                {loading ? <RefreshCw className="spinner" /> : <Wallet size={20} />}
                {loading ? 'Connecting...' : 'Connect MetaMask'}
              </button>
              <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Secure, Serverless, Decentralized
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={`status-badge ${account ? '' : 'disconnected'}`}>
                <ShieldCheck size={14} /> Connected to {network}
              </div>

              <div className="wallet-info">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Balance</p>
                <div className="balance">
                  {parseFloat(balance).toFixed(4)} <span style={{ fontSize: '1rem', color: 'var(--accent)' }}>ETH</span>
                </div>

                <div className="address">
                  {account}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn-secondary" onClick={refreshBalance} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'spinner' : ''} />
                  </button>
                  <button className="btn-secondary" onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}>
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={sendTransaction}
                disabled={loading}
                style={{ marginTop: '1.5rem', background: '#22c55e', boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
              >
                {loading ? <RefreshCw className="spinner" size={18} /> : <Send size={18} />}
                {loading ? 'Processing...' : 'Send Transaction'}
              </button>

              <button className="btn-secondary" onClick={disconnectWallet} style={{ border: 'none', color: '#ef4444' }}>
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer style={{ marginTop: '3rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        Built with Ethers.js & Vite • No Backend Required
      </footer>
    </div>
  );
}

export default App;
