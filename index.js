/**
 * Created by dandan on 2020/1/12.
 * vision:1.0
 * title:
 * e-mail:supericesun@gmail.com
 */
const displayResolution = window.devicePixelRatio;
let Application = PIXI.Application,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite,
  Texture = PIXI.Texture,
  Graphics = PIXI.Graphics,
  Container = PIXI.Container;

function format(str) {
  let pattern = /\{([\w_]+)\}/gm;
  let arr = Array.prototype.slice.call(arguments, 1);
  let args = /\{(\d+)\}/.test(str) ? arr : arr[0];
  return str.replace(pattern, function () {
    return args[arguments[1]];
  });
}

// 主场景2：游戏操作
let game = {
  opts: {
    lineTop: 64,    // 线距容器顶部的距离
    pullLimit: 54,   // 拉弓弦的最大距离
    circleR: 22,
    blueRect: .6, // 蓝色背景的起始比例（相对于页面高度来说）
    life: 2,    // 天体的生命次数
  },
  eles: {},
  cb: {},  // 需要执行的动画
  uuid: '',
  again: '', // 重新玩的次数
  // audio: null,

  init() {
    let uuid = this.getStore('uuid');
    if (!uuid) {
      uuid = this.getUuid();
      this.setStore('uuid', uuid);
    }
    this.uuid = uuid;
    this.request({action: 'ssin'});
    this.main();
    this.preload();
  },

  // 生成uuid
  getUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // 设置
  setStore(name, content) {
    if (!name) return;
    if (typeof content !== 'string') {
      content = JSON.stringify(content)
    }
    window.localStorage.setItem(name, content)
  },

  // 获取
  getStore(name) {
    if (!name) return;
    return window.localStorage.getItem(name)
  },

  // 埋点上报发送请求 // action: visitor
  request(data) {
    let url = 'http://ashita.top/xxx';
    data.uuid = this.uuid;

    let arr = [];
    for (let name in data) arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
    let params = arr.join("&");
    let xhr = new XMLHttpRequest();

    xhr.open("post", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    xhr.send(params);
  },

  // 获取尺寸
  getOpts() {
    let body = document.body;
    let box = this.box;
    let opts = game.opts;
    opts.w = box.offsetWidth;
    opts.h = box.offsetHeight;
    //console.log(opts.w, opts.h);
    return opts;
  },

  // 添加对象
  main() {
    /*this.audio = document.getElementById('audio');
    window.addEventListener('touchstart', loadAudio, false);

    function loadAudio() {
      game.audio.load();
      window.removeEventListener('touchstart', loadAudio);
    }*/

    let box = document.getElementById('box');
    this.box = box;
    let opts = this.getOpts();

    const app = new Application({
      antialias: true,
      width: opts.w,
      height: opts.h,
      resolution: displayResolution,
      autoDensity: true,  // 自动密度
    });

    box.appendChild(app.view);
    this.app = app;
    this.stage = app.stage;

    app.renderer.backgroundColor = 0x000000;
    app.renderer.autoResize = true;

    window.addEventListener('resize', () => {
      //this.getOpts();
      //opts = game.opts;
      //app.renderer.resize(opts.w, opts.h);
    }, false);

    window.addEventListener("orientationchange", function () {
      let deg = window.orientation;
      game.getOpts();
      let {w, h} = game.opts;
      if (deg !== 0 && w > h) {
        setTimeout(() => {
          scene4.show();
        }, 100);
      } else scene4.hide();
    }, false);

    app.ticker.add(delta => {
      for (let key in game.cb) {
        let cb = game.cb[key];
        cb && cb(delta);
      }
    });
  },

  // 预加载
  preload() {
    /*const texture = Texture.from('images/bow.png');
   const bow = new Sprite(texture);
   const bow = Sprite.from(path);
   */
    PIXI.loader.add('btn', 'images/btn.png')
      .add('main', 'images/main.png')
      .add('bow', 'images/bow.png')
      .add('arrow', 'images/arrow.png')
      .add('sun', 'images/sun.png')
      .add('star', 'images/star.png')
      .add('b1', 'images/1.png')
      .add('b2', 'images/2.png')
      .add('b3', 'images/3.png')
      .add('b4', 'images/4.png')
      .add('b5', 'images/5.png')
      .add('b6', 'images/6.png')
      .add('b7', 'images/7.png')
      .add('b8', 'images/8.png')
      .add('b9', 'images/9.png')
      .on('progress', (loader, resource) => {
        console.log('loading: ' + resource.url, +loader.progress.toFixed(2) + '%');
      }).load(() => {
      /*let loading = document.getElementById('loading');
      loading.classList.add('out');
      setTimeout(function () {
        document.body.removeChild(loading);
      }, 550);*/
      scene1.init();
      scene2.init();
      scene3.init();
      scene4.init();
    });
  },
};

// 场景1：游戏说明和引导
let scene1 = {
  box: null,
  init() {
    let box = new Container();
    game.stage.addChild(box);
    this.box = box;

    this.drawBg();
    this.drawIcon();
    this.drawText();
    this.drawBtn();
  },
  // 背景
  drawBg() {
    let opts = game.opts;
    let rect = new Graphics();
    rect.beginFill(0x000000); // 0x66CCFF
    rect.drawRect(0, 0, opts.w, opts.h);
    rect.endFill();
    this.box.addChild(rect);
  },

  // 顶部 头图
  drawIcon() {
    const resource = loader.resources;
    const opts = game.opts;
    // let img = PIXI.Sprite.from('images/main.png');
    let img = new Sprite(resource.main.texture);

    // img.rotation = 45 / 180 * Math.PI;
    img.scale.set(.35);
    img.anchor.set(.5);
    img.x = opts.w / 2;
    img.y = 88;
    this.box.addChild(img);
  },

  // 绘制文本
  drawText() {
    const opts = game.opts;

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
      // fontStyle: 'italic',
      fontWeight: 'bold',
      fill: '#dee2d1',   // f4f4f4
      lineHeight: 24,
      /*stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2, */
      wordWrap: true,
      breakWords: true,
      wordWrapWidth: opts.w - 20 * 2,
    });
    let str = '九曜俱见，十日并出，焦禾稼，杀草木，而民无所食\n' +
      '\n' +
      '快快化身后羿，拉弓射日，拯救地球吧。\n' +
      '开始之前，先看一下前人留下的经验：\n' +
      '\n' +
      '假太阳射中一次会现原形，再射中一次即可摧毁；\n' +
      '真太阳射中一次光照减弱，再射中一次也会摧毁；\n' +
      '万物生长靠太阳，千万不要毁掉真太阳； \n' +
      '某些假太阳可以分辨出来，其他无法分辨的就只能射中试一试了。';

    const text = new PIXI.Text(str, style);
    text.x = 20;
    text.y = 170;
    text.anchor.set(0);

    this.box.addChild(text);
  },

  // 按钮
  drawBtn() {
    const resource = loader.resources;
    let opts = game.opts;
    let btnBox = new Container();

    const style = new PIXI.TextStyle({
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#ffffff',   // f4f4f4
    });

    // let btn = PIXI.Sprite.from('images/btn.png');
    let btn = new Sprite(resource.btn.texture);
    btn.anchor.set(.5);
    btn.scale.set(.4);
    btn.interactive = true;
    btnBox.width = btn.width;
    btnBox.height = btn.height;
    btnBox.x = opts.w / 2;//- btn.width / 2;
    btnBox.y = opts.h - btn.height / 2 - 50;
    btnBox.addChild(btn);
    // Shows hand cursor
    // btn.buttonMode = true;

    let box = this.box;
    btn.on('pointerdown', function () {
      scene2.box.visible = true;

      game.cb.skipTo2 = function () {
        box.alpha -= .05;
        if (box.alpha <= 0) {
          box.alpha = 0;
          box.visible = false;
          scene2.start(true);
          game.cb.skipTo2 = null;
        }
      };
    });

    const text = new PIXI.Text('开始', style);
    btnBox.addChild(text);
    text.anchor.set(.5, .7);

    this.box.addChild(btnBox);
  },
};

