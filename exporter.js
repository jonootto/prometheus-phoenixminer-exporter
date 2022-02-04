// https://github.com/dcolley/prometheus-phoenixminer-exporter/exporter.js

const net = require("net")
const moment = require("moment-timezone")
const app = require("express")();

//-----------------------------------------------------------------------------------
// You can change these settings ====================================================

// Prometheus Job should scrape http://[host_or_ip]:[PORT]/metrics
const PORT = 3000
const TGTPORT = process.env.PORT
const TGTIP = process.env.IP
// Phoenix Miner API
const config ={
	host: TGTIP,
	port: TGTPORT
}

// Prefix used for exporter items e.g. "${PREF}_metric 123"
const PREF = "phoenixminer"

// Don't change anyting below this... ===============================================
//-----------------------------------------------------------------------------------

const statReq = '{"id":0,"jsonrpc":"2.0","method":"miner_getstat2"}';
const exampleResponse = {
	"id":0,
	"jsonrpc":"2.0",
	"result":[
		"PM 5.7b - ETH",				//  0 Version & Mode?
		"1825",							//  1 
		"122574;1276;0",				//  2 Shares: submitted, accepted, rejected
		"31011;30276;31007;30277",		//  3 GPU Hash rates
		"0;0;0",						//  4
		"off;off;off;off",				//  5
		"78;100;70;66;70;80;70;37",		//  6 temp & fan speed per GPU
		"eth-eu1.nanopool.org:9999",	//  7
		"0;0;0;0",						//  8
		"308;320;332;316",				//  9 what's this?
		"0;0;0;0",						// 10
		"0;0;0;0",						// 11
		"0;0;0;0",						// 12
		"0;0;0;0",						// 13
		"0;0;0;0",						// 14
		"1;6;7;11",						// 15 GPU pcie slots
		"0;0;0",						// 16
		"599"							// 17 
	]
}

class PhoenixMinerExporter {

	constructor(config=null) {
		this.config = config ? config : {host: "localhost", port: 3333, trace: true}
	}

	slog(text) {
		if(this.config.trace) {
			var ts = moment().format("YYYY-MM-DD HH:mm:ss");
			console.log(ts+"|phoenixminer-api|"+text);
		}
	}

	async query() {
		
		var that = this
		
		return new Promise( (resolve, reject) => {
			
			var client = new net.Socket()
			.connect(this.config.port, this.config.host, function() {
				that.slog('Connected');
				client.write( statReq + '\n');
			})

			.on('data', function(data) {
				//console.log('Received: ' + data);
				try{
					var api = JSON.parse(data);
					//console.debug(api)

				} catch( err ) {
					that.slog("[ERROR] on:data: caught 'error' - probably MySQL");
					that.slog(err);
					reject(err);
				}

				client.destroy(); // kill client after server's response
				// now we parse the api response.
				var items = []
				var parts = []

				parts = api.result[0].split(" - ")
				// console.log(parts)
				items.push(`${PREF}{version="${parts[0]}"} 1`)
				items.push(`${PREF}{mode="${parts[1]}"} 1`)
				// console.log(items)
				
				// 15: PCIE slots
				// "1;6;7;11",
				var pcies = api.result[15].split(";")
				for( var j = 0; j < pcies.length; j++ ) {
					items.push(`${PREF}_gpu{gpu_id="${j}", pcie_slot_no="${pcies[j]}"} 1`)
				}
				
				// 3: hashrate per GPU "31013;30277;31008;30276",
				// TODO, can we label the pcie slot_no?
				parts = api.result[3].split(";")
				for( var j = 0; j < parts.length; j++ ) {
					items.push(`${PREF}_gpu_hashrate{gpu_id="${j}", pcie_slot_no="${pcies[j]}"} ${parts[j]}`)
				}

				// gpu temp and fan speed
				// 6: "80;100;70;68;70;85;70;40"
				parts = api.result[6].split(";")
				for( var j = 0; j < parts.length; j=j+2 ) {
					// let temp = parts[j]
					// let speed = parts[j+1]
					items.push(`${PREF}_gpu_temp{gpu_id="${j/2}", pcie_slot_no="${pcies[j/2]}"} ${parts[j]}`)
					items.push(`${PREF}_gpu_fan_speed{gpu_id="${j/2}", pcie_slot_no="${pcies[j/2]}"} ${parts[j+1]}`)
				}

				// Power consumption W
				items.push(`${PREF}_power_consumption ${api.result[17]}`)

				// console.log(items)
				resolve(items.join("\n"))
			})

			.on('timeout', function(err) {
				that.slog('Timeout: ' + err);
				client.destroy(); // kill client after server's response
				console.error(err);
				reject(err);
			})

			.on('close', function() {
				that.slog('Connection closed');
				client.destroy(); // kill client after server's response
				reject()
			})

			.on('error', (err) => {
				// handle errors here
				client.destroy(); // kill client after server's response
				that.slog("[ERROR] got event on:'error' - probably http error?");
				console.error(err);
				reject(err);
			})
		})
	}
}

app.get('/', (req, res) => {
	res.redirect('/metrics')
})

app.get('/metrics', async (req, res) => {
	let worker = new PhoenixMinerExporter(config)
	let data = await worker.query()
	res.set("Content-Type","text/plain; version=0.0.4")
	res.send(data)
})

app.listen(PORT)

var process = require('process')
process.on('SIGINT', () => {
  console.info("Interrupted")
  process.exit(0)
})
