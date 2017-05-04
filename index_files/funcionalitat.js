const SCALE_ON_DOUBLETAP = 1.5;
const SCALE_ON_DOUBLETAP_DIF = 0.5;
const MAX_SCALE = 4;
const MIN_SCALE = 1;
const MID_HOLD = 15;

/* ######################## FILE: /home/v-s-bde/public_html/frontend/javascript/core.mobile.js ######################## */

// $(document).on("pagecreate", function(event){
    // $( document ).on( "swipeleft swiperight", function( e ) {
        // // We check if there is no open panel on the page because otherwise
        // // a swipe to close the left panel would also open the right panel (and v.v.).
        // // We do this by checking the data that the framework stores on the page element (panel: open).
        // if ( $.mobile.activePage.jqmData( "panel" ) !== "open" && !$(e.target).hasClass('preventNavigationSwipe')) {
            // if ( e.type === "swiperight" ) {
                // $( "#navigation" ).panel( "open" );
            // }
        // }
    // });

// });



$(document).on("pagecreate", function(event){
	
	/* La manipulació de la imatge en funció de la detecció de gestos es fa amb l'exemple següent 
	http://stackoverflow.com/questions/24839531/scale-div-using-hammer-js
	Sense can.js
	*/
	
	var img = new Image();
	var iRatio;
	img.onload = function() {
		iRatio = this.width / this.height;
		onWindowResize();
	}
	img.src = './index_files/VSB_Tarifzonenplan-750.png';
	var img = $('#map');
	var imgContainer = $('#imgContainer');
	// Setejem la posicio d'una presa
	var holdPos = {
		x: 0.25,
		y: 0.25
	}
	$( window ).resize(onWindowResize);
	
	var scale = 1, last_scale;
	var posX = 0, posY = 0, last_posX=0, last_posY= 0;
	var cRatio, cX, cY, scale1iX, scale1iY;
	var imgBB;
	var centerX, centerY;
	
	// http://stackoverflow.com/questions/7768269/ipad-safari-disable-scrolling-and-bounce-effect
	document.ontouchmove = function(event){
		event.preventDefault();
	}

	// img.mouseup(touchend);
	
	/* EXPLICACIÓ FLUX D'EVENTS. Touchend triggers before double tap. Per això quan som a touchend() després de fer un doubletap
	*  no tenim el valor correcte de scale. Una solució és fer servir l'event click(), que triggers after doubletap. El problema es
	*  que no fires on dragend. Per això hem afegit dragend a hammerjs.
	*/
	img.bind("click", function(){touchend();});
	// El pinch no trigger el click, també necessitem el touchend
	img.bind("touchend", touchend);
	
	function touchend() {
		console.log("------------inici touchend------------");
		imgBB = img.get(0).getBoundingClientRect();
		console.log(imgBB);
		iX = scale1iX * scale;
		iY = scale1iY * scale;
		console.log("img size on touchend: iX:" + iX + " iY:" + iY);
		if(scale < MIN_SCALE){
			scale = MIN_SCALE;
		}else if(scale > MAX_SCALE){
			scale = MAX_SCALE;
		}
		
		fitImg();
		last_scale = scale;
		last_posY = posY;
		last_posX = posX;
		img.addClass("animated");
		drawImage();
	}
	
	function fitImg() {
		
		if (cX >=  iX) {
			// Si el contenidor és més ample que la imatge
			posX =  (cX - iX) / (2 * scale);
			console.log("El contenidor és més ample que la imatge:" + cX +" "+ iX + " " +posX);
		} 
		else {
			console.log("El contenidor és més estret que la imatge. ");
			// Si la imatge és més ample que el contenidor
			if ((iX + posX) < cX){
				// Queda un espai buit a la dreta
				posX = cX - iX;
			}
			else if (posX > 0) {
				// Queda un espai buit a l'esquerra
				posX = 0;
			}
		}
		if (cY >= iY) {
			// Si el contenidor és més alt que la imatge
			posY = (cY - iY) / (2 * scale);
			console.log("El contenidor és més alt que la imatge:" + cY +" "+ iY + " " + posY);
		}
		else {
			console.log("La imatge és més alta que el contenidor " + iY + " " + cY + " " + posY);
			if ((iY + posY) < cY){
				console.log("Sobre per baix");
				posY = cY - iY;
			}
			else if (posY > 0) {
				console.log("Sobre per dalt");
				posY = 0;
			}
		}
	}
	
	
	img.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
		console.log("--------------transitionend--------------------");
		yeyeImg();
		img.removeClass("animated");
	});

	img.hammer().on( "touch doubletap pinch drag dragend", function( e ) {
		/* TODO: Si es volgués que
			- al ampliar la foto amb doubletap, es mantingués el punt de pressió com a origen de l'escalat
			- al ampliar la foto amb pinch, es mantingués el centre dels punts de pressió com a origen de l'escalat.
		S'hauria de treballar amb la variable e.gesture.center.pageX i pageY i amb la propietat transform-origen.
		Cal tenir present que al setejar la propietat transform, es sobreescriu el seu contingut, si no es seteja el translate no hi ha desplaçament */
		console.log("----------NOU MOVIMENT---------------");
		// imgBB = img.get(0).getBoundingClientRect();
		// console.log(964 * scale);
		//console.log(e.gesture.center);
		// TODO: Caldria posar els calculs en funció de les variables marge (que ara és de 8px però hauria de ser 0) i escala on doubletap (que ara és 1.2)
		switch(e.type) {
			case 'touch':
				console.log("----------TOUCH---------------");
				centerX = e.gesture.center.pageX;
				centerY = e.gesture.center.pageY;
				break;
			case 'pinch':
				/* 
				A e.gesture.scale es guarda l'escalat acumulat des del principi del moviment.
				Per tant a cada iteració calculem posX i posY des del centre de pressió. Per fer això, necessitem
				tenit last_posX i last_posX. Com que es setejen a touchend sempre les tindrem. Controlar-ho.
				Passa el mateix amb last_scale.
				Quan durant el pinch es produeix unn desplaçament, s'ignora
				*/
				console.log("----------PINCH---------------");
				scale = last_scale * e.gesture.scale;
				// console.log("posX = " + last_posX + " * " + e.gesture.scale  + " - " + e.gesture.center.pageX + " * " + (e.gesture.scale - 1));
				posX = last_posX * e.gesture.scale - centerX * (e.gesture.scale - 1);
				posY = last_posY * e.gesture.scale - centerY * (e.gesture.scale - 1);
 				break;
			case 'doubletap':
				console.log("----------DOUBLETAP---------------");
				// La fórmula per calcular l'origen i la posicio és:
				// originX = (e.gesture.center.pageX - imgBB.left - 8)/imgBB.width;
				// originY = (e.gesture.center.pageY - imgBB.top - 8)/imgBB.height;
				// posX = imgBB.left - 8 - (originX * 1.2 * imgBB.width - originX * imgBB.width);
				// posY = imgBB.top - 8 - (originY * 1.2 * imgBB.height - originY * imgBB.height);

				scale = last_scale * SCALE_ON_DOUBLETAP;
				scale_to_max_scale = SCALE_ON_DOUBLETAP;
				if(scale > MAX_SCALE) {
						scale = MAX_SCALE;
						scale_to_max_scale = MAX_SCALE / last_scale;
				}
				console.log("posX = " + posX + " * 1.2" + " - " + e.gesture.center.pageX + " * " + scale_to_max_scale);
				posX = posX * scale_to_max_scale - centerX * (scale_to_max_scale - 1) ;
				posY = posY * scale_to_max_scale - centerY * (scale_to_max_scale - 1);
 				break;
			case 'drag':
				console.log("----------DRAG---------------");
				posY = last_posY + parseFloat(e.gesture.deltaY);
				posX = last_posX + parseFloat(e.gesture.deltaX);
				break;
			case 'dragend':
				console.log("----------DRAGEND---------------");
				touchend();
				break;
		}
		console.log('transform: scale(' + scale + ') translate('+posX+'px, '+posY+'px)');
		drawImage();	
	});
	
	function drawImage(){
		img.css('transform','translate('+posX+'px, '+posY+'px) scale(' + scale + ')');
		console.log('transform: translate('+posX+'px, '+posY+'px) scale(' + scale + ')');
		$(".hold").css('top', (- MID_HOLD + posY + img.height() * scale * holdPos.y) + 'px');
		$(".hold").css('left', (- MID_HOLD + posX + img.width() * scale * holdPos.x) + 'px');
	}
	
	function onWindowResize() {
		// Setejar paràmetres i cridar fitImg
		cY = $(window).height() - 16;
		imgContainer.height(cY);
		cX = imgContainer.width();
		cRatio = cX/ cY;
		// console.log("window: " + $(window).width() + " x " + $(window).height());
		// console.log("imgcontainer: " + imgContainer.width() + " x " + imgContainer.height());
		if (cRatio > iRatio) {
			// Sobra pels costats
			img.css({
				'height':'100%',
				'width':'auto'
			});			
			posX = last_posX = (cX - img.width()) / 2;
			posY = last_posY = 0;
		}
		else {
			// Sobre per dalt i per sota
			img.css({
				'width':'100%',
				'height':'auto'
			});
			posY = last_posY = (cY - img.height()) / 2;
			posX = last_posX = 0;
		}	
		scale = last_scale = 1;
		iX = scale1iX = img.width();
		iY = scale1iY = img.height();
		drawImage();
	}
	
	function yeyeImg() {
		console.log(img.get(0).getBoundingClientRect());
	}
});