// 场景2：游戏操作
let scene2 = {
  canPull: false, // 是否可以拉弓弦
  timer: null,
  eles: {},
  box: null,
  ballBounds: {},
  index: 0,

  // 数量等
  info: {
    total: 0, // 总计射出的箭数量
    hit: 0, // 命中的数量
    time: 0, // 闯关时间
    over: 0, // 完成类型：0-射中太阳结束，1-摧毁所有的假太阳
  },

  // 获取显示天体的数量
  getBallLen() {
    let ballBox = this.eles.ballBox;
    if (!ballBox) return 0;
    let list = ballBox.children;
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      list[i].visible && count++;
    }
    return count;
  },

  // 开始  ballNotRefresh - 是否不刷新天体的x、y、speed等
  start(ballNotRefresh) {
    let info = this.info;
    info.total = 0;
    info.hit = 0;
    info.time = 0;
    info.over = 0;
    this.canPull = true;

    this.addArrow();

    let list = this.eles.ballBox.children;
    for (let i = 0; i < list.length; i++) {
      let ball = list[i];
      ball.visible = true;
      ball.life = game.opts.life;
      if (ball.isSun) ball.alpha = 1;
      else ball.children[1].alpha = 1;
      !ballNotRefresh && this.addAttrToBall(ball);
    }
    this.setInfo();
    game.cb.ball = this.ballMove;

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.info.time += 1;
      this.setInfo();
    }, 1000);

    window.addEventListener('touchstart', this.touchHandler, false);
  },

  // 停止
  stop() {
    scene2.canPull = false;

    let eles = scene2.eles;
    eles.arrow && scene2.box.removeChild(eles.arrow);
    eles.arrow = null;

    game.cb.state = null;
    game.cb.ball = null;
    clearInterval(scene2.timer);
    window.removeEventListener('touchstart', this.touchHandler);
  },

  // 入口
  init() {
    let box = new Container();
    game.stage.addChild(box);
    this.box = box;

    let circleBox = new Container();
    this.eles = {circleBox};

    this.drawBlackBg();
    this.drawBalls();
    this.drawBow();
    this.addArrow();
    box.addChild(circleBox);
    this.addText();
    this.loadBoom();
    box.visible = false;
  },

  /**================================================================
   主布局和元素
   =================================================================*/
  // 创建一个箭
  addArrow() {
    const opts = game.opts;
    const resource = loader.resources;
    const eles = this.eles;
    const arrow = new Sprite(resource.arrow.texture);
    const scale = .5;

    eles.arrow && this.box.removeChild(eles.arrow);
    eles.arrow = null;

    arrow.anchor.set(.5, .61);
    arrow.scale.set(scale);
    arrow.x = opts.w / 2;
    arrow.y = eles.btm.y - arrow.height * (1 - .61) + opts.lineTop - 14;
    arrow.rotation = 0;
    arrow._id = this.index++;

    eles.arrow = arrow;
    this.box.addChild(arrow);

    /*let rad = 0;
    arrow.rotation = rad;
    this.drawArrowPlot(rad);*/
  },

  // 绘制辅助点/圆
  drawPlot(cx, cy, alpha, r) {
    let circleBox = this.eles.circleBox;
    circleBox.removeChild();

    let circle = new Graphics();
    circle.beginFill(0xFF0000);
    circle.alpha = alpha || .6;
    circle.drawCircle(cx, cy, r || 4);
    circle.endFill();
    circleBox.addChild(circle);
  },

  // 绘制辅助点/圆
  drawPlot1(cx, cy, r) {
    let circle = new Graphics();
    circle.beginFill(0xFF0000);
    circle.alpha = .5;
    circle.drawCircle(cx, cy, r || 4);
    circle.endFill();
    this.box.addChild(circle);
  },

  // 绘制箭顶部辅助小圆点
  drawArrowPlot(rotation) {
    let pos = scene2.getArrowHeadPos(rotation);
    scene2.drawPlot(pos[0], pos[1]);
  },

  // 弓弦
  pullLine(y) {
    const opts = game.opts;
    const eles = this.eles;
    const btm = eles.btm;
    const bow = eles.bow;
    const bowW = bow.width, bowW2 = bowW / 2, space = 18, top = opts.lineTop - bow.height * .2; // top - 线距容器顶部的距离
    const points = [[-bowW2 + space, top], [0, y + top], [bowW2 - space, top]];

    let lines = [];
    eles.lines && eles.lines.length > 0 && eles.lines.forEach((line, i) => {
      eles.btm.removeChild(line);
    });

    let line = new Graphics();
    line.lineStyle(2, 0x8A736A, 1);
    line.moveTo(points[0][0], points[0][1]);
    for (let i = 0; i < 2; i++) {
      line.lineTo(points[i + 1][0], points[i + 1][1]);
    }
    btm.addChild(line);
    lines.push(line);
    eles.lines = lines;

    eles.circle.y = y + top;
    eles.circleVisible.y = y + top;
  },

  // 绘制太阳等球体
  drawBalls() {
    game.cb.ball = null;
    const scale = .3;
    let eles = this.eles;
    const opts = game.opts;
    const resources = loader.resources;
    let ballBox = new Container();
    this.box.addChild(ballBox);
    eles.ballBox = ballBox;

    const sun = new Sprite(resources.sun.texture);
    sun.scale.set(scale);
    sun.isSun = true;
    sun.anchor.set(.5, .5);
    this.addAttrToBall(sun);
    eles.sun = sun;
    ballBox.addChild(sun);

    for (let i = 1; i < 10; i++) {
      let ballGroup = new Container();
      const sunMask = new Sprite(resources.sun.texture);
      const ball = new Sprite(resources['b' + i].texture);
      ball.scale.set(scale);
      ball.anchor.set(.5, .5);

      sunMask.scale.set(scale);
      sunMask.x = ball.x;
      sunMask.y = ball.y;
      sunMask.alpha = 1;
      sunMask.anchor.set(.5, .5);

      ballGroup.addChild(ball);
      ballGroup.addChild(sunMask);

      this.addAttrToBall(ballGroup);
      ballGroup.idx = i;

      ballBox.addChild(ballGroup);
    }

    const ballBoundsPadding = sun.width;
    const ballBounds = new PIXI.Rectangle(-ballBoundsPadding,
      -ballBoundsPadding,
      opts.w + ballBoundsPadding * 2,
      opts.h * opts.blueRect + ballBoundsPadding * 2 - 20);
    this.ballBounds = ballBounds;
    game.cb.ball = scene2.ballMove;
  },

  // 往ball上添加属性
  addAttrToBall(ball) {
    let opts = game.opts;
    ball.x = Math.random() * opts.w;
    ball.y = Math.random() * opts.h / 2;
    ball.direction = Math.random() * Math.PI * 2;
    ball.turningSpeed = Math.random() - 0.8;
    ball.speed = .8 + Math.random();
    ball.life = opts.life;  // 射中两次毁灭
  },

  // 天体移动
  ballMove() {
    let balls = scene2.eles.ballBox.children;
    let ballBounds = scene2.ballBounds;

    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      ball.direction += ball.turningSpeed * 0.01;
      ball.x += Math.sin(ball.direction) * ball.speed;
      ball.y += Math.cos(ball.direction) * ball.speed;
      ball.rotation = -ball.direction - Math.PI / 2;

      if (ball.x < ballBounds.x) {
        ball.x += ballBounds.width;
      } else if (ball.x > ballBounds.x + ballBounds.width) {
        ball.x -= ballBounds.width;
      }

      if (ball.y < ballBounds.y) {
        ball.y += ballBounds.height;
      } else if (ball.y > ballBounds.y + ballBounds.height) {
        ball.y -= ballBounds.height;
      }
    }
  },

  // 拉弓
  touchHandler(e) {
    if (!scene2.box.visible || !scene2.canPull) return;
    const opts = game.opts;
    const eles = scene2.eles;
    const btm = eles.btm;
    const touch = e.touches[0];
    const {clientX: startX, clientY: startY} = touch;
    let disX, disY, timer;
    scene2.dir = 0;

    window.removeEventListener('touchmove', touchMove);
    window.removeEventListener('touchend', touchEnd);
    if (!inValidBox(startX, startY)) return;

    window.addEventListener('touchmove', touchMove);
    window.addEventListener('touchend', touchEnd);

    function touchMove(e) {
      const arrow = scene2.eles.arrow;
      if (!scene2.box.visible || !scene2.canPull || !arrow) return;
      const touch = e.touches[0];
      const {clientX: curX, clientY: curY} = touch;
      disX = curX - startX, disY = curY - startY;

      disY = disY < 0 ? 0 : disY;
      disY = disY > opts.pullLimit ? opts.pullLimit : disY;

      let rad = Math.atan(Math.abs(disX) / (disY + eles.bow.height * (1 - .2)));
      rad = rad > Math.PI / 4 ? Math.PI / 4 : rad;
      let dir = disX === 0 ? 0 : -disX / Math.abs(disX) * rad;
      btm.rotation = dir;
      arrow.rotation = dir;
      scene2.dir = dir;
      arrow.anchor.y = (.61 * arrow.height - disY) / arrow.height;

      // scene2.drawArrowPlot(rotation);
      scene2.pullLine(disY);
    }

    function touchEnd(e) {
      if (!scene2.box.visible || !scene2.canPull) return;
      if (!disY) return;
      const arrow = scene2.eles.arrow;
      let dir = scene2.dir;

      scene2.canPull = false;
      let dis = disY;
      disX = disY = 0;
      let speed = dis * .25;
      arrow.x += Math.sin(dir) * speed;
      arrow.y -= Math.cos(dir) * speed;

      let btmSpeed = 0.05, btmStart = false;
      clearTimeout(timer);
      timer = setTimeout(() => {
        btmStart = true;// 200ms之后再恢复
      }, 200);

      const {w, h} = opts;
      let balls = eles.ballBox.children;

      scene2.info.total++;
      scene2.setInfo();

      game.cb.state = function () {
        let dir = scene2.dir;
        const arrow = scene2.eles.arrow;
        arrow.x += Math.sin(dir) * speed;
        arrow.y -= Math.cos(dir) * speed;
        // scene2.drawArrowPlot(dir);

        const {x, y, width, height} = arrow;
        if (x < 0 - width || x > w + width || y < 0 - height || y > h + height) {  // 箭出去了屏幕
          return shootEnd();
        }
        for (let i = 0, len = balls.length; i < len; i++) {
          let ball = balls[i];
          let isSun = ball.isSun;

          if (!ball.visible) continue;
          if (!scene2.hitTestBall(ball)) continue;
          shootEnd();

          let curLen = scene2.getBallLen();
          if (ball.life === 2) {  // 第一次射中
            ball.life--;
            if (isSun) {
              changeAlpha(ball, .86);
              scene2.loading - iconsetTips('不要射我啦，我是真太阳');
            } else {
              changeAlpha(ball.children[1], .1);
              scene2.setTips('射中一个假太阳');
            }
          } else if (ball.life === 1) {
            if (isSun) {
              scene2.setTips('太阳毁灭');
              scene2.endGame(0);
            } else {
              let msg = '最后一个假太阳被摧毁了，太厉害了';
              if (curLen > 2) msg = '毁掉一个假太阳，再接再厉';
              else scene2.endGame(1);// 消灭掉所有的假太阳
              scene2.setTips(msg);
            }
            /*game.audio.currentTime = 0;
            game.audio.play();*/
            ball.visible = false;
            scene2.boom(ball);
          }
          scene2.info.hit++;
          scene2.setInfo();
          break;
        }
      };
      game.cb.recover = function () {
        let dir = scene2.dir;
        // 弓弦恢复
        dis -= Math.cos(dir) * speed;
        const n = dis < 0 ? 0 : dis;
        scene2.pullLine(n);
        if (!btmStart) return;

        // 弓箭旋转角度恢复
        if (dir < 0) {
          btm.rotation += btmSpeed;
          if (btm.rotation >= 0) {
            btm.rotation = 0;
            canAddArrow();
            game.cb.recover = null;
          }
        } else {
          btm.rotation -= btmSpeed;
          if (btm.rotation <= 0) {
            btm.rotation = 0;
            canAddArrow();
            game.cb.recover = null;
          }
        }
      };

      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchmove', touchEnd);
    }

    // 改变透明度
    function changeAlpha(ball, alpha) {
      let s = .06;
      let symbol = alpha - ball.alpha > 0 ? 1 : -1;
      s *= symbol;
      game.cb.alpha = function (delta) {
        ball.alpha = ball.alpha + s;
        if (symbol > 0 && ball.alpha > alpha || symbol < 0 && ball.alpha < alpha) {
          ball.alpha = alpha;
          game.cb.alpha = null;
        }
      };
    }

    // 射中或箭出了可视区，本次射击结束
    function shootEnd() {
      const arrow = eles.arrow;
      game.cb.state = null;
      scene2.box.removeChild(arrow);
      eles.arrow = null;
      canAddArrow();
    }

    // 是否可以添加箭，一个是箭射出屏幕外或射中天体，一个是弓箭角度恢复后添加
    function canAddArrow() {
      if (eles.arrow) return;
      if (btm.rotation !== 0) return;
      scene2.addArrow();
      scene2.canPull = true;
    }

    // 是否在弓的操作范围
    function inValidBox(x, y) {
      const circle = eles.circle;
      const g_pos = circle.getGlobalPosition();
      const r = circle.r;
      const {x: cx, y: cy} = g_pos;
      return x > cx - r && x < cx + r && y > cy - r && y < cy + r;
    }
  },

  endGame(overType) {
    scene2.info.over = overType;
    // game.cb.recover = null;
    this.stop();
    scene3.showResult();
  },

  /**================================================================
   辅助文案和效果
   =================================================================*/
  // 添加顶部提示文案和蓝色框内信息文案
  addText() {
    const eles = this.eles;
    const opts = game.opts;
    const box = this.box;

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      // fontStyle: 'italic',
      fontWeight: 'bold',
      fill: '#00FF12',
      /*stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: true,
      wordWrapWidth: 440,  */
    });
    const text = new PIXI.Text('', style);
    text.x = opts.w / 2;
    text.y = 20;
    text.anchor.set(.5);

    box.addChild(text);
    eles.text = text;

    // 添加蓝色区域内的信息展示文本 命中率，射了多少箭
    const style1 = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 12,
      // fontWeight: 'bold',
      fill: '#f4f4f4',  // #7200da
    });
    const text1 = new PIXI.Text('', style1);
    const padding = 5;
    text1.x = padding;
    text1.y = opts.h * opts.blueRect + padding;
    text1.anchor.set(0);
    box.addChild(text1);
    eles.text1 = text1;

    this.setInfo();
  },

  // 设置文案
  setTips(msg) {
    const text = this.eles.text;
    text.text = msg;
    text.alpha = 1;

    game.cb.tips = function () {
      text.alpha -= .004;
      if (text.alpha <= 0) {
        text.alpha = 0;
        game.cb.tips = null;
      }
    };
  },

  // 设置游戏信息
  setInfo() {
    let eles = this.eles;
    let info = this.info;
    let text = eles.text1;
    let len = this.getBallLen();
    text.text = format('时间 : {0}s\n进度 : {1}/9\n射箭 : {2}支\n命中 : {3}支', info.time, 10 - len, info.total, info.hit);
  },

  // 加载爆炸效果图片
  loadBoom() {
    let eles = this.eles;
    game.app.loader.add('spritesheet', './assets/mc.json').load(onAssetsLoaded);

    function onAssetsLoaded() {
      // create an array to store the textures
      const explosionTextures = [];
      let i;
      for (i = 0; i < 26; i++) {
        const texture = PIXI.Texture.from(`Explosion_Sequence_A ${i + 1}.png`);
        explosionTextures.push(texture);
      }
      eles.explosionTextures = explosionTextures;
    }
  },

  // 爆炸效果
  boom(ball) {
    let eles = this.eles;
    let box = this.box;
    let explosionTextures = eles.explosionTextures;

    const explosion = new PIXI.AnimatedSprite(explosionTextures);

    explosion.anchor.set(0.5);
    explosion.rotation = Math.random() * Math.PI;
    explosion.scale.set(0.75);
    explosion.animationSpeed = .8;
    explosion.x = ball.x;
    explosion.y = ball.y;
    explosion.loop = false;
    explosion.gotoAndPlay(0);

    box.addChild(explosion);

    explosion.onComplete = function () {
      box.removeChild(explosion);
    };

    explosion.play();
  },

  // 黑色背景和星星
  drawBlackBg() {
    let opts = game.opts;
    let box = this.box;
    let {w, h} = opts;

    // 天体黑色背景
    const ratio = opts.blueRect;
    let rect = new Graphics();
    // rect.lineStyle(1, 0xFF3300, 1);
    rect.beginFill(0x000000);
    rect.drawRect(0, 0, opts.w, opts.h * ratio * 1.2);
    rect.endFill();
    box.addChild(rect);

    // 绘制星星
    const starAmount = 400;
    let cameraZ = 0;
    const fov = 20;
    const baseSpeed = 0.025;
    let speed = 0;
    let warpSpeed = 0;
    const starStretch = 5;
    const starBaseSize = 0.05;

    // Create the stars
    const stars = [];
    for (let i = 0; i < starAmount; i++) {
      let sprite = new Sprite(resources.star.texture);
      sprite.anchor.set(.5, .7);
      sprite.scale.set(.6);
      const star = {
        sprite: sprite,
        z: 0, x: 0, y: 0,
      };
      randomizeStar(star, true);
      box.addChild(sprite);
      stars.push(star);
    }

    function randomizeStar(star, initial) {
      star.z = initial ? Math.random() * 2000 + 1000 : cameraZ + Math.random() * 1000 + 2000;

      // Calculate star positions with radial random coordinate so no star hits the camera.
      const deg = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50 + 1;
      star.x = Math.cos(deg) * distance;
      star.y = Math.sin(deg) * distance;
    }

    // Listen for animate update
    game.app.ticker.add((delta) => {
      // Simple easing. This should be changed to proper easing function when used for real.
      speed += (warpSpeed - speed) / 20;
      cameraZ += delta * 10 * (speed + baseSpeed);
      for (let i = 0; i < starAmount; i++) {
        const star = stars[i];
        if (star.z < cameraZ) randomizeStar(star);

        // Map star 3d position to 2d with really simple projection
        const z = star.z - cameraZ;
        star.sprite.x = star.x * (fov / z) * w + w / 2;
        star.sprite.y = star.y * (fov / z) * h + h * ratio / 2;

        // Calculate star scale & rotation.
        const dxCenter = star.sprite.x - w / 2;
        const dyCenter = star.sprite.y - h / 2;
        const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        const distanceScale = Math.max(0, (2000 - z) / 2000);
        star.sprite.scale.x = distanceScale * starBaseSize;

        star.sprite.scale.y = distanceScale * starBaseSize + distanceScale * speed * starStretch * distanceCenter / w;
        star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
      }
    });
  },

  // 蓝色背景和弓箭
  drawBow() {
    let opts = game.opts;
    let eles = this.eles;
    let box = this.box;

    // 底部遮罩 blue 区域
    const ratio = opts.blueRect;
    let rect = new Graphics();
    // rect.lineStyle(1, 0xFF3300, 1);
    rect.beginFill(0x00b6fa); // 0x66CCFF
    rect.drawRect(0, opts.h * ratio, opts.w, opts.h * (1 - ratio));
    rect.endFill();
    box.addChild(rect);

    const resource = loader.resources;
    const bow = new Sprite(resource.bow.texture);
    const scale = .5;

    bow.scale.set(scale);
    // anchor 设置锚点 - 锚点不动，图片移动
    // pivot - 设置原点 - 图片不动，原点移动
    bow.anchor.set(.5, .2);
    //bow.pivot.set(bow.width / 2, bow.height * .4);

    let btm = new Container();
    btm.width = bow.width / 2;
    btm.height = bow.height / 2;
    btm.addChild(bow);
    box.addChild(btm);

    btm.x = opts.w / 2;
    btm.y = opts.h - bow.height - 54;

    eles.btm = btm;
    eles.bow = bow;

    // 画拉弓的辅助圆
    let circleR = opts.circleR;
    // 显示的区域
    let circleVisible = new Graphics();
    circleVisible.beginFill(0x9966FF);
    circleVisible.alpha = 0.4;
    circleVisible.drawCircle(0, 0, circleR);
    circleVisible.endFill();
    circleVisible.r = circleR;
    btm.addChild(circleVisible);
    eles.circleVisible = circleVisible;

    // 实际拉弓的区域
    let circle = new Graphics();
    circle.beginFill(0x9966FF);
    circle.alpha = 0;
    circle.drawCircle(0, 0, circleR + 8);
    circle.r = circleR + 40;
    circle.endFill();
    btm.addChild(circle);
    eles.circle = circle;

    this.pullLine(0);

    // 辅助矩形
    let rectangle = new Graphics();
    rectangle.lineStyle(1, 0xFF3300, 1);
    rectangle.beginFill(0x66CCFF);
    rectangle.drawRect(btm.x, btm.y, btm.width, btm.height);
    rectangle.endFill();
    rectangle.alpha = .2;
    //box.addChild(rectangle);
  },

  // 获取箭头位置
  getArrowHeadPos(rotation) {
    let arrow = this.eles.arrow;
    rotation = rotation || arrow.rotation;
    let dis = arrow.height * (arrow.anchor.y) - 4;
    return [arrow.x + dis * Math.sin(rotation), arrow.y - dis * Math.cos(rotation)]
  },

  // 箭头部位置和天体的碰撞
  hitTestBall(ball) {
    let arr = scene2.getArrowHeadPos();
    // scene2.drawArrowPlot();
    const [ax, ay] = arr;   // 箭头位置
    // 除太阳外的其他天体都是容器
    const {width, height, x, y} = ball;
    let opts = game.opts;
    const w = opts.w;
    const h = opts.h * opts.blueRect;
    const inValidRect = ax > 0 && ax < w && ay > 0 && ay < h;
    if (!inValidRect) return;  // 且箭头位置在蓝色区域内

    // 可以认为sprite有效区域是一个圆形，看箭头的头部位置是否进入了圆形区域内
    const r = width / 2; // 半径为r，如果箭头点位置和圆心(x,y)距离小于r，则相交
    const dis = Math.sqrt(Math.pow(x - ax, 2) + Math.pow(y - ay, 2));
    // dis < r && console.log(parseInt(x), parseInt(y), r, parseInt(ax), parseInt(ay));
    return dis < r;
  },
};

