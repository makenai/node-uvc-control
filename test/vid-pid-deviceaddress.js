const UVCControl = require('../index')

var cam = new UVCControl({
	vid: 1133,
	pid: 2142,
	deviceAddress: 25
})

UVCControl.controls.map(name => {
	cam.get(name, (err, val) => {
		if(err) throw err
		console.log(name, val)
	})
})
