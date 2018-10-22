// Bohrsches Atommodell (Wasserstoff)
// Java-Applet (30.05.1999) umgewandelt
// 29.03.2016 - 31.03.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel bohrmodel_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorNucleus = "#ff0000";                              // Farbe für Atomkern
var colorElectron = "#008000";                             // Farbe für Elektron
var colorEmphasize = "#ff00ff";                            // Farbe für Hervorhebung (aktuelle Bahn)
var colorWavelength = "#0000ff";                           // Farbe für Wellenlänge (Materiewelle)

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var DEG = Math.PI/180;                                     // 1 Grad (Bogenmaß)
var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var RBH = 1.0967758e7;                                     // Rydbergkonstante Wasserstoff (1/m)
var H = 6.6262e-34;                                        // Plancksche Konstante (Js)
var C = 2.99792458e8;                                      // Lichtgeschwindigkeit (m/s)
var E = 1.6022e-19;                                        // Elementarladung (C)
var EPS0 = 8.8542e-12;                                     // Elektrische Feldkonstante (SI)
var N_MAX = 20;                                            // Maximale Quantenzahl

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var rb1, rb2;                                              // Radiobuttons
var ch;                                                    // Auswahlfeld

var xA, yA;                                                // Position Atomkern (Pixel)
var pixR;                                                  // Umrechnungsfaktor für Radius (entsprechend n = 1)
var pixE;                                                  // Umrechnungsfaktor für Energie (entsprechend n = 1)
var phi;                                                   // Positionswinkel für Teilchenbild (Bogenmaß)
var n;                                                     // Hauptquantenzahl (unter Umständen nicht ganzzahlig)
var per;                                                   // Umlaufdauer (s)
var rE;                                                    // Bahnradius (Pixel)
var model;                                                 // 1 für Teilchenbild oder 2 für Wellenbild
var lambda;                                                // Wellenlänge (Winkel im Bogenmaß)
var drag;                                                  // Flag für Zugmodus
var t0;                                                    // Bezugszeitpunkt

// Element der Schaltfläche (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // Rückgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfläche
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  rb1 = getElement("rb1");                                 // Radiobutton (Teilchenbild)
  getElement("lb1",text01);                                // Erklärender Text (Teilchenbild)
  rb2 = getElement("rb2");                                 // Radiobutton (Wellenbild)
  getElement("lb2",text02);                                // Erklärender Text (Wellenbild)
  rb1.checked = true;                                      // Zunächst Teilchenbild ausgewählt
  getElement("lb3",text03);                                // Erklärender Text (Hauptquantenzahl)
  ch = getElement("ch");                                   // Auswahlfeld (Hauptquantenzahl)
  initSelect();                                            // Auswahlfeld vorbereiten
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer 
            
  xA = 180; yA = 180;                                      // Position Atomkern (Pixel)
  reaction();                                              // Startwerte wichtiger Variablen
  phi = 0;                                                 // Startwert Positionswinkel
  drag = false;                                            // Zugmodus zunächst deaktiviert
  t0 = new Date();                                         // Bezugszeitpunkt
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  
  rb1.onclick = reaction;                                  // Reaktion auf Radiobutton (Teilchenbild)
  rb2.onclick = reaction;                                  // Reaktion auf Radiobutton (Wellenbild)
  ch.onchange = reaction;                                  // Reaktion auf Auswahlfeld (Hauptquantenzahl)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers    
  
  } // Ende der Methode start
  
// Auswahlfeld vorbereiten:
  
function initSelect () {
  for (var i=0; i<=10; i++) {                              // Für alle Indizes ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = (i==0 ? "" : symbolN+" = "+i);                // Text des Elements
    ch.add(o);                                             // Element zur Liste hinzufügen
    }
  ch.selectedIndex = 1;                                    // Eintrag n = 1 ausgewählt
  }
  
// Reaktion auf Radiobutton oder Auswahlliste:
// Seiteneffekt model, n, pixR, pixE, rE, per, lambda
    
function reaction () {
  model = (rb1.checked ? 1 : 2);                           // 1 für Teilchenmodell oder 2 für Wellenmodell
  var i = ch.selectedIndex;                                // Index im Auswahlfeld
  if (i > 0) n = i;                                        // Falls Index ungleich 0, Hauptquantenzahl aktualisieren
  calculation();                                           // Berechnungen
  rE = pixR*n*n;                                           // Bahnradius (Pixel)
  per = n*n*n;                                             // Umlaufdauer (s)                                                
  lambda = PI2/n;                                          // Wellenlänge (Winkel im Bogenmaß)
  }
  
// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen                   
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  drag = false;                                            // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Berührung:
  
