//画面サイズ
const SCREEN_W = 580;
const SCREEN_H = 320;

//キャンバスサイズ
const CANVAS_W = SCREEN_W * 2;
const CANVAS_H = SCREEN_H * 2;

//フィールドサイズ
const FIELD_W = SCREEN_W * 2;
const FIELD_H = SCREEN_H * 2;

//キャンバス
let can = document.getElementById("can");
let con = can.getContext("2d");
can.width = CANVAS_W;
can.height = CANVAS_H;

//フィールド
let vcan = document.createElement("canvas");
let vcon = vcan.getContext("2d");
vcan.width = FIELD_W;
vcan.height = FIELD_H;

//星を表す
const STAR_MAX = 350;
let star = [];

//プレイヤーの機体
const positionX = 540;
const positionY = 170;
const MAINSIZE = 10;
const PlayerSpeed = 3;
let HP = 580;

//銃弾
const BulletSpeed = 6;
const BulletMax = 50;
const BulletSize = 3;
let BulletCount = 0;
let bulletArray = [];
let bulflag = true;
let EneBulArray = [];
let EneBulCount = 0;

//敵の機体
const EnemySize = 20;
const EnemySpeed = 1;
const EnemyMax = 10;
let EnemyArray = [];
let EnemyCount = 0;

//爆発
const BrastSize = 1;
let BrastArray=[];
let BrastCount=0;
//ゲームスピード
const GAME_SPEED = 1000 / 60;

//gameLOOPの回数
let GAMECOUNT = 0;

//スコア
let SCORE=0;

//ランダムな整数を生成する
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//キーボードからの操作
let key = [];
document.onkeydown = function (e) {
  key[e.keyCode] = true;
};
document.onkeyup = function (e) {
  key[e.keyCode] = false;
};

//星を表すクラス
class Star {
  constructor() {
    this.x = rand(0, FIELD_W) << 8;
    this.y = rand(0, FIELD_H) << 8;
    this.vx = rand(20, 260);
    this.vy = 0;
    this.size = rand(1, 2);
  }
  draw() {
    let x = this.x >> 8;
    let y = this.y >> 8;
    if (x < 0 || x >= SCREEN_W || y < 0 || y > SCREEN_H) {
      return;
    }
    vcon.fillStyle = rand(0, 2) != 0 ? "66f" : "#8af";
    vcon.fillRect(this.x >> 8, this.y >> 8, this.size, this.size);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x > FIELD_W << 8) {
      this.x = 0;
      this.y = rand(0, FIELD_H) << 8;
    }
  }
}

//自分の玉を表すクラス
class Bullet {
  constructor(num) {
    this.x = player.x;
    this.y = player.y + 3;
    this.sp = BulletSpeed;
    this.num = num;
  }
  draw() {
    vcon.fillStyle = "white";
    vcon.fillRect(this.x, this.y, BulletSize, BulletSize);
  }
  update() {
    if (this.x >= 0) {
      this.x -= this.sp;
    } else if(!this.hit) {
    
      bulletArray.shift();
      BulletCount-=1;
      if (BulletCount  < 1) {
        bulflag = true;
      }
    }
  }
  damage() {
    //当たり判定
    for (let i = 0; i < EnemyArray.length; i++) {
      if (
        this.x <= EnemyArray[i].x + 20 &&
        this.x + 2 >= EnemyArray[i].x &&
        EnemyArray[i].y <= this.y + 2 &&
        this.y <= EnemyArray[i].y + 20 &&
        !this.hit
      ) {
        BulletCount-=1;
        bulletArray.splice(this.num, 1);
        this.hit = true;
        EnemyArray[i].kill = true;
        SCORE+=rand(1,7)*10;
        BrastArray.push(new Brast(this.x,this.y));
        return;
      }
    }
  }
}

