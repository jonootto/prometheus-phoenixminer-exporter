# Prometheus PhoenixMiner Exporter
Prometheus Exporter for PhoenixMiner

# Requirements

Tested on nodejs 10

# Installation
```
git clone https://github.com/dcolley/prometheus-phoenixminer-exporter
cd prometheus-phoenixminer-exporter
npm install 
node exporter.js
```

# Setup

Edit the exporter.js file
```js
// Exporter port - use this in the Prometheus job 
const PORT = 3000

// Phoenix Miner config
const config ={
	host: 'localhost',
	port: 3333
}
// Exporter prefix
const PREF = "phoenixminer"
```

# Example output

```
phoenixminer{version="PM 5.7b"} 1
phoenixminer{mode="ETH"} 1
phoenixminer_gpu{gpu_id="0", pcie_slot_no="1"} 1
phoenixminer_gpu{gpu_id="1", pcie_slot_no="6"} 1
phoenixminer_gpu{gpu_id="2", pcie_slot_no="7"} 1
phoenixminer_gpu{gpu_id="3", pcie_slot_no="11"} 1
phoenixminer_gpu_hashrate{gpu_id="0", pcie_slot_no="1"} 31011
phoenixminer_gpu_hashrate{gpu_id="1", pcie_slot_no="6"} 30275
phoenixminer_gpu_hashrate{gpu_id="2", pcie_slot_no="7"} 31009
phoenixminer_gpu_hashrate{gpu_id="3", pcie_slot_no="11"} 30274
phoenixminer_gpu_temp{gpu_id="0", pcie_slot_no="1"} 74
phoenixminer_gpu_fan_speed{gpu_id="0", pcie_slot_no="1"} 100
phoenixminer_gpu_temp{gpu_id="1", pcie_slot_no="6"} 70
phoenixminer_gpu_fan_speed{gpu_id="1", pcie_slot_no="6"} 55
phoenixminer_gpu_temp{gpu_id="2", pcie_slot_no="7"} 70
phoenixminer_gpu_fan_speed{gpu_id="2", pcie_slot_no="7"} 61
phoenixminer_gpu_temp{gpu_id="3", pcie_slot_no="11"} 68
phoenixminer_gpu_fan_speed{gpu_id="3", pcie_slot_no="11"} 33
phoenixminer_power_consumption 594
```

# Run in background

Screen
``` bash
sudo apt-get install screen
screen
node exporter.js
# crtl+a d - to detach from the screen
```

Forever - https://www.npmjs.com/package/forever
```bash
[sudo] npm install forever -g
forever start exporter.js
```

# Start on boot

TBC