function reactionTouchEnd (e) {             
  drag = false;                                            // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt drag 

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  var dx = u-xA, dy = v-yA;                                // Koordinatendifferenzen (Pixel)
  var r = Math.sqrt(dx*dx+dy*dy);                          // Abstand vom Mittelpunkt (Pixel)
  if (Math.abs(r-rE) < 20) drag = true;                    // Falls Position auf aktueller Bahn, Zugmodus aktivieren  
  }
  
// Reaktion auf Bewegung von Maus oder Finger (Änderung):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt rE, n, per, lambda, Wirkung auf Auswahlfeld

function reactionMove (u, v) {
  if (!drag) return;                                       // Falls kein Zugmodus, abbrechen
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  var dx = u-xA, dy = v-yA;                                // Koordinatendifferenzen (Pixel)
  var r = Math.sqrt(dx*dx+dy*dy);                          // Abstand vom Mittelpunkt (Pixel)
  if (r > 160) return;                                     // Falls Abstand zu groß, abbrechen
  rE = Math.max(r,1);                                      // Bahnradius (Pixel, mindestens gleich 1) 
  n = Math.sqrt(rE/pixR);                                  // Hauptquantenzahl (im Allgemeinen nicht ganzzahlig)
  var nn = Math.round(n);                                  // Hauptquantenzahl gerundet
  if (Math.abs(nn-n) <= 0.05 && n <= 10) {                 // Falls Hauptquantenzahl annähernd ganzzahlig ...
    n = nn; ch.selectedIndex = n;                          // Gerundeten Wert übernehmen
    }
  else ch.selectedIndex = 0;                               // Andernfalls leerer Eintrag im Auswahlfeld
  rE = pixR*n*n;                                           // Bahnradius (Pixel)
  per = n*n*n;                                             // Umlaufdauer (s)
  lambda = PI2/n;                                          // Wellenlänge (Winkel im Bogenmaß)
  }

//-------------------------------------------------------------------------------------------------

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }

// Berechnungen:
// Seiteneffekt pixR, pixE

function calculation () {
  if (n <= 3) {pixR = 10; pixE = 250;}                     // Umrechnungsfaktoren für 1 <= n <= 3
  else if (n <= 5) {pixR = 4; pixE = 1000;}                // Umrechnungsfaktoren für 4 <= n <= 5
  else if (n <= 7) {pixR = 2; pixE = 2400;}                // Umrechnungsfaktoren für 6 <= n <= 7
  else {pixR = 1; pixE = 4500;}                            // Umrechnungsfaktoren für n >= 8
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad:
// c ... Linienfarbe (optional, Defaultwert schwarz)

function newPath (c) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = (c ? c : "#000000");                   // Linienfarbe
  ctx.lineWidth = 1;                                       // Liniendicke
  }
  
// Linie:
// (x1,y1) ... Anfangspunkt
// (x2,y2) ... Endpunkt
// c ......... Farbe (optional)
// w ......... Liniendicke (optional, Defaultwert 1)

function line (x1, y1, x2, y2, c, w) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  if (c) ctx.strokeStyle = c;                              // Linienfarbe, falls angegeben
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Ausgefüllter oder nicht ausgefüllter Kreis:
// c1 ... Füllfarbe (optional)
// c2 ... Randfarbe (optional)
  
function circle (x, y, r, c1, c2) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,PI2,true);                               // Kreis vorbereiten
  if (c1) {ctx.fillStyle = c1; ctx.fill();}                // Ausgefüllter Kreis, falls gewünscht
  if (c2) {ctx.strokeStyle = c2; ctx.stroke();}            // Kreisrand, falls gewünscht
  }

// Kreisbogen:
// (x,y) ... Mittelpunkt (Pixel)
// r ....... Radius (Pixel)
// a0 ...... Startwinkel (Bogenmaß)
// da ...... Mittelpunktswinkel (Bogenmaß)
// c ....... Linienfarbe
// w ....... Liniendicke

function arc (x, y, r, a0, da, c, w) {
  newPath(c);                                              // Neuer Grafikpfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.arc(x,y,r,PI2-a0,PI2-a0-da,true);                    // Kreisbogen vorbereiten
  ctx.stroke();                                            // Kreisbogen zeichnen
  }
  
// Hilfsroutine: Kreisbahn mit Beschriftung
// i ... Nummer
// r ... Radius (Pixel)

function orbit (i, r) {
  var c = (i==n ? colorEmphasize : "#000000");             // Farbe
  circle(xA,yA,r,undefined,c);                             // Kreis
  if (r < 10) return;                                      // Falls Radius sehr klein, abbrechen
  ctx.fillStyle = c;                                       // Schriftfarbe
  ctx.textAlign = "center";                                // Textausrichtung
  ctx.fillText(symbolN + " = "+i,xA,yA-r);                 // Beschriftung (n = ...)
  }
  
