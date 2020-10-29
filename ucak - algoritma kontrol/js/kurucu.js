
    
function nesne(x,y,w,h,type,src) {
    this.type=type;    // tipi
    this.x=x;         //x kordinatı
    this.y=y;        //y kordinatı
    this.w=w;       // genişlik
    this.h=h;      // yüksekliği
    this.src=src; //resim yolunu belirt

    //js ile resim olsturma
    this.image=new Image();
    this.image.src=this.src;

    //nesnenin çizim fonk
    this.draw=function () {
        cc.drawImage(this.image,this.x,this.y,this.w,this.h);
    }
    // tipe göre güncelleme ve hız ayarları
    switch (this.type) {
        case "player":
            this.vx=0; //yatay hızı
            this.vy=0; // dusey hızı
            this.update=function () {
                this.x+=this.vx;
                this.y+=this.vy;
                if(this.x < 0)
                    this.x = 0;
                if(this.x > c.width - this.w)
                    this.x = c.width - this.w;
                if(this.y < 0)
                    this.y = 0;
                if(this.y > c.height - this.h)
                    this.y = c.height - this.h;
                this.draw();
            }
            break;
        case "enemy":
            enemyIndex++;
            enemyArray[enemyIndex] = this;
            this.id = enemyIndex;
            this.vy=15; // dusey hızı
            this.update=function () {
                this.y += this.vy;
                if(this.y >= c.height + this.h)
                    this.delete();
                this.draw();
            }
            this.delete = function(){
                delete enemyArray[this.id];
            }
            break;
        case "mermi":
            mermiIndex++;
            mermiArray[mermiIndex] = this;
            this.id = mermiIndex;
            this.vy=-15; // dusey hızı
            this.update=function () {
                this.y += this.vy;
                if(this.y < -this.h)
                    this.delete();
                this.draw();
             }
             this.delete = function(){
                delete mermiArray[this.id];
             }
             break;
        case "arkaPlan":
            this.vy = 6; // dusey hızı
            this.update=function () {
                this.y += this.vy;
                if(this.y >= 0)
                    this.y = -300;
                this.draw();
            }
            break;
        case "meteor":
            this.vx = Math.random();
            if(this.vx <= 0.2){
                this.vx = 0.1;
            } else if(this.vx > 0.2 && this.vx <= 0.4){
                this.vx = 0.2;
            } else if(this.vx > 0.4 && this.vx <= 0.6){
                this.vx = -0.1;
            } else if(this.vx > 0.6 && this.vx <= 0.8){
                this.vx = -0.2;
            } else {
                this.vx = 0;
            }

            this.vy = 2;
            meteorIndex++;
            meteorArray[meteorIndex] = this;
            this.id = meteorIndex;
            this.update=function () {
                this.x += this.vx;
                this.y += this.vy;
                if(this.y >= c.height + this.h)
                    this.delete();
                this.draw();
            }
            this.delete = function(){
                delete meteorArray[this.id];
            }
            break;
        case "boss": 
            this.vx = 3;
            this.vy = 8;
            this.update=function () {
                this.x += this.vx;
                this.y += this.vy;
                if(this.y > 0){
                    this.y = 0;
                }
                if(this.x + this.w > c.width || this.x < 0){
                    this.vx = -this.vx;
                }
                this.draw();
            }
            break;
        case "bossMermi": 
        this.vy = 30;
        mIndex++;
        mArray[mIndex] = this;
        this.id = mIndex;
        this.update=function () {
            this.y += this.vy;
            if(this.y < -this.h){
                this.delete();
            }
            this.draw();
        }
        this.delete = function(){
            delete mArray[this.id];
            //delete safeRangeArray[this.id];
        }
        break;
    }
}

function yazi(text, x, y, color, font, textAlign, textBaseline){
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.font = font;
    this.textAlign = textAlign;
    this.textBaseline = textBaseline;

    this.draw = function(){
        cc.fillStyle = this.color;
        cc.font = this.font;
        cc.textAlign = this.textAlign;
        cc.textBaseline = this.textBaseline;
        cc.fillText(this.text, this.x, this.y);
    }

    this.update = function(){
        this.draw();
    }
}

function ses(src){
    this.music = document.createElement("audio");
    this.music.src = src;
    this.music.setAttribute("preloads", "auto");
    this.music.setAttribute("controls", "none"); 
    this.music.style.display = "none";
    document.body.appendChild(this.music);
    this.play = function(){
        this.music.play();
    }
    this.stop = function(){
        this.music.stop();
    }
}

function range(xBegin, xEnd){
    this.xBegin = xBegin;
    this.xEnd = xEnd;
}

