// Zerlegung einer Kraft in zwei Komponenten
// Java-Applet (30.05.2003) umgewandelt
// 31.08.2014 - 10.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind in einer eigenen Datei (zum Beispiel forceresolution_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorBody = "#ffffff";                                 // Farbe f�r K�rper
var colorForce = "#c000c0";                                // Farbe f�r gegebene Kraft
var colorComp1 = "#0000ff";                                // Farbe f�r erste Komponente
var colorComp2 = "#ff0000";                                // Farbe f�r zweite Komponente
var colorAngle1 = "#8080ff";                               // Farbe f�r ersten Winkel
var colorAngle2 = "#ff8080";                               // Farbe f�r zweiten Winkel

// Sonstige Konstanten:

var PI2 = 2*Math.PI;                                       // Abk�rzung 2 pi
var DEG = Math.PI/180;                                     // Winkelgrad
var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var ipF, ipA1, ipA2;                                       // Eingabefelder (Kraftbetrag in N, Winkel in Grad)
var opF1, opF2;                                            // Ausgabefelder (Komponenten in N)
var bu1, bu2;                                              // Schaltkn�pfe
var active;                                                // Flag f�r Zugmodus
var nr;                                                    // Nummer f�r Mausereignisse  
var on;                                                    // Flag f�r Animation
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var pix;                                                   // Umrechnungsfaktor (Pixel pro N)
var force0;                                                // Vergleichskraft (N)
var f;                                                     // Gegebener Kraftbetrag (N)
var alpha, beta;                                           // Winkel (Bogenma�)
var f1, f2;                                                // Kraftkomponenten (N)
var x0, y0;                                                // Position K�rper (Pixel)
var phi0, phi1, phi2;                                      // Richtungen von Kraft und Komponenten (Bogenma�) 
var ready1, ready2;                                        // Flags f�r Ausf�hrung der Konstruktionsschritte

// Element der Schaltfl�che (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // R�ckgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfl�che
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  getElement("ipFa",text01);                               // Erkl�render Text (Kraftbetrag, erste Zeile)
  getElement("ipFb",text02);                               // Erkl�render Text (Kraftbetrag, zweite Zeile)
  ipF = getElement("ipFc");                                // Eingabefeld (Kraftbetrag)
  ipF.focus();                                             // Fokus f�r dieses Eingabefeld
  getElement("ipFd",newton);                               // Einheit (Kraftbetrag)
  getElement("angles",text03);                             // Erkl�render Text (Winkelgr��en)
  getElement("ipA1a",text04);                              // Erkl�render Text (1. Winkel)
  ipA1 = getElement("ipA1b");                              // Eingabefeld (1. Winkel)
  getElement("ipA1c",degree);                              // Einheit (1. Winkel)
  getElement("ipA2a",text05);                              // Erkl�render Text (2. Winkel)
  ipA2 = getElement("ipA2b");                              // Eingabefeld (2. Winkel)
  getElement("ipA2c",degree);                              // Einheit (2. Winkel)
  getElement("components",text06);                         // Erkl�render Text (Betr�ge der Kraftkomponenten)
  getElement("opF1a",text07);                              // Erkl�render Text (1. Komponente)          
  opF1 = getElement("opF1b");                              // Ausgabefeld (1. Komponente)
  getElement("opF1c",newton);                              // Einheit (1. Komponente)
  getElement("opF2a",text08);                              // Erkl�render Text (2. Komponente)
  opF2 = getElement("opF2b");                              // Ausgabefeld (2. Komponente)
  getElement("opF2c",newton);                              // Einheit (2. Komponente)
  bu1 = getElement("bu1",text09);                          // Erster Schaltknopf (Konstruieren)
  bu2 = getElement("bu2",text10);                          // Zweiter Schaltknopf (L�schen)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
  
  on = false;                                              // Animation abgeschaltet
  ready1 = ready2 = false;                                 // Komponenten noch nicht konstruiert
  pix = 50;                                                // 50 Pixel pro N 
  force0 = 1;                                              // Vergleichskraft 1 N
  f = 5;                                                   // Gegebener Kraftbetrag (N)
  x0 = 50; y0 = height/2;                                  // Position K�rper (Pixel)
  phi0 = 0;                                                // Kraftrichtung (Bogenma�, nach rechts)
  alpha = 20*DEG; beta = 40*DEG;                           // Gegebene Winkel (Bogenma�)
  updateInput();                                           // Eingabefelder aktualisieren
  calculation();                                           // Berechnungen
  updateOutput();                                          // Ausgabefelder aktualisieren
  paint();                                                 // Zeichnen
  t0 = new Date();                                         // Aktuelle Zeit
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  
  ipF.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Kraftbetrag)
  ipA1.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe 1. Winkel)
  ipA2.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe 2. Winkel)
  bu1.onclick = reactionButton1;                           // Reaktion auf ersten Schaltknopf (Konstruieren)
  bu2.onclick = reactionButton2;                           // Reaktion auf zweiten Schaltknopf (L�schen)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Dr�cken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Ber�hrung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Ber�hrung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  }