// 场景3：游戏结果和分享
let scene3 = {
  box: null,
  eles: {},
  showed: false, // 场景3是否完全显示出来了，完全显示出来按钮点击事件才生效

  init() {
    let box = new Container();
    game.stage.addChild(box);
    this.box = box;
    box.alpha = 0;
    this.drawContent();
    box.visible = false;
    // this.showResult();
  },

  // 绘制背景、标题、文案、按钮
  drawContent() {
    const opts = game.opts;
    let rect = new Graphics();
    let box = this.box;
    let eles = this.eles;

    rect.beginFill(0x000000); // 0x66CCFF
    rect.drawRect(0, 0, opts.w, opts.h);
    rect.endFill();
    box.addChild(rect);

    // 标题
    const style1 = new PIXI.TextStyle({
      align: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#dee2d1',   // f4f4f4
      lineHeight: 24
    });
    const title = new PIXI.Text('', style1);
    title.x = opts.w / 2;
    title.y = 70;
    title.anchor.set(.5, 0);
    box.addChild(title);
    eles.title = title;

    // 具体的文字
    const style = new PIXI.TextStyle({
      align: 'left',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#dee2d1',   // f4f4f4
      lineHeight: 28,
      wordWrap: true,
      breakWords: true,
      wordWrapWidth: opts.w * .8,
    });
    const text = new PIXI.Text('', style);
    text.x = opts.w / 2;
    text.y = title.y + title.height + 30;
    text.anchor.set(.5, 0);
    box.addChild(text);
    eles.text = text;

    // 按钮
    const resource = loader.resources;
    let btnBox = new Container();

    const style2 = new PIXI.TextStyle({
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#ffffff',   // f4f4f4
    });

    // let btn = PIXI.Sprite.from('images/btn.png');
    let btn = new Sprite(resource.btn.texture);
    btn.anchor.set(.5);
    btn.scale.set(.5, .4);
    btn.interactive = true;
    btnBox.width = btn.width;
    btnBox.height = btn.height;
    btnBox.x = opts.w / 2;//- btn.width / 2;
    btnBox.y = opts.h - btn.height / 2 - 80;
    btnBox.addChild(btn);

    btn.on('pointerdown', function () {
      if (!scene3.showed) return;
      text.text = '';
      title.text = '';
      game.cb.scene3Out = function () {
        box.alpha -= .05;
        if (box.alpha <= 0) {
          box.alpha = 0;
          box.visible = false;
          scene2.start();
          game.cb.scene3Out = null;
          game.request({action: 'ssaga', times: ++game.again});
        }
      };
    });

    const btnText = new PIXI.Text('再玩一次', style2);
    btnBox.addChild(btnText);
    btnText.anchor.set(.5, .7);

    box.addChild(btnBox);
  },

  // 显示结果
  showResult() {
    scene3.showed = false;
    let alp = .05;
    let box = this.box;
    box.visible = true;
    box.alpha = 0;

    game.cb.showScene3 = function () {
      box.alpha += alp;
      if (box.alpha >= 1) {
        scene3.showed = true;
        game.cb.showScene3 = null;
        scene3.fillContent();
      }
    };
  },

  fillContent() {
    let info = scene2.info;
    let eles = this.eles;
    let isSunOver = info.over === 0;

    let content = '';
    eles.title.text = isSunOver ? '非常遗憾' : '恭喜';
    if (isSunOver) {
      content = '地球和假太阳的能量都来自真太阳，你把真太阳摧毁，地球进入黑暗冰河期，所有生命都消亡了...';
    } else {
      let ratio = parseInt(info.hit / info.total * 100);
      let ratioStr = ratio > 92 ? '惊人的' + ratio : ratio;
      content = format('你在{0}秒内摧毁了9个假太阳, \n总计射出{1}支箭, 命中{2}支,\n命中率达到了{3}%, \n及时拯救了地球', info.time, info.total, info.hit, ratioStr);
    }
    eles.text.text = content;

    let data = {
      action: 'ssres',
      time: info.time,
      total: info.total,
      hit: info.hit,
      flag: isSunOver ? 0 : 1
    };
    game.request(data);
  },
};