function safeRange(range1, range2, beginTime, endTime, bossMermiIndex){
    this.range = [];
    this.range[0] = range1;
    this.range[1] = range2;
    this.beginTime = beginTime;
    this.endTime = endTime;
    this.bossMermiid = bossMermiIndex;
    safeRangeArray[bossMermiIndex] = this;
}

class safeRegion{
    constructor(){
        this.ranges = [];
        this.rangeCount = 0;
        this.addRange(0, c.width - player.w);
        this.beginTime = 0;
        this.endTime = 0;
    }

    addRange(begin, end){
        this.ranges[this.rangeCount++] = new range(begin, end);
    }

    intersectSafeRange(sr){ // safeRange intersect 
        let newRanges = [];
        let newRangeId = 0;

        // Bütün alanlar gitti
        if(sr.range[0] == null && sr.range[1] == null){
            this.ranges = newRanges;
            this.rangeCount = newRangeId;
        }else if(sr.range[0] == null || sr.range[1] == null){ // Sadece bir tane null olmayan alan var
            let r = sr.range[0] != null ? sr.range[0] : sr.range[1];
            this.ranges.forEach(rng => {
                let begin, end;
                begin = Math.max(rng.xBegin, r.xBegin);
                end = Math.min(rng.xEnd, r.xEnd);
                if(begin < end){
                    newRanges[newRangeId++] = new range(begin, end);
                }
            });
            this.ranges = newRanges;
            this.rangeCount = newRangeId;
        }else{ // İki range de null değil
            let r1 = sr.range[0];
            let r2 = sr.range[1];
            this.ranges.forEach(rng => {
                let begin, end;
                begin = Math.max(rng.xBegin, r1.xBegin);
                end = Math.min(rng.xEnd, r1.xEnd);
                if(begin < end){
                    newRanges[newRangeId++] = new range(begin, end);
                }
                begin = Math.max(rng.xBegin, r2.xBegin);
                end = Math.min(rng.xEnd, r2.xEnd); 
                if(begin < end){
                    newRanges[newRangeId++] = new range(begin, end);
                }
            });
            this.ranges = newRanges;
            this.rangeCount = newRangeId;
        }
    }

    intersectRange(r){ // one range intersect  
        let newRanges = [];
        let newRangeId = 0;
        this.ranges.forEach(rng => {
            let begin, end;
            begin = Math.max(rng.xBegin, r.xBegin);
            end = Math.min(rng.xEnd, r.xEnd);
            if(begin < end){
                newRanges[newRangeId++] = new range(begin, end);
            }
        });
        this.ranges = newRanges;
        this.rangeCount = newRangeId;    
    }

    sort(){
        this.ranges = sortRanges(this.ranges);
    }
}

// Merge Sort algorithm

function compare(r1, r2){
    if(r1.xBegin < r2.xBegin){
        return 1;
    }
    else if(r1.xBegin > r2.xBegin){
        return -1;
    }
    else{
        return 0;
    }
}

function sortRanges(r){
    let mid = Math.floor(r.length / 2);
    if(mid >= 1){
        return mergeRanges(sortRanges(r.slice(0, mid)), sortRanges(r.slice(mid, r.length)));
    }
    else{
        return r;
    }
}

function mergeRanges(r1, r2){
    let newRange = [];
    let newRangeIndex = 0;
    let r1Index = 0;
    let r2Index = 0;
    while(r1.length > r1Index || r2.length > r2Index){
        if(r1.length > r1Index && r2.length > r2Index){
            let compare = this.compare(r1[r1Index], r2[r2Index])
            if(compare >= 0){
                newRange[newRangeIndex++] = r1[r1Index++];
            } else{
                newRange[newRangeIndex++] = r2[r2Index++];
            }
        } else if(r1.length > r1Index){
            newRange[newRangeIndex++] = r1[r1Index++];
        } else if(r2.length > r2Index){
            newRange[newRangeIndex++] = r2[r2Index++];
        }
    }
    return newRange;
}

function time(time){
    if((ucak.sayac/time)%1 == 0){
        return true;
    }
    return false;
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function carpisma(obj1, obj2){
    if(obj1.x >= obj2.x + obj2.w || obj2.x >= obj1.x + obj1.w 
        || obj1.y >= obj2.y + obj2.h || obj2.y >= obj1.y + obj1.h)
        return false;
    return true;
}

function carpismaImage(x, y, w, h){
    let image = new Image();
    image.src = "resimler/p" + random(1,2) + ".png";
    cc.drawImage(image, x, y, w, h); 
}

