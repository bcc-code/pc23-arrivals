# Arrivals - Realtime display of ticket scans

Used at BUK Easter Camp 2023

### Setup

1. The BCC Event dev team needs to give you an api key to their ticket scanning API with access to scans and names.
2. Use portable secret (or hardcode the api key and remove the password screen)
3. Portable secret: Use [the creator](https://mprimi.github.io/portable-secret/creator/) ([source code here](https://github.com/mprimi/portable-secret/tree/main/creator))
4. Open the generated html file in an editor and copy the secret details to src/.secret (see .secret.template for a template)
5. `pnpm install` and `pnpm dev`
6. Enter the password you used for the portable secret
7. Switch between screens by pressing SHIFT+1
8. Tweak the event start date etc in ArrivalScreen1 and ArrivalScreen2 as you need

### Assets required

https://elements.envato.com/fireworks-QMPGNL6, compressed, webm, transparent bg:

```
for i in *.mov; do ffmpeg -i "$i" -vf scale=-1:520 -c:v libvpx -pix_fmt yuva420p -auto-alt-ref 0 "${i%.*}.webm"; done
```

https://elements.envato.com/confetti-YUDAW48, compressed, webm, transparent bg

### Build and distribute

CORS: At the point of writing the ticket scanning API only supported CORS on localhost:3000, so you can't use something like Tauri to package this.
Secrets: To prevent the secret api key from being leaked, the built files needs to be hosted
on an internal web server or hosted directly on the displaying PC.

It's kind of overkill but I used [embedded-server](https://github.com/andreasgan/embedded-server) to embed the built files into a .exe executable that I zipped and sent to the PCs that were wired to the projectors/LEDs.
This ensured port 3000 was being used and simplified the setup on the PCs.

### Faking the clock

#### Set speed

You can simulate time flying by faster by doing `clock.setSpeed(FACTOR);`, e.g. 10 for 10x faster.

#### Set time

You can simulate a different time by doing `clock.setTime(new Date("2023-04-01T08:00:44.000Z"))` or passing a Date to the constructor: `new Clock(new Date("2023-04-01T08:00:44.000Z"))`
