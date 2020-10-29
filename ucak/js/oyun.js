
var c,cc,ucak,player,enemyArray, enemyIndex, 
skor, playerYazi, mermiArray, mermiIndex, meteorArray, meteorIndex, 
mArray, mIndex, arkaPlan, bossReady, boss, bossYazisi, bossScore, 
gameoverYazisi, kazandinYazisi, b1, b2, b3, f16;

class game{
    constructor(){
       c=document.getElementById("canvas");
       c.width=400;
       c.height=600;
       cc=c.getContext("2d");    
       document.addEventListener("keydown", this.kontrolDown.bind(this));  
       document.addEventListener("keyup", this.kontrolUp.bind(this)); 
       document.addEventListener("mousedown", this.mouseDown.bind(this)); 
       document.addEventListener("mouseup", this.mouseUp.bind(this));
       this.carpismaSayac = 0;
       this.enemyPatlama = 0;
       this.bossPatlama = 0;
       this.playerPatlama = 0;
       this.timer = setInterval(this.animate.bind(this),30);      
    }
    init(){
        // Set up  ayarları
        this.sayac = 0;
        skor = 1;
        let x, y, w, h;
        w = 75;
        h = 75;
        x = c.width/2 - w/2;
        y = c.height - h;
        player=new nesne(x,y,w,h,"player","resimler/player.png");
        enemyArray = [];
        enemyIndex = 0;
        mermiArray = [];
        mermiIndex = 0;
        meteorArray = [];
        meteorIndex = 0;
        mArray = [];
        mIndex = 0;
        playerYazi = new yazi("Can : " + skor, 5, 5, "red", "25px Arial", "left", "hanging");
        arkaPlan = new nesne(0, -300, 400, 900, "arkaPlan", "resimler/arkaplan.png");
        bossReady = false;
        let bx, by, bw, bh;
        bw = 200;
        bh = 170;
        bx = random(0, c.width - bw);
        by = -bh;
        boss = new nesne(bx, by, bw, bh, "boss", "resimler/bigEnemy.png");
        bossScore = 100;
        bossYazisi = new yazi("Düşman Canı : " + bossScore, c.width, 5, "red", "25px Arial", "right", "hanging");    
        gameoverYazisi = new yazi("Game Over", c.width/2, 300, "#fff", "50px Arial", "center", "hanging");  
        kazandinYazisi = new yazi("You win!", c.width/2, 300, "green", "50px Arial", "center", "hanging");  

        b1 = new ses("sesler/bom1.mp3");
        b2 = new ses("sesler/bom2.mp3");
        b3 = new ses("sesler/bom3.mp3");
        f16 = new ses("sesler/airstrike.mp3");
    }
    clear(){
        cc.clearRect(0,0,c.width,c.height);
    }
    kontrolDown(event){
        if(skor > 0 || this.playerPatlama == 1){
            if(event.keyCode == 37 || event.keyCode == 65){ 
                player.vx = -10;
            }
            if(event.keyCode == 38 || event.keyCode == 87){ 
                player.vy = -10;
            }
            if(event.keyCode == 39 || event.keyCode == 68){ 
                player.vx = 10;
            }
            if(event.keyCode == 40 || event.keyCode == 83){ 
                player.vy = 10;
            }
            if(event.keyCode == 32){ // boşluk
                this.kanatMermi();
            } 
        }
    }
    kontrolUp(event){
        if(event.keyCode == 37 || event.keyCode == 65){ // a
            player.vx = 0;
        }
        if(event.keyCode == 38 || event.keyCode == 87){ // w
            player.vy = 0;
        }
        if(event.keyCode == 39 || event.keyCode == 68){ // d
            player.vx = 0;
        }
        if(event.keyCode == 40 || event.keyCode == 83){ // s
            player.vy = 0;
        }
    }

    mouseDown(){
        this.atesEt = setInterval(this.ates, 120);
    }

    mouseUp(){
        clearInterval(this.atesEt);
    }

    ates(){
        let x, y, w, h;
        w = 10;
        h = 20;
        x = player.x + player.w/2 - w/2;
        y = player.y;
        new nesne(x, y, w, h, "mermi", "resimler/mermi.png");
    }

    kanatMermi(){
        let x, x2, y, w, h;
        w = 10;
        h = 20;
        x = player.x + 2;
        y = player.y + 40;
        new nesne(x, y, w, h, "mermi", "resimler/mermi.png");
        x2 = player.x + player.w - 12;
        new nesne(x2, y, w, h, "mermi", "resimler/mermi.png");
    }

