//一种自我存档方式，
//每次temperatur被设置值的时候，就自动存档进archive中
function Archiver() {
	var temperature = null;
	var archive = [];
	Object.defineProperty(this, 'temperature', {
		get: function() {
			console.log("get");
			return temperature
		},
		set: function(val) {
			temperature = val;
			archive.push({
				val: temperature
			})
		}
	})
	this.getArchive = function() {
		return archive;
	}
}
var arc = new Archiver();
arc.temperature;
arc.temperature = 11;
arc.temperature = 13;
console.log(arc.getArchive()); //[ { val: 11 }, { val: 13 } ]