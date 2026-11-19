const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const out=process.argv[2];const FPS=30;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/index.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const dur=await p.evaluate(()=>DUR);const N=Math.round(dur*FPS);
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-r',String(FPS),out],{stdio:['pipe','inherit','inherit']});
for(let f=0;f<N;f++){await p.evaluate(t=>seek(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:94});
 if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r)); if(f%150==0)console.log('frame',f,'/',N);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('done');})();