let scene4 = {
  box: null,
  eles: {},

  init() {
    let box = new Container();
    game.stage.addChild(box);
    this.box = box;
    box.visible = false;
  },

  show() {
    this.box.visible = true;
    this.drawBg();
    this.drawText();
  },
  hide() {
    this.box.visible = false;
  },

  // 背景
  drawBg() {
    let opts = game.opts;
    let box = this.box;
    let eles = this.eles;

    eles.bg && box.removeChild(eles.bg);

    let rect = new Graphics();
    rect.beginFill(0x000000); // 0x66CCFF
    rect.drawRect(0, 0, opts.w, opts.h);
    rect.endFill();
    box.addChild(rect);
    eles.bg = rect;
  },

  // 绘制文本
  drawText() {
    let opts = game.opts;
    let box = this.box;
    let eles = this.eles;

    eles.text && box.removeChild(eles.text);
    const style = new PIXI.TextStyle({
      align: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#dee2d1',   // f4f4f4
      lineHeight: 1.5 * 24
    });
    let str = '还未考虑横屏的情况\n只是一个Demo，不用测这么细';
    const text = new PIXI.Text(str, style);
    text.anchor.set(.5, .5);
    text.x = opts.w / 2;
    text.y = opts.h / 2;

    box.addChild(text);
    eles.text = text;
  },
};

game.init();