// Reaktion auf Dr�cken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Ber�hrung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Ber�hrpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (active) e.preventDefault();                          // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  active = false;                                          // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Ber�hrung:
  
function reactionTouchEnd (e) {             
  active = false;                                          // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Hilfsroutine: Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt active, nr

function reactionDown (u, v) {
  active = true;                                           // Zugmodus aktivieren
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)  
  var tol1 = 0.05;                                         // Maximale Winkelabweichung (Bogenma�)
  var tol2 = 10;                                           // Maximale L�ngenabweichung (Pixel)
  var dx = u-x0, dy = v-y0;                                // Koordinaten des Verbindungsvektors (Pixel)
  var r = Math.sqrt(dx*dx+dy*dy);                          // Abstand zum Angriffspunkt (Pixel)
  if (r < tol2) {nr = 1; return;}                          // Falls Abstand klein, Angriffspunkt �ndern
  var phi = Math.atan2(-dy,dx);                            // Winkel gegen�ber waagrechter Achse (Bogenma�)
  var dphi = Math.abs(diffAngle(phi,phi0));                // Winkelabweichung zur Kraftrichtung (Betrag, Bogenma�) 	
  if (dphi < tol1 && r < f*pix+tol2) {                     // Falls Winkelabweichung klein und Abstand zum Angriffspunkt nicht zu gro� ...
    nr = 2; return;                                        // ... Pfeilspitze �ndern
    }
  dphi = Math.abs(diffAngle(phi,phi1));                    // Winkelabweichung zur Richtung der ersten Komponente (Betrag, Bogenma�)
  if (dphi < tol1) {                                       // Falls Winkelabweichung gering ...
    nr = 3; return;                                        // ... Richtung der ersten Komponente �ndern
    }
  dphi = Math.abs(diffAngle(phi,phi2));                    // Winkelabweichung zur Richtung der zweiten Komponente (Betrag, Bogenma�)
  if (dphi < tol1) {                                       // Falls Winkelabweichung gering ...
    nr = 4; return;                                        // Richtung der zweiten Komponente �ndern 
    }
  nr = 0; active = false;                                  // Position nicht sinnvoll
  }
  