// Hilfsroutine: Atomkern und Kreisbahnen
  	  
function nucleusOrbits () {
  circle(xA,yA,pixR>=10?2:1,colorNucleus);                 // Atomkern
  for (var i=1; i<=N_MAX; i++) {                           // Für alle Elektronenbahnen ...
    var r = pixR*i*i;                                      // Bahnradius (Pixel)
    if (r > 160) break;                                    // Falls Bahnradius zu groß, abbrechen
    orbit(i,r);                                            // Kreisbahn mit Beschriftung
    }
  if (n == Math.floor(n) && n > 0) return;                 // Falls stationärer Zustand, abbrechen
  var w1 = 40;                                             // Hilfsgröße für Kreisbögen (Gradmaß)
  if (rE > 40) w1 = 20;                                    // Alternativer Wert der Hilfsgröße
  if (rE > 80) w1 = 10;                                    // Alternativer Wert der Hilfsgröße
  if (rE > 160) w1 = 5;                                    // Alternativer Wert der Hilfsgröße
  var w2 = w1*0.7;                                         // Mittelpunktswinkel für Kreisbögen (Gradmaß)        	
  for (var i=0; i<360/w1; i++)                             // Für alle Indizes ...
    arc(xA,yA,rE,i*w1*DEG,w2*DEG,colorEmphasize,1);        // Kreisbogen als Teil eines gestrichelten Kreises
  }
  
// Hilfsroutine: Ausgefüllter oder nicht ausgefüllter Kreis für Elektron
// (x,y) ... Position (Pixel)

function electron (x, y) {
  if (n == Math.floor(n) && n > 0)                         // Falls stationärer Zustand ...
    circle(x,y,2,colorElectron,undefined);                 // Ausgefüllter Kreis
  else circle(x,y,2,undefined,colorElectron);              // Andernfalls nicht ausgefüllter Kreis
  }
  
// Teilchenbild-Darstellung:

function particleModel () {
  nucleusOrbits();                                         // Atomkern und Kreisbahnen
  electron(xA+rE*Math.cos(phi),yA-rE*Math.sin(phi));       // Elektron auf Kreisbahn
  }
     
// Wellenbild-Darstellung:

function waveModel () {
  nucleusOrbits();                                         // Atomkern und Kreisbahnen
  newPath(colorElectron);                                  // Neuer Grafikpfad
  ctx.moveTo(xA+rE,yA);                                    // Anfangspunkt
  for (var i=1; i<=360; i++) {                             // Für alle Indizes ...
    var phi = i*DEG;                                       // Positionswinkel (Bogenmaß)
    var rW = rE+8*Math.sin(PI2*phi/lambda);                // Abstand vom Mittelpunkt (Pixel)
    var x = xA+rW*Math.cos(phi), y = yA-rW*Math.sin(phi);  // Koordinaten
    ctx.lineTo(x,y);                                       // Linie zum Grafikpfad hinzufügen
    }
  ctx.stroke();                                            // Kurve für Materiewelle
  arc(xA,yA,rE,0,lambda,colorWavelength,2);                // Kreisbogen für Wellenlänge
  var r1 = rE-3, r2 = rE+3;                                // Innen- und Außenradius für Begrenzungsstriche (Pixel)
  line(xA+r1,yA,xA+r2,yA,colorWavelength,1.5);             // Begrenzungsstrich am Anfang
  var cos = Math.cos(lambda), sin = Math.sin(lambda);      // Trigonometrische Werte
  line(xA+r1*cos,yA-r1*sin,xA+r2*cos,yA-r2*sin,colorWavelength,1.5); // Begrenzungsstrich am Ende
  }
  
// Energieniveaus:

function energyLevels () {
  var x0 = 425;                                            // x-Koordinate Linienmittelpunkte (Pixel)
  var y0 = 20;                                             // y-Koordinate Ionisationsgrenze (Pixel)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  line(x0-35,y0,x0+35,y0);                                 // Ionisationsgrenze
  for (var i=1; i<=N_MAX; i++) {                           // Für alle Energieniveaus ...
    var c = (i==n ? colorEmphasize : "#000000");           // Farbe
    var y = y0+pixE/(i*i);                                 // y-Koordinate der Linie (Pixel)
    var s = symbolN+" = "+i;                               // Beschriftungstext
    ctx.fillStyle = c;                                     // Schriftfarbe
    ctx.textAlign = "right";                               // Textausrichtung
    if (y >= y0+25 && i <= 10) ctx.fillText(s,x0-30,y+4);  // Beschriftung, falls sinnvoll
    line(x0-25,y,x0+25,y,c);                               // Linie für Energieniveau
    }
  var h;                                                   // Rechteckshöhe für dichte Linien (Pixel)
  if (pixE >= 4000) h = 19;                                // Möglicher Wert der Rechteckshöhe
  else if (pixE >= 2000) h = 12;                           // Alternativwert
  else if (pixE >= 1000) h = 10;                           // Alternativwert
  else h = 5;                                              // Alternativwert
  ctx.fillStyle = "#000000";                               // Füllfarbe
  ctx.fillRect(x0-25,y0,50,h);                             // Rechteck für dichte Linien nahe der Ionisationsgrenze
  electron(x0,y0+pixE/(n*n));                              // Elektron auf Energieniveau
  }
      
