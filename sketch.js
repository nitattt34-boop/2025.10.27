let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];
let cnv; // canvas element reference
let drawSize, offsetX, offsetY; // 正方形繪製區大小與偏移（置中）

// 左側隱藏選單變數
let sidebarDiv;
let sidebarWidth = 300;
let sidebarX = -sidebarWidth;
let sidebarTargetX = -sidebarWidth;
// iframe overlay 變數
let overlayDiv;

function setup() {
    // 背景畫布全螢幕，但內容限制在置中的正方形區域
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    rectMode(CENTER);
    // 計算置中的正方形繪製區
    drawSize = min(width, height);
    offsetX = (width - drawSize) / 2;
    offsetY = (height - drawSize) / 2;
    objs.push(new DynamicShape());

    // 建立左側隱藏選單（初始隱藏在畫面左側）
    const html = `
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:24px;padding:48px 24px;box-sizing:border-box;height:100vh;">
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">第一單元作品</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">第一單元講義</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">測驗系統</div>
            <div class="menu-item" style="font-size:32px;color:#fff;cursor:pointer;">回到首頁</div>
        </div>
    `;
    sidebarDiv = createDiv(html);
    sidebarDiv.style('position', 'fixed');
    sidebarDiv.style('top', '0px');
    sidebarDiv.style('left', sidebarX + 'px');
    sidebarDiv.style('width', sidebarWidth + 'px');
    sidebarDiv.style('height', '100vh');
    sidebarDiv.style('background', 'rgba(0,0,0,0.65)');
    sidebarDiv.style('padding', '0px');
    sidebarDiv.style('z-index', '9999');
    sidebarDiv.style('box-sizing', 'border-box');
    // 加入 click handler：第一個選項開啟 iframe overlay
    const items = sidebarDiv.elt.querySelectorAll('.menu-item');
    if (items && items.length > 0) {
        // 第一項：載入指定頁面到 iframe（寬 70% 視窗，高 85% 視窗）
        items[0].addEventListener('click', () => {
            openIframe('https://nitattt34-boop.github.io/2025.10.20/');
        });
        // 第二項：載入講義到 iframe
        items[1].addEventListener('click', () => {
            openIframe('https://hackmd.io/@NAy_WOqtQvSDsNi-Atugng/HyY6O70jlx');
        });
        // 其他項目可加上對應處理，例如 items[2] ... items[3]
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 重新計算置中正方形區
    drawSize = min(width, height);
    offsetX = (width - drawSize) / 2;
    offsetY = (height - drawSize) / 2;
}

function draw() {
    background(255);
    for (let i of objs) {
        i.run();
    }

    if (frameCount % int(random([15, 30])) == 0) {
        let addNum = int(random(1, 30));
        for (let i = 0; i < addNum; i++) {
            objs.push(new DynamicShape());
        }
    }
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }

    // 偵測滑鼠是否在最左側 100px，決定選單目標位置
    // 注意：mouseX 為畫布座標，畫布是全螢幕
    if (mouseX >= 0 && mouseX <= 100) {
        sidebarTargetX = 0; // 完全顯示
    } else {
        sidebarTargetX = -sidebarWidth; // 隱藏
    }
    // 緩動移動選單位置（越接近 1 越快）
    sidebarX = lerp(sidebarX, sidebarTargetX, 0.12);
    if (sidebarDiv) sidebarDiv.style('left', sidebarX + 'px');
}