    stop(){
        clearInterval(this.timer);
    }
    animate(){
        // temizle   güncelle çiz    
        this.sayac++;  
        this.clear();
        arkaPlan.update();

        if(skor > 0){
            f16.play();
        }
        
        if(time(300)){
            let x, y, boyut;
            boyut = random(50, 200);
            x = random(0, c.width - boyut);
            y = -boyut;
            new nesne(x, y, boyut, boyut, "meteor", "resimler/meteor" + random(1, 7) + ".png");
        }

        meteorArray.forEach(meteor => {
            meteor.update();             
        });  

        if(skor > 0 && bossScore > 0){
            playerYazi.update();

            mermiArray.forEach(mermi => {
                mermi.update();             
            });
      
            if(!bossReady){
                // düşman oluşturma
                if(time(100)){
                    let x, y, w, h;
                    w = 50;
                    h = 100;
                    x = random(0, c.width - w);
                    y = -h;
                    new nesne(x, y, w, h, "enemy", "resimler/enemy" + random(1, 6) + ".png");
                }
    
                enemyArray.forEach(enemy => {
                    enemy.update();
                    mermiArray.forEach(mermi => {
                        if(carpisma(enemy, mermi)){
                            this.patlayanEnemyx = enemy.x;
                            this.patlayanEnemyy = enemy.y;
                            this.patlayanEnemyw = enemy.w;
                            this.patlayanEnemyh = enemy.h;
                            this.enemyPatlama = 1;
                            b1.play();
                            mermi.delete();
                            enemy.delete();                   
                            skor++;                     
                        }                
                    }); 
                    if(carpisma(enemy, player)){
                        b3.play();
                        enemy.delete();
                        this.carpismaSayac = 1;
                        skor--;
                    }         
                    playerYazi.text = "Can : " + skor;      
                });
            }else{
                bossYazisi.update();
                boss.update();     
                
                let w, h;
                w = 10;
                h = 40;
                // düşman mermileri
                if(time(300)){
                    let x, x2, y;
                    x = boss.x + 9;
                    y = boss.y + 120;
                    new nesne(x, y, w, h, "bossMermi", "resimler/mermi2.png");
                    x2 = boss.x + 190;
                    new nesne(x2, y, w, h, "bossMermi", "resimler/mermi2.png");
                }

                if(time(200)){
                    let x, x2, y;
                    x = boss.x + 50;
                    y = boss.y + 125;
                    new nesne(x, y, w, h, "bossMermi", "resimler/mermi2.png");
                    x2 = boss.x + 145;
                    new nesne(x2, y, w, h, "bossMermi", "resimler/mermi2.png");
                }

                if(time(30)){
                    let x, y;
                    x = boss.x + 98;
                    y = boss.y + 135;
                    new nesne(x, y, w, h, "bossMermi", "resimler/mermi2.png");
                }
                
                mermiArray.forEach(mermi => {    
                    if(carpisma(boss, mermi)){
                        b1.play();
                        mermi.delete();
                        bossScore--;      
                        bossYazisi.text = "Düşman Canı : " + bossScore;    
                        carpismaImage(mermi.x, mermi.y - 60, 30, 30);                                             
                    }        
                });

                mArray.forEach(mermi => {    
                    mermi.update();
                    if(carpisma(player, mermi)){
                        b3.play();
                        mermi.delete();
                        skor--;      
                        playerYazi.text = "Can : " + skor;     
                        this.carpismaSayac = 1;                          
                    }        
                });
            }   

            if(this.carpismaSayac > 0){
                carpismaImage(player.x, player.y, player.w, player.h);
                this.carpismaSayac++;
                if(this.carpismaSayac > 20){
                    this.carpismaSayac = 0;
                }
            } 

            if(skor >= 10){
                bossReady = true;
            }
        }

        player.update();

        if(this.enemyPatlama > 0){
            carpismaImage(this.patlayanEnemyx, this.patlayanEnemyy, this.patlayanEnemyw, this.patlayanEnemyh);
            this.enemyPatlama++;
            if(this.enemyPatlama > 20){
                this.enemyPatlama = 0;
            }
        }

        if(skor <= 0){
            if(this.playerPatlama == 0){
                b2.play();
                //f16.stop();
                this.playerPatlama = 2;
            }
            gameoverYazisi.update();
            playerYazi.text = "";
        }
        if(bossScore <= 0){
            if(this.bossPatlama == 0){
                b2.play();
                this.bossPatlama = 2; 
            }            
            kazandinYazisi.update();
            playerYazi.text = "";
        }      

        if(this.playerPatlama > 1){
            carpismaImage(player.x, player.y, player.w, player.h);
            this.playerPatlama++;
            if(this.playerPatlama > 150){
                this.playerPatlama = 1;
            }
        } 
        
        if(this.bossPatlama > 1){
            carpismaImage(boss.x, boss.y, boss.w, boss.h);
            this.bossPatlama++;
            if(this.bossPatlama > 150){
                this.bossPatlama = 1;
            }
        } 
    }
}

ucak=new game();
ucak.init();