//敵の玉
class EneBullet {
  constructor(myX, myY) {
    this.x = myX;
    this.y = myY + 8;
    this.sp = BulletSpeed - 1;
    let angre = Math.atan2(player.y - this.y, player.x - this.x);
    this.vx = Math.cos(angre) * this.sp;
    this.vy = Math.sin(angre) * this.sp;
  }
  draw() {
    let x = this.x;
    let y = this.y;
    vcon.fillStyle = "red";
    vcon.fillRect(this.x, this.y, BulletSize, BulletSize);
  }
  update() {
    if (this.x < 580) {
      this.x += this.vx;
      this.y += this.vy;
    } else {
      EneBulArray.shift();
      EneBulCount = EneBulCount - 1;
    }
  }
}

//playerの機体を表すクラス
class Player {
  constructor() {
    this.x = positionX;
    this.y = positionY;
    this.sp = PlayerSpeed;
    this.kill = false;
    this.hit = false;
  }
  draw() {
    let x = this.x;
    let y = this.y;
    if (x < 0 || x >= SCREEN_W || y < 0 || y > SCREEN_H) {
      return;
    }
    if (this.hit) {
      HP -= 40;
      console.log(HP);
      this.hit = false;
    }
    if (HP < 0) {
      alert("GAMEOVER");
      gameInit();
    } else {
      vcon.fillStyle = "blue";
      vcon.fillRect(this.x, this.y, MAINSIZE, MAINSIZE);
    }
  }
  update() {
    //キーによる移動
    if (key[38]) {
      this.y -= this.sp;
    }
    if (key[40]) {
      this.y += this.sp;
    }
    //当たり判定
    for (let i = 0; i < EneBulArray.length; i++) {
      if (
        EneBulArray[i].x + 2 >= player.x &&
        EneBulArray[i].x < player.x + 10 &&
        EneBulArray[i].y + 2 > player.y &&
        EneBulArray[i].y < player.y + 10
      ) {
        EneBulArray.splice(i, 1);
        EneBulCount -= 1;
        this.hit = true;
      }
    }
  }
  //弾を打つ
  shoot() {
    if (key[32]) {
      if (BulletCount < BulletMax && bulflag) {
        bulletArray.push(new Bullet(BulletCount));
        BulletCount += 1;
        if (BulletCount == BulletMax) {
          bulflag = false;
        }
      }
    }
  }
}

//敵の機体
class Enemy {
  constructor() {
    this.x = 10;
    this.y = rand(0, 340);
    this.vx = EnemySpeed + rand(1, 5);
    let angre = Math.atan2(player.y - this.y, player.x - this.x);
    this.vx = Math.cos(angre) * this.vx;
    this.vy = Math.sin(angre) * this.vx;
    this.size = EnemySize;
    this.r = rand(100, 170);
    this.g = rand(60, 110);
    this.b = rand(8, 40);
    this.flag = false;
    this.flag2 = false;
    this.kill = false;
  }
  draw() {
    if (this.x < 0 || this.x >= SCREEN_W || this.y < 0 || this.y > SCREEN_H) {
      return;
    }
    vcon.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
    vcon.fillRect(this.x, this.y, this.size, this.size);
  }
  update() {
    if (this.kill) {
      this.x = 10;
      this.y = rand(0, 340);
      this.vx = EnemySpeed + rand(1, 5);
      let angre = Math.atan2(player.y - this.y, player.x - this.x);
      this.vx = Math.cos(angre) * this.vx;
      this.vy = Math.sin(angre) * this.vx;
      this.size = EnemySize;
      this.r = rand(100, 170);
      this.g = rand(60, 110);
      this.b = rand(8, 40);
      this.flag = false;
      this.flag2 = false;
      this.kill = false;
    } else {
      this.x += this.vx;
      this.y += this.vy;
      if (!this.flag && !this.flag2) {
        if (this.y < player.y && this.x > 300) {
          this.vy += 1;
          this.flag2 = true;
        } else if (this.y > player.y && this.x > 300) {
          this.vy -= 1;
          this.flag2 = true;
          this.shoot();
        }
      }
      if (this.x > player.x - 100) {
        this.flag = true;
        this.vx = -2;
      } else if (this.flag) {
        this.vx -= 1;
      }
      if (this.flag && this.x < 0) {
        this.x = 10;
        this.y = rand(0, 340);
        this.vx = EnemySpeed + rand(1, 5);
        let angre = Math.atan2(player.y - this.y, player.x - this.x);
        this.vx = Math.cos(angre) * this.vx;
        this.vy = Math.sin(angre) * this.vx;
        this.size = EnemySize;
        this.r = rand(100, 170);
        this.g = rand(60, 110);
        this.b = rand(8, 40);
        this.flag = false;
        this.flag2 = false;
        this.kill = false;
      }
    }
  }
  //弾を打つ
  shoot() {
    EneBulArray.push(new EneBullet(this.x, this.y));
    EneBulCount += 1;
  }
}