function easeInOutExpo(x) {
	return x === 0 ? 0 :
		x === 1 ? 1 :
		x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
		(2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
	constructor() {
		// 位置限制在置中的正方形區域
		this.x = offsetX + random(0.3, 0.7) * drawSize;
		this.y = offsetY + random(0.3, 0.7) * drawSize;
		this.reductionRatio = 1;
		this.shapeType = int(random(4));
		this.animationType = 0;
		this.maxActionPoints = int(random(2, 5));
		this.actionPoints = this.maxActionPoints;
		this.elapsedT = 0;
		this.size = 0;
		this.sizeMax = drawSize * random(0.01, 0.05);
		this.fromSize = 0;
		this.init();
		this.isDead = false;
		this.clr = random(colors);
		this.changeShape = true;
		this.ang = int(random(2)) * PI * 0.25;
		this.lineSW = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		if (this.animationType == 1) scale(1, this.reductionRatio);
		if (this.animationType == 2) scale(this.reductionRatio, 1);
		fill(this.clr);
		stroke(this.clr);
		strokeWeight(this.size * 0.05);
		if (this.shapeType == 0) {
			noStroke();
			circle(0, 0, this.size);
		} else if (this.shapeType == 1) {
			noFill();
			circle(0, 0, this.size);
		} else if (this.shapeType == 2) {
			noStroke();
			rect(0, 0, this.size, this.size);
		} else if (this.shapeType == 3) {
			noFill();
			rect(0, 0, this.size * 0.9, this.size * 0.9);
		} else if (this.shapeType == 4) {
			line(0, -this.size * 0.45, 0, this.size * 0.45);
			line(-this.size * 0.45, 0, this.size * 0.45, 0);
		}
		pop();
		strokeWeight(this.lineSW);
		stroke(this.clr);
		line(this.x, this.y, this.fromX, this.fromY);
	}

	move() {
		let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
		if (0 < this.elapsedT && this.elapsedT < this.duration) {
			if (this.actionPoints == this.maxActionPoints) {
				this.size = lerp(0, this.sizeMax, n);
			} else if (this.actionPoints > 0) {
				if (this.animationType == 0) {
					this.size = lerp(this.fromSize, this.toSize, n);
				} else if (this.animationType == 1) {
					this.x = lerp(this.fromX, this.toX, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 2) {
					this.y = lerp(this.fromY, this.toY, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 3) {
					if (this.changeShape == true) {
						this.shapeType = int(random(5));
						this.changeShape = false;
					}
				}
				this.reductionRatio = lerp(1, 0.3, sin(n * PI));
			} else {
				this.size = lerp(this.fromSize, 0, n);
			}
		}

		this.elapsedT++;
		if (this.elapsedT > this.duration) {
			this.actionPoints--;
			this.init();
		}
		if (this.actionPoints < 0) {
			this.isDead = true;
		}
	}

	run() {
		this.show();
		this.move();
	}

	init() {
		this.elapsedT = 0;
		this.fromSize = this.size;
		this.toSize = this.sizeMax * random(0.5, 1.5);
		this.fromX = this.x;
		this.toX = this.fromX + (drawSize / 10) * random([-1, 1]) * int(random(1, 4));
		this.fromY = this.y;
		this.toY = this.fromY + (drawSize / 10) * random([-1, 1]) * int(random(1, 4));
		this.animationType = int(random(3));
		this.duration = random(20, 50);
	}
}

// 建立並顯示 iframe overlay（70vw × 85vh），含關閉鈕
function openIframe(url) {
    // 如果已有 overlay，先移除
    if (overlayDiv) {
        overlayDiv.remove();
        overlayDiv = null;
    }
    // overlay container，置中顯示
    overlayDiv = createDiv('');
    overlayDiv.style('position', 'fixed');
    overlayDiv.style('left', '50%');
    overlayDiv.style('top', '50%');
    overlayDiv.style('transform', 'translate(-50%,-50%)');
    overlayDiv.style('width', '70vw');
    overlayDiv.style('height', '85vh');
    overlayDiv.style('z-index', '10001');
    overlayDiv.style('background', '#ffffff');
    overlayDiv.style('box-shadow', '0 12px 40px rgba(0,0,0,0.5)');
    overlayDiv.style('border-radius', '6px');
    overlayDiv.style('overflow', 'hidden');

    // 內部 HTML：關閉鈕 + iframe
    overlayDiv.html(`
        <div style="position:absolute;right:10px;top:10px;z-index:10002;">
            <button id="close-iframe" style="font-size:16px;padding:8px 12px;cursor:pointer;">關閉</button>
        </div>
        <iframe src="${url}" style="width:100%;height:100%;border:none;"></iframe>
    `);

    // 關閉按鈕事件
    const btn = overlayDiv.elt.querySelector('#close-iframe');
    if (btn) {
        btn.addEventListener('click', () => {
            if (overlayDiv) {
                overlayDiv.remove();
                overlayDiv = null;
            }
        });
    }
    // 點擊 overlay 背景以外也可以關閉（選擇性，可視需求移除）
    // 這裡不額外綁全域點擊以避免誤關閉 iframe 內點擊
}