// Reaktion auf Bewegung von Maus oder Finger (�nderung):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt x0, y0, f, phi0

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  var xM = u, yM = v;                                      // Mausposition �bernehmen
  if (xM < 10) xM = 10;                                    // Falls zu weit links, korrigieren
  if (xM > width-10) xM = width-10;                        // Falls zu weit rechts, korrigieren 
  if (yM < 10) yM = 10;                                    // Falls zu weit oben, korrigieren
  if (yM > height-10) yM = height-10;                      // Falls zu weit unten, korrigieren
  var dx = xM-x0, dy = yM-y0;                              // Verbindungsvektor
  switch (nr) {                                            // Fallunterscheidung
    case 1:                                                // 1. Fall: Angriffspunkt �ndern
      x0 = xM; y0 = yM;                                    // Neue Position
      break;
    case 2:                                                // 2. Fall: Gegebene Kraft �ndern
      f = Math.sqrt(dx*dx+dy*dy)/pix;                      // Neuer Kraftbetrag (N)              
      if (f > 1000) f = 1000;                              // Falls zu gro�, korrigieren
      if (f < 0.001) f = 0.001;                            // Falls zu klein, korrigieren
      phi0 = Math.atan2(-dy,dx);                           // Neuer Richtungswinkel (Bogenma�)
      break; 
    case 3:                                                // 3. Fall: Richtung der ersten Komponente �ndern
  	  var phi = Math.atan2(-dy,dx);                        // Neuer Richtungswinkel (Bogenma�)
  	  alpha = diffAngle(phi0,phi);                         // Neuer Winkel zwischen Kraft und erster Komponente (Bogenma�)
  	  if (alpha < 0) alpha += PI2;                         // Falls negativ, korrigieren
  	  var dir = compare(phi,phi1);                         // Vergleich mit dem bisherigen Richtungswinkel
  	  if (dir > 0 && compare(phi,phi0) >= 0) {             // Falls Angriffslinie im Gegenuhrzeigersinn �berschritten wird ...
  	    alpha = DEG; phi0 = phi+alpha;                     // ... Winkel gleich 1� setzen und Kraftrichtung anpassen
  	    }
  	  if (dir < 0 && compare(phi,phi0+beta-179*DEG) < 0) { // Falls Angriffslinie im Uhrzeigersinn �berschritten wird ...
  	    if (alpha > 179*DEG) alpha = 179*DEG;              // ... Winkel gleich 179� setzen
  	    phi0 = phi+alpha;                                  // ... Kraftrichtung anpassen 	      
  	    beta = 179*DEG-alpha;                              // ... Winkel zwischen Kraft und zweiter Komponente anpassen 
  	    }
  	  break;  	 
    case 4:                                                // 4. Fall: Richtung der zweiten Komponente �ndern
      phi = Math.atan2(-dy,dx);                            // Neuer Richtungswinkel (Bogenma�)
      beta = diffAngle(phi,phi0);                          // Neuer Winkel zwischen Kraft und zweiter Komponente (Bogenma�)
      if (beta < 0) beta += PI2;                           // Falls negativ, korrigieren
      dir = compare(phi,phi2);                             // Vergleich mit dem bisherigen Richtungswinkel
      if (dir < 0 && compare(phi,phi0) <= 0) {             // Falls Angriffslinie im Uhrzeigersinn �berschritten wird ...
        beta = DEG; phi0 = phi-beta;                       // ... Winkel gleich 1� setzen und Kraftrichtung anpassen
        }
      if (dir > 0 && compare(phi,phi0-alpha+179*DEG) > 0) {// Falls Angriffslinie im Gegenuhrzeigersinn �berschritten wird ...
        if (beta > 179*DEG) beta = 179*DEG;                // ... Winkel gleich 179� setzen
        phi0 = phi-beta;                                   // ... Kraftrichtung anpassen
        alpha = 179*DEG-beta;                              // ... Winkel zwischen Kraft und erster Komponente anpassen
        }
      break;  	       
      } // Ende switch
  if (nr > 1) {                                            // Falls �nderung bei Kraft und Komponenten ...
    calculation();                                         // ... Berechnungen durchf�hren
    updateInputOutput();                                   // ... Ein- und Ausgabefelder aktualisieren
    }    
  paint();                                                 // Neu zeichnen
  }
    
// Hilfsroutine: Eingabe �bernehmen und rechnen
// Seiteneffekt f, alpha, beta, f1, f2, phi1, phi2, force0, pix

function reaction () {
  ready1 = ready2 = false;                                 // Konstruktionsschritte noch nicht abgeschlossen
  input();                                                 // Eingegebene Werte �bernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen (f1, f2, phi1, phi2)
  setPix();                                                // Aktualisierung von Vergleichskraft und Umrechnungsfaktor
  }
  
// Reaktion auf ersten Schaltknopf (Konstruieren):
// Seiteneffekt on, t0, f, alpha, beta, f1, f2, phi1, phi2, force0, pix
  
