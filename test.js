var UVCControl = require('./');

const sleep = async ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

async function main(){
    var camera = new UVCControl(0x046d, 0x082d);

await sleep(100);

    camera.get('saturation', function(error,value) {
        console.log('saturation setting:', error, value);
    });

    // camera.set('brightness', 100, function(error) {
    // 	if (!error) {
    // 		console.log('Brightness Set OK!');
    // 	}
    // });
}

main();
