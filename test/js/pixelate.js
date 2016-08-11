// create a render
var render = new zen.Render(document.getElementById("canvas"));

var texture = zen.Texture.fromSrc(render.context, "resources/hi.png");

// create some sprites
var sprites = [];
var container = new zen.DisplayObjectContainer();
container.width = 480;
container.height = 800;

var pixelateFilter = new zen.PixelateFilter(render.context);
pixelateFilter.pixelSize = 10;

var num = 1;
for(var i = 0; i < num; i++) {
    var sprite = new zen.Sprite();
    sprite.texture = texture;
    // sprite.color = 0x475846;
    sprite.filters = [pixelateFilter];
    sprite.x = 480 / 2;
    sprite.y = 800 / 2;
    sprite.width = 307;
    sprite.height = 307;
    sprite.anchorX = 0.5;
    sprite.anchorY = 0.5;
    sprites.push(sprite);
    container.addChild(sprite);
}
// container.filters = [pixelateFilter];

console.log("render object number:", num)

// fps
var state = new zen.State();
document.body.appendChild(state.getDom());

var colorValue = 0;
// frame render
function loop() {

    requestAnimationFrame(loop);

    colorValue += 0.05;

    for(var i=0;i<num;i++)
    {
    //    sprites[i].rotation += 0.1;
    }

    // render.clear();

    var drawCall = render.render(container);

    state.update(drawCall);
}

// start!!!
loop();