function reactionButton1 () {
  on = true;                                               // Animation anschalten
  t0 = new Date();                                         // Anfangszeit der Animation
  reaction();                                              // Eingaben �bernehmen und rechnen
  }

// Reaktion auf zweiten Schaltknopf (L�schen):
// Seiteneffekt on, t, f, alpha, beta, f1, f2, phi1, phi2, force0, pix
  
function reactionButton2 () {
  on = false;                                              // Animation abschalten
  t = 0;                                                   // Zeit zur�cksetzen
  reaction();                                              // Eingaben �bernehmen und rechnen
  updateOutput();                                          // Ausgabefelder aktualisieren (Fragezeichen)
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen und rechnen                          
  paint();                                                 // Neu zeichnen
  }
  
//-------------------------------------------------------------------------------------------------
  
// Differenz von Winkeln:
// w1, w2 ... gegebene Winkel
// R�ckgabewert im Normalfall w1-w2; falls dieser Wert einen Betrag von mindestens 2 pi hat, wird ein geeignetes ganzzahliges
// Vielfaches von 2 pi addiert oder subtrahiert; das Ergebnis liegt zwischen - 2 pi und + 2 pi und ist positiv f�r w1 > w2
// und negativ f�r w1 < w2.
  
function diffAngle (w1, w2) {
  var w = w1-w2;
  var n = Math.floor(w/PI2);
  if (w < 0) n++; 
  return w-n*PI2; 
  }
  
// Vergleich zweier Winkel:
// w1, w2 ... Gegebene Winkel (Bogenma�)
// R�ckgabewert 0, falls sich w1 und w2 um ein ganzzahliges Vielfaches von 2 pi unterscheiden
// R�ckgabewert 1, falls es einen Winkel w mit 0 < w < pi gibt, sodass w1 gleichwertig zu w2 + w
// R�ckgabewert -1, falls es einen Winkel w mit 0 < w < pi gibt, sodass w1 gleichwertig zu w2 - w
  
function compare (w1, w2) {
  var w = w1-w2;                                           // Differenz
  while (w > Math.PI) w -= PI2;                            // Vielfaches von 2 pi subtrahieren (Ergebnis kleiner oder gleich +pi)
  while (w < -Math.PI) w += PI2;                           // Vielfaches von 2 pi addieren (Ergebnis gr��er oder gleich -pi)                     
  if (w == 0) return 0;                                    // Falls Winkel w1 und w2 gleichwertig, R�ckgabewert 0
  return (w>0 ? 1 : -1);                                   // R�ckgabewert bei nicht gleichwertigen Winkeln
  }

// Berechnungen (nach �nderungen):
// Seiteneffekt f1, f2, phi1, phi2
  
function calculation () {
  phi1 = phi0-alpha;                                       // Richtungswinkel der ersten Komponente (Bogenma�) 
  phi2 = phi0+beta;                                        // Richtungswinkel der zweiten Komponente (Bogenma�)
  var sinAB = Math.sin(alpha+beta);                        // Hilfsgr��e
  f1 = f*Math.sin(beta)/sinAB;                             // Erste Komponente (N)
  f2 = f*Math.sin(alpha)/sinAB;                            // Zweite Komponente (N)
  }
  
// Suche nach einer Zehnerpotenz:
// a ... Gegebene Zahl (positiv)
// R�ckgabewert: Gr��te Zehnerpotenz, die kleiner oder gleich a ist

function floorP10 (a) {
  var n = Math.floor(Math.log(a)/Math.log(10));            // Exponent der gesuchten Zehnerpotenz
  var p = 1;                                               // Startwert f�r Hilfsgr��e
  for (var i=0; i<Math.abs(n); i++) p *= 10;               // Berechnung der Hilfsgr��e (Zehnerpotenz bzw. deren Kehrwert)
  return (n>=0 ? p : 1/p);                                 // R�ckgabewert 
  }
  
// Aktualisierung der Vergleichskraft und des Umrechnungsfaktors:
// Seiteneffekt force0, pix
  
