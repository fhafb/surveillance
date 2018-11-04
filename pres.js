function formatBigNumber(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function htmlToRgb(s) {
	return {red:parseInt(s.substring(1,3),16),green:parseInt(s.substring(3,5),16),blue:parseInt(s.substring(5,7),16)};
}

function colorGradient(fadeFraction, colors) {
	rgbcolors=[];
	for (let i=0;i<colors.length;++i) rgbcolors.push(htmlToRgb(colors[i]));
	let color1 = rgbcolors[0];
	let color2 = rgbcolors[1];
	if (rgbcolors.length==3) {
		fadeFraction = fadeFraction * 2;
		if (fadeFraction >= 1) {
			fadeFraction -= 1;
			color1 = rgbcolors[1];
			color2 = rgbcolors[2];
		}
	}
	let diffRed = color2.red - color1.red;
	let diffGreen = color2.green - color1.green;
	let diffBlue = color2.blue - color1.blue;
	let gradient = {
		red: parseInt(Math.floor(color1.red + (diffRed * fadeFraction)), 10),
		green: parseInt(Math.floor(color1.green + (diffGreen * fadeFraction)), 10),
		blue: parseInt(Math.floor(color1.blue + (diffBlue * fadeFraction)), 10),
	};
	return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
}

/**
 * Trace un graphique en barres verticales
 * @param {string} id - Id of the SVG object where the graph shall be drawn
 * @param {number[]} range - Range of the graph in graph units : xmin, ymin, xmax, ymax
 * @param {number[][]} values - Values for the histogram : first value is for the x-axis, following values each represent one vertical bar which is laid on the previous one
 * @param {number[]} margins - Margins for ticks and axis titles (left and bottom margins, in percentage)
 * @param {string} xtitle - Title of the x-axis
 * @param {Object[]} xticks - Ticks on the x-axis
 * @param {number} xticks[].position - Position of one tick on the x-axis, in graph units
 * @param {number} xticks[].text - Text for one tick on the x-axis
 * @param {string} ytitle - Title of the y-axis
 * @param {Object[]} yticks - Ticks on the x-axis
 * @param {number} yticks[].position - Position of one tick on the y-axis, in graph units
 * @param {number} yticks[].text - Text for one tick on the y-axis
 * @param {Object} fillcolor - Either a string, or an array with the same number of elements as values, or a function with one argument between 0 and 1. If it is a string, set the fill color to this string. If it is an array, get the fill color of the bar from the array. If it is a function apply the function to get the color, the argument varies from 0 to 1 as the index of the bar goes through the values array.
 */
function draw_bargraph(id,range,values,margins=[10,9],xtitle="",xticks=[],ytitle="",yticks=[],fillcolor="") {
	let transx=x => ((x-range[0])/(range[2]-range[0])*(100-margins[0])+margins[0]);
	let transy=y => (100-margins[1]-(y-range[1])/(range[3]-range[1])*(99-margins[1]));
	let svg=document.getElementById(id);
	if (xtitle!="") {
		let el=document.createElementNS("http://www.w3.org/2000/svg",'text');
		el.setAttribute('x','50%');
		el.setAttribute('y','98%');
		el.setAttribute('style','text-anchor: middle; dominant-baseline: middle; font-size: 0.6em');
		el.textContent=xtitle;
		svg.appendChild(el);
	}
	if (ytitle!="") {
		let el=document.createElementNS("http://www.w3.org/2000/svg",'text');
		el.setAttribute('x','1%');
		el.setAttribute('y','50%');
		el.setAttribute('style','transform-origin: 1% 50%;transform: rotate(-90deg); text-anchor: middle; dominant-baseline: middle; font-size: 0.6em');
		el.textContent=ytitle;
		svg.appendChild(el);
	}
	for (let i=0;i<2;++i) {
		let line=document.createElementNS("http://www.w3.org/2000/svg",'line');
		let x=(i==0)?(margins[0]+"%"):"100%";
		line.setAttribute('x1',x);
		line.setAttribute('y1','1%');
		line.setAttribute('x2',x);
		line.setAttribute('y2',101-margins[1]+'%');
		line.classList.add('stroke_d');
		svg.appendChild(line);
	}
	for (let i=0;i<xticks.length;++i) {
		let line=document.createElementNS("http://www.w3.org/2000/svg",'line');
		let w=0.8*90/(range[2]-range[0]);
		let x=transx(xticks[i].position)+w/2+'%';
		line.setAttribute('x1',x);
		line.setAttribute('y1',100-margins[1]+'%');
		line.setAttribute('x2',x);
		line.setAttribute('y2',101-margins[1]+'%');
		line.classList.add('stroke_d');
		svg.appendChild(line);
		let text=document.createElementNS("http://www.w3.org/2000/svg",'text');
		text.setAttribute('x',x);
		text.setAttribute('y','94%');
		text.setAttribute('style','transform-origin: '+x+' 94%; text-anchor: middle; dominant-baseline: middle; font-size: 0.6em');
		text.textContent=xticks[i].text;
		svg.appendChild(text);
	}
	for (let i=0;i<yticks.length;++i) {
		let line=document.createElementNS("http://www.w3.org/2000/svg",'line');
		let y=transy(yticks[i].position)+'%';
		line.setAttribute('x1',margins[0]-1+'%');
		line.setAttribute('y1',y);
		line.setAttribute('x2','100%');
		line.setAttribute('y2',y);
		line.classList.add('stroke_d');
		svg.appendChild(line);
		let text=document.createElementNS("http://www.w3.org/2000/svg",'text');
		text.setAttribute('x',margins[0]-1.5+'%');
		text.setAttribute('y',y);
		text.setAttribute('style','text-anchor: end; dominant-baseline: middle; font-size: 0.6em');
		text.textContent=yticks[i].text;
		svg.appendChild(text);
	}
	for (let i=0;i<values.length;++i) {
		let w=0.8*90/(range[2]-range[0])+'%';
		let b=transy(range[1]);
		let s=0;
		for (let j=1;j<values[i].length;++j) {
			let rect=document.createElementNS("http://www.w3.org/2000/svg",'rect');
			s+=values[i][j];
			let t=transy(s);
			rect.setAttribute('x',transx(values[i][0])+'%');
			rect.setAttribute('y',t+'%');
			rect.setAttribute('width',w);
			rect.setAttribute('height',(b-t)+'%');
			if (typeof fillcolor=="string" || fillcolor instanceof String) {
				if (fillcolor!='') rect.style.fill=fillcolor;
			}
			else if (fillcolor instanceof Array) {
				if (fillcolor[i] instanceof Array) {
					rect.style.fill=fillcolor[i][j-1];
				} else rect.style.fill=fillcolor[i];
			}
			else if (fillcolor instanceof Function) rect.style.fill=fillcolor(i/(values.length-1));
			rect.style.transformOrigin="0px "+(100-margins[1])+"%";
			rect.style.animation="bargraph_anim 2s ease-in "+(50*i)+"ms 1 both";
			svg.appendChild(rect);
			b=t;
		}
	}
}

document.addEventListener("DOMContentLoaded",function(event) {
	// Graphe des analyses en eau de surface
	let xticks=[];
	for (let i=1970;i<2020;i+=5) xticks.push({position:i,text:''+i});
	let yticks=[];
	for (let i=0;i<15000000;i+=2000000) yticks.push({position:i,text:formatBigNumber(i)});
	draw_bargraph('analyses_esu',[1970,0,2017,15000000],
			[[1970,20873],[1971,152255],[1972,65714],[1973,99447],[1974,112109],[1975,120124],[1976,252334],[1977,152857],[1978,196017],[1979,212915],[1980,202136],[1981,290685],[1982,215331],[1983,217529],[1984,204164],[1985,186293],[1986,186873],[1987,214679],[1988,233897],[1989,241951],[1990,249976],[1991,282115],[1992,349428],[1993,387751],[1994,419657],[1995,456631],[1996,458401],[1997,634406],[1998,632836],[1999,717929],[2000,995435],[2001,1229319],[2002,1654621],[2003,1781943],[2004,1706474],[2005,2392937],[2006,3512147],[2007,6242798],[2008,5650054],[2009,8317380],[2010,8768476],[2011,9402137],[2012,9433065],[2013,12482235],[2014,12732570],[2015,14043538],[2016,11720335],[2017,5018374]],
			[12,9],
			"",xticks,
			"Nombre d'analyses",yticks,
			i => (colorGradient(i,['#08508A','#9FC418','#199FD9'])));
	// Graphe des paramètres en eau de surface
	xticks=[];
	for (let i=1960;i<2020;i+=5) xticks.push({position:i,text:''+i});
	yticks=[];
	for (let i=0;i<=1600;i+=200) yticks.push({position:i,text:i});
	draw_bargraph('params_esu',[1960,0,2017,1600],
			[[1960,7],[1961,7],[1962,12],[1963,11],[1964,29],[1965,38],[1966,32],[1967,42],[1968,37],[1969,37],[1971,57],[1972,72],[1973,67],[1974,69],[1975,89],[1976,99],[1977,89],[1978,98],[1979,107],[1980,113],[1981,116],[1982,108],[1983,110],[1984,109],[1985,98],[1986,96],[1987,103],[1988,135],[1989,112],[1990,111],[1991,197],[1992,242],[1993,247],[1994,216],[1995,348],[1996,353],[1997,489],[1998,482],[1999,493],[2000,583],[2001,597],[2002,639],[2003,656],[2004,659],[2005,816],[2006,832],[2007,947],[2008,1076],[2009,1090],[2010,1180],[2011,1196],[2012,1281],[2013,1312],[2014,1352],[2015,1493],[2016,1556],[2017,1339]],
			[10,9],
			"",xticks,
			"Nombre de paramètres différents",yticks,
			i => (colorGradient(i,['#08508A','#9FC418','#199FD9'])));
	// Graphe des sites en eau souterraine
	yticks=[];
	for (let i=0;i<=2000;i+=200) yticks.push({position:i,text:i});
	draw_bargraph('sites_eso',[0,0,4,2000],
			[[0,574],[1,1775],[2,1446],[3,1674]],
			[10,9],
			"",[{position:0,text:"Masses d'eau"},{position:1,text:"Sites RCS chimie"},{position:2,text:"Sites RCO chimie"},{position:3,text:"Sites contrôles quantitatifs"}],
			"",yticks,
			i => (colorGradient(i,['#08508A','#9FC418','#199FD9'])));
	// Graphe des paramètres en eau souterraine
	xticks=[];
	for (let i=1970;i<2012;i+=5) xticks.push({position:i,text:''+i});
	yticks=[];
	for (let i=0;i<=1500;i+=200) yticks.push({position:i,text:i});
	draw_bargraph('params_eso',[1970,0,2012,1500],
			[[1970,40],[1971,61],[1972,60],[1973,52],[1974,53],[1975,75],[1976,95],[1977,86],[1978,83],[1979,83],[1980,75],[1981,75],[1982,90],[1983,95],[1984,99],[1985,104],[1986,171],[1987,188],[1988,215],[1989,234],[1990,352],[1991,354],[1992,401],[1993,441],[1994,469],[1995,522],[1996,570],[1997,657],[1998,770],[1999,849],[2000,1049],[2001,1160],[2002,1200],[2003,1297],[2004,1385],[2005,1480],[2006,1550],[2007,1409],[2008,1399],[2009,1215],[2010,1293],[2011,1341]],
			[10,9],
			"",xticks,
			"Nombre de paramètres différents",yticks,
			i => (colorGradient(i,['#08508A','#9FC418','#199FD9'])));
	// Graphe des piézomètres
	xticks=[];
	for (let i=1970;i<=2012;i+=5) xticks.push({position:i,text:''+i});
	yticks=[];
	for (let i=0;i<=4000;i+=500) yticks.push({position:i,text:i});
	draw_bargraph('quanti_eso',[1970,0,2013,4000],
			[[1970,384],[1971,463],[1972,497],[1973,519],[1974,666],[1975,700],[1976,745],[1977,790],[1978,847],[1979,847],[1980,869],[1981,914],[1982,948],[1983,937],[1984,1027],[1985,1095],[1986,1117],[1987,1196],[1988,1219],[1989,1343],[1990,1366],[1991,1411],[1992,1501],[1993,1591],[1994,1749],[1995,1885],[1996,2065],[1997,2122],[1998,2246],[1999,2302],[2000,2404],[2001,2494],[2002,2641],[2003,2765],[2004,3014],[2005,3160],[2006,3296],[2007,3431],[2008,3510],[2009,3623],[2010,3804],[2011,3815],[2012,3804]],
			[10,9],
			"",xticks,
			"Nombre cumulé de piézomètres",yticks,
			i => (colorGradient(i,['#08508A','#9FC418','#199FD9'])));
	// Graphe des taux de suivi par catégorie de ME
	yticks=[];
	for (let i=0;i<=100;i+=10) yticks.push({position:i,text:i});
	draw_bargraph('tx_suivi',[0,0,4,100],
			[[0,30],[1,70.6],[2,91.5],[3,82.1]],
			[10,9],
			"",[{position:0,text:"Cours d'eau"},{position:1,text:"Plans d'eau"},{position:2,text:"Eaux de transition"},{position:3,text:"Eaux côtières"}],
			"Taux de suivi (en %)",yticks,
			i => (colorGradient(i,['#08508A','#9FC418','#199FD9'])));
	// Graphe de niveau de confiance de l'état écologique des ESU
	draw_bargraph('confiance_esu_eco',[0,0,4,100],
			[[0,2.21,0.16,64.37,23.13,10.14],[1,0.97,0.83,52.18,21.76,24.26],[2,0.36,0.34,46.63,21.62,31.05],[3,0.24,0.17,17.35,26.98,55.25]],
			[6,9],
			"",[{position:0,text:"2010"},{position:1,text:"2013"},{position:2,text:"2016"},{position:3,text:"2016 - ME surv."}],
			"",yticks,
			[['#A1C51B','#08508A','#777','#E68A00','#199FD9'],['#A1C51B','#08508A','#777','#E68A00','#199FD9'],['#A1C51B','#08508A','#777','#E68A00','#199FD9'],['#A1C51B','#08508A','#777','#E68A00','#199FD9']]);
	// Graphe de niveau de confiance de l'état chimique des ESU
	draw_bargraph('confiance_esu_chim',[0,0,4,100],
			[[0,34.12,0,42.68,16.47,6.73],[1,35.91,1.10,26,21.55,15.44],[2,21.19,3.39,34.34,28.07,13.01],[3,1.25,13.95,18.02,14.83,51.95]],
			[6,9],
			"",[{position:0,text:"2010"},{position:1,text:"2013"},{position:2,text:"2016"},{position:3,text:"2016 - ME surv."}],
			"",yticks,
			[['#A1C51B','#08508A','#777','#E68A00','#199FD9'],['#A1C51B','#08508A','#777','#E68A00','#199FD9'],['#A1C51B','#08508A','#777','#E68A00','#199FD9'],['#A1C51B','#08508A','#777','#E68A00','#199FD9']]);
});

// Animation de la diapositive sur les échanges XML
let animl=0,lasttime=null,
		svgPath=document.getElementById("arrow001"),
		svgPath2=document.getElementById("arrow002"),
		svgImage1=document.getElementById("im001"),
		svgImage2=document.getElementById("im002");
let stopanim001id=false;

function anim001(time) {
	if (lasttime!=null) animl+=(time-lasttime)*0.001;
	if (animl>=2) animl-=2;
	lasttime=time;
	if (animl<=1) {
		let y=animl;
		svgPath.setAttribute('d','M 240 150 c '+(60*y)+' '+(-60*y)+', '+(y*y*240+2*y*(1-y)*60)+' '+(-y*y*60-2*y*(1-y)*60)+', '+(3*y*(1-y)**2*60+3*y*y*(1-y)*240+y**3*300)+' '+(-3*y*(1-y)**2*60-3*y*y*(1-y)*60));
		svgPath2.setAttribute('d','M '+
				((1-y)**3*540+3*y*(1-y)**2*480+3*y*y*(1-y)*300+y**3*240)+' '+((1-y)**3*250+3*y*(1-y)**2*310+3*y*y*(1-y)*310+y**3*250)+' C '+
				((1-y)**2*480+2*y*(1-y)*300+y*y*240)+' '+((1-y)**2*310+2*y*(1-y)*310+y**2*250)+', '+
				((1-y)*300+y*240)+' '+((1-y)*310+y*250)+', 240 250');
		svgImage1.style.opacity=""+animl;
		svgImage2.style.opacity=""+(1-animl);
	} else {
		let y=animl-1;
		svgPath.setAttribute('d','M '+
				((1-y)**3*240+3*y*(1-y)**2*300+3*y*y*(1-y)*480+y**3*540)+' '+((1-y)**3*150+3*y*(1-y)**2*90+3*y*y*(1-y)*90+y**3*150)+' C '+
				((1-y)**2*300+2*y*(1-y)*480+y*y*540)+' '+((1-y)**2*90+2*y*(1-y)*90+y**2*150)+', '+
				((1-y)*480+y*540)+' '+((1-y)*90+y*150)+', 540 150');
		svgPath2.setAttribute('d','M 540 250 c '+(-60*y)+' '+(60*y)+', '+(-y*y*240-2*y*(1-y)*60)+' '+(y*y*60+2*y*(1-y)*60)+', '+(-3*y*(1-y)**2*60-3*y*y*(1-y)*240-y**3*300)+' '+(3*y*(1-y)**2*60+3*y*y*(1-y)*60));
		svgImage1.style.opacity=""+(2-animl);
		svgImage2.style.opacity=""+(animl-1);
	}
	if (!stopanim001id) requestAnimationFrame(anim001);
}

function activate_arrows() {
	stopanim001id=false;
	animl=0;
	lasttime=null;
	anim001();
}

function deactivate_arrows() {
	stopanim001id=true;
}

function run_svg_animations(slide) {
	slide.find('animate').each(function() {
		$(this)[0].beginElement();
	});
}

function stop_svg_animations(slide) {
	slide.find('animate').each(function() {
		$(this)[0].endElement();
	});
}