// Hilfsroutine: Ausgabe in Zehnerpotenzschreibweise
// s ....... Zeichenkette am Anfang
// val ..... Zahlenwert
// exp ..... Zehnerexponent
// u ....... Einheit
// (x,y) ... Position (Pixel)
// n ....... Zahl der Nachkommastellen
    
function writePower10 (s, val, exp, u, x, y, n) {
  var  power10 = Math.pow(10,exp);                         // Zehnerpotenz
  s += ToString(val/power10,n,true);                       // Zeichenkette um Mantisse ergänzen
  s += " "+symbolMult+" 10";                               // Zeichenkette um "mal 10" ergänzen
  ctx.textAlign = "left";                                  // Textausrichtung
  ctx.fillText(s,x,y);                                     // Bisherige Zeichenkette ausgeben (normale Höhe)
  x += ctx.measureText(s).width;                           // Position des Zehnerexponenten (Pixel)
  s = ""+exp;                                              // Zeichenkette für Exponent 
  s = s.replace("-","\u2212");                             // Bindestrich durch Minuszeichen ersetzen
  ctx.fillText(s,x,y-6);                                   // Zehnerexponent ausgeben                         
  x += ctx.measureText(s).width;                           // Position des Leerzeichens vor der Einheit (Pixel)
  ctx.fillText(" "+u,x,y);                                 // Einheit ausgeben
  }

// Grafikausgabe:
// Seiteneffekt phi, t0 
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  var t1 = new Date();                                     // Aktuelle Zeit
  var dt = (t1-t0)/1000;                                   // Länge des Zeitintervalls (s)
  phi += dt*PI2/per;                                         // Positionswinkel aktualisieren
  t0 = t1;                                                 // Neuer Bezugszeitpunkt
  ctx.font = FONT;                                         // Zeichensatz
  if (model == 1) particleModel();                         // Entweder Teilchenmodell ...
  else waveModel();                                        // ... oder Wellenmodell darstellen
  energyLevels();                                          // Energieniveaus
  if (n != Math.floor(n)) return;                          // Falls kein stationärer Zustand, abbrechen
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  var r = E*E*n*n/(8*Math.PI*EPS0*RBH*H*C);                // Bahnradius (m)
  ctx.textAlign = "right";                                 // Textausrichtung
  var x = 40, y = 365;                                     // Position des Gleichheitszeichens für Bahnradius (Pixel)
  ctx.fillText(symbolR,x-4,y);                             // Symbol für Bahnradius (r)     
  if (r < 1e-10) writePower10("= ",r,-11,meter,x,y,2);     // Bahnradius entweder in der Form r = ... * 10^(-11) m ...
  else if (r < 1e-9) writePower10("= ",r,-10,meter,x,y,2); // ... oder in der Form r = ... * 10^(-10) m ...
  else writePower10("= ",r,-9,meter,x,y,2);                // ... oder in der Form r = ... * 10^(-9) m      
  var e = RBH*H*C/(n*n);                                   // Gesamtenergie (J)
  x = 378; y = 350;                                        // Position des Gleichheitszeichens für Energie (Pixel)
  ctx.textAlign = "right";                                 // Textausrichtung
  ctx.fillText(symbolE,x-4,y);                             // Symbol für Gesamtenergie (E)
  var s = "= \u2212";                                      // Gleichheitszeichen und Minuszeichen
  if (e < 1e-19) writePower10(s,e,-20,joule,x,y,1);        // Gesamtenergie entweder in der Form E = ... * 10^(-20) J ...
  else if (e < 1e-18) writePower10(s,e,-19,joule,x,y,2);   // ... oder in der Form E = ... * 10^(-19) J ...
  else writePower10(s,e,-18,joule,x,y,3);                  // ... oder in der Form E = ... * 10^(-18) J
  ctx.fillText(s+ToString(e/E,2,true)+" "+electronVolt,x,y+15); // Gesamtenergie in Elektronenvolt 
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen



