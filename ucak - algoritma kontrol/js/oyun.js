
var c,cc,ucak,player,enemyArray, enemyIndex, attackEnemy,
skor, playerYazi, mermiArray, mermiIndex, meteorArray, meteorIndex, safeRangeArray,
mArray, mIndex, arkaPlan, bossReady, boss, bossYazisi, bossScore, 
gameoverYazisi, kazandinYazisi, b1, b2, b3, f16, 
safeRegions, bSafeRegion, destX;

class game{
    constructor(){
       c=document.getElementById("canvas");
       c.width=400;
       c.height=600;
       cc=c.getContext("2d");    
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
        let w, h;
        w = 75;
        h = 75;
        this.playerDestX = c.width/2 - w/2;
        this.playerDestY = c.height - h;
        player=new nesne(this.playerDestX,this.playerDestY,w,h,"player","resimler/player.png");
        enemyArray = [];
        enemyIndex = 0;
        mermiArray = [];
        mermiIndex = 0;
        meteorArray = [];
        meteorIndex = 0;
        mArray = [];
        mIndex = 0;
        safeRangeArray = [];

        safeRegions = null;
        bSafeRegion = false;
        destX = 0;

        playerYazi = new yazi("Can : " + skor, 5, 5, "red", "25px Arial", "left", "hanging");
        arkaPlan = new nesne(0, -300, 400, 900, "arkaPlan", "resimler/arkaplan.png");
        bossReady = false;
        attackEnemy = false;
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

    fireMain(t){
        if(time(t)){
            this.ates();
        }
    }

    fireWing(t){
        if(time(t)){
            this.kanatMermi();
        }
    }

    fire(){
        this.fireMain(10);
        this.fireWing(20);
    }

    // Boss'tan önceki düşmanlara karşı fonksiyonlar
    readyToAttackEnemy(){
        if(!attackEnemy){
            enemyArray.forEach(enemy => {
                if(!attackEnemy){
                    if(enemy.x > player.x + player.w - 12){
                        if((player.y - enemy.y - enemy.h)/enemy.vy <= (enemy.x - player.x - player.w - 10)/(10)){
                            attackEnemy = false;
                        }
                        else{
                            attackEnemy = true;
                            this.playerDestX = enemy.x;
                        }
                    }
                    else if(player.x > enemy.x + enemy.w - 2){
                        if((player.y - enemy.y - enemy.h)/enemy.vy <= (player.x - enemy.x - enemy.w - 10)/(10)){
                            attackEnemy = false;
                        }
                        else{
                            attackEnemy = true;
                            this.playerDestX = enemy.x;
                        }
                    }
                    else{
                        attackEnemy = true;
                        this.playerDestX = player.x;
                    }
                }            
            });
        }
    }
    
    attackEnemy(){
        if(attackEnemy){
            if(player.x == c.width - player.w){ // olabilecek en uca geldi
                player.vx = 0;
                this.fire();
            }
            if(player.x < this.playerDestX - 5){
                player.vx = 10;
            }
            else if(player.x > this.playerDestX + 5){
                player.vx = -10;
            }                
            else {
                player.vx = 0;
                this.fire();
            }
        }
        else{
            if(player.x < c.width/2 - player.w/2 - 10){
                player.vx = 10;
            }
            else if(player.x > c.width/2 - player.w/2 + 10){
                player.vx = -10;
            }
            else{
                player.vx = 0;
            }
        }
    }

    // Boss'a karşı savaşmak için fonksiyonlar
    // Boss'a karşı ateş etmek için kullanılan fonksiyonlar
    getMovementRange(time){
        let minx, maxx;

        minx = player.x - time * 10;
        if(minx < 0){
            minx = 0;
        }
        maxx = player.x + time * 10;
        if(maxx > c.width - player.w){
            maxx = c.width - player.w;
        }
        return new range(minx, maxx);
    }
    getBossX(){
        let bossx;
        bossx = (boss.x + (boss.vx * (player.y - boss.h)/15));
        if(bossx > c.width || bossx < 0){
			if(bossx < 0)
                bossx = -bossx;
			let hitCount = Math.floor(bossx / c.width);
			if(hitCount % 2 == 0)
                bossx = bossx % c.width;	
			else
                bossx = c.width - bossx % c.width;
		}
        return bossx;
    }

    attackMainMiddle(){
        let mx, bossx;
        mx = player.x + player.w/2 - 5;
        bossx = this.getBossX();
        if(mx > bossx && mx < bossx + boss.w){
            this.fireMain(20);
        }
    }

    attackMainWing(){
        let mleftx, mrightx, bossx;
        mleftx = player.x + 2;
        mrightx = player.x + player.w - 12;
        bossx = this.getBossX();
        if((mleftx > bossx && mleftx < bossx + boss.w) 
            || (mrightx > bossx && mrightx < bossx + boss.w) ){
                this.fireWing(30);
        }
    }

    getSafeRegions(){
        if(!bSafeRegion){ 
            var firstHitTime = Number.MAX_VALUE;   
            safeRegions = new safeRegion();

            for(var i = 0; i < safeRangeArray.length; i++){                 
                if(safeRangeArray[i] !== undefined && safeRangeArray[i].endTime >= this.sayac){
                    let safeRange = safeRangeArray[i];       
                    var hitTime = safeRange.beginTime;
                    if(firstHitTime > hitTime + .65){
                        firstHitTime = hitTime;
                        bSafeRegion = true;
                        safeRegions.ranges = [];
                        safeRegions.rangeCount = 0;
                        safeRegions.addRange(0, c.width - player.w);
                        safeRegions.intersectSafeRange(safeRange);
                        safeRegions.beginTime = hitTime;
                        safeRegions.endTime = safeRange.endTime;
                    } 
                    else if(Math.abs(firstHitTime - hitTime) < .65){
                        safeRegions.intersectSafeRange(safeRange);
                    }
                }
            }
            safeRegions.intersectRange(this.getMovementRange(safeRegions.beginTime - this.sayac));          
        }
        if(!bSafeRegion){
            destX = boss.x + boss.w/2;
        }
    }

    calculateDest(){
        var minTime = Number.MAX_VALUE;
        if(safeRegions.ranges.length == 0){
            // Çarpışma kaçınılmaz, tek bir mermi yemeyi göze alalım
            // Tek mermiyi ortalarsak diğerlerinin bize vurmayacağını varsayıyoruz.       
            let time;    
            mArray.forEach(mermi => {   
		// Bütün mermilerde arıyoruz, ama mermi ölmemiş olması lazım
		if(mermi.y < c.width - mermi.h){ 
			time = Math.abs(player.x - mermi.x - mermi.w/2 + player.w/2)/10;
                	if(time < minTime && (mermi.y - player.h)/mermi.vy >= time){
                    		minTime = time;
                    		destX = mermi.x + mermi.w/2 - player.w/2;
                    		if(destX < 0){
                        		destX = 0;
                    		}
                	}

		}
            });
        } else{
            safeRegions.ranges.forEach( r1 => { 
                let timeToGoMiddle =  Math.abs(player.x - (r1.xBegin + r1.xEnd)/2)/10;                  
                if(timeToGoMiddle < minTime){
                    minTime = timeToGoMiddle;
                    bSafeRegion = true;
                    destX = (r1.xBegin + r1.xEnd)/2;
                }
            });
        }        
    }

    getToDest(){
        if(player.x < destX - 5){
            player.vx = 10;
        }
        else if(player.x > destX + 5){
            player.vx = -10;
        }
        else{
            player.vx = destX - player.x; // A trick to get exactly to dest            
        }
        if(this.sayac >= safeRegions.endTime){
            bSafeRegion = false;
        }   
    }

    moveAgainstBoss(){
        this.getSafeRegions();
        this.calculateDest();
        this.getToDest();
    }

    // Boss'un mermilerinden kaçmak için kullanılan fonksiyonlar
    getleftRange(bossMermi){
        if(bossMermi.x - 1 < player.w){
            return null;
        }            
        else{
            return new range(0, bossMermi.x - player.w - 1);
        }
    }

    getRightRange(bossMermi){
        if(bossMermi.x + 10 > c.width - player.w){
            return null;
        }
        else{
            return new range(bossMermi.x + 11, c.width - player.w)
        }
    }

    getHitTime(bossMermi){
        return this.sayac + (c.height - player.h - bossMermi.y - bossMermi.h) / bossMermi.vy;
    }

    getEndTime(bossMermi){
        return this.sayac + (c.height - bossMermi.y - bossMermi.h) / bossMermi.vy;
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
            //f16.play();
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

	playerYazi.update();
        if(skor > 0 && bossScore > 0){
            mermiArray.forEach(mermi => {
                mermi.update();             
            });
      
            if(!bossReady){

                this.readyToAttackEnemy();
                this.attackEnemy();
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
                    if(carpisma(enemy, player)){
                        b3.play();
                        enemy.delete();
                        this.carpismaSayac = 1;
                        skor--;
                        attackEnemy = false;
                    }
                    mermiArray.forEach(mermi => {
                        if(carpisma(enemy, mermi) && this.enemyPatlama != 1){
                            this.patlayanEnemyx = enemy.x;
                            this.patlayanEnemyy = enemy.y;
                            this.patlayanEnemyw = enemy.w;
                            this.patlayanEnemyh = enemy.h;
                            this.enemyPatlama = 1;
                            b1.play();
                            attackEnemy = false;
                            mermi.delete();
                            enemy.delete();                   
                            skor++;                     
                        }                
                    });         
                    playerYazi.text = "Can : " + skor;      
                });
            }else{
                bossYazisi.update();
                boss.update();    
                this.attackMainMiddle();
                this.attackMainWing(); 
                this.moveAgainstBoss();
                
                let w, h;
                w = 10;
                h = 40;
                // düşman mermileri
                if(time(200)){
                    let x, x2, y, mermi1, mermi2;
                    x = boss.x + 9;
                    y = boss.y + 120;
                    mermi1 = new nesne(x, y, w, h, "bossMermi", "resimler/mermi2.png");
                    new safeRange(this.getleftRange(mermi1), this.getRightRange(mermi1), this.getHitTime(mermi1), this.getEndTime(mermi1), mIndex);
                    x2 = boss.x + 190;
                    mermi2 = new nesne(x2, y, w, h, "bossMermi", "resimler/mermi2.png");
                    new safeRange(this.getleftRange(mermi2), this.getRightRange(mermi2), this.getHitTime(mermi2), this.getEndTime(mermi2), mIndex);
                }

                if(time(150)){
                    let x, x2, y, mermi1, mermi2;
                    x = boss.x + 50;
                    y = boss.y + 125;
                    mermi1 = new nesne(x, y, w, h, "bossMermi", "resimler/mermi2.png");
                    new safeRange(this.getleftRange(mermi1), this.getRightRange(mermi1), this.getHitTime(mermi1), this.getEndTime(mermi1), mIndex);
                    x2 = boss.x + 145;
                    mermi2 = new nesne(x2, y, w, h, "bossMermi", "resimler/mermi2.png");
                    new safeRange(this.getleftRange(mermi2), this.getRightRange(mermi2), this.getHitTime(mermi2), this.getEndTime(mermi2), mIndex);
                }

                if(time(25)){
                    let x, y, mermi;
                    x = boss.x + 98;
                    y = boss.y + 135;
                    mermi = new nesne(x, y, w, h, "bossMermi", "resimler/mermi2.png");
                    new safeRange(this.getleftRange(mermi), this.getRightRange(mermi), this.getHitTime(mermi), this.getEndTime(mermi), mIndex);
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