function setPix () {
  var max = f;                                             // Maximum von f, f1 und f2
  if (f1 > max) max = f1;
  if (f2 > max) max = f2;
  force0 = floorP10(max);                                  // Betrag der Vergleichskraft (N)
  if (max/force0 > 5) pix = 20/force0;                     // Umrechnungsfaktor (Pixel pro N)
  else if (max/force0 > 2) pix = 50/force0;
  else pix = 100/force0;
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  if (n == 1000) s = "1000";                               // Ausnahme, um "1,00e+3" zu verhindern
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// R�ckgabewert: Zahl oder NaN
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls m�glich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu gro�, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // R�ckgabewert
  }
   
// Gesamte Eingabe:

function input () {
  f = inputNumber(ipF,3,false,0.001,1000);                 // Betrag der gegebenen Kraft
  alpha = DEG*inputNumber(ipA1,1,true,0.1,179-beta/DEG);   // Erster Winkel
  beta = DEG*inputNumber(ipA2,1,true,0.1,179-alpha/DEG);   // Zweiter Winkel
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipF.value = ToString(f,3,false);                         // Eingabefeld f�r Kraftbetrag
  ipA1.value = ToString(alpha/DEG,1,true);                 // Eingabefeld f�r ersten Winkel
  ipA2.value = ToString(beta/DEG,1,true);                  // Eingabefeld f�r zweiten Winkel
  }
  
// Aktualisierung der Ausgabefelder:

function updateOutput () {
  opF1.innerHTML = (ready1 ? ToString(f1,3,false) : "?");  // Erste Komponente (N)
  opF2.innerHTML = (ready2 ? ToString(f2,3,false) : "?");  // Zweite Komponente (N)
  }
  
// Aktualisierung der Ein- und Ausgabefelder:
  
function updateInputOutput () {
  updateInput();                                           // Eingabefelder aktualisieren
  updateOutput();                                          // Ausgabefelder  aktualisieren
  }
  
//-------------------------------------------------------------------------------------------------
  
// Neuer Pfad mit Standardwerten:

function newPath() {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke
  }
  
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)
// Zu beachten: Die Farbe wird durch ctx.strokeStyle bestimmt.

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                           // Falls Liniendicke nicht definiert, Defaultwert                          
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);                     // L�nge
  if (length == 0) return;                                 // Abbruch, falls L�nge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // L�nge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt f�r Pfeilspitze         
  var h = 0.5*w+3.5;                                       // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;                    // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;                    // Ecke der Pfeilspitze
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;                    // Einspringende Ecke der Pfeilspitze
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.moveTo(x1,y1);                                       // Anfangspunkt
  if (length < 5) ctx.lineTo(x2,y2);                       // Falls kurzer Pfeil, weiter zum Endpunkt, ...
  else ctx.lineTo(xSp,ySp);                                // ... sonst weiter zur einspringenden Ecke
  ctx.stroke();                                            // Linie zeichnen
  if (length < 5) return;                                  // Falls kurzer Pfeil, keine Spitze
  ctx.beginPath();                                         // Neuer Pfad f�r Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Pfeil mit Anfangspunkt (x0,y0) und dreifacher Dicke  (vereinfachte Version):    
// r ..... L�nge des Pfeils (Pixel)
// phi ... Winkel gegen�ber der Waagrechten (Bogenma�, Gegenuhrzeiger)
    
function thickArrow (phi, r) {
  var x = x0+r*Math.cos(phi);                              // x-Koordinate (Pixel)
  var y = y0-r*Math.sin(phi);                              // y-Koordinate (Pixel)
  arrow(x0,y0,x,y,3);                                      // Pfeil zeichnen
  }
  
// Strecke/Halbgerade/Gerade mit Liniendicke 1:
// x0, y0 ... Anfangspunkt
// phi ...... Winkel gegen�ber der Waagrechten (Bogenma�)
// len ...... L�nge (eventuell irrelevant)
// type ..... Strecke/Halbgerade/Gerade (0/1/2)
  	
function line (x0, y0, phi, len, type) {
  var infty = 2*width;                                     // Ersatz f�r unendliche L�nge
  if (len > infty) len = infty;                            // Zu gro�e L�nge verhindern
  var sin = Math.sin(phi), cos = Math.cos(phi);            // Trigonometrische Werte
  var x = (type==2 ? x0-infty*cos : x0);                   // x-Koordinate des (eventuell ver�nderten) Anfangspunkts
  var y = (type==2 ? y0+infty*sin : y0);                   // y-Koordinate des (eventuell ver�nderten) Anfangspunkts
  var r = (type==0 ? len : infty);                         // L�nge (eventuell ver�ndert)                         
  ctx.beginPath();                                         // Neuer Pfad               
  ctx.lineWidth = 1;                                       // Liniendicke
  ctx.moveTo(x,y);                                         // Anfangspunkt
  ctx.lineTo(x0+r*cos,y0-r*sin);                           // Weiter zum Endpunkt
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Winkelmarkierung im Gegenuhrzeigersinn:
// x, y ... Scheitel
// r ...... Radius
// a0 ..... Startwinkel (Bogenma�)
// a ...... Winkelbetrag (Bogenma�)
// c ...... F�llfarbe 

function angle0 (x, y, r, a0, a, c) {
  newPath();                                               // Neuer Pfad
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.moveTo(x,y);                                         // Scheitel als Anfangspunkt
  ctx.lineTo(x+r*Math.cos(a0),y-r*Math.sin(a0));           // Linie auf dem ersten Schenkel
  ctx.arc(x,y,r,PI2-a0,PI2-a0-a,true);                     // Kreisbogen
  ctx.closePath();                                         // Zur�ck zum Scheitel
  ctx.fill(); ctx.stroke();                                // Kreissektor ausf�llen, Rand zeichnen
  }
  
// Farbige Winkelmarkierung (vereinfachte Version):
// (x0,y0) ... Scheitel (globale Variablen)
// w0 ........ Anfangswinkel (Bogenma�)
// dw ........ Winkelgr��e (Bogenma�)
// c ......... Farbe

function angle (w0, dw, c) {
  var n = Math.floor(w0/PI2);                              // 0 <= w0 < 2 pi erzwingen
  w0 -= n*PI2;
  n = Math.floor(dw/PI2);                                  // 0 <= dw < 2 pi erzwingen
  dw -= n*PI2;
  angle0(x0,y0,20,w0,dw,c);                                // Winkelmarkierung
  }
  
// Zentrierter Text:
// s ...... Zeichenkette
// x, y ... Position
// c ...... Farbe (optional)

function centeredText (s, x, y, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe setzen, falls festgelegt
  ctx.font = FONT;                                         // Zeichensatz
  ctx.textAlign = "center";                                // Textausrichtung (zentriert)
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Beschriftung eines Kraftpfeils:
// s ..... Zeichenkette
// phi ... Winkel gegen�ber der x-Achse (Bogenma�)
// r ..... Abstand vom Angriffspunkt (Pixel)
// c ..... Farbe
  
function arrowText (s, phi, r, c) {
  var x = x0+r*Math.cos(phi);                              // x-Koordinate (Pixel) 
  var y = y0-r*Math.sin(phi);                              // y-Koordinate (Pixel)
  centeredText(s,x,y,c);                                   // Text zentriert ausgeben
  } 
  
// Clipping:

function clip () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.moveTo(2,2);                                         // Anfangspunkt (links oben)
  ctx.lineTo(width-2,2);                                   // Weiter nach rechts oben
  ctx.lineTo(width-2,height-2);                            // Weiter nach rechts unten
  ctx.lineTo(2,height-2);                                  // Weiter nach links unten
  ctx.closePath();                                         // Zur�ck zum Ausgangspunkt
  ctx.clip();                                              // Zeichenbereich begrenzen
  }

// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  clip();                                                  // Clipping
  ctx.strokeStyle = "#000000";                             // Farbe f�r Vergleichspfeil
  arrow(50,height-50,50+force0*pix,height-50,3);           // Vergleichspfeil
  var f0 = ""+Math.round(force0)+" "+newtonUnicode;        // Zeichenkette f�r Vergleichskraft
  if (force0 < 1)                                          // Falls Vergleichskraft kleiner als 1 N ... 
    f0 = ""+ToString(force0,1,false)+" "+newtonUnicode;    // ... Zahlenwert mit einer g�ltigen Ziffer
  centeredText(f0,50+force0*pix/2,height-30);              // Wert der Vergleichskraft unter dem Pfeil
  ctx.beginPath();                                         // Neuer Pfad
  ctx.fillStyle = colorBody;                               // F�llfarbe f�r K�rper
  ctx.strokeStyle = "#000000";                             // Randfarbe
  ctx.lineWidth = 1.2;                                     // Liniendicke       
  ctx.arc(x0,y0,5,0,PI2,true);                             // Kreis f�r K�rper vorbereiten
  ctx.fill(); ctx.stroke();                                // Kreis mit Rand zeichnen
  var xF = x0+f*pix*Math.cos(phi0);                        // x-Koordinate der Pfeilspitze
  var yF = y0-f*pix*Math.sin(phi0);                        // y-Koordinate der Pfeilspitze
  angle(phi1,alpha,colorAngle1);                           // Ersten Winkel markieren
  angle(phi0,beta,colorAngle2);                            // Zweiten Winkel markieren
  ctx.strokeStyle = colorForce;                            // Farbe f�r Kraftpfeil
  thickArrow(phi0,f*pix);                                  // Pfeil f�r gegebene Kraft
  ctx.strokeStyle = colorComp1;                            // Farbe f�r erste Komponente
  line(x0,y0,phi1,1,1);                                    // Halbgerade f�r erste Komponente
  ctx.strokeStyle = colorComp2;                            // Farbe f�r zweite Komponente
  line(x0,y0,phi2,1,1);                                    // Halbgerade f�r zweite Komponente
  var q1 = Math.min(t/5,1);                                // Hilfsgr��en f�r Parallelen 
  var q2 = Math.min((t-5)/5,1);
  var q3 = Math.min((t-10)/5,1);
  var q4 = Math.min((t-15)/5,1);
  var dx = xF-x0, dy = yF-y0;                              // Vektorkoordinaten f�r gegebene Kraft
  if (on) t = (new Date()-t0)/1000;                        // Aktuelle Zeit (s) 
  newPath();                                               // Neuer Pfad mit Standardwerten
  if (t > 0)                                               // Parallele zur ersten Halbgeraden
    line(x0+q1*dx,y0+q1*dy,phi1+Math.PI,f1*pix,t<10?2:0);
  if (t > 5)                                               // Ab der 5. Sekunde Parallele zur zweiten Halbgeraden 
    line(x0+q2*dx,y0+q2*dy,phi2+Math.PI,f2*pix,t<10?2:0);
  if (t > 10) {                                            // Ab der 10. Sekunde ...
    arrowText(text11,phi1,f1*pix*0.5,colorComp1);          // Beschriftung f�r erste Komponente
    ctx.strokeStyle = colorComp1;                          // Farbe
    thickArrow(phi1,f1*pix*q3);                            // Pfeil f�r erste Komponente
    }
  if (t > 15) {                                            // Ab der 15. Sekunde ...
    arrowText(text12,phi2,f2*pix*0.5,colorComp2);          // Beschriftung f�r zweite Komponente
    ctx.strokeStyle = colorComp2;                          // Farbe
    thickArrow(phi2,f2*pix*q4);                            // Pfeil f�r zweite Komponente
    if (!ready1) {                                         // Falls Konstruktion der ersten Komponente beendet ... 
      ready1 = true;                                       // ... Flag �ndern
      updateInputOutput();                                 // ... Ausgabefeld(er) aktualisieren             
      }
    }
  if (t > 20) {                                            // Ab der 20. Sekunde ...
    if (!ready2) {                                         // Falls Konstruktion der zweiten Komponente beendet ...
      ready2 = true;                                       // ... Flag �ndern
      updateInputOutput();                                 // ... Ausgabefeld(er) aktualisieren
      }
    }                       
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Beim Laden der HTML-Seite Startmethode ausf�hren