//爆発を再現
class Brast{
    constructor(x,y){
        console.log("Brustが生成されました");
        BrastCount+=1;
        this.x=x;
        this.y=y;
        this.size=BrastSize;
        vcon.fillStyle = "red";
        vcon.arc(this.x,this.y,10,0 * Math.PI / 180, 360 * Math.PI / 180, false );
    }
    draw(){
        console.log("draw呼ばれたよ");
        vcon.fillStyle = "red";
        vcon.beginPath();
        vcon.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        vcon.fill();
    }
    update(){
        if(this.size>=30){
            BrastCount=-1;
            BrastArray.shift();
        }else{
            this.size+=1;
        }
    }

}

//ゲーム初期化
function gameInit() {
//数値の初期化
  HP = 580;
  BulletCount = 0;
  bulflag = true;
  EneBulCount = 0;
  EnemyCount = 0;
  GAMECOUNT = 0;
  //星クラス生成
  for (let i = 0; i < STAR_MAX; i++) {
    star[i] = new Star();
  }
  //player生成
  player = new Player();
  //gameLoopを一定間隔で呼び出す
  setInterval(gameLoop, GAME_SPEED);
}

//ゲームループ
function gameLoop() {
  GAMECOUNT += 1;

  //ランダムに敵を生成
  if(GAMECOUNT%60==0){//1秒に一回
      let r = rand(1,3);//3分の1の確立で
      if(r==2&&EnemyMax>EnemyCount){
        EnemyArray[EnemyCount] = new Enemy();
        EnemyCount+=1;
      }
  }

  //画面の初期化
  vcon.fillStyle = "black";
  vcon.fillRect(0, 0, SCREEN_W, SCREEN_H);

  //移動
  for (let i = 0; i < STAR_MAX; i++) {
    star[i].update();
    star[i].draw();
  }
  player.update();
  player.shoot();

  for (let i = 0; i < bulletArray.length; i++) {
    if (bulletArray[i] != undefined) {
      bulletArray[i].damage();
      bulletArray[i].update();
      bulletArray[i].draw();
    }
  }
  for (let i = 0; i < EnemyArray.length; i++) {
    EnemyArray[i].update();
    EnemyArray[i].draw();
  }
  for (let i = 0; i < EneBulCount; i++) {
    if (EneBulArray[i] != undefined) {
      EneBulArray[i].update();
      EneBulArray[i].draw();
    }
  }
  for(let i =0;i<BrastCount;i++){
      BrastArray[i].update();
      BrastArray[i].draw();
  }

  //描画
  player.draw();
  con.drawImage(vcan, 0, 0, SCREEN_W, SCREEN_H, 0, 0, CANVAS_W, CANVAS_H);
  changeDisplay();
}

//ゲームを開始する
window.onload = function () {
  alert("ゲームを開始しますか？");
  gameInit();
};

function changeDisplay() {
    document.getElementById(
      "display"
    ).innerText = `HP: ${HP} SCORE:${SCORE}`;
  }
